-- Add IBAN field to tenants for payment matching
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS iban TEXT;

-- Grant service_role access to payment_assignments
GRANT ALL ON TABLE public.payment_assignments TO service_role;
