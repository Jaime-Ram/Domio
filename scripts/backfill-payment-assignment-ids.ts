/**
 * Backfills unit_id and property_id on payment_assignments that were created
 * via the match engine with only rent_expectation_id set.
 *
 * Chain: rent_expectation.lease_id → leases.unit_id → units.property_id
 *
 * Run: npx tsx scripts/backfill-payment-assignment-ids.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // 1. Fetch all assignments that have a rent_expectation_id but missing unit_id or property_id
  const { data: assignments, error: aErr } = await supabase
    .from("payment_assignments")
    .select("id, rent_expectation_id")
    .not("rent_expectation_id", "is", null)
    .or("unit_id.is.null,property_id.is.null");

  if (aErr) throw aErr;
  if (!assignments?.length) {
    console.log("Nothing to backfill — all rent assignments already have unit_id and property_id.");
    return;
  }

  console.log(`Found ${assignments.length} assignment(s) to backfill.`);

  // 2. Fetch the rent_expectations we need
  const expIds = [...new Set(assignments.map((a) => a.rent_expectation_id as string))];
  const { data: expectations, error: eErr } = await supabase
    .from("rent_expectations")
    .select("id, lease_id")
    .in("id", expIds);

  if (eErr) throw eErr;

  const expById = new Map((expectations ?? []).map((e) => [e.id, e]));

  // 3. Fetch the leases we need
  const leaseIds = [...new Set((expectations ?? []).map((e) => e.lease_id))];
  const { data: leases, error: lErr } = await supabase
    .from("leases")
    .select("id, unit_id")
    .in("id", leaseIds);

  if (lErr) throw lErr;

  const leaseById = new Map((leases ?? []).map((l) => [l.id, l]));

  // 4. Fetch the units we need
  const unitIds = [...new Set((leases ?? []).map((l) => l.unit_id))];
  const { data: units, error: uErr } = await supabase
    .from("units")
    .select("id, property_id")
    .in("id", unitIds);

  if (uErr) throw uErr;

  const unitById = new Map((units ?? []).map((u) => [u.id, u]));

  // 5. Update each assignment
  let updated = 0;
  let failed = 0;

  for (const assignment of assignments) {
    const exp = expById.get(assignment.rent_expectation_id as string);
    if (!exp) { console.warn(`  ⚠ No expectation found for assignment ${assignment.id}`); failed++; continue; }

    const lease = leaseById.get(exp.lease_id);
    if (!lease) { console.warn(`  ⚠ No lease found for expectation ${exp.id}`); failed++; continue; }

    const unit = unitById.get(lease.unit_id);
    if (!unit) { console.warn(`  ⚠ No unit found for lease ${lease.id}`); failed++; continue; }

    const { error: upErr } = await supabase
      .from("payment_assignments")
      .update({ unit_id: unit.id, property_id: unit.property_id })
      .eq("id", assignment.id);

    if (upErr) {
      console.error(`  ✗ Failed to update assignment ${assignment.id}:`, upErr.message);
      failed++;
    } else {
      console.log(`  ✓ ${assignment.id} → unit ${unit.id}, property ${unit.property_id}`);
      updated++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Failed: ${failed}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
