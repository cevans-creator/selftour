import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { withCors, corsOptions } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptions();
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Creates a Stripe SetupIntent for credit card verification.
 * This authorizes $1 on the visitor's card to verify it's real,
 * then automatically cancels the hold. No charge is made.
 */
export async function POST(req: NextRequest) {
  try {
    const { visitorEmail, visitorName } = (await req.json()) as {
      visitorEmail: string;
      visitorName: string;
    };

    if (!visitorEmail) {
      return withCors(NextResponse.json({ error: "Missing email" }, { status: 400 }));
    }

    // Create a SetupIntent — verifies the card without charging
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
      metadata: {
        purpose: "visitor_id_verification",
        visitorEmail,
        visitorName,
      },
    });

    return withCors(NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    }));
  } catch (err) {
    console.error("[Card Verification] Error:", err);
    return withCors(NextResponse.json({ error: "Failed to start verification" }, { status: 500 }));
  }
}
