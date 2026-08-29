'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { CreateDialogShell } from '@/components/ui/add-dialog-layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  Home,
  Check,
  ChevronDown,
  Plus,
  Trash2,
  AlertCircle,
  Search,
  X,
} from 'lucide-react'
import { DialogDateField } from '@/components/ui/dialog-date-field'
import { DialogField } from '@/components/ui/dialog-field'
import { Input } from '@/components/ui/input'
import { tenantQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type PropertyOption = {
  id: string
  name: string
  address: string
  units: { id: string; unit_number: string; monthly_rent: number | null }[]
}

type ActiveLeaseInfo = {
  id: string
  start_date: string
  end_date: string | null
  monthly_rent: number
  tenant_name: string | null
}

type ExistingTenantOption = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
}

type TenantSlot = {
  tempId: string
  mode: 'new' | 'existing'
  // new mode
  full_name: string
  email: string
  phone: string
  // existing mode
  existingId: string
  existingSearch: string
}

const CONTRACT_EMPTY = {
  startDate: '',
  endDate: '',
  contractType: 'onbepaald' as 'onbepaald' | 'bepaald',
  monthlyRent: '',
  servicekosten: '',
  deposit: '',
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
}

interface NewTenantDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (tenant: CreatedTenantPayload) => void
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function makeSlot(): TenantSlot {
  return { tempId: `slot-${Date.now()}-${Math.random()}`, mode: 'new', full_name: '', email: '', phone: '', existingId: '', existingSearch: '' }
}

// ── Main component ────────────────────────────────────────────────────────────

