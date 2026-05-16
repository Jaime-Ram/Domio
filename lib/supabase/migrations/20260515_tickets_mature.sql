-- Fase 1: Volwassen ticketsysteem — schema uitbreiding
-- Draai dit in de Supabase SQL editor

-- ─── Tickets: extra kolommen ──────────────────────────────────────────────────

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS category TEXT
    CHECK (category IN ('onderhoud','inspectie','klacht','compliance','huurgebeurtenis')),
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'landlord'
    CHECK (source IN ('landlord','tenant','system','flow')),
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Sequentieel ticketnummer (globaal)
CREATE SEQUENCE IF NOT EXISTS tickets_number_seq;
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS ticket_number INTEGER DEFAULT nextval('tickets_number_seq');

-- Backfill bestaande rijen krijgen automatisch nummers via de DEFAULT

-- ─── Messages: visibility kolom ───────────────────────────────────────────────

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public'
    CHECK (visibility IN ('public','internal'));

-- ─── ticket_events tabel ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ticket_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL,
  from_value  TEXT,
  to_value    TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ticket_events ENABLE ROW LEVEL SECURITY;

-- Verhuurder kan alles voor eigen tickets
CREATE POLICY "owner_manage_ticket_events"
  ON ticket_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_events.ticket_id AND t.owner_id = auth.uid()
    )
  );

-- Huurder kan events zien van hun eigen tickets
CREATE POLICY "tenant_view_ticket_events"
  ON ticket_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN leases l ON l.id = t.lease_id
      JOIN tenants ten ON ten.id = l.tenant_id
      WHERE t.id = ticket_events.ticket_id AND ten.profile_id = auth.uid()
    )
  );

-- ─── work_orders tabel ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS work_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vendor_name   TEXT,
  description   TEXT,
  scheduled_at  TIMESTAMPTZ,
  cost_estimate NUMERIC(10,2),
  cost_actual   NUMERIC(10,2),
  status        TEXT NOT NULL DEFAULT 'concept'
    CHECK (status IN ('concept','ingepland','uitgevoerd','gefactureerd')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Verhuurder kan werkbonnen voor eigen tickets beheren
CREATE POLICY "owner_manage_work_orders"
  ON work_orders FOR ALL
  USING (owner_id = auth.uid());
