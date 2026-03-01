-- ==========================================
-- Domio Vastgoedbeheer — Supabase Schema
-- ==========================================

-- Profiles (extends Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'verhuurder' check (role in ('verhuurder', 'huurder', 'admin')),
  phone text,
  company_name text,
  kvk_number text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'verhuurder')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Properties
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address text not null,
  postcode text,
  city text,
  type text not null default 'appartement' check (type in ('appartement', 'eengezinswoning', 'bovenwoning', 'benedenwoning', 'maisonnette', 'studio')),
  status text not null default 'leegstand' check (status in ('verhuurd', 'leegstand', 'onderhoud', 'verkoop')),
  monthly_rent numeric(10,2),
  size_m2 numeric(8,2),
  rooms integer,
  build_year integer,
  woz_value numeric(12,2),
  energy_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

create policy "Owners can manage own properties"
  on public.properties for all using (auth.uid() = owner_id);

-- Tenants
create table if not exists public.tenants (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'actief' check (status in ('actief', 'vertrokken', 'aankomend')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tenants enable row level security;

create policy "Owners can manage own tenants"
  on public.tenants for all using (auth.uid() = owner_id);

-- Leases / Contracts
create table if not exists public.leases (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete set null,
  start_date date not null,
  end_date date,
  monthly_rent numeric(10,2) not null,
  deposit numeric(10,2),
  status text not null default 'actief' check (status in ('actief', 'verlopen', 'opgezegd', 'concept')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leases enable row level security;

create policy "Owners can manage own leases"
  on public.leases for all using (auth.uid() = owner_id);

-- Documents (metadata only — files stay out of our DB for privacy)
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete set null,
  name text not null,
  type text not null default 'Overig' check (type in ('Contract', 'Keuring', 'Factuur', 'Verzekering', 'Overig')),
  file_name text,
  mime_type text,
  extracted_data jsonb,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Owners can manage own documents"
  on public.documents for all using (auth.uid() = owner_id);

-- WWS History (puntentelling per pand per jaar)
create table if not exists public.wws_history (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  calculated_at timestamptz not null default now(),
  year integer not null,
  punten integer not null,
  sector text not null check (sector in ('sociaal', 'midden', 'vrij')),
  max_huur numeric(10,2) not null,
  breakdown jsonb not null default '[]',
  input_data jsonb not null default '{}',
  notes text
);

alter table public.wws_history enable row level security;

create policy "Owners can manage own wws_history"
  on public.wws_history for all using (auth.uid() = owner_id);

create index idx_wws_history_property on public.wws_history (property_id, year desc);

-- Payments
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  amount numeric(10,2) not null,
  due_date date not null,
  paid_date date,
  status text not null default 'openstaand' check (status in ('betaald', 'openstaand', 'te_laat', 'geannuleerd')),
  description text,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Owners can manage own payments"
  on public.payments for all using (auth.uid() = owner_id);

-- Maintenance tickets
create table if not exists public.maintenance_tickets (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_behandeling', 'afgerond', 'geannuleerd')),
  priority text not null default 'normaal' check (priority in ('laag', 'normaal', 'hoog', 'urgent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.maintenance_tickets enable row level security;

create policy "Owners can manage own tickets"
  on public.maintenance_tickets for all using (auth.uid() = owner_id);

-- Updated_at trigger (reusable)
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.update_updated_at();
create trigger set_properties_updated_at before update on public.properties for each row execute procedure public.update_updated_at();
create trigger set_tenants_updated_at before update on public.tenants for each row execute procedure public.update_updated_at();
create trigger set_leases_updated_at before update on public.leases for each row execute procedure public.update_updated_at();
create trigger set_tickets_updated_at before update on public.maintenance_tickets for each row execute procedure public.update_updated_at();
