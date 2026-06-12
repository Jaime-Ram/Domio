-- Per pand bijhouden welke compliance-items op orde zijn.
-- Aanwezigheid van een rij = item afgevinkt; afvinken weghalen = rij verwijderen.

create table if not exists public.compliance_checks (
  owner_id uuid not null references public.profiles(id),
  property_id uuid not null references public.properties(id) on delete cascade,
  item_key text not null,
  created_at timestamptz not null default now(),
  primary key (property_id, item_key)
);

alter table public.compliance_checks enable row level security;

drop policy if exists "compliance_owner_all" on public.compliance_checks;
create policy "compliance_owner_all" on public.compliance_checks
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

grant all on public.compliance_checks to authenticated, service_role;
