import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payments/tink/callback?payment_request_id=...
 * Tink redirects here after the user completes or cancels the Pay by Bank flow.
 * On success we get payment_request_id; we find our payment and mark it paid, then redirect to success page.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentRequestId = searchParams.get('payment_request_id')
  const errorParam = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const successUrl = `${baseUrl}/dashboard/employer/financial?tink=success`
  const cancelUrl = `${baseUrl}/dashboard/employer/financial?tink=cancelled`

  if (errorParam) {
    return NextResponse.redirect(cancelUrl)
  }

  if (!paymentRequestId) {
    return NextResponse.redirect(cancelUrl)
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.redirect(`${cancelUrl}&reason=config`)
  }

  const { data: payment } = await admin
    .from('payments')
    .select('id, status')
    .eq('tink_payment_request_id', paymentRequestId)
    .maybeSingle()

  if (payment && payment.status !== 'betaald') {
    const today = new Date().toISOString().split('T')[0]
    await admin
      .from('payments')
      .update({ status: 'betaald', paid_date: today })
      .eq('id', payment.id)
  }

  return NextResponse.redirect(successUrl)
}
