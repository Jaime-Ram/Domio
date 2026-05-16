-- Huurder mag public berichten sturen op eigen tickets
CREATE POLICY "tenant_insert_public_messages"
  ON messages FOR INSERT
  WITH CHECK (
    visibility = 'public'
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tickets t
      JOIN leases l ON l.id = t.lease_id
      JOIN tenants ten ON ten.id = l.tenant_id
      WHERE t.id = messages.ticket_id AND ten.profile_id = auth.uid()
    )
  );
