-- Extend tickets table with property, lease, scope and due_date
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lease_id    uuid REFERENCES public.leases(id)     ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS scope       text CHECK (scope IN ('pand', 'persoon')),
  ADD COLUMN IF NOT EXISTS due_date    date;

-- Add 'gepland' to status (was missing from original constraint)
ALTER TABLE public.tickets
  DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_status_check
    CHECK (status = ANY (ARRAY['open','in_behandeling','gepland','afgerond','geannuleerd']));

-- Tenant ziet ook tickets die direct aan hun lease gekoppeld zijn
CREATE POLICY IF NOT EXISTS "tenants can view tickets on their lease"
  ON public.tickets FOR SELECT
  USING (
    lease_id IN (
      SELECT l.id
      FROM public.leases l
      INNER JOIN public.tenants t ON t.id = l.tenant_id
      WHERE t.profile_id = auth.uid()
        AND l.status = 'actief'
    )
  );
