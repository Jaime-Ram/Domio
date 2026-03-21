-- Add category column to payment_assignments for non-rent transaction categorization
ALTER TABLE public.payment_assignments ADD COLUMN IF NOT EXISTS category TEXT;
