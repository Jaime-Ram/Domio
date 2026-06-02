'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Phone, Mail, Pencil, Trash2, BookUser, User, Building2 } from 'lucide-react'
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
import { useContacts, useQueryClient, QK } from '@/lib/hooks/use-dashboard-queries'

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
  overig:      'bg-gray-100 text-gray-600',
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
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('alle')

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

  const filtered = useMemo(() => contacts.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? '').includes(search) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'alle' || c.category === activeCategory
    return matchSearch && matchCat
  }), [contacts, search, activeCategory])

  // ── Toevoegen ──
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
      queryClient.setQueryData(QK.contacts(user!.id), (old: Contact[] = []) =>
        [...old, created].sort((a, b) => a.name.localeCompare(b.name))
      )
      setAddOpen(false)
      setAddForm(EMPTY_FORM)
    } catch (e) { console.error(e) }
    finally { setAddSaving(false) }
  }

  // ── Bekijken/bewerken ──
  const openDetail = (c: Contact) => {
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

  return (
    <div className="flex flex-col gap-6 pt-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Contactboek</h1>
          <p className="mt-1 text-sm text-gray-500">Loodgieters, aannemers en andere vaste contacten.</p>
        </div>
        <Button
          onClick={() => { setAddForm(EMPTY_FORM); setAddOpen(true) }}
          className="bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 rounded-full gap-2 font-semibold"
        >
          <Plus className="h-4 w-4" />
          Contact toevoegen
        </Button>
      </div>

      {/* Zoek + categorie filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Zoek op naam, bedrijf, telefoon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
                activeCategory === cat.value
                  ? 'bg-[#163300] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <BookUser className="h-10 w-10" />
          <p className="text-sm font-medium">
            {contacts.length === 0 ? 'Nog geen contacten toegevoegd.' : 'Geen contacten gevonden.'}
          </p>
          {contacts.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setAddForm(EMPTY_FORM); setAddOpen(true) }}
              className="rounded-full mt-1"
            >
              Eerste contact toevoegen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => openDetail(c)}
              className="group rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-3 hover:border-gray-300 hover:shadow-sm transition-all text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                  {c.company && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{c.company}</p>
                  )}
                </div>
                <Badge className={cn('shrink-0 text-xs font-medium rounded-full border-0', CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS.overig)}>
                  {CATEGORIES.find((cat) => cat.value === c.category)?.label ?? c.category}
                </Badge>
              </div>
              <div className="flex flex-col gap-1.5">
                {c.phone && (
                  <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-300">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.phone}</span>
                  </p>
                )}
                {c.email && (
                  <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-300">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </p>
                )}
              </div>
              {c.notes && (
                <p className="text-xs text-gray-400 leading-5 line-clamp-2">{c.notes}</p>
              )}
            </button>
          ))}
        </div>
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
      </CreateDialogShell>

      {/* ── BEKIJKEN — DetailShell (slide-out, read-only by default) ── */}
      <DetailShell
        open={!!detailContact}
        onClose={() => { setDetailContact(null); setEditMode(false); setDeleteConfirm(false) }}
        title={detailContact?.name ?? ''}
        subtitle={detailContact ? (CATEGORIES.find(c => c.value === detailContact.category)?.label ?? detailContact.category) : undefined}
        headerLeft={
          <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        }
        headerActions={
          !editMode && !deleteConfirm ? (
            <div className="flex items-center gap-1">
              <button type="button" onClick={enterEditMode}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-600 transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setDeleteConfirm(true)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : undefined
        }
        footer={
          deleteConfirm ? (
            <div className="border-t border-gray-100 dark:border-neutral-800 p-4 flex flex-col gap-3">
              <p className="text-sm text-gray-700 dark:text-neutral-300 font-medium">Contact verwijderen?</p>
              <p className="text-xs text-gray-500">Dit kan niet ongedaan worden gemaakt.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setDeleteConfirm(false)}
                  className="flex-1 text-sm text-gray-500 hover:text-gray-800 transition-colors py-2">
                  Annuleren
                </button>
                <button type="button" onClick={handleDelete}
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 transition-colors">
                  Verwijderen
                </button>
              </div>
            </div>
          ) : editMode ? (
            <div className="border-t border-gray-100 dark:border-neutral-800 p-4 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setEditMode(false)}
                className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1">
                Annuleren
              </button>
              <button type="button" onClick={handleSaveEdit} disabled={editSaving || !editForm.name.trim()}
                className="inline-flex items-center justify-center rounded-full bg-[#9FE870] hover:bg-[#8AD45F] disabled:opacity-50 text-[#163300] text-sm font-semibold px-5 py-2 transition-colors">
                {editSaving ? 'Opslaan…' : 'Opslaan'}
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-100 dark:border-neutral-800 p-4 flex items-center justify-end">
              <button type="button" onClick={() => setDetailContact(null)}
                className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1">
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
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-neutral-300">
                    <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                    {detailContact.company}
                  </div>
                )}
                {detailContact.phone && (
                  <a href={`tel:${detailContact.phone}`}
                    className="flex items-center gap-3 text-sm text-gray-700 dark:text-neutral-300 hover:text-[#163300] dark:hover:text-[#9FE870] transition-colors">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    {detailContact.phone}
                  </a>
                )}
                {detailContact.email && (
                  <a href={`mailto:${detailContact.email}`}
                    className="flex items-center gap-3 text-sm text-gray-700 dark:text-neutral-300 hover:text-[#163300] dark:hover:text-[#9FE870] transition-colors">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    {detailContact.email}
                  </a>
                )}
              </div>

              {/* Notities */}
              {detailContact.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-neutral-500 uppercase tracking-wide mb-2">Notities</p>
                  <p className="text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">{detailContact.notes}</p>
                </div>
              )}
            </div>
          )
        )}
      </DetailShell>
    </div>
  )
}
