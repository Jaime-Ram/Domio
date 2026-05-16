-- Ticket bijlagen tabel (foto's, PDF's)
-- Gebruikt de bestaande `documents` storage bucket

CREATE TABLE IF NOT EXISTS ticket_attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id    UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uploader_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_name    TEXT NOT NULL,
  mime_type    TEXT,
  storage_path TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Verhuurder kan bijlagen bij eigen tickets beheren
CREATE POLICY "owner_manage_ticket_attachments"
  ON ticket_attachments FOR ALL
  USING (owner_id = auth.uid());

-- Huurder kan bijlagen zien van eigen tickets
CREATE POLICY "tenant_view_ticket_attachments"
  ON ticket_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN leases l ON l.id = t.lease_id
      JOIN tenants ten ON ten.id = l.tenant_id
      WHERE t.id = ticket_attachments.ticket_id AND ten.profile_id = auth.uid()
    )
  );

-- Huurder kan bijlagen toevoegen aan eigen tickets
CREATE POLICY "tenant_insert_ticket_attachments"
  ON ticket_attachments FOR INSERT
  WITH CHECK (
    uploader_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tickets t
      JOIN leases l ON l.id = t.lease_id
      JOIN tenants ten ON ten.id = l.tenant_id
      WHERE t.id = ticket_attachments.ticket_id AND ten.profile_id = auth.uid()
    )
  );
