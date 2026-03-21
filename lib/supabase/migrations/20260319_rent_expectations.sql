-- ==========================================
-- Rent Expectations (expected monthly payments)
-- ==========================================

create table if not exists public.rent_expectations (
    id              uuid default gen_random_uuid() primary key,
    owner_id        uuid references public.profiles(id) on delete cascade not null,
    lease_id        uuid references public.leases(id) on delete cascade not null,
    tenant_id       uuid references public.tenants(id) on delete set null not null,
    unit_id         uuid references public.units(id) on delete cascade not null,
    property_id     uuid references public.properties(id) on delete cascade not null,
    expected_amount numeric(10,2) not null,
    due_date        date not null,
    period_label    text not null,
    status          text not null default 'pending' check (status in ('pending', 'paid', 'partial', 'overdue')),
    created_at      timestamptz not null default now(),
    constraint rent_expectations_lease_period_unique unique (lease_id, period_label)
);

alter table public.rent_expectations enable row level security;

create policy "RentExpectations: select own"
    on public.rent_expectations for select to authenticated
    using (owner_id = auth.uid());

create policy "RentExpectations: insert own"
    on public.rent_expectations for insert to authenticated
    with check (owner_id = auth.uid());

create policy "RentExpectations: update own"
    on public.rent_expectations for update to authenticated
    using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "RentExpectations: delete own"
    on public.rent_expectations for delete to authenticated
    using (owner_id = auth.uid());

grant all on table public.rent_expectations to service_role;
