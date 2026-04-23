-- ==========================================
-- Domio Vastgoedbeheer — Database Schema
-- ==========================================

-- 1. Profiles
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

-- 2. Properties
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

-- 3. Units
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

-- 4. Tenants
create table if not exists public.tenants (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    profile_id uuid references public.profiles(id) on delete set null,
    full_name text not null,
    email text,
    phone text,
    date_of_birth date,
    id_number text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 5. Leases
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

-- 6. Tickets
create table if not exists public.tickets (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    unit_id uuid references public.units(id) on delete set null,
    title text not null,
    description text,
    status text not null default 'open' check (status in ('open', 'in_behandeling', 'afgerond', 'geannuleerd')),
    priority text not null default 'normaal' check (priority in ('laag', 'normaal', 'hoog', 'urgent')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 7. Messages
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    ticket_id uuid references public.tickets(id) on delete cascade not null,
    sender_id uuid references public.profiles(id) on delete set null,
    content text not null,
    created_at timestamptz not null default now()
);

-- 8. WWS (Woningwaarderingsstelsel)
create table if not exists public.wws (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    unit_id uuid references public.units(id) on delete cascade not null,
    year integer not null,
    points integer not null,
    sector text not null check (sector in ('sociaal', 'midden', 'vrij')),
    max_rent numeric(10,2) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 9. Documents
create table if not exists public.documents (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    property_id uuid references public.properties(id) on delete set null,
    name text not null,
    type text not null default 'Overig' check (type in ('Contract', 'Keuring', 'Factuur', 'Verzekering', 'Overig')),
    file_name text,
    mime_type text,
    extracted_data jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 10. Payments
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
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 11. Bank Connections
CREATE TABLE IF NOT EXISTS public.bank_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL DEFAULT 'tink',
    access_token TEXT,
    refresh_token TEXT,
    iban TEXT,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(owner_id, provider)
);

-- 12. Raw Transactions (immutable — never modify after insert)
CREATE TABLE IF NOT EXISTS public.raw_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    bank_connection_id UUID REFERENCES public.bank_connections(id) ON DELETE CASCADE NOT NULL,
    external_id TEXT NOT NULL, -- Tink's transaction ID, for deduplication
    value_date DATE,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    counterparty_iban TEXT,
    counterparty_name TEXT,
    description TEXT,
    raw_data JSONB, -- full Tink response stored for debugging
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bank_connection_id, external_id) -- prevents duplicate imports
);

-- 13. Payment Assignments (the matching layer)
CREATE TABLE IF NOT EXISTS public.payment_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES public.raw_transactions(id) ON DELETE CASCADE NOT NULL UNIQUE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
    confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
    match_method TEXT CHECK (match_method IN ('iban', 'reference', 'amount_date', 'historical', 'manual')),
    is_manual BOOLEAN NOT NULL DEFAULT FALSE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS public.rent_expectations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    expected_amount NUMERIC(10,2) NOT NULL,
    due_date DATE NOT NULL,
    period_label TEXT NOT NULL, -- e.g. '2026-03'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(lease_id, period_label)
);

CREATE TABLE IF NOT EXISTS public.manual_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('onderhoud', 'verzekering', 'belasting', 'energie', 'vve', 'hypotheek', 'beheer', 'overig')),
    amount NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.tickets enable row level security;
alter table public.messages enable row level security;
alter table public.wws enable row level security;
alter table public.documents enable row level security;
alter table public.payments enable row level security;
alter table public.bank_connections enable row level security;
alter table public.raw_transactions enable row level security;
alter table public.payment_assignments enable row level security;
alter table public.rent_expectations enable row level security;
alter table public.manual_expenses enable row level security;


-- ==========================================
-- POLICIES
-- ==========================================

-- Profiles Policies
create policy "Profiles: select own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Profiles: update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Profiles: insert own" on public.profiles for insert to authenticated with check (id = auth.uid());

-- Properties Policies
create policy "Properties: select own" on public.properties for select to authenticated using (owner_id = auth.uid());
create policy "Properties: insert own" on public.properties for insert to authenticated with check (owner_id = auth.uid());
create policy "Properties: update own" on public.properties for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Properties: delete own" on public.properties for delete to authenticated using (owner_id = auth.uid());

-- Units Policies (Nested Check)
create policy "Units: select own" on public.units for select to authenticated using ( exists ( select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid() ) );
create policy "Units: insert own" on public.units for insert to authenticated with check ( exists ( select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid() ) );
create policy "Units: update own" on public.units for update to authenticated using ( exists ( select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid() ) ) with check ( exists ( select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid() ) );
create policy "Units: delete own" on public.units for delete to authenticated using ( exists ( select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid() ) );

-- Tenants Policies
create policy "Tenants: select own" on public.tenants for select to authenticated using (owner_id = auth.uid());
create policy "Tenants: insert own" on public.tenants for insert to authenticated with check (owner_id = auth.uid());
create policy "Tenants: update own" on public.tenants for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Tenants: delete own" on public.tenants for delete to authenticated using (owner_id = auth.uid());

