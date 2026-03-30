import "server-only";
import { db } from "@/server/db/client";
import { tours, visitors, properties, aiConversations, tourEvents } from "@/server/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendSms } from "./sms";
import { getKnowledgeBaseForProperty } from "@/server/ai/knowledge-base";
import { getAiResponse } from "@/server/ai/assistant";
import { normalizePhone } from "@/lib/utils";

/**
 * Handle an inbound SMS from a visitor.
 * 1. Look up their active tour by phone number
 * 2. Fetch the property knowledge base
 * 3. Call Claude to generate a reply
 * 4. Send reply via Twilio
 * 5. Log to ai_conversations and tour_events
 */
export async function handleInboundSms(
  from: string,
  body: string
): Promise<void> {
  const phone = normalizePhone(from);
  const now = new Date();

  // Find a visitor with this phone who has an active tour
  const [visitor] = await db
    .select()
    .from(visitors)
    .where(eq(visitors.phone, phone))
    .limit(1);

  if (!visitor) {
    await sendSms(
      phone,
      "Thanks for your message! We couldn't find an active tour for your number. For assistance, please contact the leasing office."
    );
    return;
  }

  // Find their most recent active tour (access_sent or in_progress)
  const [tour] = await db
    .select()
    .from(tours)
    .where(
      and(
        eq(tours.visitorId, visitor.id),
        // Tour window: started within last 2 hours or starts within 2 hours
        gte(tours.endsAt, new Date(now.getTime() - 2 * 60 * 60 * 1000)),
        lte(tours.scheduledAt, new Date(now.getTime() + 2 * 60 * 60 * 1000))
      )
    )
    .orderBy(tours.scheduledAt)
    .limit(1);

  if (!tour) {
    await sendSms(
      phone,
      `Hi ${visitor.firstName}! We couldn't find an active tour right now. For questions, please contact the leasing office.`
    );
    return;
  }

  // Load the property
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, tour.propertyId))
    .limit(1);

  if (!property) {
    await sendSms(phone, "Sorry, we had trouble looking up your property info.");
    return;
  }

  // Build knowledge base context
  const knowledgeBase = await getKnowledgeBaseForProperty(
    property.id,
    property.communityId ?? undefined,
    property.organizationId
  );

  // Get AI response
  const response = await getAiResponse({
    visitorName: `${visitor.firstName} ${visitor.lastName}`,
    propertyAddress: `${property.address}, ${property.city}, ${property.state}`,
    question: body,
    knowledgeBase,
  });

  // Send reply
  await sendSms(phone, response);

  // Log conversation
  await db.insert(aiConversations).values({
    tourId: tour.id,
    visitorPhone: phone,
    inboundMessage: body,
    outboundMessage: response,
  });

  // Log as tour event
  await db.insert(tourEvents).values({
    tourId: tour.id,
    eventType: "ai_response",
    payload: {
      inbound: body,
      outbound: response,
      visitor_phone: phone,
    },
  });
}
