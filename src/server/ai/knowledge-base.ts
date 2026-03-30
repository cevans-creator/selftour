import "server-only";
import { db } from "@/server/db/client";
import { aiKnowledgeEntries } from "@/server/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import { AI_MAX_KNOWLEDGE_ENTRIES } from "@/lib/constants";

export interface KnowledgeEntry {
  question: string;
  answer: string;
  scope: "org" | "community" | "property";
}

/**
 * Fetch knowledge base entries for a given property.
 * Merges org-level, community-level, and property-level entries.
 * Property-specific entries take precedence.
 */
export async function getKnowledgeBaseForProperty(
  propertyId: string,
  communityId: string | undefined,
  organizationId: string
): Promise<KnowledgeEntry[]> {
  // Build an OR condition to fetch all relevant scopes in one query
  const conditions = [
    // Org-level entries (no community, no property)
    and(
      eq(aiKnowledgeEntries.organizationId, organizationId),
      isNull(aiKnowledgeEntries.communityId),
      isNull(aiKnowledgeEntries.propertyId)
    ),
    // Property-specific entries
    and(
      eq(aiKnowledgeEntries.organizationId, organizationId),
      eq(aiKnowledgeEntries.propertyId, propertyId)
    ),
  ];

  if (communityId) {
    conditions.push(
      // Community-level entries
      and(
        eq(aiKnowledgeEntries.organizationId, organizationId),
        eq(aiKnowledgeEntries.communityId, communityId),
        isNull(aiKnowledgeEntries.propertyId)
      )
    );
  }

  const entries = await db
    .select()
    .from(aiKnowledgeEntries)
    .where(or(...conditions))
    .limit(AI_MAX_KNOWLEDGE_ENTRIES);

  // Map to KnowledgeEntry with scope metadata
  return entries.map((e) => ({
    question: e.question,
    answer: e.answer,
    scope: e.propertyId
      ? "property"
      : e.communityId
        ? "community"
        : "org",
  }));
}

/**
 * Format knowledge base as a context block for the AI prompt.
 */
export function formatKnowledgeBase(entries: KnowledgeEntry[]): string {
  if (entries.length === 0) return "";

  const sections: string[] = ["## Knowledge Base\n"];

  for (const entry of entries) {
    sections.push(`Q: ${entry.question}\nA: ${entry.answer}\n`);
  }

  return sections.join("\n");
}
