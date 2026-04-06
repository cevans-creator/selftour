import type { OrgInfo, Property, Booking } from "../types";

export interface OrgPropertiesResponse {
  org: OrgInfo;
  properties: Property[];
}

export interface PropertyDetailResponse {
  org: OrgInfo;
  property: Property;
  bookings: Booking[];
}

export interface BookResponse {
  tourId: string;
  accessUrl: string;
}

export async function fetchOrgProperties(
  apiBase: string,
  orgSlug: string
): Promise<OrgPropertiesResponse> {
  const res = await fetch(`${apiBase}/api/tour/${orgSlug}`);
  if (!res.ok) throw new Error("Organization not found");
  return res.json() as Promise<OrgPropertiesResponse>;
}

export async function fetchPropertyDetail(
  apiBase: string,
  orgSlug: string,
  propertyId: string
): Promise<PropertyDetailResponse> {
  const res = await fetch(`${apiBase}/api/tour/${orgSlug}/${propertyId}`);
  if (!res.ok) throw new Error("Property not found");
  return res.json() as Promise<PropertyDetailResponse>;
}

export async function bookTour(
  apiBase: string,
  body: {
    orgSlug: string;
    propertyId: string;
    scheduledAt: string;
    visitorFirstName: string;
    visitorLastName: string;
    visitorEmail: string;
    visitorPhone: string;
  }
): Promise<BookResponse> {
  const res = await fetch(`${apiBase}/api/tour/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json() as { tourId?: string; accessUrl?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Booking failed");
  return data as BookResponse;
}
