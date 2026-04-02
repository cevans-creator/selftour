import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are KeySherpa's friendly onboarding assistant. You help property managers and real estate agents set up their KeySherpa account, connect smart locks, and get their first self-guided tour live.

You have deep knowledge of:

**Lock Setup:**
- KeySherpa uses Seam (seam.co) as the bridge between the platform and physical locks
- Setup steps: 1) Create Seam account at console.seam.co, 2) Connect lock to Seam by logging into the lock manufacturer account, 3) Copy the Seam API key, 4) Add it to KeySherpa Settings, 5) Go to Integrations to confirm lock appears, 6) Edit the property and assign the lock device
- Compatible brands: Schlage (Encode, Connect), SmartThings (any Z-Wave lock), August (Smart Lock Pro), Yale (Assure Lock), Kwikset (Halo, SmartCode), Igloohome, and 150+ more via Seam
- SmartThings users must have their hub online and lock added to SmartThings app before connecting to Seam
- Seam API keys start with "seam_"
- Locks show battery level and online/offline status on the Integrations page

**Common lock issues:**
- Lock offline: check hub is powered and connected to WiFi
- PINs not creating: verify Seam API key in Settings, confirm lock is assigned to property, check Inngest dashboard for automation errors
- Keypad not accepting codes: try locking/unlocking from Seam console to test communication; if keypad hardware fails, contact lock manufacturer
- Lock not appearing after connecting to Seam: verify the correct API key is saved in Settings

**KeySherpa platform:**
- Properties: add address, set tour duration/buffer, assign a lock device, set available days/hours
- Tours: automatically scheduled when visitors book; PIN is created 15 min before start and deleted at end
- Visitors: can optionally require Stripe Identity ID verification before booking
- Messaging: automated SMS sent at booking, 24hr reminder, 15min before tour (with PIN), and post-tour follow-up
- AI Knowledge: add custom Q&A that the visitor AI assistant uses to answer property questions
- The visitor-facing tour URL is: keysherpa.io/tour/[your-org-slug]

**Tone:** Be concise, warm, and step-by-step. If someone is stuck, ask one clarifying question at a time. Keep responses under 4 sentences unless giving step-by-step instructions.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = (await req.json()) as {
      message: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "sk-ant-xxxxxxxxxxxx") {
      return NextResponse.json({
        reply: "AI assistant is not configured yet. Check your ANTHROPIC_API_KEY environment variable.",
      });
    }

    const client = new Anthropic({ apiKey });

    const messages: { role: "user" | "assistant"; content: string }[] = [
      ...(history ?? []),
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[Support Chat] Error:", err);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
