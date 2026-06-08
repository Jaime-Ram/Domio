-- Koppelingen tussen contacten en panden/portefeuilles.
-- Run this in the Supabase SQL editor before using contact links.

create table if not exists public.contact_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- precies één doelwit (pand óf portefeuille) per rij
  constraint contact_links_one_target check (
    (property_id is not null)::int + (portfolio_id is not null)::int = 1
  )
);

create index if not exists contact_links_contact_idx on public.contact_links (contact_id);
create index if not exists contact_links_owner_idx on public.contact_links (owner_id);
create unique index if not exists contact_links_unique_property
  on public.contact_links (contact_id, property_id) where property_id is not null;
create unique index if not exists contact_links_unique_portfolio
  on public.contact_links (contact_id, portfolio_id) where portfolio_id is not null;

alter table public.contact_links enable row level security;

drop policy if exists "Owners manage their contact links" on public.contact_links;
create policy "Owners manage their contact links" on public.contact_links
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
