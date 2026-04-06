import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  const tenant_id = searchParams.get("tenant_id");
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

  // ── Income: fetch actual received payments matched to this tenant/unit ──
  let incomePayments: {
    id: string;
    source: string;
    date: string;
    description: string;
    sender_name: string;
    amount: number;
  }[] = [];

  if (tenant_id || unit_id) {
    let query = (supabase as any)
      .from("payment_assignments")
      .select(
        `
        id,
        tenant_id,
        unit_id,
        property_id,
        category,
        raw_transactions (
          id,
          value_date,
          amount,
          description,
          sender_name
        )
      `
      )
      .eq("property_id", property_id);

    // Income = payments linked to tenant/unit that are NOT expense categories
    // These are rent payments: either category is null/huur, or linked via tenant_id
    if (tenant_id) {
      query = query.eq("tenant_id", tenant_id);
    } else if (unit_id) {
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
        // Only include if NOT an expense category (rent payments have null or no category)
        if (a.category && servicekostenCategories.includes(a.category)) {
          return false;
        }
        const d = a.raw_transactions?.value_date;
        const amt = Number(a.raw_transactions?.amount ?? 0);
        return d && d >= period_start && d <= period_end && amt > 0;
      })
      .map((a: any) => ({
        id: a.raw_transactions?.id ?? a.id,
        source: "payment" as const,
        date: a.raw_transactions?.value_date,
        description: a.raw_transactions?.description ?? "",
        sender_name: a.raw_transactions?.sender_name ?? "",
        amount: Number(a.raw_transactions?.amount ?? 0),
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }

  // ── Expenses: fetch categorized costs from payment_assignments ──
  const { data: assignments, error: assignErr } = await (supabase as any)
    .from("payment_assignments")
    .select(
      `
      id,
      category,
      property_id,
      raw_transactions (
        id,
        value_date,
        amount,
        description
      )
    `
    )
    .eq("property_id", property_id)
    .in("category", servicekostenCategories);

  if (assignErr) {
    console.error("Costs fetch (assignments) failed:", assignErr);
    return NextResponse.json(
      { error: "Kosten ophalen mislukt" },
      { status: 500 }
    );
  }

  const assignmentCosts = (assignments ?? [])
    .filter((a: any) => {
      const d = a.raw_transactions?.value_date;
      return d && d >= period_start && d <= period_end;
    })
    .map((a: any) => ({
      id: a.raw_transactions?.id ?? a.id,
      source: "transaction" as const,
      date: a.raw_transactions?.value_date,
      description: a.raw_transactions?.description ?? "",
      category: a.category,
      amount: Math.abs(Number(a.raw_transactions?.amount ?? 0)),
    }));

  // ── Expenses: fetch from manual_expenses ──
  const { data: expenses, error: expErr } = await (supabase as any)
    .from("manual_expenses")
    .select("id, date, description, category, amount")
    .eq("property_id", property_id)
    .gte("date", period_start)
    .lte("date", period_end)
    .in("category", servicekostenCategories);

  if (expErr) {
    console.error("Costs fetch (expenses) failed:", expErr);
    return NextResponse.json(
      { error: "Kosten ophalen mislukt" },
      { status: 500 }
    );
  }

  const manualCosts = (expenses ?? []).map((e: any) => ({
    id: e.id,
    source: "manual" as const,
    date: e.date,
    description: e.description ?? "",
    category: e.category,
    amount: Math.abs(Number(e.amount)),
  }));

  const allExpenses = [...assignmentCosts, ...manualCosts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return NextResponse.json({
    income: incomePayments,
    expenses: allExpenses,
  });
}
