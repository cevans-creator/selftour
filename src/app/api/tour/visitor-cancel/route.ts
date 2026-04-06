import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { tours } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { inngest } from "@/server/inngest/client";
import { deleteTourAccessCode } from "@/server/seam/locks";

export async function POST(req: NextRequest) {
  const { tourId } = (await req.json()) as { tourId: string };

  if (!tourId) {
    return NextResponse.json({ error: "Missing tourId" }, { status: 400 });
  }

  const [tour] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  }

  if (tour.status === "cancelled") {
    return NextResponse.json({ error: "Tour is already cancelled" }, { status: 409 });
  }

  if (tour.status === "completed") {
    return NextResponse.json({ error: "Cannot cancel a completed tour" }, { status: 409 });
  }

  // Delete Seam access code if active
  if (tour.seamAccessCodeId) {
    try {
      await deleteTourAccessCode(tour.seamAccessCodeId);
    } catch (err) {
      console.warn("[Visitor Cancel] Could not delete Seam code:", err);
    }
  }

  await db
    .update(tours)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: "Cancelled by visitor",
      updatedAt: new Date(),
    })
    .where(eq(tours.id, tourId));

  await inngest.send({
    name: "tour/cancelled",
    data: { tourId, reason: "Cancelled by visitor" },
  });

  return NextResponse.json({ success: true });
}
