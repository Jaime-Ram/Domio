'use client'

import { useState, useEffect } from 'react'
import {
  CreateDialogShell,
} from '@/components/ui/add-dialog-layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, FileText, X, ScrollText, Mail } from 'lucide-react'
import { generateContractHTML } from '@/lib/pdf/generate-contract-pdf'
import { DialogDateField } from '@/components/ui/dialog-date-field'
import { DialogField } from '@/components/ui/dialog-field'
import { Input } from '@/components/ui/input'
import { tenantQueries, propertyQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { mockProperties } from '@/lib/mock-data/vastgoed'
import { cn } from '@/lib/utils'

function formatIBAN(raw: string): string {
  const clean = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 18)
  if (!clean) return ''
  // NL IBAN: LL NN LLLL NNNN NNNN NN (18 chars) → group as 4-4-4-4-2
  return [clean.slice(0, 4), clean.slice(4, 8), clean.slice(8, 12), clean.slice(12, 16), clean.slice(16, 18)]
    .filter(Boolean)
    .join(' ')
}

const EMPTY = {
  full_name: '',
  email: '',
  phone: '',
  monthlyRent: '',
  deposit: '',
  bankAccount: '',
  startDate: '',
  endDate: '',
  contractType: 'onbepaald',
  billingPeriod: 'maandelijks',
  billingDay: '1',
  indexation: 'cpi',
  indexationPct: '',
  indexMonth: '1',
  noticePeriodMonths: '1',
}

export type CreatedTenantPayload = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  propertyName?: string
  monthlyRent?: number
  startDate?: string | null
  leaseLinkFailed?: boolean
  inviteSent?: boolean
}

type UnitOption = {
  unitId: string
  label: string
  propertyName: string
  monthlyRent: number
}

interface NewTenantDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (tenant: CreatedTenantPayload) => void
}

function safeValue(v: string) {
  if (!v || v.includes('NaN') || v.includes('undefined') || v.trim() === '') return 'Niet gedefinieerd'
  return v
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const display = safeValue(value)
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 dark:border-neutral-800 last:border-0">
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{label}</span>
      <span className={cn('text-xs font-medium text-right', display === 'Niet gedefinieerd' ? 'text-gray-400 dark:text-gray-500 italic' : 'text-gray-900 dark:text-white')}>
        {display}
      </span>
    </div>
  )
}

function OptInCard({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-150',
        checked
          ? 'border-[#163300] bg-[#163300]/[0.03] dark:border-[#9FE870] dark:bg-[#9FE870]/[0.06]'
          : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600',
      )}
    >
      <div className={cn(
        'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
        checked
          ? 'bg-[#163300] dark:bg-[#9FE870] text-white dark:text-[#163300]'
          : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-gray-500',
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      {/* Toggle pill */}
      <div className={cn(
        'relative h-6 w-10 rounded-full shrink-0 transition-colors duration-150',
        checked ? 'bg-[#163300] dark:bg-[#9FE870]' : 'bg-gray-200 dark:bg-neutral-700',
      )}>
        <div className={cn(
          'absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-150',
          checked ? 'left-5' : 'left-1',
        )} />
      </div>
    </button>
  )
}

