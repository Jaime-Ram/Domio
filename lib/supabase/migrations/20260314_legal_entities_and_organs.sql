-- ==========================================
-- Rechtspersonen & organen voor objecten
-- ==========================================
-- Objecten kunnen vallen onder verschillende rechtspersonen (BV, stichting, etc.)
-- of organen (onderdeel/fonds binnen een rechtspersoon). Dit bestand voegt
-- daarvoor de tabellen en koppelingen toe.
--
-- Model:
-- - legal_entities (rechtspersonen): naam, KvK, BTW, adres
-- - Optioneel: parent_id op legal_entities voor organen (sub-entiteit onder een rechtspersoon)
-- - profile_legal_entities: welke gebruiker mag welke rechtspersoon beheren (many-to-many)
-- - properties.legal_entity_id: object hoort bij één rechtspersoon/orgaan
--
-- Toegang: een gebruiker ziet objecten van rechtspersonen waaraan hij is gekoppeld,
-- plus bestaande objecten waar owner_id = eigen profile (backwards compatibility).

-- 1. Tabel rechtspersonen (en eventueel organen via parent_id)
create table if not exists public.legal_entities (
    id uuid default gen_random_uuid() primary key,
    parent_id uuid references public.legal_entities(id) on delete set null,
    name text not null,
    short_name text,
    kvk_number text,
    btw_number text,
    address text,
    postcode text,
    city text,
    email text,
    phone text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.legal_entities is 'Rechtspersonen (BV, stichting, etc.). Organen kunnen via parent_id als kind van een rechtspersoon worden opgevoerd.';
comment on column public.legal_entities.parent_id is 'Optioneel: orgaan onder een rechtspersoon (bijv. fonds of portefeuille).';

-- 2. Koppeltabel: welke gebruiker beheert welke rechtspersoon
create table if not exists public.profile_legal_entities (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    legal_entity_id uuid references public.legal_entities(id) on delete cascade not null,
    role text not null default 'beheerder' check (role in ('beheerder', 'eigenaar', 'medewerker')),
    created_at timestamptz not null default now(),
    unique(profile_id, legal_entity_id)
);

comment on table public.profile_legal_entities is 'Welke gebruikers hebben toegang tot welke rechtspersonen.';

-- 3. Object koppelen aan rechtspersoon/orgaan
alter table public.properties
    add column if not exists legal_entity_id uuid references public.legal_entities(id) on delete set null;

comment on column public.properties.legal_entity_id is 'Rechtspersoon of orgaan waaronder dit object valt. Leeg = legacy (alleen owner_id).';

-- 4. RLS
alter table public.legal_entities enable row level security;
alter table public.profile_legal_entities enable row level security;

-- Rechtspersonen: alleen zichtbaar als je er via profile_legal_entities aan gekoppeld bent
create policy "Legal entities: select if linked"
    on public.legal_entities for select to authenticated
    using (
        exists (
            select 1 from public.profile_legal_entities ple
            where ple.legal_entity_id = legal_entities.id and ple.profile_id = auth.uid()
        )
    );

create policy "Legal entities: update if linked"
    on public.legal_entities for update to authenticated
    using (
        exists (
            select 1 from public.profile_legal_entities ple
            where ple.legal_entity_id = legal_entities.id and ple.profile_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.profile_legal_entities ple
            where ple.legal_entity_id = legal_entities.id and ple.profile_id = auth.uid()
        )
    );

create policy "Legal entities: delete if linked"
    on public.legal_entities for delete to authenticated
    using (
        exists (
            select 1 from public.profile_legal_entities ple
            where ple.legal_entity_id = legal_entities.id and ple.profile_id = auth.uid()
        )
    );

-- Insert: elke ingelogde gebruiker mag een rechtspersoon aanmaken; daarna moet de app profile_legal_entities invullen zodat de maker toegang heeft.
create policy "Legal entities: insert authenticated"
    on public.legal_entities for insert to authenticated
    with check (true);

-- Koppeltabel: alleen eigen rijen
create policy "Profile legal entities: select own"
    on public.profile_legal_entities for select to authenticated
    using (profile_id = auth.uid());

create policy "Profile legal entities: insert own"
    on public.profile_legal_entities for insert to authenticated
    with check (profile_id = auth.uid());

create policy "Profile legal entities: delete own"
    on public.profile_legal_entities for delete to authenticated
    using (profile_id = auth.uid());

-- 5. Properties RLS uitbreiden: zichtbaar als owner_id = user OF user gekoppeld is aan property.legal_entity_id
drop policy if exists "Properties: select own" on public.properties;
create policy "Properties: select own"
    on public.properties for select to authenticated
    using (
        owner_id = auth.uid()
        or (
            legal_entity_id is not null
            and exists (
                select 1 from public.profile_legal_entities ple
                where ple.legal_entity_id = properties.legal_entity_id and ple.profile_id = auth.uid()
            )
        )
    );

-- Insert/update/delete: zelfde logica (eigenaar of gekoppeld aan de rechtspersoon)
drop policy if exists "Properties: insert own" on public.properties;
create policy "Properties: insert own"
    on public.properties for insert to authenticated
    with check (
        owner_id = auth.uid()
        and (
            legal_entity_id is null
            or exists (
                select 1 from public.profile_legal_entities ple
                where ple.legal_entity_id = properties.legal_entity_id and ple.profile_id = auth.uid()
            )
        )
    );

drop policy if exists "Properties: update own" on public.properties;
create policy "Properties: update own"
    on public.properties for update to authenticated
    using (
        owner_id = auth.uid()
        or (
            legal_entity_id is not null
            and exists (
                select 1 from public.profile_legal_entities ple
                where ple.legal_entity_id = properties.legal_entity_id and ple.profile_id = auth.uid()
            )
        )
    )
    with check (
        owner_id = auth.uid()
        or (
            legal_entity_id is not null
            and exists (
                select 1 from public.profile_legal_entities ple
                where ple.legal_entity_id = properties.legal_entity_id and ple.profile_id = auth.uid()
            )
        )
    );

drop policy if exists "Properties: delete own" on public.properties;
create policy "Properties: delete own"
    on public.properties for delete to authenticated
    using (
        owner_id = auth.uid()
        or (
            legal_entity_id is not null
            and exists (
                select 1 from public.profile_legal_entities ple
                where ple.legal_entity_id = properties.legal_entity_id and ple.profile_id = auth.uid()
            )
        )
    );

-- Trigger updated_at voor legal_entities
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger tr_legal_entities_upd
    before update on public.legal_entities for each row execute function public.update_updated_at();
