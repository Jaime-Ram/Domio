import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: transactionId } = await params;
  const { property_id, unit_id, tenant_id, lease_id, category } = await request.json();
  const isRent = !category || category === 'huur';

  // Verify the transaction belongs to this user
  const { data: tx, error: txErr } = await supabaseAdmin
    .from("raw_transactions")
    .select("id, amount, value_date")
    .eq("id", transactionId)
    .eq("owner_id", user.id)
    .single();

  if (txErr || !tx) {
    return NextResponse.json({ error: "Transactie niet gevonden" }, { status: 404 });
  }

  // Check if an assignment already exists for this transaction
  const { data: existing } = await supabaseAdmin
    .from("payment_assignments")
    .select("id, lease_id")
    .eq("transaction_id", transactionId)
    .single();

  let assignment;

  if (existing) {
    // Reset the old rent expectation back to 'pending'
    if (existing.lease_id && tx.value_date) {
      const d = new Date(tx.value_date);
      const periodLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      await supabaseAdmin
        .from("rent_expectations")
        .update({ status: "pending" })
        .eq("lease_id", existing.lease_id)
        .eq("period_label", periodLabel)
        .in("status", ["paid", "partial"]);
    }

    // Update existing assignment
    const { data, error } = await supabaseAdmin
      .from("payment_assignments")
      .update({
        property_id: property_id ?? null,
        unit_id: unit_id ?? null,
        tenant_id: tenant_id ?? null,
        lease_id: lease_id ?? null,
        category: category ?? null,
        confidence_score: 100,
        match_method: "manual",
        is_manual: true,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Reassignment failed:", error);
      return NextResponse.json({ error: "Hertoewijzing mislukt" }, { status: 500 });
    }
    assignment = data;
  } else {
    // Insert new assignment
    const { data, error } = await supabaseAdmin
      .from("payment_assignments")
      .insert({
        owner_id: user.id,
        transaction_id: transactionId,
        property_id: property_id ?? null,
        unit_id: unit_id ?? null,
        tenant_id: tenant_id ?? null,
        lease_id: lease_id ?? null,
        category: category ?? null,
        confidence_score: 100,
        match_method: "manual",
        is_manual: true,
        assigned_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Assignment failed:", error);
      return NextResponse.json({ error: "Toewijzing mislukt" }, { status: 500 });
    }
    assignment = data;
  }

  // Update the new rent expectation to paid/partial (only for rent assignments)
  if (isRent && lease_id && tx.value_date) {
    const d = new Date(tx.value_date);
    const periodLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const { data: exp } = await supabaseAdmin
      .from("rent_expectations")
      .select("id, expected_amount")
      .eq("lease_id", lease_id)
      .eq("period_label", periodLabel)
      .eq("status", "pending")
      .single();

    if (exp) {
      const status =
        Number(tx.amount) >= Number(exp.expected_amount) ? "paid" : "partial";
      await supabaseAdmin
        .from("rent_expectations")
        .update({ status })
        .eq("id", exp.id);
    }
  }

  return NextResponse.json(assignment);
}
