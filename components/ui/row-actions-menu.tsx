'use client'

import * as React from 'react'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface RowAction {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  danger?: boolean
}

/** Drie-puntjes-menu voor rij-acties, zelfde stijl als bij Drive-documenten. */
export function RowActionsMenu({
  actions,
  label = 'Acties',
}: {
  actions: RowAction[]
  label?: string
}) {
  if (actions.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label={label}
          className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#94f477]/40"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="rounded-xl min-w-[200px] border-gray-200 dark:border-neutral-700"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {actions.map((action, i) => (
          <DropdownMenuItem
            key={i}
            onClick={(e) => { e.stopPropagation(); action.onClick() }}
            className={cn(
              'gap-2',
              action.danger
                ? 'text-red-600 focus:bg-red-50 focus:text-red-700 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:focus:bg-red-900/20 dark:hover:bg-red-900/20'
                : 'focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:focus:bg-neutral-700 dark:focus:text-white dark:hover:bg-neutral-700 dark:hover:text-white',
            )}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
