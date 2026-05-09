-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.bank_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'tink'::text,
  access_token text,
  refresh_token text,
  iban text,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  account_id text,
  CONSTRAINT bank_connections_pkey PRIMARY KEY (id),
  CONSTRAINT bank_connections_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.cost_allocation_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  property_id uuid,
  name text NOT NULL,
  method text NOT NULL CHECK (method = ANY (ARRAY['equal'::text, 'surface_area'::text, 'custom'::text])),
  units jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(units) = 'array'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cost_allocation_keys_pkey PRIMARY KEY (id),
  CONSTRAINT cost_allocation_keys_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT cost_allocation_keys_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE
);
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  property_id uuid,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Overig'::text CHECK (type = ANY (ARRAY['Contract'::text, 'Keuring'::text, 'Factuur'::text, 'Verzekering'::text, 'Overig'::text])),
  file_name text,
  mime_type text,
  extracted_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  storage_path text,
  source text CHECK (source IS NULL OR (source = ANY (ARRAY['upload'::text, 'generated'::text]))),
  template_type text,
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT documents_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.leases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  tenant_id uuid,
  start_date date NOT NULL,
  end_date date,
  monthly_rent numeric NOT NULL,
  deposit numeric,
  status text NOT NULL DEFAULT 'actief'::text CHECK (status = ANY (ARRAY['actief'::text, 'verlopen'::text, 'opgezegd'::text, 'concept'::text])),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  servicekosten_voorschot numeric DEFAULT 0,
  payment_profile_id uuid NOT NULL,
  CONSTRAINT leases_pkey PRIMARY KEY (id),
  CONSTRAINT leases_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id),
  CONSTRAINT leases_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT leases_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT leases_payment_profile_id_fkey FOREIGN KEY (payment_profile_id) REFERENCES public.payment_profiles(id)
);
CREATE TABLE public.legal_entities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_id uuid,
  name text NOT NULL,
  short_name text,
  kvk_number text,
  btw_number text,
  address text,
  postcode text,
  city text,
  email text,
  phone text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT legal_entities_pkey PRIMARY KEY (id),
  CONSTRAINT legal_entities_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.legal_entities(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  sender_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payment_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  raw_transaction_id uuid NOT NULL,
  rent_expectation_id uuid,
  amount_assigned numeric NOT NULL CHECK (amount_assigned > 0::numeric),
  match_method text NOT NULL CHECK (match_method = ANY (ARRAY['iban'::text, 'description_full'::text, 'description_huur'::text, 'description_address'::text, 'manual'::text])),
  confidence_score integer CHECK (confidence_score IS NULL OR confidence_score >= 0 AND confidence_score <= 100),
  assigned_by uuid,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  category text,
  property_id uuid,
  unit_id uuid,
  cost_allocation_key_id uuid,
  CONSTRAINT payment_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT payment_assignments_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT payment_assignments_raw_transaction_id_fkey FOREIGN KEY (raw_transaction_id) REFERENCES public.raw_transactions(id),
  CONSTRAINT payment_assignments_rent_expectation_id_fkey FOREIGN KEY (rent_expectation_id) REFERENCES public.rent_expectations(id),
  CONSTRAINT payment_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.profiles(id),
  CONSTRAINT payment_assignments_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE,
  CONSTRAINT payment_assignments_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE CASCADE,
  CONSTRAINT payment_assignments_cost_allocation_key_id_fkey FOREIGN KEY (cost_allocation_key_id) REFERENCES public.cost_allocation_keys(id) ON DELETE SET NULL,
  CONSTRAINT payment_assignments_level_check CHECK (
    category = 'huur'
    OR (unit_id IS NULL AND cost_allocation_key_id IS NOT NULL)
    OR (unit_id IS NOT NULL AND cost_allocation_key_id IS NULL)
    OR category IS NULL
    OR property_id IS NULL
  )
);
CREATE INDEX IF NOT EXISTS idx_payment_assignments_property_category
  ON public.payment_assignments (property_id, category)
  WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_assignments_unit
  ON public.payment_assignments (unit_id)
  WHERE unit_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_raw_transactions_owner_date
  ON public.raw_transactions (owner_id, value_date);
