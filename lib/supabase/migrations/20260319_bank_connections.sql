-- ==========================================
-- Bank Connections (Tink open banking)
-- ==========================================

create table if not exists public.bank_connections (
    id            text primary key default concat('bc_', replace(gen_random_uuid()::text, '-', '')),
    owner_id      uuid references public.profiles(id) on delete cascade not null,
    provider      text not null default 'tink',
    access_token  text not null,
    refresh_token text,
    iban          text,
    last_synced_at timestamptz,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    constraint bank_connections_user_provider_unique unique (owner_id, provider)
);

alter table public.bank_connections enable row level security;

create policy "BankConnections: select own"
    on public.bank_connections for select to authenticated
    using (owner_id = auth.uid());

create policy "BankConnections: insert own"
    on public.bank_connections for insert to authenticated
    with check (owner_id = auth.uid());

create policy "BankConnections: update own"
    on public.bank_connections for update to authenticated
    using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "BankConnections: delete own"
    on public.bank_connections for delete to authenticated
    using (owner_id = auth.uid());

create trigger tr_bank_connections_upd
    before update on public.bank_connections
    for each row execute function public.update_updated_at();

-- Explicit grants so the service_role can bypass RLS and write from API routes
grant all on table public.bank_connections to service_role;
