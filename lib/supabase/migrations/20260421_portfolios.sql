-- ==========================================
-- Portefeuilles
-- ==========================================
-- Een portefeuille is een management-groepering van panden. Niet juridisch,
-- maar functioneel: bijv. per rechtspersoon, per geografie, per fonds.
--
-- Model:
--   portfolios          → behoort aan één gebruiker (owner_id)
--   portfolios.legal_entity_id → optioneel gekoppeld aan een rechtspersoon
--   properties.portfolio_id    → object valt onder één portefeuille (optioneel)

-- 1. Tabel portefeuilles
create table if not exists public.portfolios (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    description text,
    legal_entity_id uuid references public.legal_entities(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.portfolios is 'Portefeuilles: management-groepering van objecten per eigenaar/rechtspersoon/strategie.';
comment on column public.portfolios.legal_entity_id is 'Optionele koppeling aan een rechtspersoon (BV, privépersoon, etc.).';

-- 2. FK op objecten
alter table public.properties
    add column if not exists portfolio_id uuid references public.portfolios(id) on delete set null;

comment on column public.properties.portfolio_id is 'Portefeuille waar dit object onder valt. Leeg = niet ingedeeld.';

-- 3. Indexen
create index if not exists idx_portfolios_owner_id on public.portfolios(owner_id);
create index if not exists idx_properties_portfolio_id on public.properties(portfolio_id);

-- 4. RLS
alter table public.portfolios enable row level security;

create policy "Portfolios: select own"
    on public.portfolios for select to authenticated
    using (owner_id = auth.uid());

create policy "Portfolios: insert own"
    on public.portfolios for insert to authenticated
    with check (owner_id = auth.uid());

create policy "Portfolios: update own"
    on public.portfolios for update to authenticated
    using (owner_id = auth.uid())
    with check (owner_id = auth.uid());

create policy "Portfolios: delete own"
    on public.portfolios for delete to authenticated
    using (owner_id = auth.uid());

-- 5. Trigger updated_at (hergebruik bestaande functie)
create trigger tr_portfolios_upd
    before update on public.portfolios for each row execute function public.update_updated_at();
