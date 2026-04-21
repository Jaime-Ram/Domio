'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ADD_DIALOG_BODY_SCROLL_CLASS,
  ADD_DIALOG_CLOSE_BUTTON_CLASS,
  ADD_DIALOG_FOOTER_CLASS,
  ADD_DIALOG_HEADER_CLASS,
  ADD_DIALOG_TITLE_CLASS,
  addDialogContentClassName,
} from '@/components/ui/add-dialog-layout'
import { Building2, Calendar, Euro, FileText, Check, User, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { leaseQueries, propertyQueries, unitQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { mockProperties } from '@/lib/mock-data/vastgoed'

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
  /** Pre-ingevulde huurder — als aanwezig worden huurder-velden overgeslagen */
  tenant: { id: string; name: string }
}

type UnitOption = {
  unitId: string
  label: string
  propertyName: string
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
          const units = (
            (p as unknown) as {
              units?: { id: string; unit_number: string; monthly_rent: number | null; status: string }[]
            }
          ).units ?? []
          for (const u of units) {
            // Alleen vrije eenheden tonen
            if (u.status === 'verhuurd') continue
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

  // Auto-vul huurprijs bij eenheid-selectie
  const handleUnitChange = (val: string) => {
    setUnitId(val)
    const unit = unitOptions.find((o) => o.unitId === val)
    if (unit?.monthlyRent) setMonthlyRent(String(unit.monthlyRent))
  }

  const selectedUnit = unitOptions.find((o) => o.unitId === unitId)
  const canSave = !!unitId && !!monthlyRent && !!startDate && Number(monthlyRent) > 0

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const rent = Number(monthlyRent)
      const dep = deposit ? Number(deposit) : null

      if (isDemo) {
        onCreated({
          id: `demo-lease-${Date.now()}`,
          tenantId: tenant.id,
          unitId,
          startDate,
          endDate: endDate || null,
          monthlyRent: rent,
          deposit: dep,
          propertyName: selectedUnit?.propertyName ?? '',
        })
        onClose()
        return
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

      // Markeer eenheid als verhuurd
      await unitQueries.update(unitId, { status: 'verhuurd' } as never)

      onCreated({
        id: created.id,
        tenantId: tenant.id,
        unitId,
        startDate,
        endDate: endDate || null,
        monthlyRent: rent,
        deposit: dep,
        propertyName: selectedUnit?.propertyName ?? '',
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aanmaken mislukt')
    } finally {
      setSaving(false)
    }
  }

  const tile = 'bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3'
  const label = 'text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5'
  const inputCls =
    'w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0'
  const selectTrigger =
    'h-auto w-full p-0 text-sm font-medium text-gray-900 dark:text-white bg-transparent border-0 shadow-none focus:ring-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-gray-400'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        className={addDialogContentClassName('max-w-md')}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
          <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Nieuwe huurovereenkomst</DialogTitle>
          {/* Huurder badge */}
          <div className="flex items-center gap-2 mt-2">
            <div className="h-6 w-6 rounded-full bg-[#163300]/10 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
              <User className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tenant.name}</span>
          </div>
        </DialogHeader>

        <div className={ADD_DIALOG_BODY_SCROLL_CLASS}>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          {/* Object / eenheid */}
          <div className={tile}>
            <p className={label}>
              <Building2 className="inline h-3 w-3 mr-1" />
              Object / eenheid *
            </p>
            {loadingUnits ? (
              <p className="text-sm text-gray-400">Eenheden laden…</p>
            ) : unitOptions.length === 0 ? (
              <p className="text-sm text-gray-400">
                Geen vrije eenheden beschikbaar. Voeg eerst een pand toe.
              </p>
            ) : (
              <Select value={unitId || '__geen'} onValueChange={(v) => handleUnitChange(v === '__geen' ? '' : v)}>
                <SelectTrigger className={selectTrigger}>
                  <SelectValue placeholder="Kies een eenheid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__geen" disabled>Kies een eenheid</SelectItem>
                  {unitOptions.map((o) => (
                    <SelectItem key={o.unitId} value={o.unitId}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Huurprijs + Borg */}
          <div className="grid grid-cols-2 gap-3">
            <div className={tile}>
              <p className={label}>
                <Euro className="inline h-3 w-3 mr-1" />
                Huurprijs / mnd *
              </p>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">€</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="0,00"
                  className={cn(inputCls, 'flex-1')}
                />
              </div>
            </div>
            <div className={tile}>
              <p className={label}>
                <Euro className="inline h-3 w-3 mr-1" />
                Borg
              </p>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">€</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="0,00"
                  className={cn(inputCls, 'flex-1')}
                />
              </div>
            </div>
          </div>

          {/* Startdatum + Einddatum */}
          <div className="grid grid-cols-2 gap-3">
            <div className={tile}>
              <p className={label}>
                <Calendar className="inline h-3 w-3 mr-1" />
                Startdatum *
              </p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className={tile}>
              <p className={label}>
                <Calendar className="inline h-3 w-3 mr-1" />
                Einddatum
              </p>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Factuurperiode */}
          <div className={tile}>
            <p className={label}>
              <FileText className="inline h-3 w-3 mr-1" />
              Factuurperiode
            </p>
            <Select value={factuurPeriode} onValueChange={setFactuurPeriode}>
              <SelectTrigger className={selectTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maandelijks">Maandelijks</SelectItem>
                <SelectItem value="kwartaal">Per kwartaal</SelectItem>
                <SelectItem value="halfjaarlijks">Halfjaarlijks</SelectItem>
                <SelectItem value="jaarlijks">Jaarlijks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notities */}
          <div className={tile}>
            <p className={label}>
              <StickyNote className="inline h-3 w-3 mr-1" />
              Notities
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bijzondere voorwaarden of opmerkingen…"
              rows={2}
              className={cn(inputCls, 'resize-none leading-relaxed')}
            />
          </div>
        </div>

        <DialogFooter className={ADD_DIALOG_FOOTER_CLASS}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSave}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F]',
              'disabled:opacity-50 text-[#163300] text-sm font-semibold px-4 py-2 transition-colors'
            )}
          >
            <Check className="h-4 w-4 shrink-0" />
            {saving ? 'Opslaan…' : 'Huurovereenkomst aanmaken'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
