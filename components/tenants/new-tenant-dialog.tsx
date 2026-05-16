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
import { Building2, FileText, X } from 'lucide-react'
import { generateContractHTML } from '@/lib/pdf/generate-contract-pdf'
import { DialogDateField } from '@/components/ui/dialog-date-field'
import { DialogField } from '@/components/ui/dialog-field'
import { Input } from '@/components/ui/input'
import { tenantQueries, propertyQueries, leaseQueries, unitQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { mockProperties } from '@/lib/mock-data/vastgoed'
import { cn } from '@/lib/utils'

function formatIBAN(raw: string): string {
  const clean = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 18)
  return (clean.match(/.{1,4}/g) ?? []).join(' ')
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
  const [showPreview, setShowPreview] = useState(false)

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

  const step1Valid = !!form.full_name.trim() && !!form.monthlyRent && !!unitId
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
          onCreated({ id: created.id, full_name: created.full_name, email: created.email, phone: created.phone, leaseLinkFailed: true, propertyName: selectedUnit?.propertyName ?? '', monthlyRent: parseFloat(form.monthlyRent) || selectedUnit?.monthlyRent || 0 })
          onClose()
          return
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

  const stepTitles = [
    'Nieuwe huurovereenkomst',
    'Contractdetails',
    'Controleer & verstuur',
  ]
  const stepSubtitles = [
    'Persoonsgegevens en contactinformatie van de huurder.',
    'Standaardwaarden zijn alvast ingevuld, pas aan waar nodig.',
    'Controleer de samenvatting voordat je verzendt.',
  ]

  return (
    <CreateDialogShell
      open={open}
      onOpenChange={(v) => { if (!v) onClose() }}
      title={stepTitles[step - 1]}
      subtitle={stepSubtitles[step - 1]}
      primaryLabel={step < 3 ? 'Verder' : 'Verzenden naar huurder'}
      onPrimary={
        step === 1 ? handleStep1Next
        : step === 2 ? () => setStep(3)
        : () => handleSave(true)
      }
      primaryDisabled={saving || (step === 1 ? !step1Valid : step === 2 ? !step2Valid : false)}
      primaryLoading={saving}
      secondaryLabel={step === 3 ? 'Opslaan' : undefined}
      onSecondary={step === 3 ? () => handleSave(false) : undefined}
      secondaryDisabled={saving}
      secondaryLoading={saving}
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

      {step === 2 && (
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

          <div className="grid grid-cols-2 gap-3">
            <DialogField label="Jaarlijkse indexatie">
              <Select value={form.indexation} onValueChange={(v) => setField('indexation', v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cbs">CBS-inflatie (standaard)</SelectItem>
                  <SelectItem value="vast">Vast percentage</SelectItem>
                  <SelectItem value="geen">Geen indexatie</SelectItem>
                </SelectContent>
              </Select>
            </DialogField>
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

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3">
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-2">Samenvatting</p>
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

          {/* Contract preview (popup) */}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <FileText className="h-4 w-4 shrink-0" />
            Contractvoorbeeld bekijken
          </button>

          {showPreview && (
            <div className="fixed inset-0 z-[60] flex flex-col bg-neutral-900/95 backdrop-blur-sm">
              {/* Toolbar */}
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
              {/* Document area */}
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
