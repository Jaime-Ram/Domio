import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Geen signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Ongeldige webhook signature' }, { status: 400 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuratie ontbreekt' }, { status: 500 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId = session.metadata?.supabase_user_id
      const plan = session.metadata?.plan
      const subscriptionId = session.subscription as string

      if (!userId || !plan || !subscriptionId) break

      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        plan,
        status: 'active',
        current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (!userId) break

      await supabase.from('subscriptions')
        .update({
          status: sub.status as string,
          plan: (sub.metadata?.plan as string) || undefined,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (!userId) break

      await supabase.from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (sub?.user_id) {
        await supabase.from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('user_id', sub.user_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
