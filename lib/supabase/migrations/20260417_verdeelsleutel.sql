-- Verdeelsleutel: cost allocation key templates
CREATE TABLE IF NOT EXISTS cost_allocation_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  name        text NOT NULL,
  method      text NOT NULL CHECK (method IN ('equal', 'surface_area', 'custom')),
  units       jsonb NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS cost_allocation_key_id uuid
  REFERENCES cost_allocation_keys(id) ON DELETE SET NULL;

ALTER TABLE payment_assignments
  ADD COLUMN IF NOT EXISTS cost_allocation_key_id uuid
  REFERENCES cost_allocation_keys(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE cost_allocation_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON cost_allocation_keys
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
