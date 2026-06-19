-- Accountview als payment-provider toevoegen.
-- NIET automatisch op de live DB uitgevoerd; review en draai bewust.

-- 1. Sta 'accountview' (en 'tink', dat de code al wegschrijft) toe als payment-source.
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_source_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_source_check
  CHECK (source = ANY (ARRAY['yapily'::text, 'tink'::text, 'accountview'::text, 'manual'::text, 'camt053'::text]));

-- 2. Connectie-config voor non-OAuth providers (Accountview-webservice).
--    Bevat het endpoint (plaintext) en versleutelde credentials.
--    Vorm: { "endpoint": "https://...", "secret": "v1:..." }  (zie lib/crypto/secrets.ts)
ALTER TABLE public.bank_connections
  ADD COLUMN IF NOT EXISTS config jsonb;

-- 3. Eén koppeling per gebruiker per provider (nodig voor upsert onConflict).
CREATE UNIQUE INDEX IF NOT EXISTS bank_connections_owner_provider_key
  ON public.bank_connections (owner_id, provider);
