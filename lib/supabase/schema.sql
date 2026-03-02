-- ==========================================
-- Domio Vastgoedbeheer — Supabase Schema (Updated)
-- ==========================================

-- Profiles (extends Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'verhuurder' check (role in ('verhuurder', 'huurder', 'manager', 'admin')),
  phone text,
  company_name text,
  kvk_number text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Properties (buildings/complexes)
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address text not null,
  postcode text,
  city text,
  type text not null default 'appartement' check (type in ('appartement', 'eengezinswoning', 'bovenwoning', 'benedenwoning', 'maisonnette', 'studio', 'complex')),
  build_year integer,
  woz_value numeric(12,2),
  energy_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Property Managers Junction Table (Q1)
create table if not exists public.property_managers (
  property_id uuid references public.properties(id) on delete cascade,
  manager_id uuid references public.profiles(id) on delete cascade,
  primary key (property_id, manager_id)
);

-- Units (individual units/apartments/rooms within a property)
create table if not exists public.units (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  unit_number text not null,
  rooms integer,
  size_m2 numeric(8,2),
  monthly_rent numeric(10,2),
  status text not null default 'leegstand' check (status in ('verhuurd', 'leegstand', 'onderhoud', 'te_verhuren')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, unit_number)
);

-- Tenants (person data)
create table if not exists public.tenants (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete set null, -- Link to App User (Q3)
  full_name text not null,
  email text,
  phone text,
  date_of_birth date,
  id_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leases / Contracts
create table if not exists public.leases (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  unit_id uuid references public.units(id) on delete cascade not null,
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

-- Maintenance tickets
create table if not exists public.tickets (
  owner_id uuid references public.profiles(id) on delete cascade not null,
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  lease_id uuid references public.leases(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_behandeling', 'afgerond', 'geannuleerd')),
  priority text not null default 'normaal' check (priority in ('laag', 'normaal', 'hoog', 'urgent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Messages
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Documents
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  name text not null,
  type text not null default 'Overig' check (type in ('Contract', 'Keuring', 'Factuur', 'Verzekering', 'Overig')),
  file_name text,
  mime_type text,
  extracted_data jsonb,
  created_at timestamptz not null default now()
);

-- WWS History (Linked to Unit - Q4)
create table if not exists public.wws (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  unit_id uuid references public.units(id) on delete cascade not null,
  calculated_at timestamptz not null default now(),
  year integer not null,
  punten integer not null,
  sector text not null check (sector in ('sociaal', 'midden', 'vrij')),
  max_huur numeric(10,2) not null,
  breakdown jsonb not null default '[]',
  input_data jsonb not null default '{}',
  notes text,
  updated_at timestamptz not null default now() -- Fixed Q6
);

-- Payments
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  lease_id uuid references public.leases(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  amount numeric(10,2) not null,
  due_date date not null,
  paid_date date,
  status text not null default 'openstaand' check (status in ('betaald', 'openstaand', 'te_laat', 'geannuleerd')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_wws_unit on public.wws (unit_id, year desc);
create index idx_units_property on public.units (property_id);
create index idx_leases_unit on public.leases (unit_id);
create index idx_leases_tenant on public.leases (tenant_id);
create index idx_payments_unit on public.payments (unit_id);
create index idx_documents_unit on public.documents (unit_id);
create index idx_messages_ticket_id on public.messages (ticket_id); -- Fixed Q6

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_managers enable row level security;
alter table public.units enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.documents enable row level security;
alter table public.wws enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;
alter table public.messages enable row level security;

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Helper Function for Manager/Owner check
create or replace function public.is_authorized_for_property(prop_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.properties p
    where p.id = prop_id 
    and (p.owner_id = auth.uid() or exists (
      select 1 from public.property_managers pm 
      where pm.property_id = p.id and pm.manager_id = auth.uid()
    ))
  );
end;
$$ language plpgsql security definer;

-- Properties: Owner + Managers
create policy "Owners and managers can manage properties"
  on public.properties for all using (
    owner_id = auth.uid() or 
    exists (select 1 from public.property_managers pm where pm.property_id = properties.id and pm.manager_id = auth.uid())
  );

-- Units: Inherit from Property
create policy "Owners and managers can manage units"
  on public.units for all using (is_authorized_for_property(property_id));

-- Tickets: Owners/Managers OR Tenants of that unit (Q2)
create policy "Owners/Managers can manage tickets"
  on public.tickets for all using (is_authorized_for_property(property_id));

create policy "Tenants can view/create own unit tickets"
  on public.tickets for select using (
    exists (
      select 1 from public.tenants t
      join public.leases l on l.tenant_id = t.id
      where t.profile_id = auth.uid() and l.unit_id = tickets.unit_id and l.status = 'actief'
    )
  );

create policy "Tenants can insert tickets for their unit"
  on public.tickets for insert with check (
    exists (
      select 1 from public.tenants t
      join public.leases l on l.tenant_id = t.id
      where t.profile_id = auth.uid() and l.unit_id = tickets.unit_id and l.status = 'actief'
    )
  );

-- Messages: Users in the Ticket (Owner/Manager or Ticket Creator)
create policy "Users can view and send messages on accessible tickets"
  on public.messages for all using (
    exists (select 1 from public.tickets t where t.id = messages.ticket_id)
  );

-- ==========================================
-- TRIGGERS
-- ==========================================

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at to all tables
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.update_updated_at();
create trigger set_properties_updated_at before update on public.properties for each row execute procedure public.update_updated_at();
create trigger set_units_updated_at before update on public.units for each row execute procedure public.update_updated_at();
create trigger set_tenants_updated_at before update on public.tenants for each row execute procedure public.update_updated_at();
create trigger set_leases_updated_at before update on public.leases for each row execute procedure public.update_updated_at();
create trigger set_tickets_updated_at before update on public.tickets for each row execute procedure public.update_updated_at();
create trigger set_payments_updated_at before update on public.payments for each row execute procedure public.update_updated_at();
create trigger set_wws_updated_at before update on public.wws for each row execute procedure public.update_updated_at();