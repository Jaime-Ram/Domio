import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await (supabase as any)
    .from("settlements")
    .select(
      `
      *,
      properties (name, address),
      units (unit_number),
      tenants (full_name)
    `
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Settlements fetch failed:", error);
    return NextResponse.json({ error: "Ophalen mislukt" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    property_id,
    unit_id,
    tenant_id,
    lease_id,
    period_start,
    period_end,
    total_voorschot,
    total_actual_costs,
    balance,
    cost_breakdown,
    status,
    notes,
  } = body;

  if (!property_id || !unit_id || !period_start || !period_end) {
    return NextResponse.json(
      { error: "Verplichte velden ontbreken" },
      { status: 400 }
    );
  }

  const validStatuses = ["concept", "definitief", "verzonden", "nietig"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Ongeldige status" },
      { status: 400 }
    );
  }

  const { data, error } = await (supabase as any)
    .from("settlements")
    .insert({
      owner_id: user.id,
      property_id,
      unit_id,
      tenant_id: tenant_id || null,
      lease_id: lease_id || null,
      period_start,
      period_end,
      total_voorschot: Number(total_voorschot) || 0,
      total_actual_costs: Number(total_actual_costs) || 0,
      balance: Number(balance) || 0,
      cost_breakdown: cost_breakdown || null,
      status: status || "concept",
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Settlement insert failed:", error);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }

  return NextResponse.json(data);
}
