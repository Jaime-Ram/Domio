'use client'

import { Search, Filter, Grid3x3, Table2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AppDropdownContent } from '@/components/ui/app-dropdown'
import { cn } from '@/lib/utils'
import { DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS } from '@/app/dashboard/employer/dashboard-ui'

interface TableToolbarProps {
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
  // Slot for extra controls rendered before search (e.g. "Selecteer" for bulk)
  extra?: React.ReactNode
  className?: string
}

export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Zoeken…',
  filterContent,
  viewMode,
  onViewModeChange,
  onAdd,
  addLabel = 'Nieuw',
  addDisabled,
  extra,
  className,
}: TableToolbarProps) {
  return (
    <div className={cn('flex items-center gap-3 w-full min-w-0', className)}>
      {onSearchChange !== undefined && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            type="search"
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-9 pr-3 rounded-full border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm w-64"
          />
        </div>
      )}

      <div className="flex items-center gap-3 ml-auto">
        {extra}

      {filterContent && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn('inline-flex', DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS)}
            >
              <Filter className="h-4 w-4 md:mr-1.5" />
              <span className="hidden md:inline">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <AppDropdownContent align="end">
            {filterContent}
          </AppDropdownContent>
        </DropdownMenu>
      )}

      {viewMode !== undefined && onViewModeChange && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            'hidden md:inline-flex h-9 w-9 rounded-full border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200',
            'hover:bg-[#f4f4f4] dark:hover:bg-neutral-800'
          )}
          onClick={() => onViewModeChange(viewMode === 'table' ? 'grid' : 'table')}
          aria-label={viewMode === 'table' ? 'Toon als raster' : 'Toon als lijst'}
        >
          {viewMode === 'table' ? (
            <Grid3x3 className="h-4 w-4" />
          ) : (
            <Table2 className="h-4 w-4" />
          )}
        </Button>
      )}

      {onAdd && (
        <Button
          type="button"
          onClick={onAdd}
          disabled={addDisabled}
          className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      )}
      </div>
    </div>
  )
}