export function NewTenantDialog({ open, onClose, onCreated }: NewTenantDialogProps) {
  const { isDemo } = useDashboardUser()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Step 1: Property + Unit ──────────────────────────────────────────────────
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [loadingProps, setLoadingProps] = useState(true)
  const [propertyId, setPropertyId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [activeLease, setActiveLease] = useState<ActiveLeaseInfo | null>(null)
  const [loadingLease, setLoadingLease] = useState(false)
  const [deactivateExisting, setDeactivateExisting] = useState(false)

  const [propPickerOpen, setPropPickerOpen] = useState(false)
  const [unitPickerOpen, setUnitPickerOpen] = useState(false)
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number; width: number } | null>(null)

  // ── Step 2: Contract details ─────────────────────────────────────────────────
  const [form, setForm] = useState({ ...CONTRACT_EMPTY })
  const setField = (k: keyof typeof CONTRACT_EMPTY, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  // ── Step 3: Tenant slots ──────────────────────────────────────────────────────
  const [existingTenants, setExistingTenants] = useState<ExistingTenantOption[]>([])
  const [loadingTenants, setLoadingTenants] = useState(false)
  const [tenantSlots, setTenantSlots] = useState<TenantSlot[]>([makeSlot()])

  // ── Load properties ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    setStep(1)
    setPropertyId('')
    setUnitId('')
    setActiveLease(null)
    setDeactivateExisting(false)
    setForm({ ...CONTRACT_EMPTY })
    setTenantSlots([makeSlot()])
    setError(null)

    if (isDemo) { setProperties([]); setLoadingProps(false); return }

    setLoadingProps(true)
    getUser().then(({ user }) => {
      if (!user) { setLoadingProps(false); return }
      return (supabase as any)
        .from('properties')
        .select('id, name, address, units(id, unit_number, monthly_rent)')
        .eq('owner_id', user.id)
        .order('name')
        .then(({ data }: any) => {
          setProperties((data ?? []).map((p: any) => ({
            id: p.id, name: p.name, address: p.address,
            units: (p.units ?? []).map((u: any) => ({ id: u.id, unit_number: u.unit_number, monthly_rent: u.monthly_rent })),
          })))
        })
    }).catch(() => {}).finally(() => setLoadingProps(false))
  }, [open, isDemo])

  // ── Load active lease when unit changes ──────────────────────────────────────
  useEffect(() => {
    setActiveLease(null)
    setDeactivateExisting(false)
    if (!unitId || isDemo) return
    setLoadingLease(true)
    ;(supabase as any)
      .from('leases')
      .select('id, start_date, end_date, monthly_rent, tenants(full_name)')
      .eq('unit_id', unitId).eq('status', 'actief').maybeSingle()
      .then(({ data }: any) => {
        if (data) setActiveLease({ id: data.id, start_date: data.start_date, end_date: data.end_date ?? null, monthly_rent: data.monthly_rent, tenant_name: data.tenants?.full_name ?? null })
      })
      .catch(() => {}).finally(() => setLoadingLease(false))
  }, [unitId, isDemo])

  const selectedProperty = properties.find((p) => p.id === propertyId)
  const selectedUnit = selectedProperty?.units.find((u) => u.id === unitId)
  useEffect(() => {
    if (selectedUnit?.monthly_rent && !form.monthlyRent)
      setField('monthlyRent', String(selectedUnit.monthly_rent))
  }, [unitId])

  // ── Load existing tenants for step 3 ─────────────────────────────────────────
  const loadTenants = useCallback(async () => {
    if (isDemo) return
    setLoadingTenants(true)
    try {
      const { user } = await getUser()
      if (!user) return
      const { data } = await (supabase as any)
        .from('tenants').select('id, full_name, email, phone').eq('owner_id', user.id).order('full_name')
      setExistingTenants(data ?? [])
    } catch {} finally { setLoadingTenants(false) }
  }, [isDemo])

  // ── Slot helpers ──────────────────────────────────────────────────────────────
  const updateSlot = (tempId: string, patch: Partial<TenantSlot>) =>
    setTenantSlots((prev) => prev.map((s) => s.tempId === tempId ? { ...s, ...patch } : s))

  const removeSlot = (tempId: string) =>
    setTenantSlots((prev) => prev.filter((s) => s.tempId !== tempId))

  // ── Validation ────────────────────────────────────────────────────────────────
  const step1Valid = !!propertyId && !!unitId
  const step2Valid = !!form.startDate && !!form.monthlyRent
  const step3Valid = tenantSlots.some((s) =>
    s.mode === 'new' ? !!s.full_name.trim() : !!s.existingId
  )

  // ── Navigation ────────────────────────────────────────────────────────────────
  const goNext = () => {
    if (step === 1) setStep(2)
    else if (step === 2) { loadTenants(); setStep(3) }
  }
  const goBack = () => {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  const primaryDisabled = saving || (step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (isDemo) {
        const firstNew = tenantSlots.find((s) => s.mode === 'new' && s.full_name.trim())
        onCreated({
          id: `demo-${Date.now()}`,
          full_name: firstNew?.full_name.trim() || 'Demo huurder',
          email: firstNew?.email || null,
          phone: firstNew?.phone || null,
          propertyName: selectedProperty?.name ?? '',
          monthlyRent: parseFloat(form.monthlyRent) || 0,
          startDate: form.startDate || null,
        })
        onClose(); return
      }

      const { user } = await getUser()
      if (!user) throw new Error('Niet ingelogd')

      // Resolve all tenant IDs in slot order
      const allIds: string[] = []
      let firstPayload: { id: string; full_name: string; email: string | null; phone: string | null } | null = null

      for (const slot of tenantSlots) {
        if (slot.mode === 'new' && slot.full_name.trim()) {
          const t = await tenantQueries.create({
            owner_id: user.id,
            full_name: slot.full_name.trim(),
            email: slot.email.trim() || null,
            phone: slot.phone.trim() || null,
          })
          allIds.push(t.id)
          if (!firstPayload) firstPayload = { id: t.id, full_name: t.full_name, email: t.email, phone: t.phone }
        } else if (slot.mode === 'existing' && slot.existingId) {
          allIds.push(slot.existingId)
          if (!firstPayload) {
            const ex = existingTenants.find((t) => t.id === slot.existingId)
            if (ex) firstPayload = { id: ex.id, full_name: ex.full_name, email: ex.email, phone: ex.phone }
          }
        }
      }

      if (allIds.length === 0) throw new Error('Selecteer of maak minimaal één huurder aan')

      const res = await fetch('/api/leases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId,
          tenantId: allIds[0],
          startDate: form.startDate,
          endDate: form.endDate || null,
          monthlyRent: parseFloat(form.monthlyRent),
          deposit: form.deposit ? parseFloat(form.deposit) : null,
          servicekosten: form.servicekosten ? parseFloat(form.servicekosten) : null,
          indexationMethod: form.indexation === 'geen' ? 'none' : form.indexation,
          indexationPct: (form.indexation === 'cpi_plus' || form.indexation === 'fixed') ? parseFloat(form.indexationPct) || null : null,
          indexMonth: form.indexation !== 'geen' ? parseInt(form.indexMonth) || 1 : null,
          deactivateLeaseId: deactivateExisting && activeLease ? activeLease.id : null,
          additionalTenantIds: allIds.length > 1 ? allIds.slice(1) : null,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }

      onCreated({
        id: firstPayload!.id,
        full_name: firstPayload!.full_name,
        email: firstPayload!.email,
        phone: firstPayload!.phone,
        propertyName: selectedProperty?.name ?? '',
        monthlyRent: parseFloat(form.monthlyRent) || 0,
        startDate: form.startDate || null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aanmaken mislukt')
    } finally {
      setSaving(false)
    }
  }

  const stepTitles = ['Pand & eenheid', 'Contractdetails', 'Huurders']
  const stepSubtitles = [
    'Selecteer het pand en de eenheid waarvoor je een contract aanmaakt.',
    'Vul de contractvoorwaarden in.',
    'Voeg de huurder(s) toe aan dit contract.',
  ]

  return (
    <CreateDialogShell
      open={open}
      onOpenChange={(v) => { if (!v) onClose() }}
      title={stepTitles[step - 1]}
      subtitle={stepSubtitles[step - 1]}
      primaryLabel={step < 3 ? 'Verder' : 'Contract aanmaken'}
      onPrimary={step < 3 ? goNext : handleSave}
      primaryDisabled={primaryDisabled}
      primaryLoading={saving}
      step={step}
      totalSteps={3}
      onBack={step > 1 ? goBack : undefined}
      scrollBody
    >

      {/* ── Step 1: Pand + Eenheid ── */}
      {step === 1 && (
        <div className="space-y-4">
          {loadingProps ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">Panden laden…</p>
          ) : properties.length === 0 ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Voeg eerst een pand en eenheid toe via Portfolio.
            </p>
          ) : (
            <>
              <DialogField label="Pand" required>
                <button
                  type="button"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    setPickerPos({ top: r.bottom + 4, left: r.left, width: r.width })
                    setPropPickerOpen((v) => !v); setUnitPickerOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                    propertyId
                      ? 'border-[#1d3014] bg-[#1d3014]/5 text-[#1d3014] dark:border-[#c8e957] dark:bg-[#c8e957]/10 dark:text-[#c8e957]'
                      : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                  )}
                >
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{selectedProperty?.name ?? 'Pand kiezen'}</span>
                  {propertyId ? <Check className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
                </button>
                {propPickerOpen && pickerPos && createPortal(
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'auto' }} onClick={() => setPropPickerOpen(false)} />
                    <div style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, width: pickerPos.width, zIndex: 9999, pointerEvents: 'auto' }}
                      className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 max-h-60 overflow-y-auto"
                    >
                      {properties.map((p) => (
                        <button key={p.id} type="button"
                          onClick={() => { setPropertyId(p.id); setUnitId(''); setPropPickerOpen(false) }}
                          className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                            propertyId === p.id ? 'bg-[#1d3014]/5 dark:bg-[#c8e957]/10 text-[#1d3014] dark:text-[#c8e957] font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                          )}
                        >
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{p.name}</p>
                            <p className="text-xs text-gray-400 truncate">{p.address}</p>
                          </div>
                          {propertyId === p.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>,
                  document.body
                )}
              </DialogField>

              <DialogField label="Eenheid" required>
                <button
                  type="button"
                  disabled={!propertyId}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    setPickerPos({ top: r.bottom + 4, left: r.left, width: r.width })
                    setUnitPickerOpen((v) => !v); setPropPickerOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                    unitId
                      ? 'border-[#1d3014] bg-[#1d3014]/5 text-[#1d3014] dark:border-[#c8e957] dark:bg-[#c8e957]/10 dark:text-[#c8e957]'
                      : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600 disabled:opacity-40'
                  )}
                >
                  <Home className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{selectedUnit?.unit_number ?? 'Eenheid kiezen'}</span>
                  {unitId ? <Check className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
                </button>
                {unitPickerOpen && pickerPos && propertyId && createPortal(
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'auto' }} onClick={() => setUnitPickerOpen(false)} />
                    <div style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, width: pickerPos.width, zIndex: 9999, pointerEvents: 'auto' }}
                      className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 max-h-60 overflow-y-auto"
                    >
                      {(selectedProperty?.units ?? []).length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">Geen eenheden gevonden</p>
                      ) : (selectedProperty?.units ?? []).map((u) => (
                        <button key={u.id} type="button"
                          onClick={() => { setUnitId(u.id); setUnitPickerOpen(false) }}
                          className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                            unitId === u.id ? 'bg-[#1d3014]/5 dark:bg-[#c8e957]/10 text-[#1d3014] dark:text-[#c8e957] font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                          )}
                        >
                          <Home className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="flex-1">{u.unit_number}</span>
                          {u.monthly_rent && <span className="text-xs text-gray-400">€{u.monthly_rent.toLocaleString('nl-NL')}/mnd</span>}
                          {unitId === u.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>,
                  document.body
                )}
              </DialogField>

              {loadingLease && <p className="text-xs text-gray-400 dark:text-gray-500 px-1">Bestaand contract ophalen…</p>}
              {!loadingLease && activeLease && (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Actief contract gevonden</p>
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                        {activeLease.tenant_name && <span>{activeLease.tenant_name} · </span>}
                        Gestart {fmtDate(activeLease.start_date)} · €{activeLease.monthly_rent.toLocaleString('nl-NL')}/mnd
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setDeactivateExisting((v) => !v)}
                    className={cn('w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all',
                      deactivateExisting ? 'border-amber-500 dark:border-amber-600 bg-amber-100/60 dark:bg-amber-900/20' : 'border-amber-200 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700'
                    )}
                  >
                    <div className={cn('relative h-5 w-9 rounded-full shrink-0 transition-colors', deactivateExisting ? 'bg-amber-500 dark:bg-amber-600' : 'bg-gray-200 dark:bg-neutral-700')}>
                      <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all', deactivateExisting ? 'left-4' : 'left-0.5')} />
                    </div>
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-300">Beëindig huidig contract</p>
                      <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">
                        Het bestaande contract krijgt status "verlopen" zodra het nieuwe contract aangemaakt wordt.
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Step 2: Contract details ── */}
      {step === 2 && (
        <div className="space-y-3">
          <DialogField label="Contractvorm" required>
            <Select value={form.contractType} onValueChange={(v) => setField('contractType', v as any)}>
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

          <div className="grid grid-cols-2 gap-3">
            <DialogField label="Huurprijs per maand" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                <Input type="number" min="0" value={form.monthlyRent} onChange={(e) => setField('monthlyRent', e.target.value)} placeholder="0"
                  className="rounded-xl pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
            </DialogField>
            <DialogField label="Borg">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                <Input type="number" min="0" value={form.deposit} onChange={(e) => setField('deposit', e.target.value)} placeholder="0"
                  className="rounded-xl pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
            </DialogField>
          </div>

          <DialogField label="Servicekosten voorschot per maand">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
              <Input type="number" min="0" value={form.servicekosten} onChange={(e) => setField('servicekosten', e.target.value)} placeholder="0"
                className="rounded-xl pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </DialogField>

          <div className={cn('grid gap-3', form.billingPeriod === 'maandelijks' ? 'grid-cols-2' : 'grid-cols-1')}>
            <DialogField label="Factuurperiode">
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
                  <Input type="number" min={1} max={28} value={form.billingDay}
                    onChange={(e) => setField('billingDay', String(Math.min(28, Math.max(1, Number(e.target.value) || 1))))}
                    className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <span className="text-xs text-gray-400 shrink-0">v/d maand</span>
                </div>
              </DialogField>
            )}
          </div>

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
                      <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DialogField>
            )}
          </div>
          {(form.indexation === 'cpi_plus' || form.indexation === 'fixed') && (
            <DialogField label={form.indexation === 'cpi_plus' ? 'Opslag bovenop CPI (%)' : 'Vast percentage (%)'}>
              <div className="flex items-center gap-2">
                <Input type="number" step="0.1" min={0} max={20} placeholder="bijv. 1.5" value={form.indexationPct}
                  onChange={(e) => setField('indexationPct', e.target.value)}
                  className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <span className="text-xs text-gray-400 shrink-0">%</span>
              </div>
            </DialogField>
          )}

          <DialogField label="Opzegtermijn huurder">
            <div className="flex items-center gap-2">
              <Input type="number" min={1} max={24} value={form.noticePeriodMonths}
                onChange={(e) => setField('noticePeriodMonths', String(Math.min(24, Math.max(1, Number(e.target.value) || 1))))}
                className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              <span className="text-xs text-gray-400 shrink-0">{Number(form.noticePeriodMonths) === 1 ? 'maand' : 'maanden'}</span>
            </div>
          </DialogField>
        </div>
      )}

      {/* ── Step 3: Huurders ── */}
      {step === 3 && (
        <div className="space-y-3">
          {loadingTenants ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-2">Huurders laden…</p>
          ) : (
            <>
              {tenantSlots.map((slot, idx) => (
                <TenantSlotCard
                  key={slot.tempId}
                  slot={slot}
                  index={idx}
                  canRemove={tenantSlots.length > 1}
                  existingTenants={existingTenants}
                  usedExistingIds={new Set(tenantSlots.filter((s) => s.tempId !== slot.tempId && s.mode === 'existing').map((s) => s.existingId).filter(Boolean))}
                  onChange={(patch) => updateSlot(slot.tempId, patch)}
                  onRemove={() => removeSlot(slot.tempId)}
                />
              ))}

              <button
                type="button"
                onClick={() => setTenantSlots((prev) => [...prev, makeSlot()])}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#1d3014]/30 dark:border-[#c8e957]/30 bg-[#1d3014]/5 dark:bg-[#c8e957]/8 text-[#1d3014] dark:text-[#c8e957] text-sm font-semibold px-4 py-1.5 hover:bg-[#1d3014]/10 dark:hover:bg-[#c8e957]/15 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Nieuwe huurder
              </button>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </CreateDialogShell>
  )
}

// ── TenantSlotCard ────────────────────────────────────────────────────────────

function TenantSlotCard({
  slot,
  index,
  canRemove,
  existingTenants,
  usedExistingIds,
  onChange,
  onRemove,
}: {
  slot: TenantSlot
  index: number
  canRemove: boolean
  existingTenants: ExistingTenantOption[]
  usedExistingIds: Set<string>
  onChange: (patch: Partial<TenantSlot>) => void
  onRemove: () => void
}) {
  const [search, setSearch] = useState('')

  const selectedTenant = slot.mode === 'existing' && slot.existingId
    ? existingTenants.find((t) => t.id === slot.existingId) ?? null
    : null

  const filtered = existingTenants.filter((t) =>
    !usedExistingIds.has(t.id) &&
    (!search || t.full_name.toLowerCase().includes(search.toLowerCase()) || (t.email ?? '').toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          Huurder {index + 1}
        </span>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="inline-flex rounded-full border border-gray-200 dark:border-neutral-700 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onChange({ mode: 'new', existingId: '', existingSearch: '' })}
              className={cn(
                'rounded-full px-2.5 py-1 font-medium transition-colors',
                slot.mode === 'new'
                  ? 'bg-[#1d3014] text-white dark:bg-[#c8e957] dark:text-[#1d3014]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              Nieuw
            </button>
            <button
              type="button"
              onClick={() => onChange({ mode: 'existing', full_name: '', email: '', phone: '' })}
              className={cn(
                'rounded-full px-2.5 py-1 font-medium transition-colors',
                slot.mode === 'existing'
                  ? 'bg-[#1d3014] text-white dark:bg-[#c8e957] dark:text-[#1d3014]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              Bestaand
            </button>
          </div>
          {canRemove && (
            <button type="button" onClick={onRemove} className="text-gray-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-3 pb-3 space-y-2">
        {slot.mode === 'new' ? (
          <>
            <Input
              value={slot.full_name}
              onChange={(e) => onChange({ full_name: e.target.value })}
              placeholder="Naam *"
              className="rounded-xl h-9 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input type="email" value={slot.email} onChange={(e) => onChange({ email: e.target.value })} placeholder="E-mail" className="rounded-xl h-9 text-sm" />
              <Input type="tel" value={slot.phone} onChange={(e) => onChange({ phone: e.target.value })} placeholder="Telefoon" className="rounded-xl h-9 text-sm" />
            </div>
          </>
        ) : selectedTenant ? (
          /* Existing tenant selected — show summary with clear button */
          <div className="flex items-center gap-3 rounded-xl bg-[#1d3014]/5 dark:bg-[#c8e957]/8 px-3 py-2.5">
            <Check className="h-4 w-4 text-[#1d3014] dark:text-[#c8e957] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedTenant.full_name}</p>
              {selectedTenant.email && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{selectedTenant.email}</p>}
            </div>
            <button type="button" onClick={() => onChange({ existingId: '' })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Existing tenant search */
          existingTenants.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-1">Nog geen huurders in het systeem.</p>
          ) : (
            <div className="space-y-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Zoek huurder…"
                  className="rounded-xl h-9 text-sm pl-8"
                  autoFocus
                />
              </div>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-100 dark:border-neutral-800 divide-y divide-gray-100 dark:divide-neutral-800">
                {filtered.length === 0 ? (
                  <p className="px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500">Geen resultaten</p>
                ) : filtered.map((t) => (
                  <button key={t.id} type="button"
                    onClick={() => { onChange({ existingId: t.id }); setSearch('') }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{t.full_name}</p>
                      {t.email && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{t.email}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
