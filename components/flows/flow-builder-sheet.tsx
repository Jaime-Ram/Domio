'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  Zap,
  Mail,
  Bell,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Building2,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DetailShell } from '@/components/ui/detail-shell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '@/lib/utils'

/* ─── Shared types ─── */

export type TriggerType = 'yearly' | 'offset_days' | 'interval_months' | 'payment_late' | 'event'

export type StepDef = { label: string }

export type FlowTemplate = {
  id: string
  name: string
  description: string
  category: string
  trigger: string
  triggerType: TriggerType
  triggerEventLabel?: string
  defaultDays?: number
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  steps: StepDef[]
}

export type PropertyScope = {
  type: 'all' | 'specific'
  propertyIds: string[]
}

export type ActiveFlow = {
  id: string
  templateId: string
  name: string
  status: 'active' | 'inactive'
  category: string
  trigger: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  triggerConf: TriggerConf
  configuredSteps: ConfiguredStep[]
  propertyScope: PropertyScope
  createdAt: string
}

/* ─── Internal types ─── */

type TriggerConf = {
  yearlyDate: string   // ISO yyyy-MM-dd, only month+day used for yearly recurrence
  days: number
  intervalMonths: number
}

type ConfiguredStep = {
  label: string
  enabled: boolean
  channel: 'email' | 'notification' | 'whatsapp'
  dayOffset: number
}

/* ─── Helpers ─── */

function isCommunicationStep(label: string): boolean {
  return /verstuur|stuur|herinnering|aanmaning|notificeer|uitnodiging|welkomst|brief|verzoek|bevestig/i.test(label)
}

function defaultTriggerConf(template: FlowTemplate): TriggerConf {
  const year = new Date().getFullYear()
  return {
    yearlyDate: `${year}-06-01`,
    days: template.defaultDays ?? 30,
    intervalMonths: 6,
  }
}

function defaultSteps(steps: StepDef[]): ConfiguredStep[] {
  return steps.map((s, i) => ({
    label: s.label,
    enabled: true,
    channel: 'email',
    dayOffset: i === 0 ? 0 : i === 1 ? 3 : i === 2 ? 7 : 14,
  }))
}

/* ─── Toggle switch ─── */

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        'relative inline-flex w-9 h-5 rounded-full shrink-0 transition-colors duration-200',
        on ? 'bg-[#163300] dark:bg-[#9FE870]' : 'bg-gray-200 dark:bg-neutral-700'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200',
          on ? 'right-0.5' : 'left-0.5'
        )}
      />
    </button>
  )
}

/* ─── Component ─── */

interface FlowBuilderSheetProps {
  open: boolean
  template: FlowTemplate | null
  onClose: () => void
  onActivate: (flow: ActiveFlow) => void
  properties?: { id: string; name: string }[]
}

