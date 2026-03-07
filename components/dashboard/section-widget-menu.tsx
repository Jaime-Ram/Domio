'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Content class: lichtgrijs, geen rand/schaduw, animatie uit het bolletje (origin-top-right + widget-menu-in/out) */
export const SECTION_WIDGET_MENU_CONTENT_CLASS =
  'rounded-2xl bg-gray-100 dark:bg-neutral-800 min-w-[200px] border-0 shadow-none py-2 px-1.5 origin-top-right data-[state=open]:animate-widget-menu-in data-[state=closed]:animate-widget-menu-out [&_[role="menuitem"]]:rounded-lg [&_[role="menuitem"]]:mx-1 [&_[role="menuitem"]]:px-3 [&_[role="menuitem"]]:focus:bg-gray-200 [&_[role="menuitem"]]:focus:dark:bg-neutral-700 [&_[data-radix-menu-label]]:rounded-lg [&_[data-radix-menu-label]]:mx-1 [&_[data-radix-menu-label]]:px-3 [&_[data-radix-menu-label]]:text-gray-900 [&_[data-radix-menu-label]]:dark:text-white'

interface SectionWidgetMenuProps {
  children: React.ReactNode
  className?: string
}

/**
 * Rondje met drie puntjes (horizontaal) om widgets per sectie aan te passen.
 * Gebruik als widgetMenu in SectionNavDashboard. Design: geen rand/schaduw op het menu.
 */
export function SectionWidgetMenu({ children, className }: SectionWidgetMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'h-8 w-8 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400',
            'hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center justify-center shrink-0',
            className
          )}
          aria-label="Widgets aanpassen"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={2} className={SECTION_WIDGET_MENU_CONTENT_CLASS}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Placeholder-inhoud voor secties waar nog geen widget-opties zijn. */
export function SectionWidgetMenuPlaceholder() {
  return (
    <>
      <DropdownMenuLabel>Widgets</DropdownMenuLabel>
      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
        Binnenkort kun je hier bepalen welke onderdelen je ziet.
      </div>
    </>
  )
}
