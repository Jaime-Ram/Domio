-- Add servicekosten voorschot to leases
ALTER TABLE public.leases ADD COLUMN IF NOT EXISTS servicekosten_voorschot NUMERIC(10,2) DEFAULT 0;

-- Settlements table for service charge settlements (huurafrekening)
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_voorschot NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_actual_costs NUMERIC(10,2) NOT NULL DEFAULT 0,
    balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    cost_breakdown JSONB,
    status TEXT NOT NULL DEFAULT 'concept' CHECK (status IN ('concept', 'definitief', 'verzonden')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settlements: select own" ON public.settlements FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Settlements: insert own" ON public.settlements FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Settlements: update own" ON public.settlements FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Settlements: delete own" ON public.settlements FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TRIGGER tr_settlements_upd BEFORE UPDATE ON public.settlements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- v2: add lifecycle timestamps and 'nietig' (void) status
ALTER TABLE public.settlements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.settlements ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE public.settlements ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;
ALTER TABLE public.settlements DROP CONSTRAINT IF EXISTS settlements_status_check;
ALTER TABLE public.settlements ADD CONSTRAINT settlements_status_check CHECK (status IN ('concept', 'definitief', 'verzonden', 'nietig'));

-- v3: add 'verrekend' status
ALTER TABLE public.settlements DROP CONSTRAINT IF EXISTS settlements_status_check;
ALTER TABLE public.settlements ADD CONSTRAINT settlements_status_check CHECK (status = ANY (ARRAY['concept'::text, 'definitief'::text, 'verzonden'::text, 'verrekend'::text, 'nietig'::text]));
