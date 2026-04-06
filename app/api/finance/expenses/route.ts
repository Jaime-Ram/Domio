import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { property_id, category, amount, date, description } = body;

  const validCategories = [
    "onderhoud",
    "verzekering",
    "belasting",
    "energie",
    "vve",
    "hypotheek",
    "beheer",
    "overig",
  ];

  if (!property_id || !category || !amount || !date) {
    return NextResponse.json(
      { error: "Verplichte velden ontbreken" },
      { status: 400 }
    );
  }

  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: "Ongeldige categorie" },
      { status: 400 }
    );
  }

  const { data, error } = await (supabase as any)
    .from("manual_expenses")
    .insert({
      owner_id: user.id,
      property_id,
      category,
      amount: Number(amount),
      date,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Manual expense insert failed:", error);
    return NextResponse.json(
      { error: "Opslaan mislukt" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
