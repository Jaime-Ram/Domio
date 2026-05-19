'use client'

import { useRef, useState } from 'react'
import { Search, Filter, Grid3x3, Table2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AppDropdownContent } from '@/components/ui/app-dropdown'
import { cn } from '@/lib/utils'
import { DASHBOARD_FILTER_MENU_CONTENT_CLASS } from '@/app/dashboard/landlord/dashboard-ui'

interface TableToolbarProps {
  // Left side
  title?: string
  count?: string | number
  // Search
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  // Filter — pass DropdownMenuLabel / DropdownMenuCheckboxItem nodes as children
  filterContent?: React.ReactNode
  // View toggle
  viewMode?: 'table' | 'grid'
  onViewModeChange?: (v: 'table' | 'grid') => void
  // Add button
  onAdd?: () => void
  addLabel?: string
  addDisabled?: boolean
  secondaryAction?: { label: string; onClick: () => void }
  // Slot for extra controls rendered before the icons
  extra?: React.ReactNode
  className?: string
}

export function TableToolbar({
  title,
  count,
  search,
  onSearchChange,
  searchPlaceholder = 'Zoeken…',
  filterContent,
  viewMode,
  onViewModeChange,
  onAdd,
  addLabel = 'Nieuw',
  addDisabled,
  secondaryAction,
  extra,
  className,
}: TableToolbarProps) {
  const [searchExpanded, setSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const hasLeft = title || count !== undefined

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      {hasLeft && (
        <div>
          {title && (
            <p className="text-lg font-semibold text-[#163300] dark:text-[#9FE870]">{title}</p>
          )}
          {count !== undefined && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{count}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0">
        {extra}

        {/* Search — icon, expands left */}
        {onSearchChange !== undefined && (
          <div className="flex flex-row-reverse items-center">
            <button
              type="button"
              onClick={() => { setSearchExpanded(true); setTimeout(() => searchInputRef.current?.focus(), 0) }}
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors shrink-0',
                search && 'text-[#163300] dark:text-[#9FE870]',
              )}
            >
              <Search className="h-4 w-4" />
            </button>
            <div className={cn(
              'overflow-hidden transition-all duration-200 ease-out',
              searchExpanded ? 'max-w-[160px] opacity-100 mr-1' : 'max-w-0 opacity-0 pointer-events-none',
            )}>
              <input
                ref={searchInputRef}
                value={search ?? ''}
                onChange={e => onSearchChange(e.target.value)}
                onBlur={() => { if (!search) setSearchExpanded(false) }}
                onKeyDown={e => { if (e.key === 'Escape') { onSearchChange(''); setSearchExpanded(false) } }}
                placeholder={searchPlaceholder}
                className="pl-3 pr-3 h-8 w-40 rounded-full text-xs bg-gray-100 dark:bg-neutral-800 border-0 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40 text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
              />
            </div>
          </div>
        )}

        {/* Filter — icon only */}
        {filterContent && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                suppressHydrationWarning
                className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Filter className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <AppDropdownContent align="end" className={cn(DASHBOARD_FILTER_MENU_CONTENT_CLASS, 'max-h-[min(70vh,480px)] overflow-y-auto')}>
              {filterContent}
            </AppDropdownContent>
          </DropdownMenu>
        )}

        {/* View toggle — icon only */}
        {viewMode !== undefined && onViewModeChange && (
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => onViewModeChange(viewMode === 'table' ? 'grid' : 'table')}
            aria-label={viewMode === 'table' ? 'Toon als raster' : 'Toon als lijst'}
            className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {viewMode === 'table' ? <Grid3x3 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
          </button>
        )}

        {secondaryAction && (
          <Button
            type="button"
            onClick={secondaryAction.onClick}
            variant="outline"
            className="rounded-full px-4 sm:px-5 h-9 text-sm font-medium gap-2 shrink-0 ml-1"
          >
            {secondaryAction.label}
          </Button>
        )}

        {/* Add button */}
        {onAdd && (
          <Button
            type="button"
            onClick={onAdd}
            disabled={addDisabled}
            className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium gap-2 shrink-0 ml-1"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
