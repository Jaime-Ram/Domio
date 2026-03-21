import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.TINK_CLIENT_ID!;
  const redirectUri = process.env.TINK_REDIRECT_URI!;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "accounts:read,transactions:read",
    market: "NL",
    locale: "nl_NL",
    test: "true",
    state: user.id,
  });

  return NextResponse.redirect(
    `https://link.tink.com/1.0/transactions/connect-accounts?${params.toString()}`
  );
}
