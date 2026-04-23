'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Search,
  Workflow,
  Users,
  Pencil,
  Trash2,
  Loader2,
  CalendarClock,
  Bell,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { DashboardTableBlock } from '@/components/dashboard/dashboard-table-block'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import {
  dashboardCardClass,
  DASHBOARD_TABLE_HEAD_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS,
} from '@/app/dashboard/employer/dashboard-ui'
import { getFinancialNav } from '../nav'
import {
  paymentProfileQueries,
  type PaymentProfile,
} from '@/lib/supabase/betaalflow'
import { mockPaymentProfiles } from '@/lib/mock-data/betaalflow'
import { cn } from '@/lib/utils'

// ─── Helpers ────────────────────────────────────────────────────────────────

function reminderLabel(days: number): string {
  if (days === 0) return 'Op betaaldag'
  if (days < 0) return `${Math.abs(days)} dag${Math.abs(days) !== 1 ? 'en' : ''} vóór betaaldag`
  return `${days} dag${days !== 1 ? 'en' : ''} na betaaldag`
}

function payDateLabel(n: number): string {
  return `${n}e van de maand`
}

type SortCol = 'name' | 'pay_date' | 'reminders' | 'tenant_count'

// ─── Reminder chip builder ────────────────────────────────────────────────────

