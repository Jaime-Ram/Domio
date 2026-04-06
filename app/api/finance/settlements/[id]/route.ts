import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const validStatuses = ["concept", "definitief", "verzonden", "nietig"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Ongeldige status" },
      { status: 400 }
    );
  }

  // Verify ownership and get current status
  const { data: existing } = await (supabase as any)
    .from("settlements")
    .select("owner_id, status")
    .eq("id", id)
    .single();

  if (!existing || existing.owner_id !== user.id) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const currentStatus = existing.status as string;

  // Enforce immutability: only concept settlements can have their data edited.
  // Non-concept settlements only allow status transitions + notes.
  if (currentStatus !== "concept" && status !== "nietig") {
    return NextResponse.json(
      { error: "Alleen concept-afrekeningen kunnen worden bewerkt" },
      { status: 403 }
    );
  }

  // Void is allowed from definitief or verzonden
  if (status === "nietig" && currentStatus !== "definitief" && currentStatus !== "verzonden") {
    return NextResponse.json(
      { error: "Alleen gepubliceerde of verzonden afrekeningen kunnen nietig worden verklaard" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};

  if (currentStatus === "concept") {
    // Full edit allowed for concept
    if (property_id !== undefined) updates.property_id = property_id;
    if (unit_id !== undefined) updates.unit_id = unit_id;
    if (tenant_id !== undefined) updates.tenant_id = tenant_id || null;
    if (lease_id !== undefined) updates.lease_id = lease_id || null;
    if (period_start !== undefined) updates.period_start = period_start;
    if (period_end !== undefined) updates.period_end = period_end;
    if (total_voorschot !== undefined)
      updates.total_voorschot = Number(total_voorschot);
    if (total_actual_costs !== undefined)
      updates.total_actual_costs = Number(total_actual_costs);
    if (balance !== undefined) updates.balance = Number(balance);
    if (cost_breakdown !== undefined) updates.cost_breakdown = cost_breakdown;
    if (notes !== undefined) updates.notes = notes;
  }

  // Handle status transitions with timestamps
  if (status !== undefined) {
    updates.status = status;
    if (status === "definitief" && currentStatus === "concept") {
      updates.published_at = new Date().toISOString();
    }
    if (status === "verzonden") {
      updates.sent_at = new Date().toISOString();
    }
    if (status === "nietig") {
      updates.voided_at = new Date().toISOString();
    }
  }

  const { data, error } = await (supabase as any)
    .from("settlements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Settlement update failed:", error);
    return NextResponse.json({ error: "Bijwerken mislukt" }, { status: 500 });
  }

  return NextResponse.json(data);
}
