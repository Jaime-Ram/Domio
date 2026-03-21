import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MatchDetail {
  transaction_id: string;
  method: string;
  confidence: number;
}

interface MatchResult {
  matched: number;
  unmatched: number;
  total: number;
  details: MatchDetail[];
}

interface RawTransaction {
  id: string;
  amount: number;
  value_date: string | null;
  sender_iban: string | null;
  sender_name: string | null;
  description: string | null;
}

interface RentExpectation {
  id: string;
  lease_id: string;
  tenant_id: string;
  unit_id: string;
  property_id: string;
  expected_amount: number;
  due_date: string;
  period_label: string;
}

interface Tenant {
  id: string;
  full_name: string;
  iban: string | null;
}

interface Property {
  id: string;
  name: string;
  address: string;
}

function getPeriodLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function daysApart(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / msPerDay;
}

function containsIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function matchTransactions(
  ownerId: string
): Promise<MatchResult> {
  // 1. Fetch unmatched transactions (left join via NOT IN)
  const { data: allTx, error: txErr } = await supabaseAdmin
    .from("raw_transactions")
    .select("id, amount, value_date, sender_iban, sender_name, description")
    .eq("owner_id", ownerId);

  if (txErr) throw txErr;

  const { data: assigned, error: assignErr } = await supabaseAdmin
    .from("payment_assignments")
    .select("transaction_id")
    .eq("owner_id", ownerId);

  if (assignErr) throw assignErr;

  const assignedIds = new Set((assigned ?? []).map((a) => a.transaction_id));
  const unmatched: RawTransaction[] = (allTx ?? []).filter(
    (tx) => !assignedIds.has(tx.id)
  );

  // 2. Fetch pending expectations
  const { data: expectations, error: expErr } = await supabaseAdmin
    .from("rent_expectations")
    .select(
      "id, lease_id, tenant_id, unit_id, property_id, expected_amount, due_date, period_label"
    )
    .eq("owner_id", ownerId)
    .eq("status", "pending");

  if (expErr) throw expErr;

  // 3. Fetch tenants and properties
  const { data: tenants, error: tenErr } = await supabaseAdmin
    .from("tenants")
    .select("id, full_name, iban")
    .eq("owner_id", ownerId);

  if (tenErr) throw tenErr;

  const { data: properties, error: propErr } = await supabaseAdmin
    .from("properties")
    .select("id, name, address")
    .eq("owner_id", ownerId);

  if (propErr) throw propErr;

  // 4. Fetch historical assignments for pattern matching
  const { data: historicalAssignments, error: histErr } = await supabaseAdmin
    .from("payment_assignments")
    .select("transaction_id, tenant_id, property_id, unit_id, lease_id")
    .eq("owner_id", ownerId)
    .eq("is_manual", false);

  if (histErr) throw histErr;

  // Build historical sender_iban → assignment lookup
  const historicalByIban = new Map<
    string,
    { tenant_id: string; property_id: string; unit_id: string; lease_id: string }
  >();
  if (historicalAssignments) {
    for (const ha of historicalAssignments) {
      const matchedTx = (allTx ?? []).find((t) => t.id === ha.transaction_id);
      if (matchedTx?.sender_iban && ha.tenant_id) {
        historicalByIban.set(matchedTx.sender_iban, {
          tenant_id: ha.tenant_id,
          property_id: ha.property_id,
          unit_id: ha.unit_id,
          lease_id: ha.lease_id,
        });
      }
    }
  }

  // Index helpers
  const tenantById = new Map((tenants ?? []).map((t: Tenant) => [t.id, t]));
  const tenantByIban = new Map(
    (tenants ?? [])
      .filter((t: Tenant) => t.iban)
      .map((t: Tenant) => [t.iban!.toUpperCase(), t])
  );

  const pendingExpectations = [...(expectations ?? [])] as RentExpectation[];
  const matchedExpIds = new Set<string>();
  const details: MatchDetail[] = [];

  console.log(
    `Match engine: ${unmatched.length} unmatched transactions, ${pendingExpectations.length} pending expectations`
  );

  for (const tx of unmatched) {
    const txPeriod = tx.value_date ? getPeriodLabel(tx.value_date) : null;
    let matched = false;

    // --- Match 1: IBAN match (confidence 95) ---
    if (tx.sender_iban) {
      const tenant = tenantByIban.get(tx.sender_iban.toUpperCase());
      if (tenant) {
        const exp = pendingExpectations.find(
          (e) =>
            e.tenant_id === tenant.id &&
            e.period_label === txPeriod &&
            Number(e.expected_amount) === Number(tx.amount) &&
            !matchedExpIds.has(e.id)
        );
        if (exp) {
          await assign(tx, exp, 95, "iban", ownerId);
          matchedExpIds.add(exp.id);
          details.push({ transaction_id: tx.id, method: "iban", confidence: 95 });
          console.log(`  ✓ IBAN match: tx ${tx.id} → exp ${exp.id}`);
          matched = true;
        }
      }
    }

    // --- Match 2: Reference match (confidence 80) ---
    if (!matched && (tx.description || tx.sender_name)) {
      const searchText = [tx.description, tx.sender_name]
        .filter(Boolean)
        .join(" ");

      for (const exp of pendingExpectations) {
        if (matchedExpIds.has(exp.id)) continue;
        if (exp.period_label !== txPeriod) continue;
        if (Number(exp.expected_amount) !== Number(tx.amount)) continue;

        const tenant = tenantById.get(exp.tenant_id);
        const prop = (properties ?? []).find(
          (p: Property) => p.id === exp.property_id
        );

        const nameMatch = tenant && containsIgnoreCase(searchText, tenant.full_name);
        const addrMatch = prop && containsIgnoreCase(searchText, prop.address);
        const propNameMatch = prop && containsIgnoreCase(searchText, prop.name);

        if (nameMatch || addrMatch || propNameMatch) {
          await assign(tx, exp, 80, "reference", ownerId);
          matchedExpIds.add(exp.id);
          details.push({ transaction_id: tx.id, method: "reference", confidence: 80 });
          console.log(`  ~ Reference match (suggestion): tx ${tx.id} → exp ${exp.id}`);
          matched = true;
          break;
        }
      }
    }

    // --- Match 3: Amount + date match (confidence 70) ---
    if (!matched && tx.value_date) {
      const candidates = pendingExpectations.filter(
        (e) =>
          !matchedExpIds.has(e.id) &&
          Number(e.expected_amount) === Number(tx.amount) &&
          daysApart(tx.value_date!, e.due_date) <= 5
      );

      if (candidates.length === 1) {
        const exp = candidates[0];
        await assign(tx, exp, 70, "amount_date", ownerId);
        matchedExpIds.add(exp.id);
        details.push({ transaction_id: tx.id, method: "amount_date", confidence: 70 });
        console.log(`  ~ Amount+date match (suggestion): tx ${tx.id} → exp ${exp.id}`);
        matched = true;
      } else if (candidates.length > 1) {
        console.log(`  ✗ Amount+date ambiguous (${candidates.length} candidates): tx ${tx.id}`);
      }
    }

    // --- Match 4: Historical pattern (confidence 85) ---
    if (!matched && tx.sender_iban) {
      const hist = historicalByIban.get(tx.sender_iban);
      if (hist) {
        const exp = pendingExpectations.find(
          (e) =>
            !matchedExpIds.has(e.id) &&
            e.tenant_id === hist.tenant_id &&
            e.property_id === hist.property_id &&
            e.period_label === txPeriod
        );
        if (exp) {
          await assign(tx, exp, 85, "historical", ownerId);
          matchedExpIds.add(exp.id);
          details.push({ transaction_id: tx.id, method: "historical", confidence: 85 });
          console.log(`  ✓ Historical match: tx ${tx.id} → exp ${exp.id}`);
          matched = true;
        }
      }
    }

    if (!matched) {
      console.log(`  ✗ No match: tx ${tx.id}`);
    }
  }

  const result: MatchResult = {
    matched: details.length,
    unmatched: unmatched.length - details.length,
    total: unmatched.length,
    details,
  };

  console.log("Match summary:", {
    matched: result.matched,
    unmatched: result.unmatched,
    total: result.total,
  });

  return result;
}

async function assign(
  tx: RawTransaction,
  exp: RentExpectation,
  confidence: number,
  method: string,
  ownerId: string
) {
  // Insert payment assignment
  const { error: insertErr } = await supabaseAdmin
    .from("payment_assignments")
    .insert({
      owner_id: ownerId,
      transaction_id: tx.id,
      property_id: exp.property_id,
      unit_id: exp.unit_id,
      tenant_id: exp.tenant_id,
      lease_id: exp.lease_id,
      confidence_score: confidence,
      match_method: method,
      is_manual: false,
    });

  if (insertErr) {
    console.error(`Failed to insert assignment for tx ${tx.id}:`, insertErr);
    return;
  }

  // Only update expectation status if confidence >= 85
  if (confidence >= 85) {
    const status =
      Number(tx.amount) >= Number(exp.expected_amount) ? "paid" : "partial";

    const { error: updateErr } = await supabaseAdmin
      .from("rent_expectations")
      .update({ status })
      .eq("id", exp.id);

    if (updateErr) {
      console.error(`Failed to update expectation ${exp.id}:`, updateErr);
    }
  }
}
