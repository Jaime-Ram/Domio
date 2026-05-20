'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Search,
  Phone,
  Mail,
  Pencil,
  Trash2,
  BookUser,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { contactQueries } from '@/lib/supabase/queries'

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
  { value: 'alle', label: 'Alle' },
  { value: 'loodgieter', label: 'Loodgieter' },
  { value: 'aannemer', label: 'Aannemer' },
  { value: 'elektricien', label: 'Elektricien' },
  { value: 'schilder', label: 'Schilder' },
  { value: 'schoonmaak', label: 'Schoonmaak' },
  { value: 'overig', label: 'Overig' },
]

const CATEGORY_COLORS: Record<string, string> = {
  loodgieter: 'bg-blue-100 text-blue-700',
  aannemer: 'bg-orange-100 text-orange-700',
  elektricien: 'bg-yellow-100 text-yellow-700',
  schilder: 'bg-purple-100 text-purple-700',
  schoonmaak: 'bg-green-100 text-green-700',
  overig: 'bg-gray-100 text-gray-600',
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
  const { user, isDemo } = useDashboardUser()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('alle')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    contactQueries.getByOwner(user.id)
      .then(setContacts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (c.phone ?? '').includes(search) ||
        (c.email ?? '').toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategory === 'alle' || c.category === activeCategory
      return matchSearch && matchCat
    })
  }, [contacts, search, activeCategory])

  const openCreate = () => {
    setEditContact(null)
    setForm(EMPTY_FORM)
    setSheetOpen(true)
  }

  const openEdit = (c: Contact) => {
    setEditContact(c)
    setForm({
      name: c.name,
      company: c.company ?? '',
      category: c.category,
      phone: c.phone ?? '',
      email: c.email ?? '',
      notes: c.notes ?? '',
    })
    setSheetOpen(true)
  }

  const handleSave = async () => {
    if (!user || !form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        company: form.company.trim() || null,
        category: form.category,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
      }
      if (editContact) {
        const updated = await contactQueries.update(editContact.id, payload)
        setContacts((prev) => prev.map((c) => c.id === updated.id ? updated : c))
      } else {
        const created = await contactQueries.create({ ...payload, owner_id: user.id })
        setContacts((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      }
      setSheetOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await contactQueries.delete(id)
      setContacts((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      console.error(e)
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 pt-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Contactboek</h1>
          <p className="mt-1 text-sm text-gray-500">Loodgieters, aannemers en andere vaste contacten.</p>
        </div>
        <Button onClick={openCreate} className="bg-[#163300] text-white hover:bg-[#163300]/90 rounded-full gap-2">
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
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <BookUser className="h-10 w-10" />
          <p className="text-sm font-medium">
            {contacts.length === 0 ? 'Nog geen contacten toegevoegd.' : 'Geen contacten gevonden.'}
          </p>
          {contacts.length === 0 && (
            <Button variant="outline" size="sm" onClick={openCreate} className="rounded-full mt-1">
              Eerste contact toevoegen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="group rounded-2xl border border-gray-200 bg-white p-5 flex flex-col gap-3 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{c.name}</p>
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
                  <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#163300] transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.phone}</span>
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#163300] transition-colors">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </a>
                )}
              </div>

              {c.notes && (
                <p className="text-xs text-gray-400 leading-5 line-clamp-2">{c.notes}</p>
              )}

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#163300] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Bewerken
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(c.id)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Verwijderen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="relative ml-auto w-full max-w-md bg-white dark:bg-neutral-900 h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {editContact ? 'Contact bewerken' : 'Contact toevoegen'}
              </h2>
              <button type="button" onClick={() => setSheetOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">Naam *</label>
                <Input
                  placeholder="Jan de Vries"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">Bedrijfsnaam</label>
                <Input
                  placeholder="De Vries Installaties"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">Categorie</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#163300]/20"
                >
                  {CATEGORIES.filter((c) => c.value !== 'alle').map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">Telefoon</label>
                <Input
                  placeholder="+31 6 12345678"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">E-mail</label>
                <Input
                  placeholder="jan@devries.nl"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">Notities</label>
                <textarea
                  placeholder="Bijv. goede loodgieter, werkt snel..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#163300]/20"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <Button variant="outline" onClick={() => setSheetOpen(false)} className="flex-1 rounded-full">
                Annuleren
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 rounded-full bg-[#163300] text-white hover:bg-[#163300]/90"
              >
                {saving ? 'Opslaan...' : 'Opslaan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete bevestiging */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4">
            <h3 className="text-base font-semibold text-gray-900">Contact verwijderen?</h3>
            <p className="text-sm text-gray-500">Dit kan niet ongedaan worden gemaakt.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1 rounded-full">
                Annuleren
              </Button>
              <Button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                Verwijderen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
