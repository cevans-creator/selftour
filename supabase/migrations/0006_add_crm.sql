-- CRM pipeline stages
CREATE TYPE "crm_stage" AS ENUM (
  'new_lead',
  'demo_scheduled',
  'demo_completed',
  'proposal_sent',
  'negotiating',
  'closed_won',
  'closed_lost'
);

-- CRM contacts (KeySherpa sales pipeline)
CREATE TABLE IF NOT EXISTS "crm_contacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_name" varchar(255) NOT NULL,
  "contact_name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(20),
  "property_count" varchar(20),
  "stage" "crm_stage" NOT NULL DEFAULT 'new_lead',
  "source" varchar(100),
  "value" integer,
  "next_follow_up" timestamp with time zone,
  "closed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- CRM notes
CREATE TABLE IF NOT EXISTS "crm_notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "contact_id" uuid NOT NULL REFERENCES "crm_contacts"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "created_by" varchar(255),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
