-- Betaalflow: reusable payment profile templates
CREATE TABLE IF NOT EXISTS payment_profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  pay_date    integer NOT NULL DEFAULT 1 CHECK (pay_date BETWEEN 1 AND 28),
  reminders   integer[] NOT NULL DEFAULT '{-3, 7, 14}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS payment_profile_id uuid
  REFERENCES payment_profiles(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS payment_profile_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  profile_id  uuid REFERENCES payment_profiles(id) ON DELETE SET NULL,
  event       text NOT NULL CHECK (event IN ('reminder', 'overdue', 'paid')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE payment_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_profile_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON payment_profiles
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_all" ON payment_profile_events
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
