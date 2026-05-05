alter table public.raw_transactions
  add constraint raw_transactions_bank_connection_external_id_unique
  unique (bank_connection_id, external_id);
