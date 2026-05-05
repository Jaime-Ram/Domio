alter table public.raw_transactions
  drop constraint raw_transactions_source_connection_check;

alter table public.raw_transactions
  add constraint raw_transactions_source_connection_check check (
    (
      (source = 'manual' and bank_connection_id is null)
      or (source = any (array['tink', 'yapily', 'camt053']) and bank_connection_id is not null)
    )
  );
