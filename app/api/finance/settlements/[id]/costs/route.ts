import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AllocationMethod = "equal" | "surface_area" | "custom";
type CostAllocationKey = {
  id: string;
  name: string;
  method: AllocationMethod;
  units: Array<{ unit_id: string; percentage?: number }>;
};
type PropertyUnit = { id: string; size_m2: number | null };

function computeUnitFraction(
  key: CostAllocationKey,
  propertyUnits: PropertyUnit[],
  totalAmount: number,
  unitId: string
): number {
  if (key.method === "equal") {
    const n = propertyUnits.length;
    if (n === 0) return 0;
    if (!propertyUnits.some((u) => u.id === unitId)) return 0;
    return totalAmount / n;
  }
  if (key.method === "surface_area") {
    const totalM2 = propertyUnits.reduce((s, u) => s + (u.size_m2 ?? 0), 0);
    if (totalM2 === 0) return 0;
    const unit = propertyUnits.find((u) => u.id === unitId);
    if (!unit || !unit.size_m2) return 0;
    return (totalAmount * unit.size_m2) / totalM2;
  }
  // custom — percentages stored on the key
  const unit = key.units.find((u) => u.unit_id === unitId);
  if (!unit) return 0;
  return (totalAmount * (unit.percentage ?? 0)) / 100;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // id param is unused — costs are fetched by query params (property_id, period)
  await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const property_id = searchParams.get("property_id");
  const unit_id = searchParams.get("unit_id");
  const period_start = searchParams.get("period_start");
  const period_end = searchParams.get("period_end");

  if (!property_id || !period_start || !period_end) {
    return NextResponse.json(
      { error: "property_id, period_start en period_end zijn verplicht" },
      { status: 400 }
    );
  }

  const servicekostenCategories = [
    "onderhoud",
    "verzekering",
    "belasting",
    "energie",
    "vve",
    "beheer",
    "overig",
  ];

  // ── Income: received payments (huur) assigned to this unit/property ──
  let incomePayments: {
    id: string;
    source: string;
    date: string;
    description: string;
    counterparty_name: string;
    amount: number;
  }[] = [];

  {
    let query = (supabase as any)
      .from("payment_assignments")
      .select(
        `
        id,
        unit_id,
        property_id,
        category,
        raw_transactions (
          id,
          value_date,
          amount,
          description,
          counterparty_name
        )
      `
      )
      .eq("property_id", property_id);

    if (unit_id) {
      query = query.eq("unit_id", unit_id);
    }

    const { data: incomeAssignments, error: incomeErr } = await query;

    if (incomeErr) {
      console.error("Income fetch failed:", incomeErr);
      return NextResponse.json(
        { error: "Inkomen ophalen mislukt" },
        { status: 500 }
      );
    }

    incomePayments = (incomeAssignments ?? [])
      .filter((a: any) => {
        // Income = positive-amount transactions within the period
        const d = a.raw_transactions?.value_date;
        const amt = Number(a.raw_transactions?.amount ?? 0);
        return d && d >= period_start && d <= period_end && amt > 0;
      })
      .map((a: any) => ({
        id: a.raw_transactions?.id ?? a.id,
        source: "payment" as const,
        date: a.raw_transactions?.value_date,
        description: a.raw_transactions?.description ?? "",
        counterparty_name: a.raw_transactions?.counterparty_name ?? "",
        amount: Number(a.raw_transactions?.amount ?? 0),
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }

  // ── Expenses: payment_assignments with servicekosten categories ──
  // Run two explicit queries (combining .or() with .eq()/.in() in PostgREST is
  // unreliable), then merge:
  //  - property-level rows (unit_id IS NULL, cost_allocation_key_id set) → split via key
  //  - this-unit rows (unit_id = unit_id) → full amount
  const expenseSelect = `
    id,
    category,
    property_id,
    unit_id,
    cost_allocation_key_id,
    raw_transactions (
      id,
      value_date,
      amount,
      description
    )
  `;

  const propertyLevelPromise = (supabase as any)
    .from("payment_assignments")
    .select(expenseSelect)
    .eq("property_id", property_id)
    .is("unit_id", null)
    .in("category", servicekostenCategories);

  const unitLevelPromise = unit_id
    ? (supabase as any)
        .from("payment_assignments")
        .select(expenseSelect)
        .eq("property_id", property_id)
        .eq("unit_id", unit_id)
        .in("category", servicekostenCategories)
    : Promise.resolve({ data: [], error: null });

  const [propertyLevelRes, unitLevelRes] = await Promise.all([
    propertyLevelPromise,
    unitLevelPromise,
  ]);

  if (propertyLevelRes.error || unitLevelRes.error) {
    console.error(
      "Costs fetch failed:",
      propertyLevelRes.error ?? unitLevelRes.error
    );
    return NextResponse.json(
      { error: "Kosten ophalen mislukt" },
      { status: 500 }
    );
  }

  const assignments = [
    ...(propertyLevelRes.data ?? []),
    ...(unitLevelRes.data ?? []),
  ];

  // Batch-fetch all referenced allocation keys so we can compute fractional amounts
  const allocationKeyIds = [
    ...new Set(
      (assignments ?? [])
        .map((a: any) => a.cost_allocation_key_id)
        .filter(Boolean) as string[]
    ),
  ];

  const allocationKeyMap = new Map<string, CostAllocationKey>();
  if (allocationKeyIds.length > 0) {
    const { data: keyRows } = await (supabase as any)
      .from("cost_allocation_keys")
      .select("*")
      .in("id", allocationKeyIds);
    for (const key of keyRows ?? []) {
      allocationKeyMap.set(key.id, key as CostAllocationKey);
    }
  }

  // For equal/surface_area, the unit list and m² values are derived from the
  // property at compute time — not from the key.
  const { data: propertyUnitRows } = await (supabase as any)
    .from("units")
    .select("id, size_m2")
    .eq("property_id", property_id);
  const propertyUnits: PropertyUnit[] = (propertyUnitRows ?? []) as PropertyUnit[];

  const filteredAssignments = (assignments ?? []).filter((a: any) => {
    const d = a.raw_transactions?.value_date;
    const amt = Number(a.raw_transactions?.amount ?? 0);
    return d && d >= period_start && d <= period_end && amt < 0;
  });

  const allExpenses = filteredAssignments
    .map((a: any) => {
      const fullAmount = Math.abs(Number(a.raw_transactions?.amount ?? 0));
      const isPropertyLevel = a.unit_id == null;

      let allocatedAmount = fullAmount;
      let excluded_reason: string | null = null;
      let allocationKeyName: string | null = null;
      let allocationMethod: AllocationMethod | null = null;

      if (isPropertyLevel) {
        if (!a.cost_allocation_key_id) {
          excluded_reason = "property_cost_missing_allocation_key";
          allocatedAmount = 0;
        } else if (unit_id) {
          const key = allocationKeyMap.get(a.cost_allocation_key_id);
          if (!key) {
            excluded_reason = "allocation_key_not_found";
            allocatedAmount = 0;
          } else {
            allocationKeyName = key.name;
            allocationMethod = key.method;
            allocatedAmount = computeUnitFraction(key, propertyUnits, fullAmount, unit_id);
            if (allocatedAmount === 0) {
              excluded_reason = "unit_not_in_allocation_key";
            }
          }
        }
      }

      const allocationPct =
        isPropertyLevel && fullAmount > 0
          ? (allocatedAmount / fullAmount) * 100
          : null;

      return {
        id: a.raw_transactions?.id ?? a.id,
        source: "transaction" as const,
        date: a.raw_transactions?.value_date,
        description: a.raw_transactions?.description ?? "",
        category: a.category,
        amount: allocatedAmount,
        full_amount: fullAmount,
        is_property_level: isPropertyLevel,
        cost_allocation_key_id: a.cost_allocation_key_id ?? null,
        cost_allocation_key_name: allocationKeyName,
        cost_allocation_method: allocationMethod,
        allocation_pct: allocationPct,
        excluded_reason,
      };
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const includedExpenses = allExpenses.filter((e: any) => e.amount > 0);
  const excludedExpenses = allExpenses.filter((e: any) => e.amount === 0);

  if (excludedExpenses.length > 0) {
    console.warn(
      "[settlements/costs] excluded property-level rows",
      excludedExpenses.map((e: any) => ({
        id: e.id,
        reason: e.excluded_reason,
        cost_allocation_key_id: e.cost_allocation_key_id,
      }))
    );
  }

  return NextResponse.json({
    income: incomePayments,
    expenses: includedExpenses,
    excluded: excludedExpenses,
  });
}
