import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
  varchar,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const planTierEnum = pgEnum("plan_tier", [
  "free",
  "starter",
  "growth",
  "enterprise",
]);

export const orgMemberRoleEnum = pgEnum("org_member_role", [
  "owner",
  "admin",
  "agent",
  "viewer",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "single_family",
  "condo",
  "townhome",
  "apartment",
  "land",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "active",
  "inactive",
  "sold",
  "pending",
]);

export const idVerificationMethodEnum = pgEnum("id_verification_method", [
  "stripe_identity",
  "manual",
  "none",
]);

export const tourStatusEnum = pgEnum("tour_status", [
  "scheduled",
  "access_sent",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);

export const tourEventTypeEnum = pgEnum("tour_event_type", [
  "door_unlocked",
  "door_locked",
  "access_code_created",
  "access_code_deleted",
  "sms_sent",
  "email_sent",
  "ai_response",
  "status_changed",
  "no_show_detected",
  "hub_offline",
  "hub_low_battery",
]);

export const messageTriggerEnum = pgEnum("message_trigger", [
  "tour_booked",
  "reminder_24h",
  "reminder_1h",
  "access_code_sent",
  "tour_started",
  "tour_ending",
  "tour_completed",
  "no_show",
  "follow_up_1h",
  "follow_up_24h",
  "nurture_72h",
]);

export const messageChannelEnum = pgEnum("message_channel", ["sms", "email"]);

export const lockProviderEnum = pgEnum("lock_provider", ["seam", "pi"]);

export const hubCommandStatusEnum = pgEnum("hub_command_status", [
  "pending",
  "executing",
  "completed",
  "failed",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }).notNull().default("#2563eb"),
  planTier: planTierEnum("plan_tier").notNull().default("free"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  twilioPhoneNumber: varchar("twilio_phone_number", { length: 20 }),
  resendDomain: varchar("resend_domain", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orgMembers = pgTable("org_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  role: orgMemberRoleEnum("role").notNull().default("agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const communities = pgTable("communities", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zip: varchar("zip", { length: 20 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  communityId: uuid("community_id").references(() => communities.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zip: varchar("zip", { length: 20 }).notNull(),
  type: propertyTypeEnum("type").notNull().default("single_family"),
  status: propertyStatusEnum("status").notNull().default("active"),
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareFeet: integer("square_feet"),
  price: integer("price"),
  description: text("description"),
  imageUrls: jsonb("image_urls").$type<string[]>().notNull().default([]),
  seamDeviceId: varchar("seam_device_id", { length: 255 }), // generic deviceId — works for both Seam and Pi
  lockProvider: lockProviderEnum("lock_provider").notNull().default("seam"),
  tourDurationMinutes: integer("tour_duration_minutes").notNull().default(30),
  bufferMinutes: integer("buffer_minutes").notNull().default(10),
  availableFrom: varchar("available_from", { length: 5 }).default("09:00"),
  availableTo: varchar("available_to", { length: 5 }).default("17:00"),
  availableDays: jsonb("available_days").$type<number[]>().notNull().default([1, 2, 3, 4, 5]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hubs = pgTable("hubs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  authTokenHash: varchar("auth_token_hash", { length: 64 }).notNull(), // SHA-256 hex of auth token
  claimCode: varchar("claim_code", { length: 10 }).unique(),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  hostname: varchar("hostname", { length: 100 }),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  firmwareVersion: varchar("firmware_version", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hubCommands = pgTable("hub_commands", {
  id: uuid("id").defaultRandom().primaryKey(),
  hubId: uuid("hub_id")
    .notNull()
    .references(() => hubs.id, { onDelete: "cascade" }),
  commandType: varchar("command_type", { length: 50 }).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  status: hubCommandStatusEnum("status").notNull().default("pending"),
  result: jsonb("result").$type<Record<string, unknown>>(),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const visitors = pgTable("visitors", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  idVerificationMethod: idVerificationMethodEnum("id_verification_method")
    .notNull()
    .default("none"),
  idVerificationStatus: varchar("id_verification_status", { length: 20 }),
  stripeIdentitySessionId: varchar("stripe_identity_session_id", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tours = pgTable("tours", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  visitorId: uuid("visitor_id")
    .notNull()
    .references(() => visitors.id, { onDelete: "cascade" }),
  status: tourStatusEnum("status").notNull().default("scheduled"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  seamAccessCodeId: varchar("seam_access_code_id", { length: 255 }), // generic lock code ID (prefixed: "seam:..." or "pi:...")
  accessCode: varchar("access_code", { length: 10 }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  cancelReason: text("cancel_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tourEvents = pgTable("tour_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  tourId: uuid("tour_id")
    .notNull()
    .references(() => tours.id, { onDelete: "cascade" }),
  eventType: tourEventTypeEnum("event_type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiKnowledgeEntries = pgTable("ai_knowledge_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  communityId: uuid("community_id").references(() => communities.id, {
    onDelete: "cascade",
  }),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "cascade",
  }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tourId: uuid("tour_id")
    .notNull()
    .references(() => tours.id, { onDelete: "cascade" }),
  visitorPhone: varchar("visitor_phone", { length: 20 }).notNull(),
  inboundMessage: text("inbound_message").notNull(),
  outboundMessage: text("outbound_message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messageTemplates = pgTable("message_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  trigger: messageTriggerEnum("trigger").notNull(),
  channel: messageChannelEnum("channel").notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(orgMembers),
  communities: many(communities),
  properties: many(properties),
  visitors: many(visitors),
  tours: many(tours),
  knowledgeEntries: many(aiKnowledgeEntries),
  messageTemplates: many(messageTemplates),
  hubs: many(hubs),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [communities.organizationId],
    references: [organizations.id],
  }),
  properties: many(properties),
  knowledgeEntries: many(aiKnowledgeEntries),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [properties.organizationId],
    references: [organizations.id],
  }),
  community: one(communities, {
    fields: [properties.communityId],
    references: [communities.id],
  }),
  tours: many(tours),
  knowledgeEntries: many(aiKnowledgeEntries),
  hub: one(hubs, {
    fields: [properties.id],
    references: [hubs.propertyId],
  }),
}));

export const hubsRelations = relations(hubs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [hubs.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [hubs.propertyId],
    references: [properties.id],
  }),
  commands: many(hubCommands),
}));

export const hubCommandsRelations = relations(hubCommands, ({ one }) => ({
  hub: one(hubs, {
    fields: [hubCommands.hubId],
    references: [hubs.id],
  }),
}));

export const visitorsRelations = relations(visitors, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [visitors.organizationId],
    references: [organizations.id],
  }),
  tours: many(tours),
}));

export const toursRelations = relations(tours, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tours.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [tours.propertyId],
    references: [properties.id],
  }),
  visitor: one(visitors, {
    fields: [tours.visitorId],
    references: [visitors.id],
  }),
  events: many(tourEvents),
  conversations: many(aiConversations),
}));

export const tourEventsRelations = relations(tourEvents, ({ one }) => ({
  tour: one(tours, {
    fields: [tourEvents.tourId],
    references: [tours.id],
  }),
}));

export const aiKnowledgeRelations = relations(aiKnowledgeEntries, ({ one }) => ({
  organization: one(organizations, {
    fields: [aiKnowledgeEntries.organizationId],
    references: [organizations.id],
  }),
  community: one(communities, {
    fields: [aiKnowledgeEntries.communityId],
    references: [communities.id],
  }),
  property: one(properties, {
    fields: [aiKnowledgeEntries.propertyId],
    references: [properties.id],
  }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  tour: one(tours, {
    fields: [aiConversations.tourId],
    references: [tours.id],
  }),
}));

export const messageTemplatesRelations = relations(messageTemplates, ({ one }) => ({
  organization: one(organizations, {
    fields: [messageTemplates.organizationId],
    references: [organizations.id],
  }),
}));
