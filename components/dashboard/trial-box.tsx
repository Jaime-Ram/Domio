'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { getSubscriptionClient, trialDaysRemaining, type Subscription } from '@/lib/supabase/subscription'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'

export function TrialBox({ collapsed }: { collapsed: boolean }) {
  const { user, isDemo } = useDashboardUser()
  const [sub, setSub] = useState<Subscription | null>(null)

  useEffect(() => {
    if (!user || isDemo) return
    getSubscriptionClient(user.id).then(setSub)
  }, [user, isDemo])

  if (!sub || isDemo || sub.status === 'active') return null
  if (sub.status !== 'trialing' || new Date(sub.trial_ends_at) <= new Date()) return null

  const days = trialDaysRemaining(sub)
  const pct = Math.round((days / 30) * 100)

  if (collapsed) {
    return (
      <div className="flex-shrink-0 px-2 pb-2">
        <Link
          href="/dashboard/landlord/upgrade"
          title={`${days} dagen proefperiode resterend`}
          className="flex items-center justify-center w-full h-9 rounded-lg bg-[#163300] hover:bg-[#1e4500] transition-colors"
        >
          <span className="text-[10px] font-bold text-[#9FE870]/70">{days}d</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 px-3 pb-3">
      <div className="bg-[#163300] rounded-xl p-4 relative overflow-hidden">
        <GeometricShapes
          variant="trapezoid"
          className="right-0 bottom-0 w-40 h-40"
          color="#9FE870"
          opacity={0.12}
          layers={2}
        />
        <div className="relative z-10">
          <h3 className="text-sm font-semibold text-white mb-0.5">Proefperiode</h3>
          <p className="text-xs text-white/70 mb-3">{days} dagen resterend</p>
          <div className="h-1 rounded-full bg-white/15 mb-3 overflow-hidden">
            <div className="h-full rounded-full bg-[#9FE870]" style={{ width: `${pct}%` }} />
          </div>
          <Link
            href="/dashboard/landlord/upgrade"
            className="block w-full text-center bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 rounded-xl text-sm font-semibold py-2 transition-colors"
          >
            Abonnement starten
          </Link>
        </div>
      </div>
    </div>
  )
}
