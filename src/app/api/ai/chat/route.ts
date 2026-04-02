import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/server/db/client";
import { tours, properties, organizations, aiKnowledgeEntries } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { tourId, message } = (await req.json()) as { tourId: string; message: string };

    if (!tourId || !message?.trim()) {
      return NextResponse.json({ error: "Missing tourId or message" }, { status: 400 });
    }

    // Load tour + property + org
    const [row] = await db
      .select({ tour: tours, property: properties, org: organizations })
      .from(tours)
      .innerJoin(properties, eq(tours.propertyId, properties.id))
      .innerJoin(organizations, eq(tours.organizationId, organizations.id))
      .where(eq(tours.id, tourId))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const { property, org } = row;

    // Load knowledge base entries for this org
    const knowledge = await db
      .select()
      .from(aiKnowledgeEntries)
      .where(eq(aiKnowledgeEntries.organizationId, org.id))
      .limit(50);

    const knowledgeText = knowledge.length > 0
      ? knowledge.map((k) => `Q: ${k.question}\nA: ${k.answer}`).join("\n\n")
      : "No specific knowledge base entries configured.";

    const systemPrompt = `You are a helpful AI assistant for ${org.name}, answering questions from a visitor who is currently on a self-guided tour of ${property.address}, ${property.city}, ${property.state}.

Be friendly, concise, and helpful. Keep responses under 2-3 sentences. If you don't know the answer, say so and suggest they contact ${org.name} directly.

Property details:
- Address: ${property.address}, ${property.city}, ${property.state} ${property.zip}
- Type: ${property.type}
${property.bedrooms ? `- Bedrooms: ${property.bedrooms}` : ""}
${property.bathrooms ? `- Bathrooms: ${property.bathrooms}` : ""}
${property.squareFeet ? `- Square feet: ${property.squareFeet.toLocaleString()}` : ""}
${property.price ? `- Price: $${Math.round(property.price / 100).toLocaleString()}` : ""}
${property.description ? `- Description: ${property.description}` : ""}

Knowledge base:
${knowledgeText}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "sk-ant-xxxxxxxxxxxx") {
      return NextResponse.json({ reply: "AI assistant is not configured yet. Please contact us directly with your questions." });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const reply = response.content[0]?.type === "text" ? response.content[0].text : "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[AI Chat] Error:", err);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
