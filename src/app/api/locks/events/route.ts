import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getSeamClient } from "@/server/seam/client";

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deviceId = req.nextUrl.searchParams.get("deviceId");

  try {
    const seam = getSeamClient();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const events = await seam.events.list({
      ...(deviceId ? { device_id: deviceId } : {}),
      event_types: [
        "lock.locked",
        "lock.unlocked",
        "access_code.set_on_device",
        "access_code.created",
        "access_code.deleted",
      ],
      since,
      limit: 50,
    });

    const formatted = events.map((e) => ({
      eventId: e.event_id,
      eventType: e.event_type,
      deviceId: e.device_id,
      occurredAt: e.occurred_at,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessCodeId: (e as any).access_code_id ?? null,
    }));

    return NextResponse.json({ events: formatted });
  } catch (err) {
    console.error("[Lock Events] Error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
