'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ADD_DIALOG_BODY_SCROLL_CLASS,
  CreateDialogShell,
} from '@/components/ui/add-dialog-layout'
import { Euro, FileText, StickyNote, Send } from 'lucide-react'
import { DialogField } from '@/components/ui/dialog-field'
import { DialogDateField } from '@/components/ui/dialog-date-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { leaseQueries, propertyQueries, unitQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { mockProperties, mockLegalEntities } from '@/lib/mock-data/vastgoed'
import { generateContractHTML } from '@/lib/pdf/generate-contract-pdf'

export type CreatedLeasePayload = {
  id: string
  tenantId: string
  unitId: string
  startDate: string
  endDate: string | null
  monthlyRent: number
  deposit: number | null
  propertyName: string
}

interface HuurovereenkomstDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (lease: CreatedLeasePayload) => void
  tenant: { id: string; name: string; email?: string; phone?: string }
}

type UnitOption = {
  unitId: string
  label: string
  propertyName: string
  propertyAddress: string
  monthlyRent: number
}

const today = () => new Date().toISOString().slice(0, 10)

export function HuurovereenkomstDialog({
  open,
  onClose,
  onCreated,
  tenant,
}: HuurovereenkomstDialogProps) {
  const { isDemo } = useDashboardUser()

  const [unitId, setUnitId] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [deposit, setDeposit] = useState('')
  const [startDate, setStartDate] = useState(today())
  const [endDate, setEndDate] = useState('')
  const [factuurPeriode, setFactuurPeriode] = useState('maandelijks')
  const [notes, setNotes] = useState('')

  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([])
  const [loadingUnits, setLoadingUnits] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset bij openen
  useEffect(() => {
    if (!open) return
    setUnitId('')
    setMonthlyRent('')
    setDeposit('')
    setStartDate(today())
    setEndDate('')
    setFactuurPeriode('maandelijks')
    setNotes('')
    setError(null)

    if (isDemo) {
      setUnitOptions(
        mockProperties.map((p) => ({
          unitId: `demo-unit-${p.id}`,
          label: `${p.name} — ${(p.address ?? '').split(',')[0] || p.name}`,
          propertyName: p.name,
          propertyAddress: p.address ?? '',
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
          const units = ((p as unknown) as {
            units?: { id: string; unit_number: string; monthly_rent: number | null; status: string }[]
          }).units ?? []
          for (const u of units) {
            if (u.status === 'verhuurd') continue
            opts.push({
              unitId: u.id,
              label: `${(p as { name: string }).name}${u.unit_number ? ` — ${u.unit_number}` : ''}`,
              propertyName: (p as { name: string }).name,
              propertyAddress: (p as { address?: string }).address ?? '',
              monthlyRent: Number(u.monthly_rent) || 0,
            })
          }
        }
        setUnitOptions(opts)
      })
      .catch(() => setUnitOptions([]))
      .finally(() => setLoadingUnits(false))
  }, [open, isDemo])

  const handleUnitChange = (val: string) => {
    setUnitId(val)
    const unit = unitOptions.find((o) => o.unitId === val)
    if (unit?.monthlyRent) setMonthlyRent(String(unit.monthlyRent))
  }

  const selectedUnit = unitOptions.find((o) => o.unitId === unitId)
  const canSave = !!unitId && !!monthlyRent && !!startDate && Number(monthlyRent) > 0

  // Live contract preview
  const previewHtml = useMemo(() => {
    if (!selectedUnit) return null
    const landlord = isDemo ? mockLegalEntities[0] : null
    return generateContractHTML({
      propertyAddress: selectedUnit.propertyAddress || selectedUnit.propertyName,
      monthlyRent: Number(monthlyRent) || 0,
      deposit: deposit ? Number(deposit) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      landlordName: landlord?.name ?? undefined,
      landlordAddress: landlord?.address ?? undefined,
      tenants: [{ name: tenant.name, email: tenant.email, phone: tenant.phone }],
    })
  }, [selectedUnit, monthlyRent, deposit, startDate, endDate, tenant, isDemo])

  const buildPayload = async (): Promise<CreatedLeasePayload> => {
    const rent = Number(monthlyRent)
    const dep = deposit ? Number(deposit) : null

    if (isDemo) {
      return {
        id: `demo-lease-${Date.now()}`,
        tenantId: tenant.id,
        unitId,
        startDate,
        endDate: endDate || null,
        monthlyRent: rent,
        deposit: dep,
        propertyName: selectedUnit?.propertyName ?? '',
      }
    }

    const { user } = await getUser()
    if (!user) throw new Error('Niet ingelogd')
    const periodNotes = `Factuurperiode: ${factuurPeriode}${notes ? `\n${notes}` : ''}`
    const created = await leaseQueries.create({
      owner_id: user.id,
      unit_id: unitId,
      tenant_id: tenant.id,
      start_date: startDate,
      end_date: endDate || null,
      monthly_rent: rent,
      deposit: dep,
      status: 'actief',
      notes: periodNotes || null,
    })
    await unitQueries.update(unitId, { status: 'verhuurd' } as never)
    return {
      id: created.id,
      tenantId: tenant.id,
      unitId,
      startDate,
      endDate: endDate || null,
      monthlyRent: rent,
      deposit: dep,
      propertyName: selectedUnit?.propertyName ?? '',
    }
  }

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const payload = await buildPayload()
      onCreated(payload)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aanmaken mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleSendDocuSign = async () => {
    if (!canSave) return
    if (!tenant.email) {
      setError('Huurder heeft geen e-mailadres — voeg er eerst een toe.')
      return
    }
    setSending(true)
    setError(null)
    try {
      const payload = await buildPayload()
      onCreated(payload)

      const landlord = isDemo ? mockLegalEntities[0] : null
      const contractData = {
        propertyAddress: selectedUnit?.propertyAddress || selectedUnit?.propertyName,
        monthlyRent: payload.monthlyRent,
        deposit: payload.deposit ?? undefined,
        startDate: payload.startDate,
        endDate: payload.endDate ?? undefined,
        landlordName: landlord?.name ?? undefined,
        landlordAddress: landlord?.address ?? undefined,
        tenants: [{ name: tenant.name, email: tenant.email, phone: tenant.phone }],
      }

      const res = await fetch('/api/docusign/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractData,
          signers: [{ name: tenant.name, email: tenant.email }],
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Versturen mislukt')

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Versturen mislukt')
      setSending(false)
    }
  }

  return (
    <CreateDialogShell
      open={open}
      onOpenChange={(v) => { if (!v) onClose() }}
      title="Nieuwe huurovereenkomst"
      subtitle={`Stel de huurvoorwaarden in voor ${tenant.name}.`}
      primaryLabel="Verstuur via DocuSign"
      onPrimary={handleSendDocuSign}
      primaryDisabled={sending || saving || !canSave}
      primaryLoading={sending}
      secondaryLabel="Alleen opslaan"
      onSecondary={handleSave}
      secondaryDisabled={saving || sending || !canSave}
      secondaryLoading={saving}
      scrollBody
    >
      <div className={ADD_DIALOG_BODY_SCROLL_CLASS}>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}

        <DialogField label="Object / eenheid" required>
          {loadingUnits ? (
            <p className="text-sm text-gray-400">Eenheden laden…</p>
          ) : unitOptions.length === 0 ? (
            <p className="text-sm text-gray-400">Geen vrije eenheden beschikbaar.</p>
          ) : (
            <Select value={unitId || '__geen'} onValueChange={(v) => handleUnitChange(v === '__geen' ? '' : v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Kies een eenheid" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__geen" disabled>Kies een eenheid</SelectItem>
                {unitOptions.map((o) => (
                  <SelectItem key={o.unitId} value={o.unitId}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </DialogField>

        <div className="grid grid-cols-2 gap-3">
          <DialogField label="Huurprijs / mnd" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
              <Input type="number" min="0" step="0.01" value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="0,00" className="rounded-xl pl-7" />
            </div>
          </DialogField>
          <DialogField label="Borg" optional>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
              <Input type="number" min="0" step="0.01" value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="0,00" className="rounded-xl pl-7" />
            </div>
          </DialogField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DialogDateField label="Startdatum" value={startDate} onChange={setStartDate} required />
          <DialogDateField label="Einddatum" value={endDate} onChange={setEndDate} min={startDate} optional />
        </div>

        <DialogField label="Factuurperiode">
          <Select value={factuurPeriode} onValueChange={setFactuurPeriode}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="maandelijks">Maandelijks</SelectItem>
              <SelectItem value="kwartaal">Per kwartaal</SelectItem>
              <SelectItem value="halfjaarlijks">Halfjaarlijks</SelectItem>
              <SelectItem value="jaarlijks">Jaarlijks</SelectItem>
            </SelectContent>
          </Select>
        </DialogField>

        <DialogField label="Notities" optional>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Bijzondere voorwaarden…" rows={2}
            className="rounded-xl resize-none" />
        </DialogField>

        {/* Contract preview */}
        {previewHtml && (
          <div className="mt-2">
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              Contractpreview
            </p>
            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-700">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-[420px]"
                title="Contractpreview"
                sandbox="allow-same-origin"
              />
            </div>
            {!tenant.email && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                ⚠ Huurder heeft geen e-mailadres — "Verstuur via DocuSign" werkt niet.
              </p>
            )}
          </div>
        )}
      </div>
    </CreateDialogShell>
  )
}
