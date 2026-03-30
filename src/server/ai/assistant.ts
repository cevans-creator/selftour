import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { AI_MAX_RESPONSE_CHARS, AI_MODEL } from "@/lib/constants";
import { formatKnowledgeBase, type KnowledgeEntry } from "./knowledge-base";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GetAiResponseOptions {
  visitorName: string;
  propertyAddress: string;
  question: string;
  knowledgeBase: KnowledgeEntry[];
}

/**
 * Get a concise, SMS-friendly response from Claude for a visitor question.
 * Responses are capped at ~300 characters to fit in a single SMS.
 */
export async function getAiResponse(
  opts: GetAiResponseOptions
): Promise<string> {
  const { visitorName, propertyAddress, question, knowledgeBase } = opts;

  const knowledgeContext = formatKnowledgeBase(knowledgeBase);

  const systemPrompt = `You are a helpful leasing assistant for ${propertyAddress}.
A visitor named ${visitorName} is currently on a self-guided tour and has a question.

Your job is to answer their question as helpfully and concisely as possible.
Keep responses under 300 characters so they fit in a single SMS message.
Be friendly, direct, and informative. Use plain text only — no markdown.

${knowledgeContext}

If you don't know the answer, suggest they call the leasing office for more details.
Never make up specific details like prices, square footage, or fees — only use info from the knowledge base.`;

  const message = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 150,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });

  const responseText =
    message.content[0]?.type === "text"
      ? message.content[0].text.trim()
      : "Thanks for your question! Please contact the leasing office for details.";

  // Truncate to SMS-friendly length
  if (responseText.length > AI_MAX_RESPONSE_CHARS) {
    // Find the last sentence boundary before the limit
    const truncated = responseText.slice(0, AI_MAX_RESPONSE_CHARS - 1);
    const lastPeriod = truncated.lastIndexOf(". ");
    if (lastPeriod > 100) {
      return truncated.slice(0, lastPeriod + 1);
    }
    return truncated + "…";
  }

  return responseText;
}
