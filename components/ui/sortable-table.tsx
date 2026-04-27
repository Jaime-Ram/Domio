'use client'

import { useState } from 'react'
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDir = 'asc' | 'desc' | null

export interface SortState<K extends string> {
  key: K | null
  dir: SortDir
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSortable<K extends string>(initialKey?: K, initialDir: 'asc' | 'desc' = 'asc') {
  const [sort, setSort] = useState<SortState<K>>({
    key: initialKey ?? null,
    dir: initialKey ? initialDir : null,
  })

  const toggleSort = (key: K) => {
    setSort((prev) => {
      if (prev.key !== key || prev.dir === null) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return { key: null, dir: null }
    })
  }

  return { sort, toggleSort }
}

// ─── Sort utility ─────────────────────────────────────────────────────────────

export function applySortedRows<T>(
  data: T[],
  sort: SortState<string>,
  getValue: (item: T, key: string) => string | number | null | undefined,
): T[] {
  if (!sort.key || !sort.dir) return data
  const dir = sort.dir === 'asc' ? 1 : -1
  return [...data].sort((a, b) => {
    const va = getValue(a, sort.key!) ?? ''
    const vb = getValue(b, sort.key!) ?? ''
    if (typeof va === 'number' && typeof vb === 'number') return dir * (va - vb)
    return dir * String(va).localeCompare(String(vb), 'nl', { sensitivity: 'base' })
  })
}

// ─── SortableHeader ───────────────────────────────────────────────────────────

interface SortableHeaderProps {
  label: string
  sortKey: string
  sort: SortState<string>
  onSort: (key: string) => void
  className?: string
}

export function SortableHeader({ label, sortKey, sort, onSort, className }: SortableHeaderProps) {
  const isActive = sort.key === sortKey && sort.dir !== null

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium transition-colors text-left',
        isActive
          ? 'text-gray-700 dark:text-gray-200'
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
        className,
      )}
    >
      {label}
      {isActive ? (
        sort.dir === 'asc'
          ? <ChevronUp className="h-3 w-3 text-[#163300] dark:text-[#9FE870] shrink-0" />
          : <ChevronDown className="h-3 w-3 text-[#163300] dark:text-[#9FE870] shrink-0" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-40" />
      )}
    </button>
  )
}
