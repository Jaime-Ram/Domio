import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { expectation_ids, action } = await request.json();

  if (
    !Array.isArray(expectation_ids) ||
    expectation_ids.length === 0 ||
    !["settled", "ignored", "pending", "paid"].includes(action)
  ) {
    return NextResponse.json(
      { error: "Ongeldige parameters" },
      { status: 400 }
    );
  }

  // Determine which source statuses to update
  const fromStatuses =
    action === "pending"
      ? ["settled", "ignored", "paid"] // reset action — also reset accepted discrepancies
      : action === "paid"
        ? ["pending", "overdue", "partial"] // accept discrepancy
        : ["pending", "overdue"]; // settle or ignore action

  const { data, error } = await supabaseAdmin
    .from("rent_expectations")
    .update({ status: action })
    .eq("owner_id", user.id)
    .in("id", expectation_ids)
    .in("status", fromStatuses)
    .select("id");

  if (error) {
    console.error("Bulk update failed:", error);
    return NextResponse.json(
      { error: "Bijwerken mislukt" },
      { status: 500 }
    );
  }

  return NextResponse.json({ updated: data?.length ?? 0 });
}
