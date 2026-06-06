-- Flows: persisted automation flows per owner
-- Run this in the Supabase SQL editor (or via the CLI) before using the Flows feature.

create table if not exists public.flows (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  template_id text not null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  category text,
  trigger text,
  trigger_conf jsonb not null default '{}'::jsonb,
  configured_steps jsonb not null default '[]'::jsonb,
  property_scope jsonb not null default '{"type":"all","propertyIds":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flows_owner_id_idx on public.flows (owner_id);

alter table public.flows enable row level security;

drop policy if exists "Owners manage their flows" on public.flows;
create policy "Owners manage their flows" on public.flows
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
