import { NextRequest, NextResponse } from 'next/server'
import { createPaymentRequest, buildTinkPayDirectUrl } from '@/lib/tink/client'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/tink/create
 * Body: { amount, recipientIban, recipientName, description?, paymentId? }
 * Creates a Tink payment request and returns the redirect URL for Pay by Bank.
 * If paymentId is given, links the Tink request to that payment and stores tink_payment_request_id.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      amount,
      recipientIban,
      recipientName,
      description,
      paymentId,
    } = body as {
      amount: number
      recipientIban: string
      recipientName: string
      description?: string
      paymentId?: string
    }

    if (!amount || !recipientIban || !recipientName) {
      return NextResponse.json(
        { error: 'amount, recipientIban en recipientName zijn verplicht' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    let linkedPaymentId: string | undefined

    if (paymentId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
      }
      const { data: paymentData, error: payErr } = await supabase
        .from('payments')
        .select('id, owner_id, status')
        .eq('id', paymentId)
        .eq('owner_id', user.id)
        .single()
      if (payErr || !paymentData) {
        return NextResponse.json({ error: 'Betaling niet gevonden' }, { status: 404 })
      }
      const payment = paymentData as { id: string; owner_id: string; status: string }
      if (payment.status === 'betaald') {
        return NextResponse.json({ error: 'Deze betaling is al voldaan' }, { status: 400 })
      }
      linkedPaymentId = paymentId
    }

    const result = await createPaymentRequest({
      amount: Number(amount),
      recipientIban: String(recipientIban).trim(),
      recipientName: String(recipientName).trim(),
      sourceMessage: description || 'Betaling via Domio',
      remittanceInformation: description || 'Huur',
    })

    if (linkedPaymentId) {
      // @ts-expect-error - payments.Update allows tink_payment_request_id; Supabase infers never in some builds
      await supabase.from('payments').update({ tink_payment_request_id: result.id }).eq('id', linkedPaymentId)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/payments/tink/callback`
    const redirectUrl = buildTinkPayDirectUrl({
      paymentRequestId: result.id,
      redirectUri,
      market: 'NL',
      locale: 'nl_NL',
    })

    return NextResponse.json({ redirectUrl, paymentRequestId: result.id })
  } catch (err) {
    console.error('Tink create payment error:', err)
    const message = err instanceof Error ? err.message : 'Betaling kon niet worden gestart'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
