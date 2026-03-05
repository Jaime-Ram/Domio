-- Add Tink payment request id to payments for callback matching
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS tink_payment_request_id text;
