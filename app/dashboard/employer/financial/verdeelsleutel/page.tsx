'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertCircle,
  Scale,
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
  costAllocationKeyQueries,
  previewAllocation,
  type CostAllocationKey,
  type AllocationMethod,
  type AllocationUnit,
} from '@/lib/supabase/verdeelsleutel'
import { mockCostAllocationKeys } from '@/lib/mock-data/betaalflow'
import { cn } from '@/lib/utils'

// ─── Helpers ────────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<AllocationMethod, string> = {
  equal: 'Gelijke verdeling',
  surface_area: 'Naar oppervlakte (m²)',
  custom: 'Handmatige percentages',
}

const METHOD_DESC: Record<AllocationMethod, string> = {
  equal: 'Elk eenheid betaalt evenveel',
  surface_area: 'Verdeeld naar m² per eenheid',
  custom: 'Zelf percentages instellen (som = 100%)',
}

type SortCol = 'name' | 'method'

// ─── Unit rows builder (for surface_area / custom) ───────────────────────────

type UnitRow = { unit_id: string; value: string }

function UnitRowsBuilder({
  rows,
  onChange,
}: {
  rows: UnitRow[]
  onChange: (r: UnitRow[]) => void
}) {
  function update(idx: number, field: keyof UnitRow, val: string) {
    onChange(rows.map((r, i) => (i === idx ? { ...r, [field]: val } : r)))
  }

  function addRow() {
    onChange([...rows, { unit_id: '', value: '' }])
  }

  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx))
  }

  const totalPct = rows.reduce((s, r) => s + (parseFloat(r.value) || 0), 0)

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Eenheid-ID"
            value={r.unit_id}
            onChange={(e) => update(i, 'unit_id', e.target.value)}
            className="flex-1 h-8 rounded-lg text-sm"
          />
          <Input
            type="number"
            placeholder="%"
            value={r.value}
            onChange={(e) => update(i, 'value', e.target.value)}
            className="w-24 h-8 rounded-lg text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 shrink-0"
            onClick={() => removeRow(i)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="h-8 rounded-lg text-xs px-3">
        <Plus className="h-3.5 w-3.5 mr-1" />Rij toevoegen
      </Button>
      <div className={cn('flex items-center gap-1.5 text-xs', Math.abs(totalPct - 100) < 0.01 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400')}>
        {Math.abs(totalPct - 100) < 0.01
          ? '✓ Percentages tellen op tot 100%'
          : `Som = ${totalPct.toFixed(1)}% — moet 100% zijn`}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Percentages moeten optellen tot 100%.
      </p>
    </div>
  )
}

// ─── Preview panel ────────────────────────────────────────────────────────────

function AllocationPreview({ keyObj, amount }: { keyObj: CostAllocationKey; amount: number }) {
  const rows = useMemo(() => {
    try {
      return previewAllocation(keyObj, amount)
    } catch {
      return []
    }
  }, [keyObj, amount])

  if (rows.length === 0) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
        {keyObj.method === 'custom'
          ? 'Onvoldoende data voor preview.'
          : 'Verdeling wordt automatisch berekend per pand op basis van de eenheden.'}
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {rows.map((r) => (
        <div key={r.unit_id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-neutral-800/60 px-3 py-1.5">
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[140px]">{r.unit_id}</span>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-500">{r.pct.toFixed(1)}%</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              € {r.amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VerdeelsleutelPage() {
  const { user, isDemo, basePath } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)

  const [keys, setKeys] = useState<CostAllocationKey[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<{ column: SortCol | null; direction: 'asc' | 'desc' | null }>({ column: null, direction: null })

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<CostAllocationKey | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Form state
  const [formName, setFormName] = useState('')
  const [formMethod, setFormMethod] = useState<AllocationMethod>('equal')
  const [formUnitRows, setFormUnitRows] = useState<UnitRow[]>([])

  // Preview
  const [previewAmount, setPreviewAmount] = useState(1000)
  const [previewKey, setPreviewKey] = useState<CostAllocationKey | null>(null)

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDemo) { setKeys(mockCostAllocationKeys); setLoading(false); return }
    if (!user?.id) { setLoading(false); return }
    costAllocationKeyQueries.getByOwner(user.id)
      .then(setKeys)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id, isDemo])

  // ── Filtered + sorted ─────────────────────────────────────────────────────
  const filtered = useMemo(() => keys, [keys])

  const sorted = useMemo(() => {
    if (!sort.column) return filtered
    return [...filtered].sort((a, b) => {
      let diff = 0
      if (sort.column === 'name') diff = a.name.localeCompare(b.name, 'nl')
      if (sort.column === 'method') diff = a.method.localeCompare(b.method)
      return sort.direction === 'desc' ? -diff : diff
    })
  }, [filtered, sort])

  // ── Sort ─────────────────────────────────────────────────────────────────
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
    setEditingKey(null)
    setFormName('')
    setFormMethod('equal')
    setFormUnitRows([])
    setSaveError('')
    setDialogOpen(true)
  }

  function openEdit(k: CostAllocationKey) {
    setEditingKey(k)
    setFormName(k.name)
    setFormMethod(k.method)
    if (k.method === 'custom') {
      setFormUnitRows(k.units.map((u) => ({ unit_id: u.unit_id, value: String(u.percentage) })))
    } else {
      setFormUnitRows([])
    }
    setSaveError('')
    setDialogOpen(true)
  }

  // ── Parse units ───────────────────────────────────────────────────────────
  // Only `custom` keys store per-unit data; equal/surface_area derive everything
  // from the property's units at compute time.
  function parseUnits(): AllocationUnit[] {
    if (formMethod !== 'custom') return []
    return formUnitRows
      .filter((r) => r.unit_id.trim() && r.value)
      .map((r) => ({ unit_id: r.unit_id.trim(), percentage: parseFloat(r.value) || 0 }))
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!formName.trim()) { setSaveError('Naam is verplicht'); return }

    if (formMethod === 'custom') {
      const units = parseUnits() as { unit_id: string; percentage: number }[]
      const total = units.reduce((s, u) => s + u.percentage, 0)
      if (units.length > 0 && Math.abs(total - 100) > 0.01) {
        setSaveError(`Percentages tellen op tot ${total.toFixed(1)}% — moet 100% zijn`)
        return
      }
    }

    if (isDemo) { setDialogOpen(false); return }
    if (!user?.id) return

    setSaving(true)
    setSaveError('')
    try {
      const payload = { name: formName.trim(), method: formMethod, units: parseUnits() }
      if (editingKey) {
        const updated = await costAllocationKeyQueries.update(editingKey.id, payload)
        setKeys((prev) => prev.map((k) => (k.id === updated.id ? updated : k)))
      } else {
        const created = await costAllocationKeyQueries.create({ owner_id: user.id, ...payload })
        setKeys((prev) => [created, ...prev])
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
    if (isDemo) { setKeys((prev) => prev.filter((k) => k.id !== id)); setDeleteId(null); return }
    setDeleting(true)
    try {
      await costAllocationKeyQueries.delete(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
      setDeleteId(null)
    } catch (e: unknown) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  // ── Method badge ─────────────────────────────────────────────────────────
  function MethodBadge({ method }: { method: AllocationMethod }) {
    const styles: Record<AllocationMethod, string> = {
      equal: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300',
      surface_area: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      custom: 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400',
    }
    return (
      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', styles[method])}>
        {METHOD_LABELS[method]}
      </span>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4">
          <Card className={dashboardCardClass()}>
            {/* Toolbar */}
            <CardHeader className={cn('space-y-3', DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Scale className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                    Verdeelsleutels
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Definieer hoe gedeelde kosten worden verdeeld over eenheden
                  </p>
                </div>
                <Button
                  onClick={openCreate}
                  className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 h-9 text-sm font-medium shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Nieuwe sleutel
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
                        <button type="button" onClick={() => toggleSort('method')} className="inline-flex items-center gap-1">
                          Methode <SortIcon col="method" />
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Eenheden</TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Preview</TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <AlertCircle className="h-8 w-8 text-gray-300 dark:text-neutral-600" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Nog geen verdeelsleutels aangemaakt
                            </p>
                            <Button onClick={openCreate} variant="outline" size="sm" className="rounded-full text-xs mt-1">
                              <Plus className="h-3.5 w-3.5 mr-1" />Maak je eerste sleutel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {sorted.map((k) => (
                      <TableRow key={k.id} className="group cursor-pointer" onClick={() => openEdit(k)}>
                        <TableCell className="px-3.5 py-3">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{k.name}</p>
                          {k.property_id && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Pand-specifiek</p>
                          )}
                        </TableCell>
                        <TableCell className="px-3.5 py-3">
                          <MethodBadge method={k.method} />
                        </TableCell>
                        <TableCell className="px-3.5 py-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {k.method === 'equal' ? 'Automatisch' : `${k.units.length} eenheden`}
                          </span>
                        </TableCell>
                        <TableCell className="px-3.5 py-3">
                          <button
                            type="button"
                            className="text-xs text-[#163300] dark:text-[#9FE870] hover:underline font-medium"
                            onClick={(e) => { e.stopPropagation(); setPreviewKey(k) }}
                          >
                            Preview →
                          </button>
                        </TableCell>
                        <TableCell className="px-3.5 py-3">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg"
                              onClick={(e) => { e.stopPropagation(); openEdit(k) }}
                            >
                              <Pencil className="h-3.5 w-3.5 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                              onClick={(e) => { e.stopPropagation(); setDeleteId(k.id) }}
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

          {/* Info block */}
          <div className="rounded-card border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-5 py-4 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Hoe werkt het?</span> Met verdeelsleutels kan je kosten voor een pand splitsen over eenheden. Voeg bij elk pand een standaard verdeerlsleutel toe die automatisch wordt toegepast. Je kan altijd nog voor losse betalingen kiezen om die via een andere sleutel te verdelen.
            </p>
          </div>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={addDialogContentClassName('sm:max-w-lg')}
          closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
        >
          <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
            <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>
              {editingKey ? 'Sleutel bewerken' : 'Nieuwe verdeelsleutel'}
            </DialogTitle>
          </DialogHeader>

          <div className={cn(ADD_DIALOG_BODY_CLASS, 'space-y-5')}>
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="vdk-name">Naam</Label>
              <Input
                id="vdk-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="bijv. Gelijke verdeling, Servicekosten split…"
                className="rounded-xl"
                autoFocus
              />
            </div>

            {/* Method */}
            <div className="space-y-1.5">
              <Label>Verdeelmethode</Label>
              <div className="grid grid-cols-1 gap-2">
                {(['equal', 'surface_area', 'custom'] as AllocationMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setFormMethod(m); setFormUnitRows([]) }}
                    className={cn(
                      'text-left rounded-xl border-2 px-4 py-3 transition-all',
                      formMethod === m
                        ? 'border-[#163300] dark:border-[#9FE870] bg-[#163300]/5 dark:bg-[#9FE870]/5'
                        : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                    )}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{METHOD_LABELS[m]}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{METHOD_DESC[m]}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Unit rows — only for 'custom' (equal/surface_area derive from property) */}
            {formMethod === 'custom' && (
              <div className="space-y-1.5">
                <Label>Eenheden</Label>
                <UnitRowsBuilder rows={formUnitRows} onChange={setFormUnitRows} />
              </div>
            )}
            {formMethod !== 'custom' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formMethod === 'equal'
                  ? 'Kosten worden gelijk verdeeld over alle eenheden van het pand.'
                  : 'Kosten worden verdeeld op basis van het opgegeven m²-oppervlak per eenheid.'}
              </p>
            )}

            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          </div>

          <DialogFooter className={ADD_DIALOG_FOOTER_CLASS}>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-sm font-semibold px-5 py-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'Opslaan…' : editingKey ? 'Wijzigingen opslaan' : 'Sleutel aanmaken'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null) }}>
        <DialogContent className={addDialogContentClassName('sm:max-w-sm')} closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}>
          <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
            <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Sleutel verwijderen</DialogTitle>
          </DialogHeader>
          <div className={ADD_DIALOG_BODY_CLASS}>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Weet je zeker dat je deze verdeelsleutel wilt verwijderen? Panden en transacties die deze sleutel gebruiken worden losgekoppeld.
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

      {/* Preview dialog */}
      <Dialog open={!!previewKey} onOpenChange={(o) => { if (!o) setPreviewKey(null) }}>
        <DialogContent className={addDialogContentClassName('sm:max-w-md')} closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}>
          <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
            <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Verdeling preview</DialogTitle>
          </DialogHeader>
          <div className={cn(ADD_DIALOG_BODY_CLASS, 'space-y-4')}>
            {previewKey && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="preview-amt">Bedrag (€)</Label>
                  <Input
                    id="preview-amt"
                    type="number"
                    value={previewAmount}
                    onChange={(e) => setPreviewAmount(parseFloat(e.target.value) || 0)}
                    className="w-36 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Verdeling</p>
                  <AllocationPreview keyObj={previewKey} amount={previewAmount} />
                </div>
              </>
            )}
          </div>
          <DialogFooter className={ADD_DIALOG_FOOTER_CLASS}>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setPreviewKey(null)}>
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
