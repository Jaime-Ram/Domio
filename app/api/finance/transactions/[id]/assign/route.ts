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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: transactionId } = await params;
  const { lease_id } = await request.json();

  if (!lease_id) {
    return NextResponse.json({ error: "lease_id is verplicht" }, { status: 400 });
  }

  // Verify the transaction belongs to this user
  const { data: tx, error: txErr } = await supabaseAdmin
    .from("raw_transactions")
    .select("id, amount, booking_date, value_date, owner_id")
    .eq("id", transactionId)
    .eq("owner_id", user.id)
    .single();

  if (txErr || !tx) {
    return NextResponse.json({ error: "Transactie niet gevonden" }, { status: 404 });
  }

  // Derive the due_period: first day of the transaction's month
  const txDate = new Date(tx.booking_date ?? tx.value_date);
  const due_period = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}-01`;

  // Find or create the rent_expectation for this lease + period
  let rentExpectationId: string;

  const { data: existing } = await supabaseAdmin
    .from("rent_expectations")
    .select("id")
    .eq("lease_id", lease_id)
    .eq("due_period", due_period)
    .single();

  if (existing) {
    rentExpectationId = existing.id;
  } else {
    // Get the lease's expected rent amount
    const { data: lease } = await supabaseAdmin
      .from("leases")
      .select("monthly_rent")
      .eq("id", lease_id)
      .single();

    const { data: created, error: createErr } = await supabaseAdmin
      .from("rent_expectations")
      .insert({
        owner_id: user.id,
        lease_id,
        due_period,
        amount_expected: lease?.monthly_rent ?? Math.abs(Number(tx.amount)),
      })
      .select("id")
      .single();

    if (createErr || !created) {
      console.error("Failed to create rent_expectation:", createErr);
      return NextResponse.json({ error: "Verwachting aanmaken mislukt" }, { status: 500 });
    }
    rentExpectationId = created.id;
  }

  // Remove any existing assignment for this transaction
  await supabaseAdmin
    .from("payment_assignments")
    .delete()
    .eq("raw_transaction_id", transactionId)
    .eq("owner_id", user.id);

  // Create the new assignment
  const { data: assignment, error: assignErr } = await supabaseAdmin
    .from("payment_assignments")
    .insert({
      owner_id: user.id,
      raw_transaction_id: transactionId,
      rent_expectation_id: rentExpectationId,
      amount_assigned: Math.abs(Number(tx.amount)),
      match_method: "manual",
      confidence_score: null,
      assigned_by: user.id,
    })
    .select()
    .single();

  if (assignErr) {
    console.error("Assignment failed:", assignErr);
    return NextResponse.json({ error: "Toewijzing mislukt" }, { status: 500 });
  }

  return NextResponse.json(assignment);
}