CREATE TABLE public.payment_profile_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  profile_id uuid,
  event text NOT NULL CHECK (event = ANY (ARRAY['reminder'::text, 'overdue'::text, 'paid'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_profile_events_pkey PRIMARY KEY (id),
  CONSTRAINT payment_profile_events_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id),
  CONSTRAINT payment_profile_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT payment_profile_events_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.payment_profiles(id)
);
CREATE TABLE public.payment_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  pay_date integer NOT NULL DEFAULT 1 CHECK (pay_date >= 1 AND pay_date <= 28),
  reminders ARRAY NOT NULL DEFAULT '{-3,7,14}'::integer[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT payment_profiles_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  tenant_id uuid,
  property_id uuid,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status text NOT NULL DEFAULT 'openstaand'::text CHECK (status = ANY (ARRAY['betaald'::text, 'openstaand'::text, 'te_laat'::text, 'geannuleerd'::text])),
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT payments_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.portfolios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  legal_entity_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT portfolios_pkey PRIMARY KEY (id),
  CONSTRAINT portfolios_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT portfolios_legal_entity_id_fkey FOREIGN KEY (legal_entity_id) REFERENCES public.legal_entities(id)
);
CREATE TABLE public.profile_legal_entities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  legal_entity_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'beheerder'::text CHECK (role = ANY (ARRAY['beheerder'::text, 'eigenaar'::text, 'medewerker'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profile_legal_entities_pkey PRIMARY KEY (id),
  CONSTRAINT profile_legal_entities_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT profile_legal_entities_legal_entity_id_fkey FOREIGN KEY (legal_entity_id) REFERENCES public.legal_entities(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'verhuurder'::text CHECK (role = ANY (ARRAY['verhuurder'::text, 'huurder'::text, 'admin'::text])),
  phone text,
  company_name text,
  kvk_number text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  mfa_method text NOT NULL DEFAULT 'none'::text CHECK (mfa_method = ANY (ARRAY['none'::text, 'email'::text, 'totp'::text])),
  btw_number text,
  company_email text,
  company_phone text,
  company_logo_url text,
  company_address text,
  company_postal_code text,
  company_city text,
  language text DEFAULT 'nl'::text CHECK (language = ANY (ARRAY['nl'::text, 'en'::text])),
  notification_prefs jsonb DEFAULT '{"push": false, "email": true, "in_app": true, "new_payment": true, "payment_overdue": true, "document_expiring": true, "maintenance_request": true}'::jsonb,
  mfa_email_enabled boolean DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.properties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  postcode text,
  city text,
  type text NOT NULL DEFAULT 'appartement'::text CHECK (type = ANY (ARRAY['appartement'::text, 'eengezinswoning'::text, 'bovenwoning'::text, 'benedenwoning'::text, 'maisonnette'::text, 'studio'::text, 'complex'::text])),
  build_year integer,
  woz_value numeric,
  energy_label text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  ean_electricity text,
  ean_gas text,
  cost_allocation_key_id uuid NOT NULL,
  legal_entity_id uuid,
  portfolio_id uuid,
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_legal_entity_id_fkey FOREIGN KEY (legal_entity_id) REFERENCES public.legal_entities(id),
  CONSTRAINT properties_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id),
  CONSTRAINT properties_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT properties_cost_allocation_key_id_fkey FOREIGN KEY (cost_allocation_key_id) REFERENCES public.cost_allocation_keys(id) ON DELETE RESTRICT
);
CREATE TABLE public.raw_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  bank_connection_id uuid,
  external_id text,
  booking_date date NOT NULL,
  value_date date,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR'::text,
  counterparty_iban text,
  counterparty_name text,
  description text,
  raw_data jsonb,
  imported_at timestamp with time zone NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT '''yapily''::text'::text CHECK (source = ANY (ARRAY['yapily'::text, 'manual'::text, 'camt053'::text])),
  CONSTRAINT raw_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT raw_transactions_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT raw_transactions_bank_connection_id_fkey FOREIGN KEY (bank_connection_id) REFERENCES public.bank_connections(id)
);
CREATE TABLE public.rent_expectations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  lease_id uuid NOT NULL,
  due_period date NOT NULL CHECK (EXTRACT(day FROM due_period) = 1::numeric),
  amount_expected numeric NOT NULL CHECK (amount_expected > 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expectation_type text NOT NULL DEFAULT 'rent'::text CHECK (expectation_type = ANY (ARRAY['rent'::text, 'service_charges'::text])),
  CONSTRAINT rent_expectations_pkey PRIMARY KEY (id),
  CONSTRAINT rent_expectations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT rent_expectations_lease_id_fkey FOREIGN KEY (lease_id) REFERENCES public.leases(id)
);
CREATE TABLE public.settlements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  property_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  tenant_id uuid,
  lease_id uuid,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_voorschot numeric NOT NULL DEFAULT 0,
  total_actual_costs numeric NOT NULL DEFAULT 0,
  balance numeric NOT NULL DEFAULT 0,
  cost_breakdown jsonb,
  allocation_keys_snapshot jsonb,
  status text NOT NULL DEFAULT 'concept'::text CHECK (status = ANY (ARRAY['concept'::text, 'definitief'::text, 'verzonden'::text, 'verrekend'::text, 'nietig'::text])),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  published_at timestamp with time zone,
  sent_at timestamp with time zone,
  voided_at timestamp with time zone,
  CONSTRAINT settlements_pkey PRIMARY KEY (id),
  CONSTRAINT settlements_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT settlements_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT settlements_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id),
  CONSTRAINT settlements_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT settlements_lease_id_fkey FOREIGN KEY (lease_id) REFERENCES public.leases(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  property_id uuid,
  tenant_id uuid,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'afgerond'::text, 'geannuleerd'::text])),
  priority text NOT NULL DEFAULT 'normaal'::text CHECK (priority = ANY (ARRAY['laag'::text, 'normaal'::text, 'hoog'::text, 'urgent'::text])),
  category text NOT NULL DEFAULT 'overig'::text CHECK (category = ANY (ARRAY['administratief'::text, 'onderhoud'::text, 'financieel'::text, 'huurder'::text, 'juridisch'::text, 'overig'::text])),
  due_date date,
  notification_date date,
  recurring text NOT NULL DEFAULT 'geen'::text CHECK (recurring = ANY (ARRAY['geen'::text, 'wekelijks'::text, 'maandelijks'::text, 'jaarlijks'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT tasks_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT tasks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  profile_id uuid,
  full_name text NOT NULL,
  email text,
  phone text,
  date_of_birth date,
  id_number text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  iban text,
  CONSTRAINT tenants_pkey PRIMARY KEY (id),
  CONSTRAINT tenants_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT tenants_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  unit_id uuid,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'in_behandeling'::text, 'afgerond'::text, 'geannuleerd'::text])),
  priority text NOT NULL DEFAULT 'normaal'::text CHECK (priority = ANY (ARRAY['laag'::text, 'normaal'::text, 'hoog'::text, 'urgent'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tickets_pkey PRIMARY KEY (id),
  CONSTRAINT tickets_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT tickets_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id)
);
CREATE TABLE public.units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  unit_number text NOT NULL,
  rooms integer,
  size_m2 numeric,
  monthly_rent numeric,
  status text NOT NULL DEFAULT 'leegstand'::text CHECK (status = ANY (ARRAY['verhuurd'::text, 'leegstand'::text, 'onderhoud'::text, 'te_verhuren'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT units_pkey PRIMARY KEY (id),
  CONSTRAINT units_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.wws (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  year integer NOT NULL,
  points integer NOT NULL,
  sector text NOT NULL CHECK (sector = ANY (ARRAY['sociaal'::text, 'midden'::text, 'vrij'::text])),
  max_rent numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT wws_pkey PRIMARY KEY (id),
  CONSTRAINT wws_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT wws_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id)
);