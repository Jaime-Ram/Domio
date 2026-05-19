'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Bell,
  Receipt,
  UserCheck,
  UserMinus,
  FileSignature,
  ClipboardCheck,
  Wrench,
  Zap,
  Plus,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  PauseCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TabNav } from '@/components/ui/tab-nav'
import { type FlowTemplate, type ActiveFlow, FlowBuilderSheet } from '@/components/flows/flow-builder-sheet'
import { DetailShell } from '@/components/ui/detail-shell'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'
import { GrayBlock } from '@/components/ui/gray-block'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

/* ─── Template library ─── */

const TEMPLATES: FlowTemplate[] = [
  {
    id: 'huurverhoging',
    name: 'Huurverhoging',
    description: 'Berekent jaarlijkse huurverhoging op basis van CPI of vast percentage, genereert brieven en verwerkt de nieuwe huurprijs automatisch.',
    category: 'Financieel',
    trigger: 'Jaarlijks vóór 1 juli',
    triggerType: 'yearly',
    icon: TrendingUp,
    steps: [
      { label: 'Bereken nieuwe huur (CPI% of vast %)' },
      { label: 'Genereer huurverhogingsbrief' },
      { label: 'Verstuur brief naar huurder' },
      { label: 'Verwerk nieuwe huurprijs in systeem' },
      { label: 'Pas automatische incasso aan' },
    ],
  },
  {
    id: 'huurachterstand',
    name: 'Huurachterstand opvolging',
    description: 'Stuurt automatisch herinneringen en aanmaningen bij achterstallige huur, tot aan een formele ingebrekestelling.',
    category: 'Financieel',
    trigger: 'Betaling X dagen te laat',
    triggerType: 'payment_late',
    icon: AlertTriangle,
    steps: [
      { label: 'Vriendelijke herinnering (dag 3)' },
      { label: 'Tweede herinnering (dag 10)' },
      { label: 'Formele aanmaning (dag 15)' },
      { label: 'Ingebrekestelling (dag 30)' },
    ],
  },
  {
    id: 'betaalherinnering',
    name: 'Betaalherinnering',
    description: 'Stuurt huurders automatisch een herinnering voor of na de betaaldag op basis van een instelbaar schema.',
    category: 'Financieel',
    trigger: 'X dagen voor/na betaaldag',
    triggerType: 'offset_days',
    triggerEventLabel: 'dagen voor betaaldag',
    defaultDays: 3,
    icon: Bell,
    steps: [
      { label: 'Controleer betaalstatus' },
      { label: 'Verstuur herinnering via e-mail' },
      { label: 'Registreer notificatie in dossier' },
    ],
  },
  {
    id: 'servicekosten',
    name: 'Servicekosten afrekening',
    description: 'Verzamelt werkelijke servicekosten, vergelijkt met voorschotten en genereert jaarlijkse afrekeningen per huurder.',
    category: 'Financieel',
    trigger: 'Jaarlijks (instelbare datum)',
    triggerType: 'yearly',
    icon: Receipt,
    steps: [
      { label: 'Verzamel werkelijke kosten' },
      { label: 'Bereken aandeel per huurder' },
      { label: 'Genereer afrekening' },
      { label: 'Verstuur naar huurder' },
      { label: 'Verwerk bijbetaling of teruggave' },
    ],
  },
  {
    id: 'onboarding',
    name: 'Nieuwe huurder onboarding',
    description: 'Begeleidt de instroom van een nieuwe huurder van ondertekening tot eerste betaling, inclusief documentverzameling en welkomstbericht.',
    category: 'Huurdersbeheer',
    trigger: 'Huurcontract ondertekend',
    triggerType: 'event',
    icon: UserCheck,
    steps: [
      { label: 'Verstuur welkomstmail met portaaluitnodiging' },
      { label: 'Verzoek documenten (ID, inkomensverklaring)' },
      { label: 'SEPA-incassomachtiging inrichten' },
      { label: 'Sleuteloverdracht plannen' },
      { label: 'Eerste betaling controleren' },
    ],
  },
  {
    id: 'vertrek',
    name: 'Huurder vertrek',
    description: 'Begeleidt het volledige vertrekproces: opzegging, eindinspectie, waarborgsom en eindafrekening.',
    category: 'Huurdersbeheer',
    trigger: 'Opzegging ontvangen',
    triggerType: 'event',
    icon: UserMinus,
    steps: [
      { label: 'Bevestig opzegging en einddatum' },
      { label: 'Plan eindinspectie' },
      { label: 'Genereer eindafrekening' },
      { label: 'Verwerk waarborgsom' },
      { label: 'Zet woning klaar voor nieuwe huurder' },
    ],
  },
  {
    id: 'contract-verlenging',
    name: 'Contract verlenging',
    description: 'Signaleert tijdig naderende contracteinddatum, initieert het verlengingsgesprek en genereert het nieuwe contract.',
    category: 'Huurdersbeheer',
    trigger: 'X dagen voor contracteinde',
    triggerType: 'offset_days',
    triggerEventLabel: 'dagen voor contracteinde',
    defaultDays: 90,
    icon: FileSignature,
    steps: [
      { label: 'Notificeer verhuurder (90 dagen voor einde)' },
      { label: 'Stuur huurder verlengingsaanbod' },
      { label: 'Genereer nieuw contract' },
      { label: 'Digitaal ondertekenen' },
      { label: 'Verwerk nieuwe huurperiode' },
    ],
  },
  {
    id: 'inspectie',
    name: 'Periodieke inspectie',
    description: 'Plant automatisch terugkerende inspecties, informeert de huurder en genereert een inspectieformulier met opvolgacties.',
    category: 'Onderhoud',
    trigger: 'Elke X maanden',
    triggerType: 'interval_months',
    icon: ClipboardCheck,
    steps: [
      { label: 'Stuur uitnodiging naar huurder' },
      { label: 'Bevestig datum en tijdstip' },
      { label: 'Genereer inspectiechecklist' },
      { label: 'Registreer bevindingen' },
      { label: 'Verstuur inspectierapport' },
    ],
  },
  {
    id: 'onderhoud',
    name: 'Onderhoudsverzoek opvolging',
    description: 'Bewaakt de afhandeling van onderhoudsmeldingen van huurders, van toewijzing tot afmelding.',
    category: 'Onderhoud',
    trigger: 'Onderhoudticket ingediend',
    triggerType: 'event',
    icon: Wrench,
    steps: [
      { label: 'Bevestig ontvangst aan huurder' },
      { label: 'Beoordeel urgentie' },
      { label: 'Wijs monteur / aannemer toe' },
      { label: 'Monitor voortgang' },
      { label: 'Bevestig afronding aan huurder' },
    ],
  },
  {
    id: 'epc',
    name: 'EPC verloopdatum',
    description: 'Waarschuwt tijdig voor het verlopen van het Energieprestatiecertificaat en initieert de aanvraag voor een nieuw certificaat.',
    category: 'Compliance',
    trigger: 'X dagen voor verloopdatum',
    triggerType: 'offset_days',
    triggerEventLabel: 'dagen voor verloopdatum EPC',
    defaultDays: 90,
    icon: Zap,
    steps: [
      { label: 'Signaleer naderende verloopdatum (90 dagen)' },
      { label: 'Notificeer verhuurder' },
      { label: 'Plan EPA-keuring' },
      { label: 'Verwerk nieuw certificaat in dossier' },
    ],
  },
]

