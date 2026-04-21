-- EAN-adressenregister + lookup (zelfde model als energiebelastingloket3).
-- Data: importeer zelf (COPY/CSV) of kopieer vanuit het andere project.
-- Alleen service_role mag RPC lookup_ean_adres uitvoeren.

create table if not exists public.ean_adressen (
  id bigserial primary key,
  bron_id bigint,
  straat text not null,
  huisnummer text not null,
  huisletter text,
  toevoeging text,
  postcode text not null,
  postcode_normalized text not null,
  plaats text not null,
  ean text,
  gas_ean text,
  created_at timestamptz default now()
);

comment on table public.ean_adressen is 'Adresregels gekoppeld aan EAN; alleen server-side lookup via API (service role).';
comment on column public.ean_adressen.ean is 'Stroom-EAN (elk_ean); NULL = geen stroom-EAN in bron.';
comment on column public.ean_adressen.gas_ean is 'Gas-EAN uit bron; NULL = geen gas-EAN.';

create index if not exists idx_ean_adressen_lookup
  on public.ean_adressen (postcode_normalized, huisnummer, coalesce(huisletter, ''), coalesce(toevoeging, ''));

create index if not exists idx_ean_adressen_postcode
  on public.ean_adressen (postcode_normalized);

alter table public.ean_adressen enable row level security;

drop function if exists public.lookup_ean_adres(text, text, text, text);

create function public.lookup_ean_adres(
  p_postcode_normalized text,
  p_huisnummer text,
  p_huisletter text default null,
  p_toevoeging text default null
)
returns table (
  ean text,
  gas_ean text,
  straat text,
  plaats text,
  postcode text,
  huisnummer text,
  huisletter text,
  toevoeging text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    e.ean,
    e.gas_ean,
    e.straat,
    e.plaats,
    e.postcode,
    e.huisnummer,
    e.huisletter,
    e.toevoeging
  from public.ean_adressen e
  where e.postcode_normalized = p_postcode_normalized
    and e.huisnummer = p_huisnummer
    and coalesce(e.huisletter, '') = coalesce(nullif(trim(coalesce(p_huisletter, '')), ''), '')
    and coalesce(e.toevoeging, '') = coalesce(nullif(trim(coalesce(p_toevoeging, '')), ''), '')
  limit 5;
$$;

revoke all on function public.lookup_ean_adres(text, text, text, text) from public;
grant execute on function public.lookup_ean_adres(text, text, text, text) to service_role;
