'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { SortableHeader, type SortState } from '@/components/ui/sortable-table'
import { RowActionsMenu } from '@/components/ui/row-actions-menu'

/**
 * DataTable — config-gedreven tabel voor het hele dashboard.
 *
 * Eén bron voor: kolommen, sorteren, rij-klik, 3-puntjes-acties, lege staat
 * en laadstaat. Geef `columns` + `rows` mee; de cellen render je per kolom.
 *
 *   <DataTable
 *     rows={tenants}
 *     getRowId={(t) => t.id}
 *     sort={sort} onSort={toggleSort}
 *     onRowClick={open}
 *     columns={[
 *       { key: 'name', header: 'Huurder', sortable: true, width: 'minmax(0,2fr)',
 *         render: (t) => <TenantCell t={t} /> },
 *       { key: 'rent', header: 'Huurprijs', sortable: true, align: 'right',
 *         render: (t) => fmt(t.rent) },
 *     ]}
 *     rowActions={(t) => [{ label: 'Bewerken', icon: Pencil, onClick: () => edit(t) }]}
 *     empty="Nog geen huurders."
 *     loading={loading}
 *   />
 *
 * Sorteren gebeurt in de pagina (useSortable + applySortedRows); dit component
 * toont alleen de sorteer-headers en geeft kliks door via `onSort`.
 */

export type DataTableAlign = 'left' | 'right' | 'center'

export interface DataTableColumn<T> {
  /** Unieke sleutel; ook de sorteer-sleutel. */
  key: string
  header: React.ReactNode
  /** Celinhoud. Zonder render valt 'ie terug op row[key]. */
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  /** Grid-track, bv. 'minmax(0,2fr)' of 'auto'. Default 'minmax(0,1fr)'. */
  width?: string
  align?: DataTableAlign
  className?: string
  headerClassName?: string
}

export interface DataTableRowAction<T> {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: (row: T) => void
  danger?: boolean
  hidden?: (row: T) => boolean
}

interface DataTableProps<T> {
  rows: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  rowActions?: (row: T) => DataTableRowAction<T>[]
  sort?: SortState<string>
  onSort?: (key: string) => void
  empty?: React.ReactNode
  loading?: boolean
  loadingRows?: number
  className?: string
}

const alignCell: Record<DataTableAlign, string> = {
  left: '',
  right: 'justify-self-end text-right',
  center: 'justify-self-center text-center',
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  onRowClick,
  rowActions,
  sort,
  onSort,
  empty = 'Geen resultaten.',
  loading,
  loadingRows = 5,
  className,
}: DataTableProps<T>) {
  const tracks = [
    ...columns.map((c) => c.width ?? 'minmax(0,1fr)'),
    ...(rowActions ? ['2.5rem'] : []),
  ].join(' ')
  const gridStyle: React.CSSProperties = { gridTemplateColumns: tracks }

  return (
    <div className={cn('rounded-2xl', className)}>
      {/* Header */}
      <div className="grid items-center gap-4 mx-1 px-3 pb-2 border-b border-gray-100 dark:border-neutral-800" style={gridStyle}>
        {columns.map((c) =>
          c.sortable && onSort ? (
            <SortableHeader
              key={c.key}
              label={String(c.header)}
              sortKey={c.key}
              sort={sort ?? { key: null, dir: null }}
              onSort={onSort}
              className={cn(c.align === 'right' && 'justify-self-end', c.headerClassName)}
            />
          ) : (
            <span
              key={c.key}
              className={cn(
                'text-xs font-medium text-gray-500 dark:text-gray-400',
                c.align === 'right' && 'justify-self-end text-right',
                c.align === 'center' && 'justify-self-center text-center',
                c.headerClassName,
              )}
            >
              {c.header}
            </span>
          ),
        )}
        {rowActions && <span />}
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-100 dark:divide-neutral-800">
        {loading ? (
          Array.from({ length: loadingRows }).map((_, i) => (
            <div key={i} className="grid items-center gap-4 mx-1 px-3 py-3" style={gridStyle}>
              {columns.map((c) => (
                <div key={c.key} className="h-4 rounded bg-gray-100 dark:bg-neutral-800 animate-pulse" style={{ width: `${55 + ((i * 13 + c.key.length * 7) % 35)}%` }} />
              ))}
              {rowActions && <span />}
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">{empty}</div>
        ) : (
          rows.map((row) => {
            const actions = (rowActions?.(row) ?? []).filter((a) => !a.hidden?.(row))
            return (
              <div
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'grid items-center gap-4 mx-1 px-3 py-3 rounded-xl transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/40',
                )}
                style={gridStyle}
              >
                {columns.map((c) => (
                  <div key={c.key} className={cn('min-w-0', alignCell[c.align ?? 'left'], c.className)}>
                    {c.render ? c.render(row) : ((row as Record<string, React.ReactNode>)[c.key] ?? null)}
                  </div>
                ))}
                {rowActions && (
                  <div className="justify-self-end" onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu
                      actions={actions.map((a) => ({
                        label: a.label,
                        icon: a.icon,
                        onClick: () => a.onClick(row),
                        danger: a.danger,
                      }))}
                    />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
