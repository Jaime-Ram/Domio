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
  ADD_DIALOG_BODY_CLASS,
  ADD_DIALOG_CLOSE_BUTTON_CLASS,
  ADD_DIALOG_FOOTER_CLASS,
  ADD_DIALOG_HEADER_CLASS,
  ADD_DIALOG_TITLE_CLASS,
  addDialogContentClassName,
} from '@/components/ui/add-dialog-layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, User, Mail, Phone, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tenantQueries, propertyQueries, leaseQueries, unitQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { mockProperties } from '@/lib/mock-data/vastgoed'

const EMPTY = { full_name: '', email: '', phone: '' }

export type CreatedTenantPayload = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  /** Alleen gezet bij demo of als koppeling gelukt is */
  propertyName?: string
  monthlyRent?: number
  startDate?: string | null
  /** Huurder wel aangemaakt, lease-koppeling mislukt */
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

export function NewTenantDialog({ open, onClose, onCreated }: NewTenantDialogProps) {
  const { isDemo } = useDashboardUser()
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

  const selectedUnit = unitOptions.find((o) => o.unitId === unitId)

  const setField = (key: keyof typeof EMPTY, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  const startDateToday = () => new Date().toISOString().slice(0, 10)

  const handleCreate = async () => {
    const name = form.full_name.trim()
    if (!name) return
    setSaving(true)
    setError(null)
    try {
      if (isDemo) {
        const link = selectedUnit
        onCreated({
          id: `demo-${Date.now()}`,
          full_name: name,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          propertyName: link?.propertyName ?? '',
          monthlyRent: link?.monthlyRent ?? 0,
          startDate: unitId ? startDateToday() : null,
        })
        onClose()
        return
      }
      const { user } = await getUser()
      if (!user) throw new Error('Niet ingelogd')
      const created = await tenantQueries.create({
        owner_id: user.id,
        full_name: name,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      })

      if (unitId && selectedUnit) {
        try {
          await leaseQueries.create({
            owner_id: user.id,
            unit_id: unitId,
            tenant_id: created.id,
            start_date: startDateToday(),
            monthly_rent: selectedUnit.monthlyRent,
            deposit: null,
            status: 'actief',
            notes: null,
          })
          await unitQueries.update(unitId, { status: 'verhuurd' } as never)
        } catch {
          onCreated({
            id: created.id,
            full_name: created.full_name,
            email: created.email,
            phone: created.phone,
            leaseLinkFailed: true,
          })
          onClose()
          return
        }
      }

      onCreated({
        id: created.id,
        full_name: created.full_name,
        email: created.email,
        phone: created.phone,
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

  const showUnitHint =
    !isDemo && !loadingUnits && unitOptions.length === 0

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        className={addDialogContentClassName('max-w-md')}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
          <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Nieuwe huurder</DialogTitle>
        </DialogHeader>

        <div className={ADD_DIALOG_BODY_CLASS}>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <div className={tile}>
            <p className={label}>
              <User className="inline h-3 w-3 mr-1" />
              Naam *
            </p>
            <input
              autoFocus
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Voor- en achternaam of bedrijfsnaam"
              className={inputCls}
              autoComplete="name"
            />
          </div>

          <div className={tile}>
            <p className={label}>
              <Mail className="inline h-3 w-3 mr-1" />
              E-mail
            </p>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="naam@voorbeeld.nl"
              className={inputCls}
              autoComplete="email"
            />
          </div>

          <div className={tile}>
            <p className={label}>
              <Phone className="inline h-3 w-3 mr-1" />
              Telefoon
            </p>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="+31 6 12345678"
              className={inputCls}
              autoComplete="tel"
            />
          </div>

          <div className={tile}>
            <p className={label}>
              <Building2 className="inline h-3 w-3 mr-1" />
              Object / eenheid
            </p>
            {loadingUnits ? (
              <p className="text-sm text-gray-500">Eenheden laden…</p>
            ) : (
              <Select
                value={unitId || 'geen'}
                onValueChange={(v) => setUnitId(v === 'geen' ? '' : v)}
              >
                <SelectTrigger className={selectTrigger}>
                  <SelectValue placeholder="Kies een eenheid (optioneel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geen">Geen koppeling</SelectItem>
                  {unitOptions.map((o) => (
                    <SelectItem key={o.unitId} value={o.unitId}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {showUnitHint && (
              <p className="text-[11px] text-gray-500 mt-2">
                Er zijn nog geen eenheden. Voeg eerst een pand met eenheid toe in de portefeuille.
              </p>
            )}
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 pb-1">
            Bij een koppeling wordt een actieve huur aangemaakt met de huurprijs van de eenheid (aanpasbaar in het contract).
          </p>
        </div>

        <DialogFooter className={ADD_DIALOG_FOOTER_CLASS}>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !form.full_name.trim()}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F]',
              'disabled:opacity-50 text-[#163300] text-sm font-semibold px-4 py-2 transition-colors'
            )}
          >
            <Check className="h-4 w-4 shrink-0" />
            {saving ? 'Aanmaken…' : 'Aanmaken'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
