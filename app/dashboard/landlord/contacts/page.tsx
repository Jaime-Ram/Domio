'use client'

import { useState, useMemo } from 'react'
import { Plus, Phone, Mail, Pencil, Trash2, BookUser, User, Building2, Layers, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CreateDialogShell } from '@/components/ui/add-dialog-layout'
import { DetailShell } from '@/components/ui/detail-shell'
import { DialogField } from '@/components/ui/dialog-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { contactQueries } from '@/lib/supabase/queries'
import { useContacts, useProperties, usePortfolios, useQueryClient, QK } from '@/lib/hooks/use-dashboard-queries'
import { TableToolbar } from '@/components/dashboard/table-toolbar'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table-grid'
import { PersonAvatar } from '@/components/ui/entity-avatar'
import { useSortable, applySortedRows } from '@/components/ui/sortable-table'
import { DropdownMenuLabel, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS } from '@/app/dashboard/landlord/dashboard-ui'

type Category = 'alle' | 'loodgieter' | 'aannemer' | 'elektricien' | 'schilder' | 'schoonmaak' | 'overig'

interface Contact {
  id: string
  owner_id: string
  name: string
  company: string | null
  category: string
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'alle',        label: 'Alle' },
  { value: 'loodgieter',  label: 'Loodgieter' },
  { value: 'aannemer',    label: 'Aannemer' },
  { value: 'elektricien', label: 'Elektricien' },
  { value: 'schilder',    label: 'Schilder' },
  { value: 'schoonmaak',  label: 'Schoonmaak' },
  { value: 'overig',      label: 'Overig' },
]

const CATEGORY_COLORS: Record<string, string> = {
  loodgieter:  'bg-blue-100 text-blue-700',
  aannemer:    'bg-orange-100 text-orange-700',
  elektricien: 'bg-yellow-100 text-yellow-700',
  schilder:    'bg-purple-100 text-purple-700',
  schoonmaak:  'bg-green-100 text-green-700',
  overig:      'bg-[#f4f4f1] text-[#55554e]',
}

const EMPTY_FORM = {
  name: '',
  company: '',
  category: 'overig' as string,
  phone: '',
  email: '',
  notes: '',
}