export function FlowBuilderSheet({ open, template, onClose, onActivate, properties = [] }: FlowBuilderSheetProps) {
  const [name, setName] = useState(template?.name ?? '')
  const [triggerConf, setTriggerConf] = useState<TriggerConf>(() =>
    template ? defaultTriggerConf(template) : { yearlyDate: `${new Date().getFullYear()}-06-01`, days: 30, intervalMonths: 6 }
  )
  const [steps, setSteps] = useState<ConfiguredStep[]>(() =>
    template ? defaultSteps(template.steps) : []
  )
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [scopeType, setScopeType] = useState<'all' | 'specific'>('all')
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])

  useEffect(() => {
    if (template) {
      setName(template.name)
      setTriggerConf(defaultTriggerConf(template))
      setSteps(defaultSteps(template.steps))
      setExpandedStep(null)
      setScopeType('all')
      setSelectedPropertyIds([])
    }
  }, [template?.id])

  const updateStep = (i: number, patch: Partial<ConfiguredStep>) =>
    setSteps((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  const toggleProperty = (id: string) =>
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const handleActivate = () => {
    if (!template) return
    onActivate({
      id: `flow_${Date.now()}`,
      templateId: template.id,
      name,
      status: 'active',
      category: template.category,
      trigger: template.trigger,
      icon: template.icon,
      triggerConf,
      configuredSteps: steps,
      propertyScope: { type: scopeType, propertyIds: scopeType === 'specific' ? selectedPropertyIds : [] },
      createdAt: new Date().toISOString(),
    })
  }

  const Icon = template?.icon

  return (
    <DetailShell
      open={open}
      onClose={onClose}
      title={template?.name ?? ''}
      subtitle="Flow instellen"
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
            Annuleren
          </button>
          <Button
            onClick={handleActivate}
            className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] font-semibold text-sm h-9 px-5"
          >
            Flow activeren
          </Button>
        </div>
      }
    >
      {template && (
        <div className="px-6 py-5 space-y-5">
          {/* Naam */}
          <div className="space-y-2">
            <Label>Naam</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Trigger */}
          {template.triggerType === 'event' && (
            <div className="space-y-2">
              <Label>Trigger</Label>
              <div className="h-10 flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm text-gray-700 dark:text-gray-300">
                <Zap className="h-4 w-4 text-[#163300] dark:text-[#9FE870] shrink-0" />
                {template.trigger}
              </div>
            </div>
          )}

          {template.triggerType === 'payment_late' && (
            <div className="space-y-2">
              <Label>Trigger</Label>
              <div className="h-10 flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                Achterstallige betaling — tijdlimieten per stap instelbaar
              </div>
            </div>
          )}

          {template.triggerType === 'yearly' && (
            <div className="space-y-2">
              <Label>Jaarlijkse datum</Label>
              <DatePicker
                value={triggerConf.yearlyDate}
                onChange={(v) => setTriggerConf((c) => ({ ...c, yearlyDate: v }))}
                placeholder="Kies dag en maand"
              />
              <p className="text-xs text-gray-400 dark:text-neutral-500">
                Wordt elk jaar op deze dag uitgevoerd — het jaar wordt genegeerd.
              </p>
            </div>
          )}

          {template.triggerType === 'offset_days' && (
            <div className="space-y-2">
              <Label>{template.triggerEventLabel ?? 'Aantal dagen'}</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={triggerConf.days}
                  onChange={(e) => setTriggerConf((c) => ({ ...c, days: Number(e.target.value) }))}
                  className="rounded-xl w-24 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">dagen</span>
              </div>
            </div>
          )}

          {template.triggerType === 'interval_months' && (
            <div className="space-y-2">
              <Label>Interval</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={triggerConf.intervalMonths}
                  onChange={(e) => setTriggerConf((c) => ({ ...c, intervalMonths: Number(e.target.value) }))}
                  className="rounded-xl w-24 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">maanden</span>
              </div>
            </div>
          )}

          {/* Van toepassing op */}
          <div>
            <Label className="mb-2 block">Van toepassing op</Label>
            <div className="rounded-xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setScopeType('all')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-gray-100 dark:border-neutral-800',
                  scopeType === 'all'
                    ? 'bg-[#163300]/5 dark:bg-[#9FE870]/5 text-gray-900 dark:text-white'
                    : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  scopeType === 'all' ? 'border-[#163300] dark:border-[#9FE870] bg-[#163300] dark:bg-[#9FE870]' : 'border-gray-300 dark:border-neutral-600'
                )}>
                  {scopeType === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#163300]" />}
                </div>
                <span className="font-medium">Alle panden</span>
              </button>
              <button
                type="button"
                onClick={() => setScopeType('specific')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  scopeType === 'specific'
                    ? 'bg-[#163300]/5 dark:bg-[#9FE870]/5 text-gray-900 dark:text-white'
                    : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  scopeType === 'specific' ? 'border-[#163300] dark:border-[#9FE870] bg-[#163300] dark:bg-[#9FE870]' : 'border-gray-300 dark:border-neutral-600'
                )}>
                  {scopeType === 'specific' && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#163300]" />}
                </div>
                <span className="font-medium">Specifieke panden kiezen</span>
              </button>

              {scopeType === 'specific' && (
                <div className="border-t border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30">
                  {properties.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-gray-400 dark:text-neutral-500">
                      Geen panden gevonden. Voeg panden toe via Portfolio.
                    </p>
                  ) : (
                    <div className="py-1">
                      {properties.map((p) => {
                        const selected = selectedPropertyIds.includes(p.id)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleProperty(p.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <div className={cn(
                              'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                              selected
                                ? 'bg-[#163300] dark:bg-[#9FE870] border-[#163300] dark:border-[#9FE870]'
                                : 'border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900'
                            )}>
                              {selected && <Check className="h-2.5 w-2.5 text-white dark:text-[#163300]" strokeWidth={3} />}
                            </div>
                            <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            {scopeType === 'specific' && selectedPropertyIds.length > 0 && (
              <p className="mt-1.5 text-xs text-gray-400 dark:text-neutral-500">
                {selectedPropertyIds.length} pand{selectedPropertyIds.length !== 1 ? 'en' : ''} geselecteerd
              </p>
            )}
          </div>

          {/* Stappen */}
          <div>
            <Label className="mb-2 block">Stappen</Label>
            <div className="rounded-xl border border-gray-100 dark:border-neutral-800 px-4 py-3">
              {steps.map((step, i) => {
                const isComm = isCommunicationStep(step.label)
                const isExpanded = expandedStep === i
                const hasConfig = isComm || i > 0

                return (
                  <div key={i} className="flex gap-3">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
                        step.enabled
                          ? 'bg-[#163300] dark:bg-[#9FE870] text-white dark:text-[#163300]'
                          : 'bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-neutral-500'
                      )}>
                        {i + 1}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={cn(
                          'w-px my-1',
                          step.enabled ? 'bg-gray-200 dark:bg-neutral-700' : 'bg-gray-100 dark:bg-neutral-800'
                        )} style={{ minHeight: 20 }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={cn('flex-1 min-w-0', i < steps.length - 1 ? 'pb-4' : 'pb-1')}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'text-sm pt-0.5 leading-snug',
                          step.enabled
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-300 dark:text-neutral-600 line-through'
                        )}>
                          {step.label}
                        </p>
                        <div className="flex items-center gap-2 shrink-0 pt-0.5">
                          {hasConfig && (
                            <button
                              type="button"
                              onClick={() => setExpandedStep(isExpanded ? null : i)}
                              className="text-gray-300 dark:text-neutral-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                            >
                              {isExpanded
                                ? <ChevronUp className="h-3.5 w-3.5" />
                                : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          )}
                          <Toggle on={step.enabled} onChange={(v) => updateStep(i, { enabled: v })} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 flex flex-col gap-3 pb-1">
                          {isComm && (
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-500 dark:text-gray-400">Kanaal</Label>
                              <div className="flex gap-2 flex-wrap">
                                {(['email', 'notification', 'whatsapp'] as const).map((ch) => {
                                  const icons = { email: Mail, notification: Bell, whatsapp: MessageSquare }
                                  const labels = { email: 'E-mail', notification: 'Notificatie', whatsapp: 'WhatsApp' }
                                  const Icon = icons[ch]
                                  return (
                                    <button
                                      key={ch}
                                      type="button"
                                      onClick={() => updateStep(i, { channel: ch })}
                                      className={cn(
                                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                        step.channel === ch
                                          ? 'bg-[#163300]/10 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870] border-[#163300]/20 dark:border-[#9FE870]/20'
                                          : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                                      )}
                                    >
                                      <Icon className="h-3.5 w-3.5" />
                                      {labels[ch]}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          {i > 0 && (
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-500 dark:text-gray-400">Vertraging</Label>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="number"
                                  min={0}
                                  max={365}
                                  value={step.dayOffset}
                                  onChange={(e) => updateStep(i, { dayOffset: Number(e.target.value) })}
                                  className="rounded-xl w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-sm text-gray-500 dark:text-gray-400">dagen na vorige stap</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </DetailShell>
  )
}
