import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface GenerateResult {
  generated: number;
  skipped: number;
}

export async function generateRentExpectations(
  ownerId: string
): Promise<GenerateResult> {
  // Fetch active leases with unit → property join
  const { data: leases, error } = await supabaseAdmin
    .from("leases")
    .select("id, tenant_id, unit_id, start_date, end_date, monthly_rent, units!inner(property_id)")
    .eq("owner_id", ownerId)
    .eq("status", "actief");

  if (error) throw error;
  if (!leases || leases.length === 0) {
    console.log("No active leases found for owner:", ownerId);
    return { generated: 0, skipped: 0 };
  }

  console.log(`Found ${leases.length} active lease(s) for owner:`, ownerId);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based

  const rows: Array<Record<string, unknown>> = [];

  for (const lease of leases) {
    const start = new Date(lease.start_date);
    const end = lease.end_date ? new Date(lease.end_date) : null;
    const propertyId = (lease.units as unknown as { property_id: string }).property_id;

    // Walk from lease start month up to current month
    let year = start.getFullYear();
    let month = start.getMonth();

    while (year < currentYear || (year === currentYear && month <= currentMonth)) {
      // Stop if past lease end date
      if (end) {
        const endYear = end.getFullYear();
        const endMonth = end.getMonth();
        if (year > endYear || (year === endYear && month > endMonth)) break;
      }

      const periodLabel = `${year}-${String(month + 1).padStart(2, "0")}`;
      const dueDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;

      rows.push({
        owner_id: ownerId,
        lease_id: lease.id,
        tenant_id: lease.tenant_id,
        unit_id: lease.unit_id,
        property_id: propertyId,
        expected_amount: lease.monthly_rent,
        due_date: dueDate,
        period_label: periodLabel,
      });

      // Next month
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }
  }

  if (rows.length === 0) {
    return { generated: 0, skipped: 0 };
  }

  // Upsert in batches
  const BATCH_SIZE = 500;
  let generated = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data, error: upsertError } = await supabaseAdmin
      .from("rent_expectations")
      .upsert(batch, {
        onConflict: "lease_id,period_label",
        ignoreDuplicates: true,
      })
      .select("id");

    if (upsertError) throw upsertError;
    generated += data?.length ?? 0;
  }

  const result: GenerateResult = {
    generated,
    skipped: rows.length - generated,
  };

  console.log("Rent expectations generated:", result);
  return result;
}