export default function ContactsPage() {
  const { user } = useDashboardUser()
  const queryClient = useQueryClient()
  const { data: contacts = [], isLoading: loading } = useContacts(user?.id)
  const { data: properties = [] } = useProperties(user?.id)
  const { data: portfolios = [] } = usePortfolios(user?.id)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const { sort, toggleSort } = useSortable<string>()

  const toggleCategory = (value: string) =>
    setCategoryFilter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })

  // Toevoegen — popup
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(EMPTY_FORM)
  const [addSaving, setAddSaving] = useState(false)

  // Bekijken/bewerken — slide-out
  const [detailContact, setDetailContact] = useState<Contact | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [editSaving, setEditSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Koppelingen aan panden/portefeuilles
  const [linkPropertyIds, setLinkPropertyIds] = useState<Set<string>>(new Set())
  const [linkPortfolioIds, setLinkPortfolioIds] = useState<Set<string>>(new Set())

  const toggleLinkProperty = (id: string) => setLinkPropertyIds((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })
  const toggleLinkPortfolio = (id: string) => setLinkPortfolioIds((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  const filtered = useMemo(() => contacts.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? '').includes(search) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter.size === 0 || categoryFilter.has(c.category)
    return matchSearch && matchCat
  }), [contacts, search, categoryFilter])

  const sortedFiltered = useMemo(
    () => applySortedRows(filtered, sort, (c, k) =>
      k === 'category' ? (CATEGORIES.find(cat => cat.value === c.category)?.label ?? c.category)
      : k === 'company' ? (c.company ?? '')
      : c.name,
    ),
    [filtered, sort],
  )

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of contacts) counts[c.category] = (counts[c.category] ?? 0) + 1
    return counts
  }, [contacts])

  const filterContent = (
    <>
      <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-[#97978f] dark:text-[#97978f]">
        Categorie
      </DropdownMenuLabel>
      <div className="space-y-1">
        {CATEGORIES.filter(c => c.value !== 'alle').map((cat) => (
          <DropdownMenuCheckboxItem
            key={cat.value}
            checked={categoryFilter.has(cat.value)}
            onCheckedChange={() => toggleCategory(cat.value)}
            onSelect={(e) => e.preventDefault()}
            className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
          >
            <span>{cat.label}</span>
            <span className="text-xs text-[#97978f] dark:text-[#97978f]">{categoryCounts[cat.value] ?? 0}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </div>
    </>
  )

  // ── Toevoegen ──
  const openAdd = () => {
    setAddForm(EMPTY_FORM)
    setLinkPropertyIds(new Set())
    setLinkPortfolioIds(new Set())
    setAddOpen(true)
  }

  const handleAdd = async () => {
    if (!user || !addForm.name.trim()) return
    setAddSaving(true)
    try {
      const created = await contactQueries.create({
        owner_id: user.id,
        name: addForm.name.trim(),
        company: addForm.company.trim() || null,
        category: addForm.category,
        phone: addForm.phone.trim() || null,
        email: addForm.email.trim() || null,
        notes: addForm.notes.trim() || null,
      })
      await contactQueries.replaceLinks(created.id, user.id, [...linkPropertyIds], [...linkPortfolioIds])
      queryClient.setQueryData(QK.contacts(user!.id), (old: Contact[] = []) =>
        [...old, created].sort((a, b) => a.name.localeCompare(b.name))
      )
      setAddOpen(false)
      setAddForm(EMPTY_FORM)
    } catch (e) { console.error(e) }
    finally { setAddSaving(false) }
  }

  // ── Bekijken/bewerken ──
  const openDetail = async (c: Contact) => {
    setDetailContact(c)
    setEditMode(false)
    setDeleteConfirm(false)
    setEditForm({
      name: c.name,
      company: c.company ?? '',
      category: c.category,
      phone: c.phone ?? '',
      email: c.email ?? '',
      notes: c.notes ?? '',
    })
    setLinkPropertyIds(new Set())
    setLinkPortfolioIds(new Set())
    try {
      const links = await contactQueries.getLinks(c.id)
      setLinkPropertyIds(new Set(links.filter((l) => l.property_id).map((l) => l.property_id)))
      setLinkPortfolioIds(new Set(links.filter((l) => l.portfolio_id).map((l) => l.portfolio_id)))
    } catch (e) { console.error(e) }
  }

  const enterEditMode = () => {
    if (!detailContact) return
    setEditMode(true)
    setDeleteConfirm(false)
    setEditForm({
      name: detailContact.name,
      company: detailContact.company ?? '',
      category: detailContact.category,
      phone: detailContact.phone ?? '',
      email: detailContact.email ?? '',
      notes: detailContact.notes ?? '',
    })
  }

  const handleSaveEdit = async () => {
    if (!detailContact || !editForm.name.trim()) return
    setEditSaving(true)
    try {
      const updated = await contactQueries.update(detailContact.id, {
        name: editForm.name.trim(),
        company: editForm.company.trim() || null,
        category: editForm.category,
        phone: editForm.phone.trim() || null,
        email: editForm.email.trim() || null,
        notes: editForm.notes.trim() || null,
      })
      await contactQueries.replaceLinks(detailContact.id, user!.id, [...linkPropertyIds], [...linkPortfolioIds])
      queryClient.setQueryData(QK.contacts(user!.id), (old: Contact[] = []) =>
        old.map(c => c.id === updated.id ? updated : c).sort((a, b) => a.name.localeCompare(b.name))
      )
      setDetailContact(updated)
      setEditMode(false)
    } catch (e) { console.error(e) }
    finally { setEditSaving(false) }
  }

  const handleDelete = async () => {
    if (!detailContact) return
    try {
      await contactQueries.delete(detailContact.id)
      queryClient.setQueryData(QK.contacts(user!.id), (old: Contact[] = []) =>
        old.filter(c => c.id !== detailContact.id)
      )
      setDetailContact(null)
    } catch (e) { console.error(e) }
  }

  const contactColumns: DataTableColumn<any>[] = [
    {
      key: 'name', header: 'Naam', sortable: true, width: 'minmax(0,2fr)',
      render: (c) => (
        <div className="flex items-center gap-3 min-w-0">
          <PersonAvatar />
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-[#1a1c18] dark:text-white truncate leading-tight">{c.name}</p>
            {c.company && (
              <p className="text-[12.5px] text-[#97978f] dark:text-[#97978f] truncate leading-tight mt-0.5">{c.company}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category', header: 'Categorie', sortable: true, width: 'minmax(0,1fr)',
      render: (c) => (
        <Badge className={cn('text-[12.5px] font-medium rounded-full border-0', CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS.overig)}>
          {CATEGORIES.find((cat) => cat.value === c.category)?.label ?? c.category}
        </Badge>
      ),
    },
    {
      key: 'phone', header: 'Telefoon', width: 'minmax(0,1.2fr)',
      render: (c) => c.phone ? (
        <a href={`tel:${c.phone}`} onClick={(e) => e.stopPropagation()} className="inline-block max-w-full text-[12.5px] text-[#55554e] dark:text-gray-300 truncate hover:text-[#161f13] dark:hover:text-[#94f477] hover:underline transition-colors">{c.phone}</a>
      ) : <span className="text-[12.5px] text-[#97978f] dark:text-[#55554e]">—</span>,
    },
    {
      key: 'email', header: 'E-mail', width: 'minmax(0,1.6fr)',
      render: (c) => c.email ? (
        <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="inline-block max-w-full text-[12.5px] text-[#55554e] dark:text-gray-300 truncate hover:text-[#161f13] dark:hover:text-[#94f477] hover:underline transition-colors">{c.email}</a>
      ) : <span className="text-[12.5px] text-[#97978f] dark:text-[#55554e]">—</span>,
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-8">
        <TableToolbar
          title="Contactboek"
          count={`${filtered.length} van ${contacts.length} contact${contacts.length === 1 ? '' : 'en'}`}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Zoek op naam, bedrijf, telefoon…"
          filterContent={filterContent}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAdd={openAdd}
          addLabel="Contact toevoegen"
        />

        {/* Lijst / raster */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#97978f]">
          <BookUser className="h-10 w-10" />
          <p className="text-sm font-medium">
            {contacts.length === 0 ? 'Nog geen contacten toegevoegd.' : 'Geen contacten gevonden.'}
          </p>
          {contacts.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={openAdd}
              className="rounded-full mt-1"
            >
              Eerste contact toevoegen
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFiltered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => openDetail(c)}
              className="group rounded-2xl border border-[#e3e3de] dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-3 hover:border-gray-300 hover:shadow-sm transition-all text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[#1a1c18] dark:text-white truncate">{c.name}</p>
                  {c.company && (
                    <p className="text-xs text-[#97978f] truncate mt-0.5">{c.company}</p>
                  )}
                </div>
                <Badge className={cn('shrink-0 text-xs font-medium rounded-full border-0', CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS.overig)}>
                  {CATEGORIES.find((cat) => cat.value === c.category)?.label ?? c.category}
                </Badge>
              </div>
              <div className="flex flex-col gap-1.5">
                {c.phone && (
                  <p className="flex items-center gap-2 text-sm text-[#55554e] dark:text-neutral-300">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.phone}</span>
                  </p>
                )}
                {c.email && (
                  <p className="flex items-center gap-2 text-sm text-[#55554e] dark:text-neutral-300">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </p>
                )}
              </div>
              {c.notes && (
                <p className="text-xs text-[#97978f] leading-5 line-clamp-2">{c.notes}</p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <DataTable
          rows={sortedFiltered}
          columns={contactColumns}
          getRowId={(c) => c.id}
          sort={sort}
          onSort={toggleSort}
          onRowClick={(c) => openDetail(c)}
          rowActions={(c) => [
            { label: 'Bewerken', icon: Pencil, onClick: async () => { await openDetail(c); setEditMode(true) } },
            { label: 'Verwijderen', icon: Trash2, danger: true, onClick: async () => { await openDetail(c); setDeleteConfirm(true) } },
          ]}
          empty="Geen contacten gevonden."
        />
      )}

      {/* ── TOEVOEGEN — CreateDialogShell (popup) ── */}
      <CreateDialogShell
        open={addOpen}
        onOpenChange={open => { if (!open) setAddOpen(false) }}
        title="Contact toevoegen"
        primaryLabel="Toevoegen"
        onPrimary={handleAdd}
        primaryDisabled={addSaving || !addForm.name.trim()}
        primaryLoading={addSaving}
      >
        <DialogField label="Naam" required>
          <Input className="rounded-xl" placeholder="Jan de Vries" value={addForm.name}
            onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
        </DialogField>
        <div className="grid grid-cols-2 gap-3">
          <DialogField label="Bedrijfsnaam" optional>
            <Input className="rounded-xl" placeholder="De Vries Installaties" value={addForm.company}
              onChange={e => setAddForm(f => ({ ...f, company: e.target.value }))} />
          </DialogField>
          <DialogField label="Categorie">
            <Select value={addForm.category} onValueChange={v => setAddForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter(c => c.value !== 'alle').map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DialogField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DialogField label="Telefoon" optional>
            <Input className="rounded-xl" placeholder="+31 6 12345678" value={addForm.phone}
              onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} />
          </DialogField>
          <DialogField label="E-mail" optional>
            <Input className="rounded-xl" type="email" placeholder="jan@devries.nl" value={addForm.email}
              onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} />
          </DialogField>
        </div>
        <DialogField label="Notities" optional>
          <Textarea className="rounded-xl resize-none" rows={3} placeholder="Bijv. goede loodgieter, werkt snel..."
            value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} />
        </DialogField>
        <LinkSelectors
          properties={properties as any[]}
          portfolios={portfolios as any[]}
          propertyIds={linkPropertyIds}
          portfolioIds={linkPortfolioIds}
          onToggleProperty={toggleLinkProperty}
          onTogglePortfolio={toggleLinkPortfolio}
        />
      </CreateDialogShell>

      {/* ── BEKIJKEN — DetailShell (slide-out, read-only by default) ── */}
      <DetailShell
        open={!!detailContact}
        onClose={() => { setDetailContact(null); setEditMode(false); setDeleteConfirm(false) }}
        title={detailContact?.name ?? ''}
        subtitle={detailContact ? (CATEGORIES.find(c => c.value === detailContact.category)?.label ?? detailContact.category) : undefined}
        headerLeft={
          <PersonAvatar />
        }
        footer={
          deleteConfirm ? (
            <div className="border-t border-[#e3e3de] dark:border-neutral-800 p-4 flex flex-col gap-3">
              <p className="text-sm text-[#55554e] dark:text-neutral-300 font-medium">Contact verwijderen?</p>
              <p className="text-xs text-[#97978f]">Dit kan niet ongedaan worden gemaakt.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setDeleteConfirm(false)}
                  className="flex-1 text-sm text-[#97978f] hover:text-[#1a1c18] transition-colors py-2">
                  Annuleren
                </button>
                <button type="button" onClick={handleDelete}
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 transition-colors">
                  Verwijderen
                </button>
              </div>
            </div>
          ) : editMode ? (
            <div className="border-t border-[#e3e3de] dark:border-neutral-800 p-4 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setEditMode(false)}
                className="text-sm text-[#97978f] hover:text-[#1a1c18] dark:text-[#97978f] dark:hover:text-gray-200 transition-colors px-1 py-1">
                Annuleren
              </button>
              <button type="button" onClick={handleSaveEdit} disabled={editSaving || !editForm.name.trim()}
                className="inline-flex items-center justify-center rounded-full bg-[#94f477] hover:bg-[#8AD45F] disabled:opacity-50 text-[#161f13] text-sm font-semibold px-5 py-2 transition-colors">
                {editSaving ? 'Opslaan…' : 'Opslaan'}
              </button>
            </div>
          ) : (
            <div className="border-t border-[#e3e3de] dark:border-neutral-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button type="button" onClick={enterEditMode}
                  className="inline-flex items-center gap-1.5 text-sm text-[#97978f] dark:text-[#97978f] hover:text-[#1a1c18] dark:hover:text-gray-200 transition-colors px-2 py-1 rounded-lg hover:bg-[#f4f4f1] dark:hover:bg-neutral-800">
                  <Pencil className="h-4 w-4" />
                  Bewerken
                </button>
                <button type="button" onClick={() => setDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-[#97978f] dark:text-[#97978f] hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10">
                  <Trash2 className="h-4 w-4" />
                  Verwijderen
                </button>
              </div>
              <button type="button" onClick={() => setDetailContact(null)}
                className="text-sm text-[#97978f] hover:text-[#1a1c18] dark:text-[#97978f] dark:hover:text-gray-200 transition-colors px-1 py-1">
                Sluiten
              </button>
            </div>
          )
        }
      >
        {detailContact && (
          editMode ? (
            /* ── Bewerken ── */
            <div className="px-6 py-5 space-y-4">
              <DialogField label="Naam" required>
                <Input className="rounded-xl" value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </DialogField>
              <div className="grid grid-cols-2 gap-3">
                <DialogField label="Bedrijfsnaam" optional>
                  <Input className="rounded-xl" value={editForm.company}
                    onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} />
                </DialogField>
                <DialogField label="Categorie">
                  <Select value={editForm.category} onValueChange={v => setEditForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.value !== 'alle').map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DialogField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DialogField label="Telefoon" optional>
                  <Input className="rounded-xl" value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                </DialogField>
                <DialogField label="E-mail" optional>
                  <Input className="rounded-xl" type="email" value={editForm.email}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </DialogField>
              </div>
              <DialogField label="Notities" optional>
                <Textarea className="rounded-xl resize-none" rows={3} value={editForm.notes}
                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
              </DialogField>

              <LinkSelectors
                properties={properties as any[]}
                portfolios={portfolios as any[]}
                propertyIds={linkPropertyIds}
                portfolioIds={linkPortfolioIds}
                onToggleProperty={toggleLinkProperty}
                onTogglePortfolio={toggleLinkPortfolio}
              />
            </div>
          ) : (
            /* ── Read-only weergave ── */
            <div className="px-6 py-5 space-y-5">
              {/* Categorie badge */}
              <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-medium', CATEGORY_COLORS[detailContact.category] ?? CATEGORY_COLORS.overig)}>
                {CATEGORIES.find(c => c.value === detailContact.category)?.label ?? detailContact.category}
              </span>

              {/* Contactgegevens */}
              <div className="space-y-3">
                {detailContact.company && (
                  <div className="flex items-center gap-3 text-sm text-[#55554e] dark:text-neutral-300">
                    <Building2 className="h-4 w-4 text-[#97978f] shrink-0" />
                    {detailContact.company}
                  </div>
                )}
                {detailContact.phone && (
                  <a href={`tel:${detailContact.phone}`}
                    className="flex items-center gap-3 text-sm text-[#55554e] dark:text-neutral-300 hover:text-[#161f13] dark:hover:text-[#94f477] transition-colors">
                    <Phone className="h-4 w-4 text-[#97978f] shrink-0" />
                    {detailContact.phone}
                  </a>
                )}
                {detailContact.email && (
                  <a href={`mailto:${detailContact.email}`}
                    className="flex items-center gap-3 text-sm text-[#55554e] dark:text-neutral-300 hover:text-[#161f13] dark:hover:text-[#94f477] transition-colors">
                    <Mail className="h-4 w-4 text-[#97978f] shrink-0" />
                    {detailContact.email}
                  </a>
                )}
              </div>

              {/* Gekoppeld aan */}
              {(linkPropertyIds.size > 0 || linkPortfolioIds.size > 0) && (
                <div>
                  <p className="text-xs font-medium text-[#97978f] dark:text-neutral-500 uppercase tracking-wide mb-2">Gekoppeld aan</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...linkPropertyIds].map((id) => {
                      const p = (properties as any[]).find((x) => x.id === id)
                      return (
                        <span key={`p-${id}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 px-2.5 py-1 text-xs text-[#55554e] dark:text-gray-300">
                          <Building2 className="h-3 w-3 text-[#97978f] shrink-0" />
                          {p?.name || p?.address || 'Pand'}
                        </span>
                      )
                    })}
                    {[...linkPortfolioIds].map((id) => {
                      const pf = (portfolios as any[]).find((x) => x.id === id)
                      return (
                        <span key={`pf-${id}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 px-2.5 py-1 text-xs text-[#55554e] dark:text-gray-300">
                          <Layers className="h-3 w-3 text-[#97978f] shrink-0" />
                          {pf?.name || 'Portefeuille'}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Notities */}
              {detailContact.notes && (
                <div>
                  <p className="text-xs font-medium text-[#97978f] dark:text-neutral-500 uppercase tracking-wide mb-2">Notities</p>
                  <p className="text-sm text-[#55554e] dark:text-neutral-300 leading-relaxed">{detailContact.notes}</p>
                </div>
              )}
            </div>
          )
        )}
      </DetailShell>
      </div>
    </>
  )
}

function LinkSelectors({
  properties,
  portfolios,
  propertyIds,
  portfolioIds,
  onToggleProperty,
  onTogglePortfolio,
}: {
  properties: any[]
  portfolios: any[]
  propertyIds: Set<string>
  portfolioIds: Set<string>
  onToggleProperty: (id: string) => void
  onTogglePortfolio: (id: string) => void
}) {
  return (
    <>
      <div>
        <p className="text-xs font-medium text-[#55554e] dark:text-[#97978f] mb-1.5">Koppel aan panden</p>
        {properties.length === 0 ? (
          <p className="text-xs text-[#97978f]">Nog geen panden in je portefeuille.</p>
        ) : (
          <div className="max-h-40 overflow-y-auto rounded-xl border border-[#e3e3de] dark:border-neutral-700 divide-y divide-gray-100 dark:divide-neutral-800">
            {properties.map((p) => {
              const sel = propertyIds.has(p.id)
              return (
                <button key={p.id} type="button" onClick={() => onToggleProperty(p.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#f4f4f1] dark:hover:bg-neutral-800 transition-colors">
                  <span className={cn('h-4 w-4 rounded border flex items-center justify-center shrink-0', sel ? 'bg-[#161f13] border-[#161f13] dark:bg-[#94f477] dark:border-[#94f477]' : 'border-gray-300 dark:border-neutral-600')}>
                    {sel && <Check className="h-3 w-3 text-white dark:text-[#161f13]" />}
                  </span>
                  <Building2 className="h-3.5 w-3.5 text-[#97978f] shrink-0" />
                  <span className="text-sm text-[#55554e] dark:text-gray-300 truncate">{p.name || p.address || 'Pand'}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-[#55554e] dark:text-[#97978f] mb-1.5">Koppel aan portefeuilles</p>
        {portfolios.length === 0 ? (
          <p className="text-xs text-[#97978f]">Nog geen portefeuilles.</p>
        ) : (
          <div className="max-h-40 overflow-y-auto rounded-xl border border-[#e3e3de] dark:border-neutral-700 divide-y divide-gray-100 dark:divide-neutral-800">
            {portfolios.map((pf) => {
              const sel = portfolioIds.has(pf.id)
              return (
                <button key={pf.id} type="button" onClick={() => onTogglePortfolio(pf.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#f4f4f1] dark:hover:bg-neutral-800 transition-colors">
                  <span className={cn('h-4 w-4 rounded border flex items-center justify-center shrink-0', sel ? 'bg-[#161f13] border-[#161f13] dark:bg-[#94f477] dark:border-[#94f477]' : 'border-gray-300 dark:border-neutral-600')}>
                    {sel && <Check className="h-3 w-3 text-white dark:text-[#161f13]" />}
                  </span>
                  <Layers className="h-3.5 w-3.5 text-[#97978f] shrink-0" />
                  <span className="text-sm text-[#55554e] dark:text-gray-300 truncate">{pf.name || 'Portefeuille'}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
