-- Huurindexatie velden op leases
-- base_rent = oorspronkelijke huur bij ondertekening (referentie voor herberekening)
-- indexation_method: geen / CPI / CPI+opslag / vast percentage
-- indexation_pct: opslag bovenop CPI (bij cpi_plus) of vast % (bij fixed)
-- index_month: maand (1-12) waarop jaarlijkse indexatie plaatsvindt
-- last_indexed_at: datum van laatste indexatie (null = nog nooit geïndexeerd)

ALTER TABLE public.leases
  ADD COLUMN IF NOT EXISTS base_rent          NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS indexation_method  TEXT NOT NULL DEFAULT 'none'
    CHECK (indexation_method IN ('none', 'cpi', 'cpi_plus', 'fixed')),
  ADD COLUMN IF NOT EXISTS indexation_pct     NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS index_month        INTEGER
    CHECK (index_month BETWEEN 1 AND 12),
  ADD COLUMN IF NOT EXISTS last_indexed_at    DATE;

-- Vul base_rent voor bestaande leases in vanuit huidige monthly_rent
UPDATE public.leases SET base_rent = monthly_rent WHERE base_rent IS NULL;
