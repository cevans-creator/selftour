import { config } from "dotenv";
config({ path: ".env.local" });

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

async function main() {
  console.log("\n📧 Sending test email...");

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    to: process.argv[2] ?? "cevans@wwcpro.com",
    subject: "Tour Confirmed: Evans House — Self-Guided Tour",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #111;">Your Tour is Confirmed!</h1>
        <p>Hi Caden,</p>
        <p>Your self-guided tour of <strong>5010 Mimosa Ln</strong> is confirmed.</p>
        <p><strong>Date:</strong> Today<br/>
           <strong>PIN:</strong> 4890<br/>
           <strong>Valid:</strong> 30 minutes from start time</p>
        <a href="https://selftour.vercel.app/tour/wwc/access/test"
           style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;">
          View Your Access Link
        </a>
        <p style="margin-top:24px;color:#666;font-size:14px;">
          Enter your PIN on the keypad when you arrive. The code will be deactivated automatically when your tour ends.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }

  console.log("✅ Email sent! ID:", data?.id);
  console.log(`   Check ${process.argv[2] ?? "cevans@wwcpro.com"} for the email.\n`);
}

main().catch(console.error);
