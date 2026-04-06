import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { properties, orgMembers, organizations } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

async function getOrgForUser(userId: string) {
  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, userId))
    .limit(1);
  return membership?.org ?? null;
}

// POST /api/properties/[id]/images — upload a new photo
export async function POST(
  req: NextRequest,
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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${org.id}/${id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("property-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[Image Upload] Supabase error:", uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("property-images")
    .getPublicUrl(path);

  const updatedUrls = [...(property.imageUrls ?? []), publicUrl];

  await db
    .update(properties)
    .set({ imageUrls: updatedUrls, updatedAt: new Date() })
    .where(eq(properties.id, id));

  return NextResponse.json({ url: publicUrl, imageUrls: updatedUrls });
}

// DELETE /api/properties/[id]/images — remove a photo
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getOrgForUser(user.id);
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = (await req.json()) as { url: string };
  if (!url) return NextResponse.json({ error: "No url provided" }, { status: 400 });

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.organizationId, org.id)))
    .limit(1);
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Extract the storage path from the public URL
  const storagePrefix = `/storage/v1/object/public/property-images/`;
  const pathIndex = url.indexOf(storagePrefix);
  if (pathIndex !== -1) {
    const storagePath = url.slice(pathIndex + storagePrefix.length);
    await supabase.storage.from("property-images").remove([storagePath]);
  }

  const updatedUrls = (property.imageUrls ?? []).filter((u) => u !== url);

  await db
    .update(properties)
    .set({ imageUrls: updatedUrls, updatedAt: new Date() })
    .where(eq(properties.id, id));

  return NextResponse.json({ imageUrls: updatedUrls });
}
