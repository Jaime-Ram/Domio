'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

export interface TransactionCategory {
  id: string
  label: string
}

export const DEFAULT_CATEGORIES: TransactionCategory[] = [
  { id: 'huur', label: 'Huur' },
  { id: 'onderhoud', label: 'Onderhoud' },
  { id: 'verzekering', label: 'Verzekering' },
  { id: 'belasting', label: 'Belasting' },
  { id: 'energie', label: 'Energie' },
  { id: 'vve', label: 'VvE' },
  { id: 'hypotheek', label: 'Hypotheek' },
  { id: 'beheer', label: 'Beheer' },
  { id: 'prive', label: 'Privé' },
  { id: 'overig', label: 'Overig' },
]

export function useTransactionCategories() {
  const { user } = useDashboardUser()
  const [categories, setCategories] = useState<TransactionCategory[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user?.id) return
    const { data } = await supabase
      .from('profiles')
      .select('transaction_categories')
      .eq('id', user.id)
      .single()
    const cats = (data as any)?.transaction_categories as TransactionCategory[] | null
    setCategories(cats && cats.length > 0 ? cats : DEFAULT_CATEGORIES)
    setLoading(false)
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const persist = useCallback(async (cats: TransactionCategory[]) => {
    if (!user?.id) return
    setCategories(cats)
    await (supabase as any)
      .from('profiles')
      .update({ transaction_categories: cats })
      .eq('id', user.id)
  }, [user?.id])

  const addCategory = useCallback(async (label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return
    const base = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
    const id = categories.some(c => c.id === base) ? `${base}_${Date.now()}` : base
    await persist([...categories, { id, label: trimmed }])
  }, [categories, persist])

  const deleteCategory = useCallback(async (id: string) => {
    await persist(categories.filter(c => c.id !== id))
  }, [categories, persist])

  const renameCategory = useCallback(async (id: string, label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return
    await persist(categories.map(c => c.id === id ? { ...c, label: trimmed } : c))
  }, [categories, persist])

  const moveCategory = useCallback(async (id: string, direction: 'up' | 'down') => {
    const idx = categories.findIndex(c => c.id === id)
    if (idx < 0) return
    const next = direction === 'up' ? idx - 1 : idx + 1
    if (next < 0 || next >= categories.length) return
    const updated = [...categories]
    ;[updated[idx], updated[next]] = [updated[next], updated[idx]]
    await persist(updated)
  }, [categories, persist])

  return { categories, loading, addCategory, deleteCategory, renameCategory, moveCategory }
}
