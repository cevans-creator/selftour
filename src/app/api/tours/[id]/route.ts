import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { tours, orgMembers, organizations } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { inngest } from "@/server/inngest/client";
import { deleteTourAccessCode } from "@/server/seam/locks";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const { action, reason } = (await req.json()) as { action: string; reason?: string };

  if (action !== "cancel") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Fetch tour (must belong to this org)
  const [tour] = await db
    .select()
    .from(tours)
    .where(and(eq(tours.id, id), eq(tours.organizationId, membership.org.id)))
    .limit(1);

  if (!tour) return NextResponse.json({ error: "Tour not found" }, { status: 404 });

  if (tour.status === "cancelled") {
    return NextResponse.json({ error: "Tour is already cancelled" }, { status: 409 });
  }

  // Delete Seam access code if one was created
  if (tour.seamAccessCodeId) {
    try {
      await deleteTourAccessCode(tour.seamAccessCodeId);
    } catch (err) {
      console.warn("[Cancel Tour] Could not delete Seam code:", err);
    }
  }

  // Update tour status
  await db
    .update(tours)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: reason ?? "Cancelled by admin",
      updatedAt: new Date(),
    })
    .where(eq(tours.id, id));

  // Fire Inngest cancellation event (stops any pending jobs)
  await inngest.send({
    name: "tour/cancelled",
    data: { tourId: id, reason: reason ?? "Cancelled by admin" },
  });

  return NextResponse.json({ success: true });
}
