'use client'

import * as React from 'react'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// ─── Standaard dropdown container ────────────────────────────────────────────
// Gebruik dit altijd i.p.v. DropdownMenuContent direct.

interface AppDropdownContentProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuContent> {}

export function AppDropdownContent({ className, sideOffset = 8, ...props }: AppDropdownContentProps) {
  return (
    <DropdownMenuContent
      sideOffset={sideOffset}
      className={cn(
        'rounded-2xl bg-white dark:bg-neutral-800 border-0 shadow-soft-lg p-1.5 overflow-hidden min-w-[220px]',
        'origin-top-right data-[state=open]:animate-widget-menu-in data-[state=closed]:animate-widget-menu-out',
        className,
      )}
      {...props}
    />
  )
}

// ─── Standaard dropdown item ──────────────────────────────────────────────────

interface AppDropdownItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuItem> {}

export function AppDropdownItem({ className, ...props }: AppDropdownItemProps) {
  return (
    <DropdownMenuItem
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200',
        'cursor-pointer transition-colors hover:bg-[#f4f4f4] dark:hover:bg-neutral-700',
        'focus:bg-[#f4f4f4] dark:focus:bg-neutral-700 focus:text-gray-900 dark:focus:text-white',
        className,
      )}
      {...props}
    />
  )
}

// ─── Standaard dropdown label ─────────────────────────────────────────────────

interface AppDropdownLabelProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuLabel> {}

export function AppDropdownLabel({ className, ...props }: AppDropdownLabelProps) {
  return (
    <DropdownMenuLabel
      className={cn('px-3 pt-2 pb-1 text-[11px] font-medium text-gray-400 dark:text-gray-500', className)}
      {...props}
    />
  )
}

// ─── Standaard checkbox item ──────────────────────────────────────────────────

interface AppDropdownCheckboxItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuCheckboxItem> {}

export function AppDropdownCheckboxItem({ className, ...props }: AppDropdownCheckboxItemProps) {
  return (
    <DropdownMenuCheckboxItem
      className={cn(
        'flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-200',
        'cursor-pointer transition-colors hover:bg-[#f4f4f4] dark:hover:bg-neutral-700',
        'focus:bg-[#f4f4f4] dark:focus:bg-neutral-700',
        className,
      )}
      {...props}
    />
  )
}

// ─── Standaard separator ─────────────────────────────────────────────────────

export function AppDropdownSeparator({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      className={cn('my-1 h-px bg-gray-100 dark:bg-neutral-700 mx-1.5', className)}
      {...props}
    />
  )
}
