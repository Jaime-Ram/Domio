import { createClient } from "@supabase/supabase-js";

const TINK_TRANSACTIONS_URL = "https://api.tink.com/data/v2/transactions";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TinkTransaction {
  id: string;
  amount: {
    value: { unscaledValue: string; scale: string };
    currencyCode: string;
  };
  dates: { booked?: string };
  descriptions: { original?: string };
  counterparties?: Array<{
    name?: string;
    identifiers?: { iban?: { iban?: string } };
  }>;
}

interface TinkTransactionsResponse {
  transactions: TinkTransaction[];
  nextPageToken?: string;
}

export interface SyncResult {
  imported: number;
  skipped: number;
  total: number;
}

export async function fetchTransactions(
  bankConnectionId: string,
  accessToken: string,
  ownerId: string
): Promise<SyncResult> {
  const allTransactions: TinkTransaction[] = [];
  let pageToken: string | undefined;

  // Paginate through all transactions
  do {
    const url = new URL(TINK_TRANSACTIONS_URL);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Tink transactions fetch failed: ${res.status} ${text}`);
    }

    const data: TinkTransactionsResponse = await res.json();
    allTransactions.push(...data.transactions);
    pageToken = data.nextPageToken || undefined;

    console.log(
      `Tink: fetched page (${data.transactions.length} txns, total so far: ${allTransactions.length})`
    );
  } while (pageToken);

  if (allTransactions.length === 0) {
    return { imported: 0, skipped: 0, total: 0 };
  }

  // Map to raw_transactions schema
  const rows = allTransactions.map((txn) => {
    const scale = parseInt(txn.amount.value.scale, 10) || 0;
    const unscaled = parseInt(txn.amount.value.unscaledValue, 10) || 0;
    const amount = unscaled / Math.pow(10, scale);
    const counterparty = txn.counterparties?.[0];

    return {
      owner_id: ownerId,
      bank_connection_id: bankConnectionId,
      external_id: txn.id,
      amount,
      currency: txn.amount.currencyCode,
      value_date: txn.dates.booked ?? null,
      sender_iban: counterparty?.identifiers?.iban?.iban ?? null,
      sender_name: counterparty?.name ?? null,
      description: txn.descriptions.original ?? null,
      raw_data: txn,
    };
  });

  // Upsert in batches (Supabase has a payload size limit)
  const BATCH_SIZE = 500;
  let imported = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabaseAdmin
      .from("raw_transactions")
      .upsert(batch, {
        onConflict: "bank_connection_id,external_id",
        ignoreDuplicates: true,
      })
      .select("id");

    if (error) throw error;
    imported += data?.length ?? 0;
  }

  // Update last_synced_at on the bank connection
  const { error: updateError } = await supabaseAdmin
    .from("bank_connections")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", bankConnectionId);

  if (updateError) {
    console.error("Failed to update last_synced_at:", updateError);
  }

  const result: SyncResult = {
    imported,
    skipped: allTransactions.length - imported,
    total: allTransactions.length,
  };

  console.log("Tink sync complete:", result);
  return result;
}
