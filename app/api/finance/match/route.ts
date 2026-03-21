import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { matchTransactions } from "@/lib/finance/matchTransactions";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await matchTransactions(user.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Match transactions error:", err);
    return NextResponse.json(
      { error: "Matching failed" },
      { status: 500 }
    );
  }
}
