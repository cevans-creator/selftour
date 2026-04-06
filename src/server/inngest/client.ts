import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "selftour",
  name: "KeySherpa",
});

// ─── Event type definitions ───────────────────────────────────────────────────

export interface TourBookedEvent {
  name: "tour/booked";
  data: {
    tourId: string;
    propertyId: string;
    visitorId: string;
    organizationId: string;
    scheduledAt: string; // ISO
    endsAt: string; // ISO
    visitorPhone: string;
    visitorEmail: string;
    visitorFirstName: string;
    propertyAddress: string;
    seamDeviceId: string | null;
    accessUrl: string;
    manageUrl: string;
    orgName: string;
    orgLogoUrl: string | null;
    orgPrimaryColor: string;
  };
}

export interface TourCancelledEvent {
  name: "tour/cancelled";
  data: {
    tourId: string;
    reason?: string;
  };
}
