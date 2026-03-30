-- ─── Enable pgcrypto for gen_random_uuid() ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE plan_tier AS ENUM ('free', 'starter', 'growth', 'enterprise');
CREATE TYPE org_member_role AS ENUM ('owner', 'admin', 'agent', 'viewer');
CREATE TYPE property_type AS ENUM ('single_family', 'condo', 'townhome', 'apartment', 'land');
CREATE TYPE property_status AS ENUM ('active', 'inactive', 'sold', 'pending');
CREATE TYPE id_verification_method AS ENUM ('stripe_identity', 'manual', 'none');
CREATE TYPE tour_status AS ENUM ('scheduled', 'access_sent', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE tour_event_type AS ENUM (
  'door_unlocked', 'door_locked', 'access_code_created', 'access_code_deleted',
  'sms_sent', 'email_sent', 'ai_response', 'status_changed',
  'no_show_detected', 'hub_offline', 'hub_low_battery'
);
CREATE TYPE message_trigger AS ENUM (
  'tour_booked', 'reminder_24h', 'reminder_1h', 'access_code_sent',
  'tour_started', 'tour_ending', 'tour_completed', 'no_show',
  'follow_up_1h', 'follow_up_24h', 'nurture_72h'
);
CREATE TYPE message_channel AS ENUM ('sms', 'email');

-- ─── Organizations ─────────────────────────────────────────────────────────────

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color VARCHAR(7) NOT NULL DEFAULT '#2563eb',
  plan_tier plan_tier NOT NULL DEFAULT 'free',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  twilio_phone_number VARCHAR(20),
  resend_domain VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Org members can read their own org
CREATE POLICY "org_members_can_read_org" ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM org_members
      WHERE user_id = auth.uid()
    )
  );

-- Only owners/admins can update
CREATE POLICY "owners_can_update_org" ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ─── Org Members ──────────────────────────────────────────────────────────────

CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role org_member_role NOT NULL DEFAULT 'agent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_can_read_own_membership" ON org_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "owners_can_manage_members" ON org_members
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Allow service role to insert (for signup flow)
CREATE POLICY "service_can_insert_members" ON org_members
  FOR INSERT
  WITH CHECK (true);

-- ─── Communities ──────────────────────────────────────────────────────────────

CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_read_communities" ON communities
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "admins_can_manage_communities" ON communities
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Public read for active properties lookup
CREATE POLICY "public_can_read_communities" ON communities
  FOR SELECT
  USING (true);

-- ─── Properties ───────────────────────────────────────────────────────────────

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  type property_type NOT NULL DEFAULT 'single_family',
  status property_status NOT NULL DEFAULT 'active',
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  price INTEGER,
  description TEXT,
  image_urls JSONB NOT NULL DEFAULT '[]',
  seam_device_id VARCHAR(255),
  tour_duration_minutes INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER NOT NULL DEFAULT 10,
  available_from VARCHAR(5) DEFAULT '09:00',
  available_to VARCHAR(5) DEFAULT '17:00',
  available_days JSONB NOT NULL DEFAULT '[1,2,3,4,5]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_crud_properties" ON properties
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- Public can read active properties (for visitor-facing pages)
CREATE POLICY "public_can_read_active_properties" ON properties
  FOR SELECT
  USING (status = 'active');

-- ─── Visitors ─────────────────────────────────────────────────────────────────

CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  id_verification_method id_verification_method NOT NULL DEFAULT 'none',
  id_verification_status VARCHAR(20),
  stripe_identity_session_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_read_visitors" ON visitors
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- Allow public insert (visitors register themselves)
CREATE POLICY "public_can_create_visitors" ON visitors
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "org_members_can_update_visitors" ON visitors
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- ─── Tours ────────────────────────────────────────────────────────────────────

CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  status tour_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  seam_access_code_id VARCHAR(255),
  access_code VARCHAR(10),
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tours_org_scheduled ON tours (organization_id, scheduled_at);
CREATE INDEX idx_tours_property ON tours (property_id);
CREATE INDEX idx_tours_visitor ON tours (visitor_id);
CREATE INDEX idx_tours_status ON tours (status);

ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_read_tours" ON tours
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_members_can_manage_tours" ON tours
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- Public can create tours (booking) and read their own tour
CREATE POLICY "public_can_create_tours" ON tours
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "public_can_read_own_tour" ON tours
  FOR SELECT
  USING (true); -- Further restricted in application layer

-- ─── Tour Events ──────────────────────────────────────────────────────────────

CREATE TABLE tour_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  event_type tour_event_type NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tour_events_tour_id ON tour_events (tour_id);
CREATE INDEX idx_tour_events_created_at ON tour_events (created_at DESC);

ALTER TABLE tour_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_read_tour_events" ON tour_events
  FOR SELECT
  USING (
    tour_id IN (
      SELECT t.id FROM tours t
      INNER JOIN org_members m ON m.organization_id = t.organization_id
      WHERE m.user_id = auth.uid()
    )
  );

-- Allow service role (Inngest) to insert events
CREATE POLICY "service_can_insert_tour_events" ON tour_events
  FOR INSERT
  WITH CHECK (true);

-- ─── AI Knowledge Entries ─────────────────────────────────────────────────────

CREATE TABLE ai_knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_knowledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_manage_knowledge" ON ai_knowledge_entries
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- ─── AI Conversations ─────────────────────────────────────────────────────────

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  visitor_phone VARCHAR(20) NOT NULL,
  inbound_message TEXT NOT NULL,
  outbound_message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_read_ai_conversations" ON ai_conversations
  FOR SELECT
  USING (
    tour_id IN (
      SELECT t.id FROM tours t
      INNER JOIN org_members m ON m.organization_id = t.organization_id
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "service_can_insert_ai_conversations" ON ai_conversations
  FOR INSERT
  WITH CHECK (true);

-- ─── Message Templates ────────────────────────────────────────────────────────

CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  trigger message_trigger NOT NULL,
  channel message_channel NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_manage_templates" ON message_templates
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- ─── Enable Realtime on tour_events ────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE tour_events;
ALTER PUBLICATION supabase_realtime ADD TABLE tours;

-- ─── Updated_at trigger function ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON visitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_knowledge_updated_at
  BEFORE UPDATE ON ai_knowledge_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
