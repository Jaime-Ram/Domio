import { matchTransactions } from "../../finance/matchTransactions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from("raw_transactions")
    .select("id, owner_id, description, counterparty_iban, amount")
    .like("description", "[TEST]%");

  if (error) throw error;

  // Group by owner so the engine runs once per owner, not once per transaction
  const byOwner = new Map<string, typeof data>();
  for (const tx of data) {
    if (!byOwner.has(tx.owner_id)) byOwner.set(tx.owner_id, []);
    byOwner.get(tx.owner_id)!.push(tx);
  }

  for (const [ownerId, txs] of byOwner) {
    console.log(`\nOwner ${ownerId} — ${txs.length} test transaction(s)`);
    const result = await matchTransactions(ownerId);

    for (const tx of txs) {
      const detail = result.details.find((d) => d.transaction_id === tx.id);
      if (detail) {
        console.log(`  ✓ ${tx.description}`);
        console.log(`    method=${detail.method}  score=${detail.confidence}`);
      } else {
        console.log(`  ✗ ${tx.description} — no match`);
      }
    }

    console.log(`  Summary: ${result.matched} matched, ${result.unmatched} unmatched, total=${result.total}`);
  }
}

main().catch(console.error);
