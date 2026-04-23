'use client'

import { useState, useEffect } from 'react'
import {
  X, Search, Building2, Home, User, Check, Loader2,
  Wrench, Shield, Landmark, Zap, Building, Briefcase, UserX, MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  value_date: string | null
  amount: number
  currency: string
  counterparty_name: string | null
  counterparty_iban: string | null
  description: string | null
}

interface PropertyHierarchy {
  id: string
  name: string
  address: string
  city: string
  units: {
    id: string
    unit_number: string
    leases: {
      id: string
      tenant_id: string | null
      tenant_name: string | null
      monthly_rent: number
      status: string
    }[]
  }[]
}

interface ExistingAssignment {
  property_id: string | null
  unit_id: string | null
  tenant_id: string | null
  lease_id: string | null
  category: string | null
}

interface AssignDrawerProps {
  transaction: Transaction | null
  properties: PropertyHierarchy[]
  open: boolean
  onClose: () => void
  onAssigned: () => void
  existingAssignment?: ExistingAssignment
}

type DrawerTab = 'rent' | 'category'

const CATEGORIES = [
  { key: 'onderhoud', label: 'Onderhoud', icon: Wrench },
  { key: 'verzekering', label: 'Verzekering', icon: Shield },
  { key: 'belasting', label: 'Belasting', icon: Landmark },
  { key: 'energie', label: 'Energie', icon: Zap },
  { key: 'vve', label: 'VvE', icon: Building },
  { key: 'hypotheek', label: 'Hypotheek', icon: Home },
  { key: 'beheer', label: 'Beheer', icon: Briefcase },
  { key: 'prive', label: 'Privé', icon: UserX },
  { key: 'overig', label: 'Overig', icon: MoreHorizontal },
] as const

