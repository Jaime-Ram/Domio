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
import { Building2, Send, Save, FileText } from 'lucide-react'
import { DialogDateField } from '@/components/ui/dialog-date-field'
import { tenantQueries, propertyQueries, leaseQueries, unitQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { mockProperties } from '@/lib/mock-data/vastgoed'
import { cn } from '@/lib/utils'

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
  indexation: 'cbs',
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

const tile = 'bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3'
const lbl = 'text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5'
const inputCls =
  'w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0'
const selectTrigger =
  'h-auto w-full p-0 text-sm font-medium text-gray-900 dark:text-white bg-transparent border-0 shadow-none focus:ring-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-gray-400'

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

export function NewTenantDialog({ open, onClose, onCreated }: NewTenantDialogProps) {
  const { isDemo } = useDashboardUser()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ ...EMPTY })
  const [unitId, setUnitId] = useState<string>('')
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([])
  const [loadingUnits, setLoadingUnits] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY })
    setUnitId('')
    setStep(1)
    setError(null)

    if (isDemo) {
      setUnitOptions(
        mockProperties.map((p) => ({
          unitId: `demo-unit-${p.id}`,
          label: `${p.name} — ${(p.address ?? '').split(',')[0] || p.name}`,
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

  // Prefill huurprijs van geselecteerde eenheid
  useEffect(() => {
    const unit = unitOptions.find((o) => o.unitId === unitId)
    if (unit && !form.monthlyRent) {
      setForm((f) => ({ ...f, monthlyRent: String(unit.monthlyRent || '') }))
    }
  }, [unitId, unitOptions])

  const selectedUnit = unitOptions.find((o) => o.unitId === unitId)
  const setField = (key: keyof typeof EMPTY, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  const step1Valid = !!form.full_name.trim() && !!form.monthlyRent
  const step2Valid = !!form.startDate

  const handleStep1Next = () => {
    // Auto-fill borg = 1x maandhuur als nog niet ingevuld
    if (!form.deposit && form.monthlyRent) {
      setField('deposit', form.monthlyRent)
    }
    setStep(2)
  }

  const handleSave = async (sendToTenant: boolean) => {
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
          await leaseQueries.create({
            owner_id: user.id,
            unit_id: unitId,
            tenant_id: created.id,
            start_date: form.startDate,
            end_date: form.endDate || null,
            monthly_rent: parseFloat(form.monthlyRent) || selectedUnit.monthlyRent,
            deposit: form.deposit ? parseFloat(form.deposit) : null,
            status: 'actief',
            notes: null,
          })
          await unitQueries.update(unitId, { status: 'verhuurd' } as never)
        } catch {
          onCreated({ id: created.id, full_name: created.full_name, email: created.email, phone: created.phone, leaseLinkFailed: true })
          onClose()
          return
        }
      }

      onCreated({ id: created.id, full_name: created.full_name, email: created.email, phone: created.phone, startDate: form.startDate || null })
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

  const stepTitles = [
    'Nieuwe huurovereenkomst',
    'Contractdetails',
    'Controleer & verstuur',
  ]
  const stepSubtitles = [
    'Persoonsgegevens en contactinformatie van de huurder.',
    'Standaardwaarden zijn alvast ingevuld — pas aan waar nodig.',
    'Controleer de samenvatting en kies hoe je verzendt.',
  ]

  return (
    <CreateDialogShell
      open={open}
      onOpenChange={(v) => { if (!v) onClose() }}
      title={stepTitles[step - 1]}
      subtitle={stepSubtitles[step - 1]}
      primaryLabel={step < 3 ? 'Verder' : 'Opslaan'}
      onPrimary={
        step === 1 ? handleStep1Next
        : step === 2 ? () => setStep(3)
        : () => handleSave(false)
      }
      primaryDisabled={saving || (step === 1 ? !step1Valid : step === 2 ? !step2Valid : false)}
      primaryLoading={saving}
      step={step}
      totalSteps={3}
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      scrollBody
    >
      {step === 1 && (
        <div className="space-y-3">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          {/* Naam */}
          <div className={tile}>
            <p className={lbl}>Naam huurder *</p>
            <input
              autoFocus
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              placeholder="Voor- en achternaam of bedrijfsnaam"
              className={inputCls}
              autoComplete="name"
            />
          </div>

          {/* Email + Telefoon */}
          <div className="grid grid-cols-2 gap-3">
            <div className={tile}>
              <p className={lbl}>Email</p>
              <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="naam@voorbeeld.nl" className={inputCls} autoComplete="email" />
            </div>
            <div className={tile}>
              <p className={lbl}>Telefoonnummer</p>
              <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+31 6 12345678" className={inputCls} autoComplete="tel" />
            </div>
          </div>

          {/* Object */}
          <div className={tile}>
            <p className={lbl}>
              <Building2 className="inline h-3 w-3 mr-1" />
              Object / eenheid
            </p>
            {loadingUnits ? (
              <p className="text-sm text-gray-500">Eenheden laden…</p>
            ) : (
              <Select value={unitId || 'geen'} onValueChange={(v) => setUnitId(v === 'geen' ? '' : v)}>
                <SelectTrigger className={selectTrigger}>
                  <SelectValue placeholder="Kies een eenheid (optioneel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geen">Geen koppeling</SelectItem>
                  {unitOptions.map((o) => (
                    <SelectItem key={o.unitId} value={o.unitId}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Huurprijs */}
          <div className={tile}>
            <p className={lbl}>Huurprijs per maand *</p>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400 dark:text-gray-500">€</span>
              <input
                type="number"
                min="0"
                value={form.monthlyRent}
                onChange={(e) => setField('monthlyRent', e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </div>
          </div>

          {/* Bankrekeningnummer */}
          <div className={tile}>
            <p className={lbl}>Bankrekeningnummer huurder</p>
            <input
              value={form.bankAccount}
              onChange={(e) => setField('bankAccount', e.target.value)}
              placeholder="NL00 BANK 0000 0000 00"
              className={inputCls}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          {/* Borg — auto 1x maandhuur */}
          <div className={tile}>
            <p className={lbl}>Borg</p>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400 dark:text-gray-500">€</span>
              <input
                type="number"
                min="0"
                value={form.deposit}
                onChange={(e) => setField('deposit', e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </div>
            {form.monthlyRent && form.deposit === form.monthlyRent && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Automatisch ingesteld op 1× maandhuur</p>
            )}
          </div>

          {/* Contractvorm */}
          <div className={tile}>
            <p className={lbl}>Contractvorm</p>
            <Select value={form.contractType} onValueChange={(v) => setField('contractType', v)}>
              <SelectTrigger className={selectTrigger}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="onbepaald">Onbepaalde tijd</SelectItem>
                <SelectItem value="bepaald">Bepaalde tijd</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Startdatum + Einddatum */}
          <div className={cn('grid gap-3', form.contractType === 'bepaald' ? 'grid-cols-2' : 'grid-cols-1')}>
            <DialogDateField label="Startdatum" value={form.startDate} onChange={(v) => setField('startDate', v)} required />
            {form.contractType === 'bepaald' && (
              <DialogDateField label="Einddatum" value={form.endDate} onChange={(v) => setField('endDate', v)} min={form.startDate || undefined} />
            )}
          </div>

          {/* Facturatie periode + dag */}
          <div className={cn('grid gap-3', form.billingPeriod === 'maandelijks' ? 'grid-cols-2' : 'grid-cols-1')}>
            <div className={tile}>
              <p className={lbl}>Facturatie periode</p>
              <Select value={form.billingPeriod} onValueChange={(v) => setField('billingPeriod', v)}>
                <SelectTrigger className={selectTrigger}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="maandelijks">Maandelijks</SelectItem>
                  <SelectItem value="kwartaal">Per kwartaal</SelectItem>
                  <SelectItem value="jaarlijks">Jaarlijks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.billingPeriod === 'maandelijks' && (
              <div className={tile}>
                <p className={lbl}>Facturatiedag</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setField('billingDay', String(Math.max(1, Number(form.billingDay) - 1)))}
                    className="h-6 w-6 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors shrink-0"
                  >−</button>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={form.billingDay}
                    onChange={(e) => {
                      const v = Math.min(28, Math.max(1, Number(e.target.value) || 1))
                      setField('billingDay', String(v))
                    }}
                    className="w-8 text-center bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none border-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setField('billingDay', String(Math.min(28, Number(form.billingDay) + 1)))}
                    className="h-6 w-6 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors shrink-0"
                  >+</button>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">v/d maand</span>
                </div>
              </div>
            )}
          </div>

          {/* Indexatie + Opzegtermijn */}
          <div className="grid grid-cols-2 gap-3">
            <div className={tile}>
              <p className={lbl}>Jaarlijkse indexatie</p>
              <Select value={form.indexation} onValueChange={(v) => setField('indexation', v)}>
                <SelectTrigger className={selectTrigger}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cbs">CBS-inflatie (standaard)</SelectItem>
                  <SelectItem value="vast">Vast percentage</SelectItem>
                  <SelectItem value="geen">Geen indexatie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={tile}>
              <p className={lbl}>Opzegtermijn huurder</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setField('noticePeriodMonths', String(Math.max(1, Number(form.noticePeriodMonths) - 1)))}
                  className="h-6 w-6 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors shrink-0"
                >−</button>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={form.noticePeriodMonths}
                  onChange={(e) => {
                    const v = Math.min(24, Math.max(1, Number(e.target.value) || 1))
                    setField('noticePeriodMonths', String(v))
                  }}
                  className="w-8 text-center bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none border-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setField('noticePeriodMonths', String(Math.min(24, Number(form.noticePeriodMonths) + 1)))}
                  className="h-6 w-6 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors shrink-0"
                >+</button>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                  {Number(form.noticePeriodMonths) === 1 ? 'maand' : 'maanden'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          {/* Samenvatting */}
          <div className={tile}>
            <p className={cn(lbl, 'mb-2')}>Samenvatting</p>
            <SummaryRow label="Huurder" value={form.full_name} />
            <SummaryRow label="Object" value={selectedUnit?.label ?? ''} />
            <SummaryRow label="Huurprijs" value={form.monthlyRent ? `€ ${parseFloat(form.monthlyRent).toLocaleString('nl-NL')} / mnd` : ''} />
            <SummaryRow label="Borg" value={form.deposit ? `€ ${parseFloat(form.deposit).toLocaleString('nl-NL')}` : ''} />
            <SummaryRow label="Bankrekeningnummer" value={form.bankAccount} />
            <SummaryRow label="Contractvorm" value={form.contractType === 'onbepaald' ? 'Onbepaalde tijd' : 'Bepaalde tijd'} />
            <SummaryRow label="Startdatum" value={form.startDate} />
            {form.contractType === 'bepaald' && (
              <SummaryRow label="Einddatum" value={form.endDate} />
            )}
            <SummaryRow label="Facturatie" value={billingLabel} />
            <SummaryRow label="Indexatie" value={form.indexation === 'cbs' ? 'CBS-inflatie' : form.indexation === 'vast' ? 'Vast %' : 'Geen'} />
            <SummaryRow label="Opzegtermijn" value={`${form.noticePeriodMonths} ${Number(form.noticePeriodMonths) === 1 ? 'maand' : 'maanden'}`} />
          </div>

          {/* Contract preview placeholder */}
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/30 px-6 py-8 flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Contract preview</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Documentweergave wordt hier getoond</p>
            </div>
          </div>

          {/* Verzendopties */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Opslaan zonder te verzenden
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#163300] dark:bg-[#9FE870] px-4 py-3 text-sm font-medium text-white dark:text-[#163300] hover:bg-[#1e4800] dark:hover:bg-[#8AD45F] transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Verzenden naar huurder
            </button>
          </div>

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
