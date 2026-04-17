import { NextRequest, NextResponse } from "next/server";
import { getResendClient, EMAIL_FROM } from "@/server/email/client";
import { db } from "@/server/db/client";
import { crmContacts } from "@/server/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, company, properties, message } = (await req.json()) as {
      firstName: string;
      lastName: string;
      email: string;
      company: string;
      properties: string;
      message?: string;
    };

    if (!firstName || !email || !company) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({ error: "Email not configured" }, { status: 500 });
    }

    // Send to KeySherpa sales (your email)
    await resend.emails.send({
      from: EMAIL_FROM,
      to: "cevans@wwcpro.com",
      replyTo: email,
      subject: `Pricing inquiry from ${firstName} ${lastName} at ${company}`,
      text: `New pricing inquiry from keysherpa.io/pricing\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nCompany: ${company}\nProperties: ${properties}\n${message ? `\nMessage:\n${message}` : ""}\n\nReply to this email to respond directly to the prospect.`,
    });

    // Send confirmation to the prospect
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Thanks for your interest in KeySherpa",
      text: `Hi ${firstName},\n\nThanks for reaching out! We received your pricing inquiry and will get back to you within 1 business day.\n\nIn the meantime, feel free to reply to this email with any questions.\n\n— The KeySherpa Team`,
    });

    // Auto-create CRM lead
    try {
      await db.insert(crmContacts).values({
        companyName: company,
        contactName: `${firstName} ${lastName}`,
        email,
        phone: null,
        propertyCount: properties,
        source: "pricing_form",
        stage: "new_lead",
      });
    } catch { /* best effort — don't fail the form submission */ }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact] Error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
