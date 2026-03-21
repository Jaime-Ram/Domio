-- Allow 'settled' and 'ignored' status values for bulk arrear management
ALTER TABLE public.rent_expectations DROP CONSTRAINT IF EXISTS rent_expectations_status_check;
ALTER TABLE public.rent_expectations ADD CONSTRAINT rent_expectations_status_check
  CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'settled', 'ignored'));
