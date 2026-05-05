import { type SupabaseClient } from "@supabase/supabase-js";
import type {
  DbRawTransaction,
  DbRentExpectation,
  DbLease,
  DbTenant,
  DbPaymentProfile,
  DbUnit,
  DbProperty,
  EnrichedCandidate,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>;

type EnrichedExp = {
  id: string;
  lease_id: string;
  due_period: string;
  amountRemaining: number;
  tenant: DbTenant | null;
  paymentProfile: Pick<DbPaymentProfile, "pay_date" | "reminders"> | null;
  propertyAddress: string | null;
};

export async function findCandidates(
  tx: DbRawTransaction,
  client: Client
): Promise<EnrichedCandidate[]> {
  const ownerId = tx.owner_id;

  // Fetch all rent_expectations for this owner
  const { data: expectations, error: expErr } = await client
    .from("rent_expectations")
    .select("id, lease_id, due_period, amount_expected")
    .eq("owner_id", ownerId);
  if (expErr) throw expErr;
  if (!expectations || expectations.length === 0) return [];

  // Fetch all existing assignments to compute already-paid amounts per expectation
  const { data: assignments, error: assignErr } = await client
    .from("payment_assignments")
    .select("rent_expectation_id, amount_assigned")
    .eq("owner_id", ownerId);
  if (assignErr) throw assignErr;

  const paidByExp = new Map<string, number>();
  for (const a of assignments ?? []) {
    const key = a.rent_expectation_id as string;
    paidByExp.set(key, (paidByExp.get(key) ?? 0) + Number(a.amount_assigned));
  }

  // Keep only open expectations (paid < expected)
  const openExps = (expectations as DbRentExpectation[]).filter(
    (e) => (paidByExp.get(e.id) ?? 0) < Number(e.amount_expected)
  );
  if (openExps.length === 0) return [];

  // Batch-fetch leases
  const leaseIds = [...new Set(openExps.map((e) => e.lease_id))];
  const { data: leases, error: leaseErr } = await client
    .from("leases")
    .select("id, tenant_id, unit_id")
    .in("id", leaseIds);
  if (leaseErr) throw leaseErr;

  const leaseById = new Map(
    (leases as DbLease[]).map((l) => [l.id, l])
  );

  // Batch-fetch tenants
  const tenantIds = [
    ...new Set(
      (leases as DbLease[])
        .map((l) => l.tenant_id)
        .filter((id): id is string => id !== null)
    ),
  ];

  let tenantById = new Map<string, DbTenant>();
  if (tenantIds.length > 0) {
    const { data: tenants, error: tenantErr } = await client
      .from("tenants")
      .select("id, iban, payment_profile_id")
      .in("id", tenantIds);
    if (tenantErr) throw tenantErr;
    tenantById = new Map((tenants as DbTenant[]).map((t) => [t.id, t]));
  }

  // Batch-fetch payment profiles
  const profileIds = [
    ...new Set(
      [...tenantById.values()]
        .map((t) => t.payment_profile_id)
        .filter((id): id is string => id !== null)
    ),
  ];

  let profileById = new Map<string, DbPaymentProfile>();
  if (profileIds.length > 0) {
    const { data: profiles, error: profileErr } = await client
      .from("payment_profiles")
      .select("id, pay_date, reminders")
      .in("id", profileIds);
    if (profileErr) throw profileErr;
    profileById = new Map((profiles as DbPaymentProfile[]).map((p) => [p.id, p]));
  }

  // Batch-fetch units
  const unitIds = [...new Set((leases as DbLease[]).map((l) => l.unit_id))];
  const { data: units, error: unitErr } = await client
    .from("units")
    .select("id, property_id")
    .in("id", unitIds);
  if (unitErr) throw unitErr;

  const unitById = new Map((units as DbUnit[]).map((u) => [u.id, u]));

  // Batch-fetch properties
  const propertyIds = [
    ...new Set((units as DbUnit[]).map((u) => u.property_id)),
  ];

  let propertyById = new Map<string, DbProperty>();
  if (propertyIds.length > 0) {
    const { data: properties, error: propErr } = await client
      .from("properties")
      .select("id, address")
      .in("id", propertyIds);
    if (propErr) throw propErr;
    propertyById = new Map((properties as DbProperty[]).map((p) => [p.id, p]));
  }

  // Build enriched expectations
  const enriched: EnrichedExp[] = openExps.map((e) => {
    const lease = leaseById.get(e.lease_id) ?? null;
    const tenant = lease?.tenant_id ? (tenantById.get(lease.tenant_id) ?? null) : null;
    const paymentProfile = tenant?.payment_profile_id
      ? (profileById.get(tenant.payment_profile_id) ?? null)
      : null;
    const unit = lease?.unit_id ? (unitById.get(lease.unit_id) ?? null) : null;
    const property = unit?.property_id ? (propertyById.get(unit.property_id) ?? null) : null;

    return {
      id: e.id,
      lease_id: e.lease_id,
      due_period: e.due_period,
      amountRemaining: Number(e.amount_expected) - (paidByExp.get(e.id) ?? 0),
      tenant,
      paymentProfile,
      propertyAddress: property?.address ?? null,
    };
  });

  // Group by (lease_id, due_period) for split-candidate detection
  const groups = new Map<string, EnrichedExp[]>();
  for (const exp of enriched) {
    const key = `${exp.lease_id}|${exp.due_period}`;
    const group = groups.get(key) ?? [];
    group.push(exp);
    groups.set(key, group);
  }

  const txAmount = Number(tx.amount);
  const candidates: EnrichedCandidate[] = [];

  for (const group of groups.values()) {
    const [first] = group;
    const tenantIban = first.tenant?.iban ?? null;
    const paymentProfile = first.paymentProfile;
    const propertyAddress = first.propertyAddress;

    // Single candidates: any one expectation whose remaining amount == tx.amount
    for (const exp of group) {
      if (Math.abs(exp.amountRemaining - txAmount) < 0.005) {
        candidates.push({
          expectationIds: [exp.id],
          amountAssigned: txAmount,
          assignments: [{ expectationId: exp.id, amount: txAmount }],
          duePeriod: exp.due_period,
          tenantIban,
          paymentProfile,
          propertyAddress,
        });
      }
    }

    // Split candidate: exactly 2 expectations whose combined remaining == tx.amount
    if (group.length === 2) {
      const [a, b] = group;
      const sum = a.amountRemaining + b.amountRemaining;
      if (Math.abs(sum - txAmount) < 0.005) {
        candidates.push({
          expectationIds: [a.id, b.id],
          amountAssigned: txAmount,
          assignments: [
            { expectationId: a.id, amount: a.amountRemaining },
            { expectationId: b.id, amount: b.amountRemaining },
          ],
          duePeriod: a.due_period,
          tenantIban,
          paymentProfile,
          propertyAddress,
        });
      }
    }
  }

  return candidates;
}
