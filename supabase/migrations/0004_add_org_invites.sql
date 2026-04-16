-- Organization invites table for team member invitations
CREATE TABLE IF NOT EXISTS "org_invites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "email" varchar(255) NOT NULL,
  "role" "org_member_role" NOT NULL DEFAULT 'agent',
  "token" varchar(64) NOT NULL UNIQUE,
  "invited_by" uuid NOT NULL,
  "accepted_at" timestamp with time zone,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
