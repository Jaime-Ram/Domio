-- RLS policies for lease_tenants
-- lease_tenants has no owner_id, so ownership is derived from the related lease.

ALTER TABLE public.lease_tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lease_tenants: owner can select"
  ON public.lease_tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leases
      WHERE leases.id = lease_tenants.lease_id
        AND leases.owner_id = auth.uid()
    )
  );

CREATE POLICY "lease_tenants: owner can insert"
  ON public.lease_tenants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leases
      WHERE leases.id = lease_tenants.lease_id
        AND leases.owner_id = auth.uid()
    )
  );

CREATE POLICY "lease_tenants: owner can update"
  ON public.lease_tenants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.leases
      WHERE leases.id = lease_tenants.lease_id
        AND leases.owner_id = auth.uid()
    )
  );

CREATE POLICY "lease_tenants: owner can delete"
  ON public.lease_tenants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.leases
      WHERE leases.id = lease_tenants.lease_id
        AND leases.owner_id = auth.uid()
    )
  );
