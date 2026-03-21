import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { fetchTransactions } from "@/lib/tink/fetchTransactions";

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // Authenticate user via cookie session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up the user's bank connection
  const { data: connection, error: connError } = await supabaseAdmin
    .from("bank_connections")
    .select("id, access_token")
    .eq("owner_id", user.id)
    .eq("provider", "tink")
    .single();

  if (connError || !connection) {
    return NextResponse.json(
      { error: "No bank connection found" },
      { status: 404 }
    );
  }

  try {
    const result = await fetchTransactions(
      connection.id,
      connection.access_token,
      user.id
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("Tink sync error:", err);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
