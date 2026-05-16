import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLAN_PRICE_IDS } from '@/lib/stripe'
import { SubscriptionPlan } from '@/lib/supabase/subscription'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }

  const body = await request.json()
  const plan = body.plan as SubscriptionPlan

  if (!plan || !PLAN_PRICE_IDS[plan]) {
    return NextResponse.json({ error: 'Ongeldig plan' }, { status: 400 })
  }

  const priceId = PLAN_PRICE_IDS[plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Retrieve or create Stripe customer
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = sub?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('subscriptions')
      .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: 'user_id' })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    payment_method_types: ['card', 'ideal', 'sepa_debit'],
    success_url: `${appUrl}/dashboard/landlord?checkout=success`,
    cancel_url: `${appUrl}/dashboard/landlord/upgrade`,
    locale: 'nl',
    metadata: { supabase_user_id: user.id, plan },
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan },
    },
  })

  return NextResponse.json({ url: session.url })
}
