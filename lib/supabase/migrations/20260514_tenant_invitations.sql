-- Tenant invitations: tracks invitation state
-- JWT token is stateless; this table tracks accept/cancel status per tenant.

CREATE TABLE public.tenant_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'cancelled')),
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

-- Landlords can manage their own invitations
CREATE POLICY "owners can manage invitations"
  ON public.tenant_invitations
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Index for fast lookup by tenant
CREATE INDEX ON public.tenant_invitations (tenant_id);
CREATE INDEX ON public.tenant_invitations (owner_id, status);
