import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/server/db/client";
import { organizations, visitors } from "@/server/db/schema";
import { eq } from "drizzle-orm";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "placeholder", {
    apiVersion: "2025-02-24.acacia",
  });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[Stripe Webhook] Event:", event.type);

  try {
    switch (event.type) {
      // ─── Subscription lifecycle ────────────────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const planTier = getPlanTierFromSubscription(subscription);

        if (planTier) {
          await db
            .update(organizations)
            .set({
              stripeSubscriptionId: subscription.id,
              planTier,
              updatedAt: new Date(),
            })
            .where(eq(organizations.stripeCustomerId, customerId));
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        await db
          .update(organizations)
          .set({
            stripeSubscriptionId: null,
            planTier: "free",
            updatedAt: new Date(),
          })
          .where(eq(organizations.stripeCustomerId, customerId));
        break;
      }

      // ─── Identity verification ─────────────────────────────────────────────
      case "identity.verification_session.verified": {
        const session = event.data.object as Stripe.Identity.VerificationSession;

        await db
          .update(visitors)
          .set({
            idVerificationStatus: "verified",
            updatedAt: new Date(),
          })
          .where(eq(visitors.stripeIdentitySessionId, session.id));
        break;
      }

      case "identity.verification_session.requires_input": {
        const session = event.data.object as Stripe.Identity.VerificationSession;

        await db
          .update(visitors)
          .set({
            idVerificationStatus: "failed",
            updatedAt: new Date(),
          })
          .where(eq(visitors.stripeIdentitySessionId, session.id));
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}

function getPlanTierFromSubscription(
  subscription: Stripe.Subscription
): "free" | "starter" | "growth" | "enterprise" | null {
  const item = subscription.items.data[0];
  if (!item) return null;

  const productId = typeof item.price.product === "string"
    ? item.price.product
    : item.price.product?.id ?? "";

  // Map Stripe product IDs to plan tiers via env vars
  const STARTER_PRODUCT = process.env.STRIPE_STARTER_PRODUCT_ID;
  const GROWTH_PRODUCT = process.env.STRIPE_GROWTH_PRODUCT_ID;
  const ENTERPRISE_PRODUCT = process.env.STRIPE_ENTERPRISE_PRODUCT_ID;

  if (STARTER_PRODUCT && productId === STARTER_PRODUCT) return "starter";
  if (GROWTH_PRODUCT && productId === GROWTH_PRODUCT) return "growth";
  if (ENTERPRISE_PRODUCT && productId === ENTERPRISE_PRODUCT) return "enterprise";

  return null;
}