export function AssignDrawer({
  transaction,
  properties,
  open,
  onClose,
  onAssigned,
  existingAssignment,
}: AssignDrawerProps) {
  const isEdit = !!existingAssignment
  const [tab, setTab] = useState<DrawerTab>('rent')
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedRent, setSelectedRent] = useState<{
    property_id: string
    unit_id: string
    tenant_id: string | null
    lease_id: string
  } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCategoryProperty, setSelectedCategoryProperty] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      setSubmitting(false)

      if (existingAssignment?.category && existingAssignment.category !== 'huur') {
        setTab('category')
        setSelectedCategory(existingAssignment.category)
        setSelectedCategoryProperty(existingAssignment.property_id)
        setSelectedRent(null)
      } else if (existingAssignment?.lease_id && existingAssignment?.unit_id && existingAssignment?.property_id) {
        setTab('rent')
        setSelectedRent({
          property_id: existingAssignment.property_id,
          unit_id: existingAssignment.unit_id,
          tenant_id: existingAssignment.tenant_id,
          lease_id: existingAssignment.lease_id,
        })
        setSelectedCategory(null)
        setSelectedCategoryProperty(null)
      } else {
        setTab('rent')
        setSelectedRent(null)
        setSelectedCategory(null)
        setSelectedCategoryProperty(null)
      }
    }
  }, [open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open || !transaction) return null

  const q = search.toLowerCase()
  const filtered = properties
    .map((p) => ({
      ...p,
      units: p.units
        .map((u) => ({
          ...u,
          leases: u.leases.filter((l) => l.status === 'actief'),
        }))
        .filter((u) => u.leases.length > 0),
    }))
    .filter((p) => {
      if (!q) return p.units.length > 0
      const propMatch =
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      const unitMatch = p.units.some(
        (u) =>
          u.unit_number.toLowerCase().includes(q) ||
          u.leases.some((l) => l.tenant_name?.toLowerCase().includes(q))
      )
      return (propMatch || unitMatch) && p.units.length > 0
    })

  const canSubmit =
    tab === 'rent' ? !!selectedRent : !!selectedCategory

  const handleAssign = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const body =
        tab === 'rent'
          ? { ...selectedRent, category: 'huur' }
          : {
              property_id: selectedCategoryProperty,
              unit_id: null,
              tenant_id: null,
              lease_id: null,
              category: selectedCategory,
            }

      const res = await fetch(
        `/api/finance/transactions/${transaction.id}/assign`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )
      if (res.ok) {
        onAssigned()
        onClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-neutral-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-[#163300] dark:text-[#9FE870]">
            {isEdit ? 'Toewijzing wijzigen' : 'Transactie toewijzen'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Transaction details */}
        <div className="px-6 py-4 border-b dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Datum</span>
              <p className="font-medium">{formatDate(transaction.value_date)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bedrag</span>
              <p className="font-semibold text-base">
                {formatAmount(transaction.amount)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Afzender</span>
              <p className="font-medium">{transaction.counterparty_name || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">IBAN</span>
              <p className="font-mono text-xs">{transaction.counterparty_iban || '—'}</p>
            </div>
            {transaction.description && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Omschrijving</span>
                <p className="font-medium">{transaction.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="relative flex text-sm border-b border-gray-200 dark:border-neutral-700 px-6">
          <button
            type="button"
            onClick={() => setTab('rent')}
            className={cn(
              'pb-2.5 pt-3 mr-6 whitespace-nowrap transition-colors duration-200 font-semibold',
              tab === 'rent'
                ? 'text-[#163300] dark:text-[#9FE870]'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            Huurkoppeling
          </button>
          <button
            type="button"
            onClick={() => setTab('category')}
            className={cn(
              'pb-2.5 pt-3 whitespace-nowrap transition-colors duration-200 font-semibold',
              tab === 'category'
                ? 'text-[#163300] dark:text-[#9FE870]'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            Categoriseren
          </button>
        </div>

        {/* Tab content */}
        {tab === 'rent' ? (
          <>
            {/* Search */}
            <div className="px-6 py-3 border-b dark:border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek op pand, eenheid of huurder..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Property list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Geen resultaten gevonden
                </p>
              )}
              {filtered.map((property) => (
                <div
                  key={property.id}
                  className="rounded-lg border dark:border-neutral-700 overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/50">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm">{property.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {property.address}, {property.city}
                    </span>
                  </div>

                  {property.units.map((unit) =>
                    unit.leases.map((lease) => {
                      const isSelected =
                        selectedRent?.lease_id === lease.id &&
                        selectedRent?.unit_id === unit.id
                      return (
                        <button
                          key={`${unit.id}-${lease.id}`}
                          onClick={() =>
                            setSelectedRent(
                              isSelected
                                ? null
                                : {
                                    property_id: property.id,
                                    unit_id: unit.id,
                                    tenant_id: lease.tenant_id,
                                    lease_id: lease.id,
                                  }
                            )
                          }
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-t dark:border-neutral-700',
                            isSelected
                              ? 'bg-green-50 dark:bg-green-900/20'
                              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                          )}
                        >
                          <Home className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium w-16 shrink-0">
                            {unit.unit_number}
                          </span>
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm flex-1 truncate">
                            {lease.tenant_name || 'Onbekend'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatAmount(lease.monthly_rent)}/mnd
                          </span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-green-600 shrink-0" />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {/* Category grid */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Categorie
              </p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = selectedCategory === cat.key
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(isSelected ? null : cat.key)
                      }
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm transition-colors',
                        isSelected
                          ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                          : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium text-xs">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Optional property picker */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Pand (optioneel)
              </p>
              <div className="space-y-1.5">
                {properties.map((p) => {
                  const isSelected = selectedCategoryProperty === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategoryProperty(isSelected ? null : p.id)
                      }
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors',
                        isSelected
                          ? 'border-[#163300] bg-[#163300]/5 dark:border-[#9FE870] dark:bg-[#9FE870]/10'
                          : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                      )}
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium flex-1">{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.address}, {p.city}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-neutral-800 flex items-center gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuleren
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!canSubmit || submitting}
            className="flex-1"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isEdit ? 'Opslaan' : 'Toewijzen'}
          </Button>
        </div>
      </div>
    </>
  )
}
