-- Extend profiles for company details, notification prefs, language
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_address text,
  ADD COLUMN IF NOT EXISTS company_postal_code text,
  ADD COLUMN IF NOT EXISTS company_city text,
  ADD COLUMN IF NOT EXISTS company_email text,
  ADD COLUMN IF NOT EXISTS company_phone text,
  ADD COLUMN IF NOT EXISTS btw_number text,
  ADD COLUMN IF NOT EXISTS company_logo_url text,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'nl' CHECK (language IN ('nl', 'en')),
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb NOT NULL DEFAULT '{"email":true,"push":false,"in_app":true,"new_payment":true,"payment_overdue":true,"maintenance_request":true,"document_expiring":true}'::jsonb;
