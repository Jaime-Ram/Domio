import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRentExpectations } from "@/lib/finance/generateRentExpectations";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generateRentExpectations(user.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Rent expectations error:", err);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
