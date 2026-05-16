import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export const PLAN_PRICE_IDS: Record<'starter' | 'pro', string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
}