function ReminderBuilder({
  value,
  onChange,
}: {
  value: number[]
  onChange: (v: number[]) => void
}) {
  const [input, setInput] = useState('')
  const [err, setErr] = useState('')

  function add() {
    const n = parseInt(input, 10)
    if (isNaN(n)) { setErr('Voer een getal in'); return }
    if (value.includes(n)) { setErr('Al toegevoegd'); return }
    setErr('')
    setInput('')
    onChange([...value, n].sort((a, b) => a - b))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.length === 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 italic">Geen herinneringen</span>
        )}
        {value.map((d) => (
          <span key={d} className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
            d < 0
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : d === 0
              ? 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
          )}>
            {reminderLabel(d)}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== d))} className="ml-0.5 hover:opacity-70 transition-opacity">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-1">
          <Input
            type="number"
            value={input}
            onChange={(e) => { setInput(e.target.value); setErr('') }}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="bijv. -3 of 7"
            className="h-9 rounded-lg text-sm"
          />
          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add} className="h-9 rounded-lg text-sm px-3">
          Toevoegen
        </Button>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Negatief = vóór betaaldag · Positief = dagen na betaaldag · 0 = op betaaldag
      </p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BetaalflowPage() {
  const { user, isDemo, basePath } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)

  const [profiles, setProfiles] = useState<PaymentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<{ column: SortCol | null; direction: 'asc' | 'desc' | null }>({ column: null, direction: null })

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<PaymentProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Form state
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPayDate, setFormPayDate] = useState(1)
  const [formReminders, setFormReminders] = useState<number[]>([-3, 7, 14])

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDemo) {
      setProfiles(mockPaymentProfiles)
      setLoading(false)
      return
    }
    if (!user?.id) { setLoading(false); return }
    paymentProfileQueries.getWithTenantCounts(user.id)
      .then(setProfiles)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id, isDemo])

  // ── Filtered + sorted ─────────────────────────────────────────────────────
  const filtered = useMemo(() => profiles, [profiles])

  const sorted = useMemo(() => {
    if (!sort.column) return filtered
    return [...filtered].sort((a, b) => {
      let diff = 0
      if (sort.column === 'name') diff = a.name.localeCompare(b.name, 'nl')
      if (sort.column === 'pay_date') diff = a.pay_date - b.pay_date
      if (sort.column === 'reminders') diff = a.reminders.length - b.reminders.length
      if (sort.column === 'tenant_count') diff = (a.tenant_count ?? 0) - (b.tenant_count ?? 0)
      return sort.direction === 'desc' ? -diff : diff
    })
  }, [filtered, sort])

  // ── Sort toggle ───────────────────────────────────────────────────────────
  function toggleSort(col: SortCol) {
    setSort((prev) => {
      if (prev.column !== col) return { column: col, direction: 'asc' }
      if (prev.direction === 'asc') return { column: col, direction: 'desc' }
      return { column: null, direction: null }
    })
  }

  function SortIcon({ col }: { col: SortCol }) {
    if (sort.column !== col) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
    if (sort.direction === 'asc') return <ChevronUp className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
    return <ChevronDown className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
  }

  // ── Dialog open ───────────────────────────────────────────────────────────
  function openCreate() {
    setEditingProfile(null)
    setFormName('')
    setFormDesc('')
    setFormPayDate(1)
    setFormReminders([-3, 7, 14])
    setSaveError('')
    setDialogOpen(true)
  }

  function openEdit(p: PaymentProfile) {
    setEditingProfile(p)
    setFormName(p.name)
    setFormDesc(p.description ?? '')
    setFormPayDate(p.pay_date)
    setFormReminders([...p.reminders])
    setSaveError('')
    setDialogOpen(true)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!formName.trim()) { setSaveError('Naam is verplicht'); return }
    if (formPayDate < 1 || formPayDate > 28) { setSaveError('Betaaldag moet tussen 1 en 28 liggen'); return }

    if (isDemo) { setDialogOpen(false); return }
    if (!user?.id) return

    setSaving(true)
    setSaveError('')
    try {
      if (editingProfile) {
        const updated = await paymentProfileQueries.update(editingProfile.id, {
          name: formName.trim(),
          description: formDesc.trim() || null,
          pay_date: formPayDate,
          reminders: formReminders,
        })
        setProfiles((prev) =>
          prev.map((p) => (p.id === updated.id ? { ...updated, tenant_count: p.tenant_count } : p))
        )
      } else {
        const created = await paymentProfileQueries.create({
          owner_id: user.id,
          name: formName.trim(),
          description: formDesc.trim() || null,
          pay_date: formPayDate,
          reminders: formReminders,
        })
        setProfiles((prev) => [{ ...created, tenant_count: 0 }, ...prev])
      }
      setDialogOpen(false)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (isDemo) { setProfiles((prev) => prev.filter((p) => p.id !== id)); setDeleteId(null); return }
    setDeleting(true)
    try {
      await paymentProfileQueries.delete(id)
      setProfiles((prev) => prev.filter((p) => p.id !== id))
      setDeleteId(null)
    } catch (e: unknown) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <Card className={dashboardCardClass()}>
          {/* Toolbar */}
          <CardHeader className={cn('space-y-3', DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                  Betaalflow
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Herbruikbare betaalprofielen die je aan huurders koppelt
                </p>
              </div>
              <Button
                onClick={openCreate}
                className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 h-9 text-sm font-medium shrink-0"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Nieuw profiel
              </Button>
            </div>
          </CardHeader>

          {/* Table */}
          <CardContent className={cn('p-0 px-0 pb-0', DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>
            <DashboardTableBlock empty={sorted.length === 0}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1">
                        Naam <SortIcon col="name" />
                      </button>
                    </TableHead>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" onClick={() => toggleSort('pay_date')} className="inline-flex items-center gap-1">
                        Betaaldag <SortIcon col="pay_date" />
                      </button>
                    </TableHead>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" onClick={() => toggleSort('reminders')} className="inline-flex items-center gap-1">
                        Herinneringen <SortIcon col="reminders" />
                      </button>
                    </TableHead>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" onClick={() => toggleSort('tenant_count')} className="inline-flex items-center gap-1">
                        Huurders <SortIcon col="tenant_count" />
                      </button>
                    </TableHead>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Workflow className="h-8 w-8 text-gray-300 dark:text-neutral-600" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nog geen betaalprofielen aangemaakt
                          </p>
                          <Button onClick={openCreate} variant="outline" size="sm" className="rounded-full text-xs mt-1">
                            <Plus className="h-3.5 w-3.5 mr-1" />Maak je eerste profiel
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {sorted.map((p) => (
                    <TableRow key={p.id} className="group cursor-pointer" onClick={() => openEdit(p)}>
                      <TableCell className="px-3.5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#163300]/8 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                            <Workflow className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name}</p>
                            {p.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">{p.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3.5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                          <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                          {payDateLabel(p.pay_date)}
                        </span>
                      </TableCell>
                      <TableCell className="px-3.5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.reminders.length === 0 ? (
                            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                          ) : (
                            p.reminders.map((d) => (
                              <span key={d} className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                d < 0
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                  : d === 0
                                  ? 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                              )}>
                                <Bell className="h-2.5 w-2.5 mr-1" />
                                {reminderLabel(d)}
                              </span>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3.5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          {p.tenant_count ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="px-3.5 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); openEdit(p) }}
                          >
                            <Pencil className="h-3.5 w-3.5 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(p.id) }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DashboardTableBlock>
          </CardContent>
        </Card>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={addDialogContentClassName('sm:max-w-lg')}
          closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
        >
          <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
            <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>
              {editingProfile ? 'Profiel bewerken' : 'Nieuw betaalprofiel'}
            </DialogTitle>
          </DialogHeader>

          <div className={cn(ADD_DIALOG_BODY_CLASS, 'space-y-5')}>
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="bf-name">Naam</Label>
              <Input
                id="bf-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="bijv. Standaard, Probleemhuurder…"
                className="rounded-xl"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="bf-desc">Omschrijving <span className="text-gray-400 font-normal">(optioneel)</span></Label>
              <Textarea
                id="bf-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Korte toelichting…"
                className="rounded-xl resize-none text-sm"
                rows={2}
              />
            </div>

            {/* Pay date */}
            <div className="space-y-1.5">
              <Label htmlFor="bf-paydate">Betaaldag van de maand</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="bf-paydate"
                  type="number"
                  min={1}
                  max={28}
                  value={formPayDate}
                  onChange={(e) => setFormPayDate(Math.min(28, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-24 rounded-xl text-sm"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">van de maand (1–28)</span>
              </div>
            </div>

            {/* Reminders */}
            <div className="space-y-1.5">
              <Label>Herinneringsschema</Label>
              <ReminderBuilder value={formReminders} onChange={setFormReminders} />
            </div>

            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          </div>

          <DialogFooter className={ADD_DIALOG_FOOTER_CLASS}>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-sm font-semibold px-5 py-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'Opslaan…' : editingProfile ? 'Wijzigingen opslaan' : 'Profiel aanmaken'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null) }}>
        <DialogContent className={addDialogContentClassName('sm:max-w-sm')} closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}>
          <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
            <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Profiel verwijderen</DialogTitle>
          </DialogHeader>
          <div className={cn(ADD_DIALOG_BODY_CLASS)}>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Weet je zeker dat je dit betaalprofiel wilt verwijderen? Huurders die dit profiel gebruiken worden losgekoppeld.
            </p>
          </div>
          <DialogFooter className={ADD_DIALOG_FOOTER_CLASS}>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setDeleteId(null)}>
              Annuleren
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
              Verwijderen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
