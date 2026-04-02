import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "placeholder", {
    apiVersion: "2025-02-24.acacia",
  });
}

export async function POST(_req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "placeholder") {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const stripe = getStripe();

    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      options: {
        document: {
          allowed_types: ["driving_license", "passport", "id_card"],
          require_id_number: false,
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("[Stripe Identity] Error creating session:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create verification session" },
      { status: 500 }
    );
  }
}
