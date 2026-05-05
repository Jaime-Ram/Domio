import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { yapilyRequest, yapilyRequestWithConsent } from '@/lib/yapily/client'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const betalingenUrl = '/dashboard/employer/financial/betalingen'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')

  if (error) {
    console.error('Yapily callback error:', error)
    return NextResponse.redirect(new URL(`${betalingenUrl}?yapily_error=true`, request.url))
  }

  // Yapily returns application-user-id (the Supabase userId we passed as applicationUserId)
  const userId = searchParams.get('application-user-id')

  // Most institutions: Yapily passes consentToken directly as `consent`
  let consentToken = searchParams.get('consent')

  // Some institutions use OAuth2 and redirect with an auth code instead
  if (!consentToken) {
    const code = searchParams.get('code')
    if (code) {
      const exchangeRes = await yapilyRequest('/consent-auth-code', {
        method: 'POST',
        body: JSON.stringify({ authCode: code }),
      })
      if (exchangeRes.ok) {
        const exchangeData = await exchangeRes.json()
        consentToken = exchangeData?.data?.consentToken ?? null
      }
    }
  }

  if (!consentToken || !userId) {
    console.error('Yapily callback: missing consent token or user ID', {
      hasConsent: !!consentToken,
      hasUserId: !!userId,
    })
    return NextResponse.redirect(new URL(`${betalingenUrl}?yapily_error=true`, request.url))
  }

  // Fetch accounts to get IBAN and Yapily account ID (needed for transaction fetching)
  const accountsRes = await yapilyRequestWithConsent('/accounts', consentToken)
  if (!accountsRes.ok) {
    console.error('Yapily accounts fetch failed:', await accountsRes.text())
    return NextResponse.redirect(new URL(`${betalingenUrl}?yapily_error=true`, request.url))
  }

  const accountsData = await accountsRes.json()
  const account = accountsData?.data?.[0]
  const iban =
    account?.accountIdentifications?.find(
      (i: { type: string; identification: string }) => i.type === 'IBAN'
    )?.identification ?? null
  const accountId: string | null = account?.id ?? null

  try {
    const { error: dbError } = await supabaseAdmin.from('bank_connections').upsert(
      {
        owner_id: userId,
        provider: 'yapily',
        access_token: consentToken,
        refresh_token: null,
        iban,
        account_id: accountId,
      },
      { onConflict: 'owner_id,provider' }
    )

    if (dbError) throw dbError
    console.log('Yapily bank connection saved:', { userId, iban, accountId })
  } catch (err) {
    console.error('Yapily DB save failed:', err)
    return NextResponse.redirect(new URL(`${betalingenUrl}?yapily_error=true`, request.url))
  }

  return NextResponse.redirect(new URL(`${betalingenUrl}?yapily_connected=true`, request.url))
}
