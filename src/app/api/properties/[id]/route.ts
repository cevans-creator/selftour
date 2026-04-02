import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { properties, orgMembers, organizations } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

async function getOrgForUser(userId: string) {
  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, userId))
    .limit(1);
  return membership?.org ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getOrgForUser(user.id);
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.organizationId, org.id)))
    .limit(1);

  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(property);
}

const updateSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  type: z.enum(["single_family", "condo", "townhome", "apartment", "land"]),
  status: z.enum(["active", "inactive", "sold", "pending"]),
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  squareFeet: z.number().nullable().optional(),
  price: z.number().nullable().optional(),
  description: z.string().optional(),
  seamDeviceId: z.string().optional(),
  tourDurationMinutes: z.number().min(15).max(180),
  bufferMinutes: z.number().min(0).max(60),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  availableDays: z.array(z.number().min(0).max(6)).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getOrgForUser(user.id);
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as unknown;
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const { seamDeviceId, bathrooms, availableDays, ...rest } = parsed.data;

  const [updated] = await db
    .update(properties)
    .set({
      ...rest,
      bathrooms: bathrooms != null ? bathrooms.toString() : null,
      seamDeviceId: seamDeviceId || null,
      availableDays: availableDays ?? [1, 2, 3, 4, 5],
      updatedAt: new Date(),
    })
    .where(and(eq(properties.id, id), eq(properties.organizationId, org.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}
