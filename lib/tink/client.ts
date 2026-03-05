/**
 * Tink Payment Initiation (PIS) – client credentials + payment request.
 * Docs: https://docs.tink.com/resources/payments/one-time-payments/initiate-your-first-one-time-payment
 */

const TINK_TOKEN_URL = 'https://api.tink.com/api/v1/oauth/token'
const TINK_PAYMENTS_URL = 'https://api.tink.com/api/v1/payments/requests'
const TINK_SCOPES = 'payment:read,payment:write'

let cachedToken: { access_token: string; expires_at: number } | null = null

async function getClientAccessToken(): Promise<string> {
  const clientId = process.env.TINK_CLIENT_ID
  const clientSecret = process.env.TINK_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('TINK_CLIENT_ID and TINK_CLIENT_SECRET must be set in .env.local')
  }

  if (cachedToken && cachedToken.expires_at > Date.now() + 60_000) {
    return cachedToken.access_token
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope: TINK_SCOPES,
  })

  const res = await fetch(TINK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Tink token failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
  return data.access_token
}

export interface CreatePaymentRequestParams {
  amount: number
  currency?: string
  market?: string
  recipientIban: string
  recipientName: string
  sourceMessage?: string
  remittanceInformation?: string
}

export interface CreatePaymentRequestResult {
  id: string
  amount: number
  currency: string
  market: string
}

export async function createPaymentRequest(
  params: CreatePaymentRequestParams
): Promise<CreatePaymentRequestResult> {
  const token = await getClientAccessToken()
  const {
    amount,
    currency = 'EUR',
    market = 'NL',
    recipientIban,
    recipientName,
    sourceMessage = 'Betaling via Domio',
    remittanceInformation = 'Huur',
  } = params

  const body = {
    recipient: {
      accountNumber: recipientIban.replace(/\s/g, ''),
      accountType: 'iban',
    },
    amount: Number(amount),
    currency,
    market,
    recipientName,
    sourceMessage,
    remittanceInformation: {
      type: 'UNSTRUCTURED',
      value: remittanceInformation,
    },
    paymentScheme: 'SEPA_CREDIT_TRANSFER',
  }

  const res = await fetch(TINK_PAYMENTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Tink create payment request failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as CreatePaymentRequestResult
  return data
}

/**
 * Bouwt de Tink Link URL voor één betaling (Pay by Bank).
 * https://link.tink.com/1.0/pay/direct
 */
export function buildTinkPayDirectUrl(options: {
  paymentRequestId: string
  redirectUri: string
  market?: string
  locale?: string
}): string {
  const clientId = process.env.TINK_CLIENT_ID
  if (!clientId) throw new Error('TINK_CLIENT_ID must be set')

  const { paymentRequestId, redirectUri, market = 'NL', locale = 'nl_NL' } = options
  const url = new URL('https://link.tink.com/1.0/pay/direct')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('payment_request_id', paymentRequestId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('market', market)
  url.searchParams.set('locale', locale)
  return url.toString()
}