const CATEGORIES = ['Financieel', 'Huurdersbeheer', 'Onderhoud', 'Compliance']

/* ─── Detail sheet ─── */

function FlowDetailSheet({ open, template, onClose, onSetup }: {
  open: boolean
  template: FlowTemplate | null
  onClose: () => void
  onSetup: () => void
}) {
  const Icon = template?.icon
  return (
    <DetailShell
      open={open}
      onClose={onClose}
      title={template?.name ?? ''}
      subtitle={template?.category}
      headerLeft={Icon ? (
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
          <Icon className="h-[18px] w-[18px] text-[#163300] dark:text-[#9FE870]" strokeWidth={2} />
        </div>
      ) : undefined}
      footer={
        <div className="border-t border-gray-100 dark:border-neutral-800 p-4 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1"
          >
            Sluiten
          </button>
          <Button
            onClick={onSetup}
            className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] font-semibold text-sm h-9 px-5"
          >
            Flow instellen
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      }
    >
      {template && (
        <div className="px-6 py-5 space-y-5">
          {/* Beschrijving */}
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{template.description}</p>

          {/* Trigger */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Trigger</p>
            <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-800 px-4 py-3">
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{template.trigger}</span>
            </div>
          </div>

          {/* Stappen */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Stappen</p>
            <div className="rounded-xl border border-gray-100 dark:border-neutral-800 px-4 py-3">
              {template.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#163300] dark:bg-[#9FE870] flex items-center justify-center text-[11px] font-bold text-white dark:text-[#163300] shrink-0">
                      {i + 1}
                    </div>
                    {i < template.steps.length - 1 && (
                      <div className="w-px flex-1 my-1 bg-gray-200 dark:bg-neutral-700" />
                    )}
                  </div>
                  <div className="pb-4 pt-0.5 flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{step.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DetailShell>
  )
}

/* ─── Flow card ─── */

function FlowCard({ template, activeCount, onOpen }: {
  template: FlowTemplate
  activeCount: number
  onOpen: () => void
}) {
  const Icon = template.icon
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full text-left flex flex-col gap-3 p-4 rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 hover:brightness-95 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-neutral-700 flex items-center justify-center shrink-0">
          <Icon className="h-[18px] w-[18px] text-[#163300] dark:text-[#9FE870]" strokeWidth={2} />
        </div>
        {activeCount > 0 ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full whitespace-nowrap">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            {activeCount > 1 ? `${activeCount}× actief` : 'Actief'}
          </span>
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-300 dark:text-neutral-600 group-hover:text-gray-400 transition-colors mt-1" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{template.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{template.description}</p>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-neutral-500">
        <Clock className="h-3 w-3 shrink-0" />
        {template.trigger}
      </div>
    </button>
  )
}

/* ─── Active flow card ─── */

function ActiveFlowCard({ flow, properties, onToggle, onEdit }: {
  flow: ActiveFlow
  properties: { id: string; name: string }[]
  onToggle: () => void
  onEdit: () => void
}) {
  const Icon = flow.icon
  const isActive = flow.status === 'active'
  return (
    <GrayBlock className="flex items-start gap-4 p-4">
      <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-neutral-700 flex items-center justify-center shrink-0">
        <Icon className="h-[18px] w-[18px] text-[#163300] dark:text-[#9FE870]" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{flow.name}</p>
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {flow.trigger}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              Bewerken
            </button>
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  : 'text-gray-400 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-700'
              )}
            >
              {isActive
                ? <><CheckCircle2 className="h-3 w-3" />Actief</>
                : <><PauseCircle className="h-3 w-3" />Gepauzeerd</>}
            </button>
          </div>
        </div>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500 bg-black/[0.06] dark:bg-neutral-700 px-2 py-0.5 rounded-full">
            {flow.category}
          </span>
          <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500 bg-black/[0.06] dark:bg-neutral-700 px-2 py-0.5 rounded-full">
            {flow.configuredSteps.filter((s) => s.enabled).length} stappen actief
          </span>
          <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500 bg-black/[0.06] dark:bg-neutral-700 px-2 py-0.5 rounded-full">
            {flow.propertyScope.type === 'all'
              ? 'Alle panden'
              : flow.propertyScope.propertyIds
                  .map(id => properties.find(p => p.id === id)?.name ?? '?')
                  .join(', ') || 'Geen panden'}
          </span>
        </div>
      </div>
    </GrayBlock>
  )
}

/* ─── Page ─── */

type FlowTab = 'bibliotheek' | 'actief'

export default function FlowsPage() {
  const { user, isDemo } = useDashboardUser()
  const [activeFlows, setActiveFlows] = useState<ActiveFlow[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<FlowTemplate | null>(null)
  const [builderTemplate, setBuilderTemplate] = useState<FlowTemplate | null>(null)
  const [tab, setTab] = useState<FlowTab>('bibliotheek')
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])

  // Load flows from localStorage on mount
  useEffect(() => {
    if (isDemo) return
    try {
      const saved = localStorage.getItem('domio:activeFlows')
      if (!saved) return
      const parsed: Omit<ActiveFlow, 'icon'>[] = JSON.parse(saved)
      const restored = parsed.map(f => {
        const template = TEMPLATES.find(t => t.id === f.templateId)
        return { ...f, icon: template?.icon ?? Zap }
      })
      setActiveFlows(restored)
    } catch {}
  }, [isDemo])

  // Save flows to localStorage whenever they change
  useEffect(() => {
    if (isDemo) return
    try {
      const toSave = activeFlows.map(({ icon, ...rest }) => rest)
      localStorage.setItem('domio:activeFlows', JSON.stringify(toSave))
    } catch {}
  }, [activeFlows, isDemo])

  // Load properties via server-side API route
  useEffect(() => {
    if (isDemo) {
      setProperties([
        { id: 'demo-p1', name: 'Keizersgracht 12' },
        { id: 'demo-p2', name: 'Prinsengracht 88' },
        { id: 'demo-p3', name: 'Herengracht 45' },
      ])
      return
    }
    if (!user?.id) return
    fetch('/api/properties')
      .then(r => r.json())
      .then(({ properties: props }) => {
        setProperties((props ?? []).map((p: any) => ({ id: p.id, name: p.name || p.address || 'Pand' })))
      })
      .catch(e => console.error('[flows/properties]', e))
  }, [user?.id, isDemo])

  // Count active instances per template
  const activeCounts = activeFlows.reduce<Record<string, number>>((acc, f) => {
    acc[f.templateId] = (acc[f.templateId] ?? 0) + 1
    return acc
  }, {})

  const handleSetup = () => {
    if (!selectedTemplate) return
    setBuilderTemplate(selectedTemplate)
    setSelectedTemplate(null)
  }

  const handleActivate = (flow: ActiveFlow) => {
    setActiveFlows(prev => [flow, ...prev])
    setBuilderTemplate(null)
    setTab('actief')
  }

  const toggleFlowStatus = (id: string) => {
    setActiveFlows((prev) =>
      prev.map((f) => f.id === id ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' } : f)
    )
  }

  const editFlow = (flow: ActiveFlow) => {
    const template = TEMPLATES.find((t) => t.id === flow.templateId)
    if (template) setBuilderTemplate(template)
  }

  return (
    <>
      <div className="flex flex-col gap-8">
      <TabNav
        tabs={[
          { id: 'actief', label: 'Actief', count: activeFlows.length > 0 ? activeFlows.length : undefined },
          { id: 'bibliotheek', label: 'Bibliotheek' },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as FlowTab)}
        className="w-full"
      />

      {tab === 'bibliotheek' && (
        <div className="flex flex-col gap-10">

          {/* Intro block */}
          <div className="rounded-2xl bg-[#163300] px-8 py-8 relative overflow-hidden">
            <GeometricShapes variant="trapezoid" className="right-0 bottom-0 w-40 h-40" color="#9FE870" opacity={0.15} layers={2} />
            <div className="relative z-10 flex flex-col gap-3 max-w-xl">
              <h2 className="text-[26px] font-bold text-white leading-tight">
                Maak je eigen flow aan
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Heb je een specifieke behoefte die niet in de bibliotheek staat? Bouw je eigen geautomatiseerde flow met triggers, stappen en communicatiemomenten op maat.
              </p>
              <div className="mt-1 flex items-center gap-3">
                <Button
                  disabled
                  className="rounded-full bg-[#9FE870] text-[#163300] font-semibold text-sm px-4 h-9 gap-1.5 hover:bg-[#9FE870]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Eigen flow aanmaken
                </Button>
                <span className="text-xs text-white/50">Binnenkort beschikbaar</span>
              </div>
            </div>
          </div>

          {/* Template library */}
          <div className="flex flex-col gap-8">
            {CATEGORIES.map((cat) => {
              const templates = TEMPLATES.filter((t) => t.category === cat)
              return (
                <section key={cat}>
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-3">{cat}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {templates.map((template) => (
                      <FlowCard
                        key={template.id}
                        template={template}
                        activeCount={activeCounts[template.id] ?? 0}
                        onOpen={() => setSelectedTemplate(template)}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'actief' && (
        activeFlows.length === 0 ? (
          <GrayBlock className="px-8 py-8">
            <div className="flex flex-col gap-3 max-w-xl">
              <h2 className="text-[26px] font-bold text-gray-900 dark:text-white leading-tight">
                Nog geen actieve flows
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Kies een flow uit de bibliotheek, stel de stappen in op jouw situatie en activeer hem met één klik.
              </p>
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setTab('bibliotheek')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] dark:bg-[#9FE870] text-white dark:text-[#163300] font-semibold text-sm px-4 h-9 hover:bg-[#1e4a00] transition-colors"
                >
                  Naar bibliotheek
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </GrayBlock>
        ) : (
          <div className="flex flex-col gap-3">
            {activeFlows.map((flow) => (
              <ActiveFlowCard
                key={flow.id}
                flow={flow}
                properties={properties}
                onToggle={() => toggleFlowStatus(flow.id)}
                onEdit={() => editFlow(flow)}
              />
            ))}
          </div>
        )
      )}

      </div>

      <FlowDetailSheet
        open={selectedTemplate !== null}
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onSetup={handleSetup}
      />

      <FlowBuilderSheet
        open={builderTemplate !== null}
        template={builderTemplate}
        onClose={() => setBuilderTemplate(null)}
        onActivate={handleActivate}
        properties={properties}
      />
    </>
  )
}
