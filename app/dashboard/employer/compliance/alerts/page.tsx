'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle, BarChart3, Calculator, CheckCircle2,
  ArrowRight, ShieldCheck,
} from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import { mockWwsAlerts, type WWSAlert } from '@/lib/mock-data/wws-compliance'

const getComplianceNav = (basePath: string) => [
  { label: 'WWS Overzicht', href: `${basePath}/compliance`, icon: BarChart3 },
  { label: 'Puntentelling', href: `${basePath}/compliance/puntentelling`, icon: Calculator },
  { label: 'Alerts', href: `${basePath}/compliance/alerts`, icon: AlertTriangle },
]

const URGENCY_LABEL: Record<WWSAlert['urgency'], string> = {
  hoog: 'Hoog',
  midden: 'Middel',
}

export default function ComplianceAlertsPage() {
  const { basePath, isDemo } = useDashboardUser()
  const COMPLIANCE_NAV = getComplianceNav(basePath)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const alerts = (isDemo ? mockWwsAlerts : []).filter((a) => !dismissed.has(a.id))
  const hoogCount = alerts.filter((a) => a.urgency === 'hoog').length
  const middenCount = alerts.filter((a) => a.urgency === 'midden').length

  return (
    <>
      <SectionNavDashboard title="Compliance" items={COMPLIANCE_NAV} titleVariant="hero" />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-content-blocks">
        {[
          { label: 'Hoge urgentie', value: isDemo ? hoogCount : 0, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: AlertTriangle },
          { label: 'Middel urgentie', value: isDemo ? middenCount : 0, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: AlertTriangle },
          { label: 'Opgelost', value: isDemo ? dismissed.size : 0, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle2 },
        ].map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.label} className={dashboardCardClass()}>
              <CardContent className="p-5">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', m.bg)}>
                  <Icon className={cn('h-5 w-5', m.color)} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{m.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{m.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alert list */}
      <Card className={dashboardCardClass()}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Actieve alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">Geen actieve alerts</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {isDemo ? 'Alle alerts zijn afgehandeld.' : 'Voeg objecten toe om compliance bij te houden.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                  <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    alert.urgency === 'hoog' ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-500/10')}>
                    <AlertTriangle className={cn('h-5 w-5', alert.urgency === 'hoog' ? 'text-red-500' : 'text-amber-500')} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</p>
                      <Badge className={cn('border-0 text-xs px-2 py-0.5',
                        alert.urgency === 'hoog'
                          ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400')}>
                        {URGENCY_LABEL[alert.urgency]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{alert.address} — {alert.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-[#163300] dark:text-[#9FE870] font-medium">
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                      {alert.actie}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" className="rounded-full h-8 px-3 text-xs bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300]">
                      Oplossen
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full h-8 px-3 text-xs text-gray-400 hover:text-gray-600"
                      onClick={() => setDismissed((prev) => new Set([...prev, alert.id]))}>
                      Negeer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
