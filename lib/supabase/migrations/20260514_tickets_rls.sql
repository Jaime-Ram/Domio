-- RLS voor tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Verhuurder beheert eigen tickets
CREATE POLICY "owners can manage their tickets"
  ON public.tickets FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Huurder ziet tickets van zijn actieve eenheden
CREATE POLICY "tenants can view tickets on their unit"
  ON public.tickets FOR SELECT
  USING (
    unit_id IN (
      SELECT u.id
      FROM public.units u
      INNER JOIN public.leases l ON l.unit_id = u.id
      INNER JOIN public.tenants t ON t.id = l.tenant_id
      WHERE t.profile_id = auth.uid()
        AND l.status = 'actief'
    )
  );

-- Huurder kan ticket aanmaken op zijn actieve eenheid
CREATE POLICY "tenants can create tickets on their unit"
  ON public.tickets FOR INSERT
  WITH CHECK (
    unit_id IN (
      SELECT u.id
      FROM public.units u
      INNER JOIN public.leases l ON l.unit_id = u.id
      INNER JOIN public.tenants t ON t.id = l.tenant_id
      WHERE t.profile_id = auth.uid()
        AND l.status = 'actief'
    )
  );

-- RLS voor messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Berichten lezen op toegankelijke tickets
CREATE POLICY "users can view messages on accessible tickets"
  ON public.messages FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM public.tickets
      WHERE owner_id = auth.uid()
    )
    OR
    ticket_id IN (
      SELECT tk.id
      FROM public.tickets tk
      INNER JOIN public.units u ON u.id = tk.unit_id
      INNER JOIN public.leases l ON l.unit_id = u.id
      INNER JOIN public.tenants t ON t.id = l.tenant_id
      WHERE t.profile_id = auth.uid()
        AND l.status = 'actief'
    )
  );

-- Berichten sturen op toegankelijke tickets
CREATE POLICY "users can send messages on accessible tickets"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      ticket_id IN (
        SELECT id FROM public.tickets WHERE owner_id = auth.uid()
      )
      OR
      ticket_id IN (
        SELECT tk.id
        FROM public.tickets tk
        INNER JOIN public.units u ON u.id = tk.unit_id
        INNER JOIN public.leases l ON l.unit_id = u.id
        INNER JOIN public.tenants t ON t.id = l.tenant_id
        WHERE t.profile_id = auth.uid()
          AND l.status = 'actief'
      )
    )
  );
