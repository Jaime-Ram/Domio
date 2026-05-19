import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * DataTable — herbruikbare grid-gebaseerde tabel voor het dashboard.
 *
 * Gebruik:
 *   const COLS = 'grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]'
 *
 *   <DataTable>
 *     <DataTableHeader cols={COLS}>
 *       <DataTableHeadCell>Naam</DataTableHeadCell>
 *       <DataTableHeadCell>Status</DataTableHeadCell>
 *       <span />
 *     </DataTableHeader>
 *     <DataTableBody>
 *       {rows.length === 0 ? (
 *         <DataTableEmpty>Geen resultaten.</DataTableEmpty>
 *       ) : rows.map(r => (
 *         <DataTableRow key={r.id} cols={COLS} onClick={() => open(r)}>
 *           <p>{r.name}</p>
 *           <Badge>{r.status}</Badge>
 *           <ChevronRight className="h-4 w-4 text-gray-400 justify-self-end" />
 *         </DataTableRow>
 *       ))}
 *     </DataTableBody>
 *   </DataTable>
 */

export function DataTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden', className)}>
      {children}
    </div>
  )
}

export function DataTableHeader({
  cols,
  children,
  className,
}: {
  cols: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid items-center gap-4 mx-1 px-3 pb-2 border-b border-gray-100 dark:border-neutral-800',
        cols,
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-neutral-800">
      {children}
    </div>
  )
}

export function DataTableRow({
  cols,
  onClick,
  children,
  className,
}: {
  cols: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'grid items-center gap-4 mx-1 px-3 py-3.5',
        'hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors rounded-xl',
        onClick && 'cursor-pointer',
        cols,
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DataTableHeadCell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={cn('text-sm font-medium text-gray-400 dark:text-gray-500', className)}>
      {children}
    </span>
  )
}

export function DataTableEmpty({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('py-16 text-center text-sm text-gray-400 dark:text-gray-500', className)}>
      {children}
    </div>
  )
}
