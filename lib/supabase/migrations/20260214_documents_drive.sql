-- ==========================================
-- Documenten Drive: storage_path, source, template_type
-- ==========================================
-- Ondersteunt:
-- - Uploads: bestand in Supabase Storage, pad in storage_path
-- - Gegenereerde PDF's: Domio genereert bv. huurcontract, puntentelling; source = 'generated'

alter table public.documents
  add column if not exists storage_path text,
  add column if not exists source text check (source is null or source in ('upload', 'generated')),
  add column if not exists template_type text;

comment on column public.documents.storage_path is 'Pad in Storage bucket documents, bijv. {owner_id}/{document_id}/{file_name}';
comment on column public.documents.source is 'upload = door gebruiker geüpload, generated = door Domio gegenereerd';
comment on column public.documents.template_type is 'Bij source=generated: welk template, bv. huurcontract, puntentelling_wws';
