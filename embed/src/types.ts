export interface OrgInfo {
  name: string;
  primaryColor: string;
  logoUrl: string | null;
  slug: string;
  twilioPhoneNumber: string | null;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: number | null;
  bathrooms: string | null;
  squareFeet: number | null;
  price: number | null;
  description: string | null;
  imageUrls: string[];
  tourDurationMinutes: number;
  bufferMinutes: number;
  availableFrom: string | null;
  availableTo: string | null;
  availableDays: number[];
}

export interface Booking {
  scheduledAt: string;
  endsAt: string;
}

export interface TimeSlot {
  startsAt: Date;
  endsAt: Date;
  available: boolean;
}

export type Step =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "pick_property"; org: OrgInfo; properties: Property[] }
  | { type: "pick_slot"; org: OrgInfo; property: Property; bookings: Booking[] }
  | { type: "register"; org: OrgInfo; property: Property; slot: TimeSlot }
  | { type: "confirm"; org: OrgInfo; property: Property; slot: TimeSlot; tourId: string; accessUrl: string };
