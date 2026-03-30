// ─── Enums ────────────────────────────────────────────────────────────────────

export type PlanTier = "free" | "starter" | "growth" | "enterprise";
export type OrgMemberRole = "owner" | "admin" | "agent" | "viewer";
export type PropertyType = "single_family" | "condo" | "townhome" | "apartment" | "land";
export type PropertyStatus = "active" | "inactive" | "sold" | "pending";
export type IdVerificationMethod = "stripe_identity" | "manual" | "none";
export type TourStatus =
  | "scheduled"
  | "access_sent"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";
export type TourEventType =
  | "door_unlocked"
  | "door_locked"
  | "access_code_created"
  | "access_code_deleted"
  | "sms_sent"
  | "email_sent"
  | "ai_response"
  | "status_changed"
  | "no_show_detected"
  | "hub_offline"
  | "hub_low_battery";
export type MessageTrigger =
  | "tour_booked"
  | "reminder_24h"
  | "reminder_1h"
  | "access_code_sent"
  | "tour_started"
  | "tour_ending"
  | "tour_completed"
  | "no_show"
  | "follow_up_1h"
  | "follow_up_24h"
  | "nurture_72h";
export type MessageChannel = "sms" | "email";

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  planTier: PlanTier;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  twilioPhoneNumber: string | null;
  resendDomain: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgMemberRole;
  createdAt: Date;
}

export interface Community {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  organizationId: string;
  communityId: string | null;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number | null;
  bathrooms: string | null;
  squareFeet: number | null;
  price: number | null;
  description: string | null;
  imageUrls: string[];
  seamDeviceId: string | null;
  tourDurationMinutes: number;
  bufferMinutes: number;
  availableFrom: string | null;
  availableTo: string | null;
  availableDays: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Visitor {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idVerificationMethod: IdVerificationMethod;
  idVerificationStatus: "pending" | "verified" | "failed" | null;
  stripeIdentitySessionId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tour {
  id: string;
  organizationId: string;
  propertyId: string;
  visitorId: string;
  status: TourStatus;
  scheduledAt: Date;
  endsAt: Date;
  seamAccessCodeId: string | null;
  accessCode: string | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TourEvent {
  id: string;
  tourId: string;
  eventType: TourEventType;
  payload: Record<string, unknown> | null;
  createdAt: Date;
}

export interface AiKnowledgeEntry {
  id: string;
  organizationId: string;
  communityId: string | null;
  propertyId: string | null;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiConversation {
  id: string;
  tourId: string;
  visitorPhone: string;
  inboundMessage: string;
  outboundMessage: string;
  createdAt: Date;
}

export interface MessageTemplate {
  id: string;
  organizationId: string;
  trigger: MessageTrigger;
  channel: MessageChannel;
  subject: string | null;
  body: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── API / tRPC Types ─────────────────────────────────────────────────────────

export interface TourWithDetails extends Tour {
  property: Property;
  visitor: Visitor;
}

export interface PropertyWithStatus extends Property {
  lockOnline: boolean | null;
  lockBattery: number | null;
  lockLocked: boolean | null;
  upcomingTourCount: number;
  community: Community | null;
}

export interface DashboardKPIs {
  toursToday: number;
  toursThisWeek: number;
  conversionRate: number;
  noShowRate: number;
  totalVisitors: number;
  activeProperties: number;
}

export interface TimeSlot {
  startsAt: Date;
  endsAt: Date;
  available: boolean;
}

export interface SeamDevice {
  deviceId: string;
  name: string;
  type: string;
  connected: boolean;
  locked: boolean | null;
  batteryLevel: number | null;
}
