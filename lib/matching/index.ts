// TODO: migrate payment_assignments.match_method CHECK constraint to add:
//   'description_full', 'description_huur', 'description_address'
// Until then inserts with these methods will fail the DB constraint.
// Current allowed values: 'iban' | 'reference' | 'amount_date' | 'historical' | 'manual'

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  MatchResult,
  ScoredCandidate,
  PaymentAssignment,
  EnrichedCandidate,
  DbRawTransaction,
} from "./types";
import { findCandidates } from "./candidates";
import { scoreCandidate } from "./score";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function matchTransaction(rawTransactionId: string): Promise<MatchResult> {
  const client = createAdminClient();

  const { data: tx, error: txErr } = await client
    .from("raw_transactions")
    .select("id, owner_id, booking_date, amount, counterparty_iban, counterparty_name, description")
    .eq("id", rawTransactionId)
    .single();

  if (txErr) throw txErr;
  if (!tx) throw new Error(`Transaction not found: ${rawTransactionId}`);

  const transaction = tx as DbRawTransaction;
  const enrichedCandidates = await findCandidates(transaction, client);

  // Score all candidates and keep both enriched + scored in parallel
  const pairs = enrichedCandidates.map((enriched) => ({
    enriched,
    scored: {
      ...scoreCandidate(transaction, enriched),
      expectationIds: enriched.expectationIds,
      amountAssigned: enriched.amountAssigned,
    } satisfies ScoredCandidate,
  }));

  const allScored = pairs.map((p) => p.scored);
  const positive = pairs.filter((p) => p.scored.score > 0);

  if (positive.length === 0) {
    return { status: "no_match", candidates: allScored };
  }

  const maxScore = Math.max(...positive.map((p) => p.scored.score)) as ScoredCandidate["score"];
  const topPairs = positive.filter((p) => p.scored.score === maxScore);

  if (topPairs.length === 1 && maxScore >= 90) {
    const { enriched, scored } = topPairs[0];
    const committed = await commitCandidate(transaction, enriched, scored, client);
    return { status: "auto_committed", candidates: allScored, committed };
  }

  return { status: "review_queue", candidates: allScored };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function commitCandidate(
  tx: DbRawTransaction,
  enriched: EnrichedCandidate,
  scored: ScoredCandidate,
  client: SupabaseClient<any>
): Promise<PaymentAssignment[]> {
  const rows = enriched.assignments.map(({ expectationId, amount }) => ({
    owner_id: tx.owner_id,
    raw_transaction_id: tx.id,
    rent_expectation_id: expectationId,
    amount_assigned: amount,
    match_method: scored.method,
    confidence_score: scored.score,
    assigned_by: null,
  }));

  const { data, error } = await client
    .from("payment_assignments")
    .insert(rows)
    .select("id, raw_transaction_id, rent_expectation_id, amount_assigned, match_method, confidence_score, assigned_by");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    raw_transaction_id: row.raw_transaction_id as string,
    rent_expectation_id: row.rent_expectation_id as string,
    amount_assigned: row.amount_assigned as number,
    match_method: row.match_method as ScoredCandidate["method"],
    confidence_score: row.confidence_score as number,
    assigned_by: null,
  }));
}
