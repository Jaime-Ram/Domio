import { supabase } from './client'

export type SubscriptionPlan = 'starter' | 'pro'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'paused'

export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: SubscriptionPlan | null
  status: SubscriptionStatus
  trial_ends_at: string
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export function isSubscriptionActive(sub: Pick<Subscription, 'status' | 'trial_ends_at'>): boolean {
  if (sub.status === 'active') return true
  if (sub.status === 'trialing') return new Date(sub.trial_ends_at) > new Date()
  return false
}

export function trialDaysRemaining(sub: Pick<Subscription, 'trial_ends_at'>): number {
  const diff = new Date(sub.trial_ends_at).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/** Client-side: fetch own subscription */
export async function getSubscriptionClient(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data as Subscription
}

