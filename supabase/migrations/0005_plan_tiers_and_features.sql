-- New plan tiers
ALTER TYPE "plan_tier" ADD VALUE IF NOT EXISTS 'rookie';
ALTER TYPE "plan_tier" ADD VALUE IF NOT EXISTS 'pro';
ALTER TYPE "plan_tier" ADD VALUE IF NOT EXISTS 'elite';

-- Credit card verification method
ALTER TYPE "id_verification_method" ADD VALUE IF NOT EXISTS 'stripe_card';

-- Lead source tracking on tours
ALTER TABLE "tours" ADD COLUMN IF NOT EXISTS "source" varchar(100);

-- CRM webhook URL on organizations
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "crm_webhook_url" varchar(500);

-- Default plan tier for new orgs
ALTER TABLE "organizations" ALTER COLUMN "plan_tier" SET DEFAULT 'rookie';
