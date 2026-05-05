import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type MatchMethod = "iban" | "description_full" | "description_huur" | "description_address" | "manual";

interface MatchDetail {
  transaction_id: string;
  method: MatchMethod;
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
  counterparty_iban: string | null;
  counterparty_name: string | null;
  description: string | null;
}

interface RentExpectation {
  id: string;
  lease_id: string;
  due_period: string; // YYYY-MM-01
  amount_expected: number;
}

interface Lease {
  id: string;
  unit_id: string;
  tenant_id: string | null;
}

interface Unit {
  id: string;
  property_id: string;
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

function containsIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function matchTransactions(ownerId: string): Promise<MatchResult> {
  const { data: allTx, error: txErr } = await supabaseAdmin
    .from("raw_transactions")
    .select("id, amount, value_date, counterparty_iban, counterparty_name, description")
    .eq("owner_id", ownerId);

  if (txErr) throw txErr;

  // Fetch existing assignments to exclude already-matched transactions and expectations
  const { data: assigned, error: assignErr } = await supabaseAdmin
    .from("payment_assignments")
    .select("raw_transaction_id, rent_expectation_id")
    .eq("owner_id", ownerId);

  if (assignErr) throw assignErr;

  const assignedTxIds = new Set((assigned ?? []).map((a) => a.raw_transaction_id));
  const assignedExpIds = new Set((assigned ?? []).map((a) => a.rent_expectation_id));

  const unmatched: RawTransaction[] = (allTx ?? []).filter(
    (tx) => !assignedTxIds.has(tx.id)
  );

  const { data: expectations, error: expErr } = await supabaseAdmin
    .from("rent_expectations")
    .select("id, lease_id, due_period, amount_expected")
    .eq("owner_id", ownerId);

  if (expErr) throw expErr;

  const pendingExpectations = ((expectations ?? []) as RentExpectation[]).filter(
    (e) => !assignedExpIds.has(e.id)
  );

  // Fetch only the leases we actually need
  const leaseIds = [...new Set(pendingExpectations.map((e) => e.lease_id))];
  const { data: leases, error: leaseErr } = leaseIds.length
    ? await supabaseAdmin
        .from("leases")
        .select("id, unit_id, tenant_id")
        .in("id", leaseIds)
    : { data: [], error: null };

  if (leaseErr) throw leaseErr;

  // Fetch units to resolve unit_id → property_id
  const unitIds = [...new Set((leases ?? []).map((l: Lease) => l.unit_id))];
  const { data: units, error: unitErr } = unitIds.length
    ? await supabaseAdmin
        .from("units")
        .select("id, property_id")
        .in("id", unitIds)
    : { data: [], error: null };

  if (unitErr) throw unitErr;

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

  const leaseById = new Map((leases ?? []).map((l: Lease) => [l.id, l]));
  const unitById = new Map((units ?? []).map((u: Unit) => [u.id, u]));
  const tenantById = new Map((tenants ?? []).map((t: Tenant) => [t.id, t]));
  const tenantByIban = new Map(
    (tenants ?? [])
      .filter((t: Tenant) => t.iban)
      .map((t: Tenant) => [t.iban!.toUpperCase(), t])
  );

  const matchedExpIds = new Set<string>();
  const details: MatchDetail[] = [];

  console.log(
    `Match engine: ${unmatched.length} unmatched transactions, ${pendingExpectations.length} pending expectations`
  );

  for (const tx of unmatched) {
    const txPeriod = tx.value_date ? getPeriodLabel(tx.value_date) : null;
    const searchText = [tx.description, tx.counterparty_name].filter(Boolean).join(" ");
    let matched = false;

    // --- Match 1: IBAN (confidence 95) ---
    if (tx.counterparty_iban) {
      const tenant = tenantByIban.get(tx.counterparty_iban.toUpperCase());
      if (tenant) {
        const exp = pendingExpectations.find((e) => {
          if (matchedExpIds.has(e.id)) return false;
          if (e.due_period.substring(0, 7) !== txPeriod) return false;
          if (Number(e.amount_expected) !== Number(tx.amount)) return false;
          return leaseById.get(e.lease_id)?.tenant_id === tenant.id;
        });
        if (exp) {
          await assign(tx, exp, 95, "iban", ownerId);
          matchedExpIds.add(exp.id);
          details.push({ transaction_id: tx.id, method: "iban", confidence: 95 });
          console.log(`  ✓ IBAN match: tx ${tx.id} → exp ${exp.id}`);
          matched = true;
        }
      }
    }

    // --- Match 2: Description full name (confidence 80) ---
    if (!matched && searchText) {
      for (const exp of pendingExpectations) {
        if (matchedExpIds.has(exp.id)) continue;
        if (exp.due_period.substring(0, 7) !== txPeriod) continue;
        if (Number(exp.amount_expected) !== Number(tx.amount)) continue;

        const lease = leaseById.get(exp.lease_id);
        const tenant = lease?.tenant_id ? tenantById.get(lease.tenant_id) : undefined;
        if (tenant && containsIgnoreCase(searchText, tenant.full_name)) {
          await assign(tx, exp, 80, "description_full", ownerId);
          matchedExpIds.add(exp.id);
          details.push({ transaction_id: tx.id, method: "description_full", confidence: 80 });
          console.log(`  ~ Description full match: tx ${tx.id} → exp ${exp.id}`);
          matched = true;
          break;
        }
      }
    }

    // --- Match 3: Description address (confidence 75) ---
    if (!matched && searchText) {
      for (const exp of pendingExpectations) {
        if (matchedExpIds.has(exp.id)) continue;
        if (exp.due_period.substring(0, 7) !== txPeriod) continue;
        if (Number(exp.amount_expected) !== Number(tx.amount)) continue;

        const lease = leaseById.get(exp.lease_id);
        const unit = lease ? unitById.get(lease.unit_id) : undefined;
        const prop = unit
          ? (properties ?? []).find((p: Property) => p.id === unit.property_id)
          : undefined;
        if (
          prop &&
          (containsIgnoreCase(searchText, prop.address) ||
            containsIgnoreCase(searchText, prop.name))
        ) {
          await assign(tx, exp, 75, "description_address", ownerId);
          matchedExpIds.add(exp.id);
          details.push({ transaction_id: tx.id, method: "description_address", confidence: 75 });
          console.log(`  ~ Description address match: tx ${tx.id} → exp ${exp.id}`);
          matched = true;
          break;
        }
      }
    }

    // --- Match 4: Description huur (confidence 65) — only when unambiguous ---
    if (!matched && tx.description && containsIgnoreCase(tx.description, "huur") && txPeriod) {
      const candidates = pendingExpectations.filter(
        (e) =>
          !matchedExpIds.has(e.id) &&
          e.due_period.substring(0, 7) === txPeriod &&
          Number(e.amount_expected) === Number(tx.amount)
      );

      if (candidates.length === 1) {
        const exp = candidates[0];
        await assign(tx, exp, 65, "description_huur", ownerId);
        matchedExpIds.add(exp.id);
        details.push({ transaction_id: tx.id, method: "description_huur", confidence: 65 });
        console.log(`  ~ Description huur match: tx ${tx.id} → exp ${exp.id}`);
        matched = true;
      } else if (candidates.length > 1) {
        console.log(`  ✗ Huur match ambiguous (${candidates.length} candidates): tx ${tx.id}`);
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
  method: MatchMethod,
  ownerId: string
) {
  const { error: insertErr } = await supabaseAdmin
    .from("payment_assignments")
    .insert({
      owner_id: ownerId,
      raw_transaction_id: tx.id,
      rent_expectation_id: exp.id,
      amount_assigned: tx.amount,
      match_method: method,
      confidence_score: method === "manual" ? null : confidence,
      assigned_by: null,
    });

  if (insertErr) {
    console.error(`Failed to insert assignment for tx ${tx.id}:`, insertErr);
  }
}