-- Leases Policies
create policy "Leases: select own" on public.leases for select to authenticated using (owner_id = auth.uid());
create policy "Leases: insert own" on public.leases for insert to authenticated with check (owner_id = auth.uid());
create policy "Leases: update own" on public.leases for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Leases: delete own" on public.leases for delete to authenticated using (owner_id = auth.uid());

-- Tickets Policies
create policy "Tickets: select own" on public.tickets for select to authenticated using (owner_id = auth.uid());
create policy "Tickets: insert own" on public.tickets for insert to authenticated with check (owner_id = auth.uid());
create policy "Tickets: update own" on public.tickets for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Tickets: delete own" on public.tickets for delete to authenticated using (owner_id = auth.uid());

-- Messages Policies
create policy "Messages: select by ticket_member" on public.messages for select to authenticated using ( exists ( select 1 from public.tickets t where t.id = ticket_id and t.owner_id = auth.uid() ) );
create policy "Messages: insert by ticket_member" on public.messages for insert to authenticated with check ( exists ( select 1 from public.tickets t where t.id = ticket_id and t.owner_id = auth.uid() ) );

-- WWS Policies
create policy "WWS: select own" on public.wws for select to authenticated using (owner_id = auth.uid());
create policy "WWS: insert own" on public.wws for insert to authenticated with check (owner_id = auth.uid());
create policy "WWS: update own" on public.wws for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "WWS: delete own" on public.wws for delete to authenticated using (owner_id = auth.uid());

-- Documents Policies
create policy "Documents: select own" on public.documents for select to authenticated using (owner_id = auth.uid());
create policy "Documents: insert own" on public.documents for insert to authenticated with check (owner_id = auth.uid());
create policy "Documents: update own" on public.documents for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Documents: delete own" on public.documents for delete to authenticated using (owner_id = auth.uid());

-- Payments Policies
create policy "Payments: select own" on public.payments for select to authenticated using (owner_id = auth.uid());
create policy "Payments: insert own" on public.payments for insert to authenticated with check (owner_id = auth.uid());
create policy "Payments: update own" on public.payments for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Payments: delete own" on public.payments for delete to authenticated using (owner_id = auth.uid());

-- Bank Connections Policies
CREATE POLICY "Bank connections: select own" ON public.bank_connections
    FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Bank connections: insert own" ON public.bank_connections
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Bank connections: update own" ON public.bank_connections
    FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Bank connections: delete own" ON public.bank_connections
    FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Raw Transactions Policies
CREATE POLICY "Raw transactions: select own" ON public.raw_transactions
    FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Raw transactions: insert own" ON public.raw_transactions
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

-- Payment Assignments Policies
CREATE POLICY "Payment assignments: select own" ON public.payment_assignments
    FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Payment assignments: insert own" ON public.payment_assignments
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Payment assignments: update own" ON public.payment_assignments
    FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Payment assignments: delete own" ON public.payment_assignments
    FOR DELETE TO authenticated USING (owner_id = auth.uid());


CREATE POLICY "Rent expectations: select own" ON public.rent_expectations
    FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Rent expectations: insert own" ON public.rent_expectations
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Rent expectations: update own" ON public.rent_expectations
    FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Rent expectations: delete own" ON public.rent_expectations
    FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Manual expenses: select own" ON public.manual_expenses FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Manual expenses: insert own" ON public.manual_expenses FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Manual expenses: update own" ON public.manual_expenses FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Manual expenses: delete own" ON public.manual_expenses FOR DELETE TO authenticated USING (owner_id = auth.uid());
    
-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to handle new user registration
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

-- Restrict execution permissions
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- Trigger for auth.users
create or replace trigger on_auth_user_created 
after insert on auth.users 
for each row execute procedure public.handle_new_user();

-- Universal function to update 'updated_at' timestamp
create or replace function public.update_updated_at() 
returns trigger language plpgsql security definer as $$ 
begin 
    NEW.updated_at := now(); 
    return NEW; 
end; 
$$;

-- Apply update triggers to tables
create trigger tr_profiles_upd before update on public.profiles for each row execute function public.update_updated_at();
create trigger tr_properties_upd before update on public.properties for each row execute function public.update_updated_at();
create trigger tr_units_upd before update on public.units for each row execute function public.update_updated_at();
create trigger tr_tenants_upd before update on public.tenants for each row execute function public.update_updated_at();
create trigger tr_leases_upd before update on public.leases for each row execute function public.update_updated_at();
create trigger tr_tickets_upd before update on public.tickets for each row execute function public.update_updated_at();
create trigger tr_wws_upd before update on public.wws for each row execute function public.update_updated_at();
create trigger tr_documents_upd before update on public.documents for each row execute function public.update_updated_at();
create trigger tr_payments_upd before update on public.payments for each row execute function public.update_updated_at();
CREATE TRIGGER tr_bank_connections_upd BEFORE UPDATE ON public.bank_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_raw_transactions before update on public.raw_transactions for each row execute function public.update_updated_at();
CREATE TRIGGER tr_payment_assignments before update on public.payment_assignments for each row execute function public.update_updated_at();
CREATE TRIGGER tr_rent_expectations before update on public.rent_expectations for each row execute function public.update_updated_at();
CREATE TRIGGER tr_manual_expenses before update on public.manual_expenses for each row execute function public.update_updated_at();