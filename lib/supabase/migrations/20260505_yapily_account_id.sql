alter table public.bank_connections
  add column if not exists account_id text;
