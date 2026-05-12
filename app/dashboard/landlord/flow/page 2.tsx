'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/landlord/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { MetricCard } from '@/components/finance/MetricCard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import {
  Workflow, Plus, ArrowRight, Mail, Bell, Receipt,
  Calendar, CheckCircle2, Clock, Zap, Users, FileText,
  AlertTriangle, CreditCard, MessageSquare, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type WorkflowStatus = 'actief' | 'inactief' | 'concept'

interface Flow {
  id: string
  name: string
  description: string
  triggerLabel: string
  triggerIcon: React.ComponentType<{ className?: string }>
  actionLabel: string
  actionIcon: React.ComponentType<{ className?: string }>
  status: WorkflowStatus
  lastRun?: string
  runCount: number
  category: string
}

const mockFlows: Flow[] = [
  {
    id: '1',
    name: 'Huurverhoging herinnering',
    description: 'Stuur automatisch een herinnering 30 dagen voor contractverlenging.',
    triggerLabel: '30 dagen voor verlenging',
    triggerIcon: Calendar,
    actionLabel: 'E-mail naar huurder',
    actionIcon: Mail,
    status: 'actief',
    lastRun: '2 dagen geleden',
    runCount: 24,
    category: 'Huurders',
  },
  {
    id: '2',
    name: 'Ticket escalatie',
    description: 'Escaleer een open ticket als het langer dan 7 dagen openstaat.',
    triggerLabel: 'Ticket > 7 dagen open',
    triggerIcon: AlertTriangle,
    actionLabel: 'Notificatie eigenaar',
    actionIcon: Bell,
    status: 'actief',
    lastRun: 'Gisteren',
    runCount: 8,
    category: 'Onderhoud',
  },
  {
    id: '3',
    name: 'Betaalbevestiging',
    description: 'Stuur automatisch een kwitantie na elke ontvangen betaling.',
    triggerLabel: 'Betaling ontvangen',
    triggerIcon: CreditCard,
    actionLabel: 'Kwitantie per e-mail',
    actionIcon: Receipt,
    status: 'actief',
    lastRun: 'Vandaag',
    runCount: 61,
    category: 'Financieel',
  },
  {
    id: '4',
    name: 'Inspectie herinnering huurder',
    description: 'Herinner de huurder 14 dagen van tevoren aan een geplande inspectie.',
    triggerLabel: '14 dagen voor inspectie',
    triggerIcon: Clock,
    actionLabel: 'Bericht via portaal',
    actionIcon: MessageSquare,
    status: 'actief',
    lastRun: '5 dagen geleden',
    runCount: 12,
    category: 'Onderhoud',
  },
  {
    id: '5',
    name: 'Nieuwe huurder onboarding',
    description: 'Stuur welkomstpakket en portaaluitnodiging bij een nieuw huurcontract.',
    triggerLabel: 'Nieuw contract aangemaakt',
    triggerIcon: FileText,
    actionLabel: 'Welkomstmail + portaallink',
    actionIcon: Users,
    status: 'inactief',
    lastRun: '3 weken geleden',
    runCount: 5,
    category: 'Huurders',
  },
  {
    id: '6',
    name: 'WWS compliance check',
    description: 'Controleer maandelijks of alle objecten nog compliant zijn.',
    triggerLabel: 'Elke 1e van de maand',
    triggerIcon: ShieldCheck,
    actionLabel: 'Rapport + alerts',
    actionIcon: CheckCircle2,
    status: 'concept',
    runCount: 0,
    category: 'Compliance',
  },
]

const STATUS_BADGE: Record<WorkflowStatus, React.ReactNode> = {
  actief: <Badge className="bg-[#163300]/8 text-[#163300] dark:bg-[#9FE870]/10 dark:text-[#9FE870] border-0 text-xs">Actief</Badge>,
  inactief: <Badge className="bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-500 border-0 text-xs">Inactief</Badge>,
  concept: <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-0 text-xs">Concept</Badge>,
}

const CATEGORY_COLORS: Record<string, string> = {
  Huurders: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  Onderhoud: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
  Financieel: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  Compliance: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
}

export default function FlowPage() {
  const { isDemo } = useDashboardUser()
  const [flows, setFlows] = useState<Flow[]>(isDemo ? mockFlows : [])

  const activeCount = flows.filter((f) => f.status === 'actief').length
  const totalRuns = flows.reduce((s, f) => s + f.runCount, 0)
  const conceptCount = flows.filter((f) => f.status === 'concept').length

  const toggleStatus = (id: string) => {
    setFlows((prev) => prev.map((f) =>
      f.id === id
        ? { ...f, status: f.status === 'actief' ? 'inactief' : 'actief' }
        : f
    ))
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870]">Flow</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automatiseer terugkerende taken in je portefeuille.
          </p>
        </div>
        <Button className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 h-9 text-sm font-medium shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe workflow
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
        <MetricCard label="Actieve workflows" value={String(activeCount)} icon={<Zap />} />
        <MetricCard label="Totaal uitgevoerd" value={String(totalRuns)} icon={<CheckCircle2 />} />
        <MetricCard label="In concept" value={String(conceptCount)} icon={<Clock />} />
      </div>

      {/* Flow list */}
      <Card className={dashboardCardClass()}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Workflows</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {flows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <Workflow className="h-7 w-7 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">Geen workflows</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Maak je eerste automatisering aan.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
              {flows.map((flow) => {
                const TriggerIcon = flow.triggerIcon
                const ActionIcon = flow.actionIcon
                return (
                  <div
                    key={flow.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    {/* Trigger → Action visualisatie */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="h-9 w-9 rounded-xl bg-[#163300]/5 dark:bg-[#9FE870]/10 flex items-center justify-center">
                        <TriggerIcon className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-neutral-600 shrink-0" />
                      <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                        <ActionIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{flow.name}</p>
                        <Badge className={cn('border-0 text-xs px-2 py-0', CATEGORY_COLORS[flow.category] ?? 'bg-gray-100 text-gray-500')}>
                          {flow.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        <span className="font-medium text-gray-600 dark:text-gray-300">{flow.triggerLabel}</span>
                        <span className="mx-1.5">→</span>
                        {flow.actionLabel}
                      </p>
                      {flow.lastRun && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Laatste run: {flow.lastRun} · {flow.runCount}× uitgevoerd
                        </p>
                      )}
                    </div>

                    {/* Status + toggle */}
                    <div className="flex items-center gap-3 shrink-0">
                      {STATUS_BADGE[flow.status]}
                      {flow.status !== 'concept' && (
                        <Switch
                          checked={flow.status === 'actief'}
                          onCheckedChange={() => toggleStatus(flow.id)}
                          className="data-[state=checked]:bg-[#163300] dark:data-[state=checked]:bg-[#9FE870]"
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming soon banner */}
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-neutral-700 px-6 py-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-[#9FE870]/20 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
          <Workflow className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Workflow builder komt eraan</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Bouw visueel je eigen triggers en acties — integraties met e-mail, WhatsApp en meer.
          </p>
        </div>
        <Badge className="bg-[#9FE870]/20 text-[#163300] dark:bg-[#9FE870]/10 dark:text-[#9FE870] border-0 shrink-0">
          Binnenkort
        </Badge>
      </div>
    </>
  )
}
