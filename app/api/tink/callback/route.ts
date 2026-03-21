import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !userId) {
    return NextResponse.redirect(new URL("/finances?tink_error=true", request.url));
  }

  // Exchange code for tokens
  const tokenResponse = await fetch("https://api.tink.com/api/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.TINK_CLIENT_ID!,
      client_secret: process.env.TINK_CLIENT_SECRET!,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Tink token exchange failed:", errorText);
    return NextResponse.redirect(new URL("/finances?tink_error=true", request.url));
  }

  const { access_token, refresh_token } = await tokenResponse.json();

  // Fetch accounts
  const accountsResponse = await fetch("https://api.tink.com/data/v2/accounts", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const accountsData = await accountsResponse.json();
  const iban = accountsData?.accounts?.[0]?.identifiers?.iban?.iban ?? null;

  // Save to database
  try {
    const { error: dbError } = await supabaseAdmin
      .from("bank_connections")
      .upsert(
        {
          owner_id: userId,
          provider: "tink",
          access_token,
          refresh_token: refresh_token ?? null,
          iban,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "owner_id,provider" }
      );

    if (dbError) throw dbError;

    console.log("Tink bank connection saved:", { userId, iban });
  } catch (dbErr) {
    console.error("Tink DB save failed:", dbErr);
    return NextResponse.redirect(new URL("/finances?tink_error=true", request.url));
  }

  return NextResponse.redirect(new URL("/finances?tink_connected=true", request.url));
}
