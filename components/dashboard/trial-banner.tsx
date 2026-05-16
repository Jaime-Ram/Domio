'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { getSubscriptionClient, trialDaysRemaining, type Subscription } from '@/lib/supabase/subscription'

export function TrialBanner() {
  const { user, isDemo } = useDashboardUser()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!user || isDemo) return
    getSubscriptionClient(user.id).then(setSub)
  }, [user, isDemo])

  if (!sub || dismissed || isDemo) return null
  if (sub.status === 'active') return null

  const isExpired = sub.status !== 'trialing' || new Date(sub.trial_ends_at) <= new Date()
  const daysLeft = trialDaysRemaining(sub)
  const isUrgent = daysLeft <= 7

  if (isExpired) return null // middleware handles redirect, but just in case

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
      isUrgent
        ? 'bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300'
        : 'bg-[#f0fae6] dark:bg-[#163300]/40 border-b border-[#9FE870]/30 text-[#163300] dark:text-[#9FE870]'
    }`}>
      <Sparkles className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1">
        <strong>{daysLeft} dag{daysLeft !== 1 ? 'en' : ''}</strong> proefperiode resterend.{' '}
        <Link
          href="/dashboard/landlord/upgrade"
          className="underline underline-offset-2 hover:no-underline font-medium"
        >
          Kies een abonnement →
        </Link>
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Sluiten"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
