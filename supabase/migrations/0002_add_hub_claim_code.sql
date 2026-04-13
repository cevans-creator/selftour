-- Make organizationId nullable (unclaimed hubs have no org)
ALTER TABLE "hubs" ALTER COLUMN "organization_id" DROP NOT NULL;

-- Add claim code, claimed timestamp, and hostname columns
ALTER TABLE "hubs" ADD COLUMN IF NOT EXISTS "claim_code" varchar(10) UNIQUE;
ALTER TABLE "hubs" ADD COLUMN IF NOT EXISTS "claimed_at" timestamp with time zone;
ALTER TABLE "hubs" ADD COLUMN IF NOT EXISTS "hostname" varchar(100);
