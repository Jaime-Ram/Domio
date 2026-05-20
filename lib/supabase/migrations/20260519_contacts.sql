-- Contactboek: loodgieters, aannemers, elektriciens, etc. per verhuurder
CREATE TABLE IF NOT EXISTS public.contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  company     TEXT,
  category    TEXT NOT NULL DEFAULT 'overig'
                CHECK (category IN ('loodgieter','aannemer','elektricien','schilder','schoonmaak','overig')),
  phone       TEXT,
  email       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Eigenaar beheert eigen contacten" ON public.contacts;
CREATE POLICY "Eigenaar beheert eigen contacten"
  ON public.contacts FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS contacts_owner_id_idx ON public.contacts (owner_id);
