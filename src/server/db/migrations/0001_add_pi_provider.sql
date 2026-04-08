-- Add lock provider enum and column to properties
CREATE TYPE lock_provider AS ENUM ('seam', 'pi');
ALTER TABLE properties ADD COLUMN lock_provider lock_provider NOT NULL DEFAULT 'seam';

-- Hub command status enum
CREATE TYPE hub_command_status AS ENUM ('pending', 'executing', 'completed', 'failed');

-- Hubs table (Raspberry Pi devices)
CREATE TABLE hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  auth_token_hash VARCHAR(64) NOT NULL,
  last_seen_at TIMESTAMPTZ,
  firmware_version VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hub commands table
CREATE TABLE hub_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  command_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status hub_command_status NOT NULL DEFAULT 'pending',
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for polling performance
CREATE INDEX hub_commands_hub_id_status ON hub_commands(hub_id, status) WHERE status IN ('pending', 'executing');
CREATE INDEX hubs_org_id ON hubs(organization_id);
