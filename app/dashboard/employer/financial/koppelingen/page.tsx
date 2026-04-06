'use client'

import { useEffect, useState } from 'react'
import { Landmark, BookOpen, FileUp, ScanLine, RefreshCw, ExternalLink, CheckCircle2 } from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { getFinancialNav } from '../nav'

interface BankConnection {
  iban: string | null
  last_synced_at: string | null
}

export default function KoppelingenPage() {
  const { basePath } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)
  const [bankConnection, setBankConnection] = useState<BankConnection | null>(null)
  const [bankLoading, setBankLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    async function fetchBank() {
      const { data } = await (supabase as any)
        .from('bank_connections')
        .select('iban, last_synced_at')
        .eq('provider', 'tink')
        .maybeSingle()
      setBankConnection(data ?? null)
      setBankLoading(false)
    }
    fetchBank()
  }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch('/api/tink/sync', { method: 'POST' })
      // Refresh connection data
      const { data } = await (supabase as any)
        .from('bank_connections')
        .select('iban, last_synced_at')
        .eq('provider', 'tink')
        .maybeSingle()
      setBankConnection(data ?? null)
    } finally {
      setSyncing(false)
    }
  }

  function handleConnect() {
    window.location.href = '/api/tink/link'
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const PLACEHOLDER_CARDS = [
    {
      title: 'Boekhoudkoppeling',
      description: 'Koppel Domio met je boekhoudsoftware (Exact, Twinfield, Moneybird).',
      icon: BookOpen,
    }
  ]

  return (
    <div className="space-y-content-blocks">
      <SectionNavDashboard
        title="Financieel"
        items={FINANCIAL_NAV}
        titleVariant="hero"
        widgetMenu={
          <SectionWidgetMenu>
            <SectionWidgetMenuPlaceholder />
          </SectionWidgetMenu>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bank connection card */}
        <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
          <CardContent className="pt-6 pb-6 px-6 flex flex-col items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Bankkoppeling (Tink)</h3>
              {bankLoading ? (
                <p className="text-sm text-gray-400">Laden...</p>
              ) : bankConnection ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Verbonden</span>
                  </div>
                  {bankConnection.iban && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">IBAN: {bankConnection.iban}</p>
                  )}
                  {bankConnection.last_synced_at && (
                    <p className="text-xs text-gray-400">Laatst gesynchroniseerd: {formatDate(bankConnection.last_synced_at)}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Koppel je bankrekening om transacties automatisch te importeren.
                </p>
              )}
            </div>
            {bankConnection ? (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#163300] dark:bg-[#9FE870] px-3.5 py-2 text-sm font-medium text-white dark:text-[#163300] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Synchroniseren...' : 'Synchroniseren'}
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#163300] dark:bg-[#9FE870] px-3.5 py-2 text-sm font-medium text-white dark:text-[#163300] hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="h-4 w-4" />
                Koppel je bankrekening
              </button>
            )}
          </CardContent>
        </Card>

        {/* Placeholder cards */}
        {PLACEHOLDER_CARDS.map((card) => (
          <Card key={card.title} className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
            <CardContent className="pt-6 pb-6 px-6 flex flex-col items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <card.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{card.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{card.description}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/20 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                Binnenkort beschikbaar
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
