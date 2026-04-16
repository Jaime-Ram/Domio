-- Add EAN codes (energy connection identifiers) to properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS ean_electricity text,
  ADD COLUMN IF NOT EXISTS ean_gas text;