export function NewTenantDialog({ open, onClose, onCreated }: NewTenantDialogProps) {
  const { isDemo } = useDashboardUser()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ ...EMPTY })
  const [unitId, setUnitId] = useState<string>('')
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([])
  const [loadingUnits, setLoadingUnits] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // New opt-in choices
  const [createContract, setCreateContract] = useState(true)
  const [inviteTenant, setInviteTenant] = useState(true)

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY })
    setUnitId('')
    setStep(1)
    setError(null)
    setCreateContract(true)
    setInviteTenant(true)

    if (isDemo) {
      setUnitOptions(
        mockProperties.map((p) => ({
          unitId: `demo-unit-${p.id}`,
          label: `${p.name} (${(p.address ?? '').split(',')[0] || p.name})`,
          propertyName: p.name,
          monthlyRent: p.monthlyRent ?? 0,
        }))
      )
      return
    }

    setLoadingUnits(true)
    getUser()
      .then(({ user }) => {
        if (!user) return
        return propertyQueries.getByOwner(user.id)
      })
      .then((props) => {
        const opts: UnitOption[] = []
        for (const p of props ?? []) {
          const units = ((p as unknown) as { units?: { id: string; unit_number: string; monthly_rent: number | null }[] }).units ?? []
          for (const u of units) {
            opts.push({
              unitId: u.id,
              label: `${(p as { name: string }).name}${u.unit_number ? ` — ${u.unit_number}` : ''}`,
              propertyName: (p as { name: string }).name,
              monthlyRent: Number(u.monthly_rent) || 0,
            })
          }
        }
        setUnitOptions(opts)
      })
      .catch(() => setUnitOptions([]))
      .finally(() => setLoadingUnits(false))
  }, [open, isDemo])

  useEffect(() => {
    const unit = unitOptions.find((o) => o.unitId === unitId)
    if (unit && !form.monthlyRent) {
      setForm((f) => ({ ...f, monthlyRent: String(unit.monthlyRent || '') }))
    }
  }, [unitId, unitOptions])

  const selectedUnit = unitOptions.find((o) => o.unitId === unitId)
  const setField = (key: keyof typeof EMPTY, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  // Step navigation — step 3 (contract details) is skipped if createContract=false
  const totalSteps = createContract ? 4 : 3
  const displayStep = createContract ? step : (step === 4 ? 3 : step)

  const step1Valid = !!form.full_name.trim() && !!form.monthlyRent && !!unitId
  const step3Valid = !!form.startDate // only relevant when createContract=true

  const goNext = () => {
    if (step === 1) {
      if (!form.deposit && form.monthlyRent) setField('deposit', form.monthlyRent)
      setStep(2)
    } else if (step === 2) {
      setStep(createContract ? 3 : 4)
    } else if (step === 3) {
      setStep(4)
    }
  }

  const goBack = () => {
    if (step === 4) setStep(createContract ? 3 : 2)
    else if (step === 3) setStep(2)
    else if (step === 2) setStep(1)
  }

  const primaryDisabled =
    saving ||
    (step === 1 && !step1Valid) ||
    (step === 3 && !step3Valid)

  const stepTitles = ['Nieuwe huurder', 'Instellen', 'Contractdetails', 'Controleer & afronden']
  const stepSubtitles = [
    'Persoonsgegevens en contactinformatie van de huurder.',
    'Kies wat je wilt aanmaken voor deze huurder.',
    'Standaardwaarden zijn alvast ingevuld, pas aan waar nodig.',
    'Controleer de samenvatting voordat je opslaat.',
  ]

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (isDemo) {
        onCreated({
          id: `demo-${Date.now()}`,
          full_name: form.full_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          propertyName: selectedUnit?.propertyName ?? '',
          monthlyRent: parseFloat(form.monthlyRent) || selectedUnit?.monthlyRent || 0,
          startDate: form.startDate || null,
          inviteSent: inviteTenant,
        })
        onClose()
        return
      }
      const { user } = await getUser()
      if (!user) throw new Error('Niet ingelogd')

      const created = await tenantQueries.create({
        owner_id: user.id,
        full_name: form.full_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      })

      if (unitId && selectedUnit) {
        try {
          const res = await fetch('/api/leases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              unitId,
              tenantId: created.id,
              startDate: form.startDate || new Date().toISOString().slice(0, 10),
              endDate: form.endDate || null,
              monthlyRent: parseFloat(form.monthlyRent) || selectedUnit.monthlyRent,
              deposit: form.deposit ? parseFloat(form.deposit) : null,
              indexationMethod: form.indexation === 'geen' ? 'none' : form.indexation,
              indexationPct: (form.indexation === 'cpi_plus' || form.indexation === 'fixed')
                ? parseFloat(form.indexationPct) || null
                : null,
              indexMonth: form.indexation !== 'geen' ? parseInt(form.indexMonth) || 1 : null,
            }),
          })
          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body.error || `HTTP ${res.status}`)
          }
        } catch (leaseErr: any) {
          console.error('[new-tenant] lease creation failed:', leaseErr?.message ?? leaseErr)
          onCreated({
            id: created.id,
            full_name: created.full_name,
            email: created.email,
            phone: created.phone,
            leaseLinkFailed: true,
            propertyName: selectedUnit?.propertyName ?? '',
            monthlyRent: parseFloat(form.monthlyRent) || selectedUnit?.monthlyRent || 0,
          })
          onClose()
          return
        }
      }

      // Send platform invite if chosen — uses /api/invitations/send (tenant already created)
      if (inviteTenant && created.email) {
        try {
          await fetch('/api/invitations/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId: created.id }),
          })
        } catch (inviteErr) {
          console.error('[new-tenant] invite failed (non-fatal):', inviteErr)
        }
      }

      onCreated({
        id: created.id,
        full_name: created.full_name,
        email: created.email,
        phone: created.phone,
        startDate: form.startDate || null,
        propertyName: selectedUnit?.propertyName ?? '',
        monthlyRent: parseFloat(form.monthlyRent) || selectedUnit?.monthlyRent || 0,
        inviteSent: inviteTenant && !!created.email,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aanmaken mislukt')
    } finally {
      setSaving(false)
    }
  }

  const billingLabel = form.billingPeriod === 'maandelijks'
    ? `Maandelijks, dag ${form.billingDay}`
    : form.billingPeriod === 'kwartaal' ? 'Per kwartaal' : 'Jaarlijks'

  return (
    <CreateDialogShell
      open={open}
      onOpenChange={(v) => { if (!v) onClose() }}
      title={stepTitles[step - 1]}
      subtitle={stepSubtitles[step - 1]}
      primaryLabel={step < 4 ? 'Verder' : 'Opslaan'}
      onPrimary={step < 4 ? goNext : handleSave}
      primaryDisabled={primaryDisabled}
      primaryLoading={saving}
      step={displayStep}
      totalSteps={totalSteps}
      onBack={step > 1 ? goBack : undefined}
      scrollBody
    >
      {/* Step 1 — Persoonsgegevens */}
      {step === 1 && (
        <div className="space-y-3">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}
          <DialogField label="Naam huurder" required>
            <Input
              autoFocus
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              placeholder="Voor- en achternaam of bedrijfsnaam"
              className="rounded-xl"
              autoComplete="name"
            />
          </DialogField>
          <div className="grid grid-cols-2 gap-3">
            <DialogField label="Email" optional>
              <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="naam@voorbeeld.nl" className="rounded-xl" autoComplete="email" />
            </DialogField>
            <DialogField label="Telefoonnummer" optional>
              <Input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+31 6 12345678" className="rounded-xl" autoComplete="tel" />
            </DialogField>
          </div>
          <DialogField label="Object / eenheid" required>
            {loadingUnits ? (
              <p className="text-sm text-gray-500">Eenheden laden…</p>
            ) : unitOptions.length === 0 ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Voeg eerst een pand en eenheid toe via Portfolio.
              </p>
            ) : (
              <Select value={unitId || ''} onValueChange={(v) => setUnitId(v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Kies een eenheid" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((o) => (
                    <SelectItem key={o.unitId} value={o.unitId}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </DialogField>
          <DialogField label="Huurprijs per maand" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">€</span>
              <Input
                type="number"
                min="0"
                value={form.monthlyRent}
                onChange={(e) => setField('monthlyRent', e.target.value)}
                placeholder="0"
                className="rounded-xl pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </DialogField>
          <DialogField label="Bankrekeningnummer huurder" optional>
            <Input
              value={form.bankAccount}
              onChange={(e) => setField('bankAccount', formatIBAN(e.target.value))}
              placeholder="NL00 XXXX 0000 0000 00"
              className="rounded-xl"
              maxLength={22}
              autoComplete="off"
              spellCheck={false}
            />
          </DialogField>
        </div>
      )}

      {/* Step 2 — Opt-in keuzes */}
      {step === 2 && (
        <div className="space-y-3">
          <OptInCard
            icon={<ScrollText className="h-5 w-5" />}
            title="Contract aanmaken"
            description="Genereer een huurovereenkomst op basis van de ingevoerde gegevens. Zet dit uit als het contract al bestaat."
            checked={createContract}
            onChange={setCreateContract}
          />
          <OptInCard
            icon={<Mail className="h-5 w-5" />}
            title="Huurder uitnodigen voor platform"
            description="Stuur een uitnodigingsmail zodat de huurder toegang krijgt tot hun eigen portaal."
            checked={inviteTenant}
            onChange={(v) => {
              // Can only invite if email is known
              if (v && !form.email.trim()) return
              setInviteTenant(v)
            }}
          />
          {inviteTenant && !form.email.trim() && (
            <p className="text-xs text-amber-600 dark:text-amber-400 px-1">
              Vul een e-mailadres in bij stap 1 om de huurder te kunnen uitnodigen.
            </p>
          )}
          {!inviteTenant && !form.email.trim() && (
            <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
              Geen e-mailadres ingevuld — uitnodiging is uitgeschakeld.
            </p>
          )}
        </div>
      )}

      {/* Step 3 — Contractdetails (only when createContract=true) */}
      {step === 3 && createContract && (
        <div className="space-y-3">
          <DialogField label="Borg">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">€</span>
              <Input
                type="number"
                min="0"
                value={form.deposit}
                onChange={(e) => setField('deposit', e.target.value)}
                placeholder="0"
                className="rounded-xl pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </DialogField>
          <DialogField label="Contractvorm">
            <Select value={form.contractType} onValueChange={(v) => setField('contractType', v)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="onbepaald">Onbepaalde tijd</SelectItem>
                <SelectItem value="bepaald">Bepaalde tijd</SelectItem>
              </SelectContent>
            </Select>
          </DialogField>
          <div className={cn('grid gap-3', form.contractType === 'bepaald' ? 'grid-cols-2' : 'grid-cols-1')}>
            <DialogDateField label="Startdatum" value={form.startDate} onChange={(v) => setField('startDate', v)} required />
            {form.contractType === 'bepaald' && (
              <DialogDateField label="Einddatum" value={form.endDate} onChange={(v) => setField('endDate', v)} min={form.startDate || undefined} />
            )}
          </div>
          <div className={cn('grid gap-3', form.billingPeriod === 'maandelijks' ? 'grid-cols-2' : 'grid-cols-1')}>
            <DialogField label="Facturatie periode">
              <Select value={form.billingPeriod} onValueChange={(v) => setField('billingPeriod', v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="maandelijks">Maandelijks</SelectItem>
                  <SelectItem value="kwartaal">Per kwartaal</SelectItem>
                  <SelectItem value="jaarlijks">Jaarlijks</SelectItem>
                </SelectContent>
              </Select>
            </DialogField>
            {form.billingPeriod === 'maandelijks' && (
              <DialogField label="Facturatiedag">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={form.billingDay}
                    onChange={(e) => {
                      const v = Math.min(28, Math.max(1, Number(e.target.value) || 1))
                      setField('billingDay', String(v))
                    }}
                    className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">v/d maand</span>
                </div>
              </DialogField>
            )}
          </div>
          <div className="space-y-3">
            <div className={cn('grid gap-3', form.indexation !== 'geen' ? 'grid-cols-2' : 'grid-cols-1')}>
              <DialogField label="Jaarlijkse indexatie">
                <Select value={form.indexation} onValueChange={(v) => setField('indexation', v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpi">CPI – CBS-inflatie</SelectItem>
                    <SelectItem value="cpi_plus">CPI + opslag %</SelectItem>
                    <SelectItem value="fixed">Vast percentage</SelectItem>
                    <SelectItem value="geen">Geen indexatie</SelectItem>
                  </SelectContent>
                </Select>
              </DialogField>
              {form.indexation !== 'geen' && (
                <DialogField label="Indexatiemaand">
                  <Select value={form.indexMonth} onValueChange={(v) => setField('indexMonth', v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'].map((m, i) => (
                        <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DialogField>
              )}
            </div>
            {(form.indexation === 'cpi_plus' || form.indexation === 'fixed') && (
              <DialogField label={form.indexation === 'cpi_plus' ? 'Opslag bovenop CPI (%)' : 'Vast percentage (%)'}>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    max={20}
                    placeholder="bijv. 1.5"
                    value={form.indexationPct}
                    onChange={(e) => setField('indexationPct', e.target.value)}
                    className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-gray-400 shrink-0">%</span>
                </div>
              </DialogField>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DialogField label="Opzegtermijn huurder">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={form.noticePeriodMonths}
                  onChange={(e) => {
                    const v = Math.min(24, Math.max(1, Number(e.target.value) || 1))
                    setField('noticePeriodMonths', String(v))
                  }}
                  className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  {Number(form.noticePeriodMonths) === 1 ? 'maand' : 'maanden'}
                </span>
              </div>
            </DialogField>
          </div>
        </div>
      )}

      {/* Step 4 — Samenvatting */}
      {step === 4 && (
        <div className="space-y-4">

          {/* Opt-in badges */}
          <div className="flex flex-wrap gap-2">
            <span className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
              createContract
                ? 'bg-[#163300]/8 text-[#163300] dark:bg-[#9FE870]/15 dark:text-[#9FE870]'
                : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400',
            )}>
              <ScrollText className="h-3 w-3" />
              {createContract ? 'Contract wordt aangemaakt' : 'Geen contract'}
            </span>
            <span className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
              inviteTenant && form.email.trim()
                ? 'bg-[#163300]/8 text-[#163300] dark:bg-[#9FE870]/15 dark:text-[#9FE870]'
                : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400',
            )}>
              <Mail className="h-3 w-3" />
              {inviteTenant && form.email.trim() ? 'Uitnodiging wordt verstuurd' : 'Geen uitnodiging'}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3">
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-2">Huurder</p>
            <SummaryRow label="Naam" value={form.full_name} />
            <SummaryRow label="Email" value={form.email} />
            <SummaryRow label="Telefoon" value={form.phone} />
            <SummaryRow label="Bankrekeningnummer" value={form.bankAccount} />
          </div>

          <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3">
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-2">Object & huur</p>
            <SummaryRow label="Object" value={selectedUnit?.label ?? ''} />
            <SummaryRow label="Huurprijs" value={form.monthlyRent ? `€ ${parseFloat(form.monthlyRent).toLocaleString('nl-NL')} / mnd` : ''} />
            {createContract && <SummaryRow label="Borg" value={form.deposit ? `€ ${parseFloat(form.deposit).toLocaleString('nl-NL')}` : ''} />}
          </div>

          {createContract && (
            <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3">
              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-2">Contract</p>
              <SummaryRow label="Contractvorm" value={form.contractType === 'onbepaald' ? 'Onbepaalde tijd' : 'Bepaalde tijd'} />
              <SummaryRow label="Startdatum" value={form.startDate} />
              {form.contractType === 'bepaald' && <SummaryRow label="Einddatum" value={form.endDate} />}
              <SummaryRow label="Facturatie" value={billingLabel} />
              <SummaryRow label="Indexatie" value={
                form.indexation === 'cpi' ? 'CBS CPI' :
                form.indexation === 'cpi_plus' ? `CBS CPI + ${form.indexationPct || '?'}%` :
                form.indexation === 'fixed' ? `Vast ${form.indexationPct || '?'}%` :
                'Geen'
              } />
              <SummaryRow label="Opzegtermijn" value={`${form.noticePeriodMonths} ${Number(form.noticePeriodMonths) === 1 ? 'maand' : 'maanden'}`} />
            </div>
          )}

          {createContract && (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <FileText className="h-4 w-4 shrink-0" />
              Contractvoorbeeld bekijken
            </button>
          )}

          {showPreview && (
            <div className="fixed inset-0 z-[60] flex flex-col bg-neutral-900/95 backdrop-blur-sm">
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800 shrink-0">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-white">Huurovereenkomst — {selectedUnit?.label ?? (form.full_name || 'concept')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 flex justify-center">
                <div className="w-full max-w-3xl bg-white rounded shadow-2xl overflow-hidden">
                  <iframe
                    srcDoc={generateContractHTML({
                      propertyAddress: selectedUnit?.label ?? 'Onbekend object',
                      monthlyRent: parseFloat(form.monthlyRent) || 0,
                      tenants: [{ name: form.full_name || 'Huurder', email: form.email || undefined, phone: form.phone || undefined }],
                      startDate: form.startDate || undefined,
                      endDate: form.endDate || undefined,
                      deposit: form.deposit ? parseFloat(form.deposit) : undefined,
                      bankAccount: form.bankAccount || undefined,
                      billingDay: parseInt(form.billingDay) || 1,
                      billingPeriod: form.billingPeriod,
                      indexation: form.indexation,
                      noticePeriodMonths: parseInt(form.noticePeriodMonths) || 1,
                    })}
                    className="w-full h-[calc(100vh-120px)] bg-white"
                    title="Contract preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}
        </div>
      )}
    </CreateDialogShell>
  )
}
