-- Manual expenses table for property-linked costs entered by the user
CREATE TABLE IF NOT EXISTS public.manual_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('onderhoud', 'verzekering', 'belasting', 'energie', 'vve', 'hypotheek', 'beheer', 'overig')),
    amount NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.manual_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manual expenses: select own" ON public.manual_expenses FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Manual expenses: insert own" ON public.manual_expenses FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Manual expenses: update own" ON public.manual_expenses FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Manual expenses: delete own" ON public.manual_expenses FOR DELETE TO authenticated USING (owner_id = auth.uid());
