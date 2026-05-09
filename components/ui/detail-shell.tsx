'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import * as DialogPrimitive from '@radix-ui/react-dialog'

export const DETAIL_SHELL_WIDTH = 'w-full max-w-xl'

interface DetailShellProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  /** Node rendered to the left of the title/subtitle block (e.g. icon circle) */
  headerLeft?: React.ReactNode
  /** Replaces the default footer when provided */
  footer?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function DetailShell({
  open,
  onClose,
  title,
  subtitle,
  headerLeft,
  footer,
  children,
  className,
}: DetailShellProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        className={cn(
          DETAIL_SHELL_WIDTH,
          'flex flex-col p-0 overflow-hidden gap-0',
          className,
        )}
      >
        {/* Header */}
        {headerLeft || subtitle ? (
          <div className="px-6 pt-6 pb-5 border-b border-gray-100 dark:border-neutral-800 pr-14 shrink-0 flex items-center gap-3">
            {headerLeft}
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-xl font-bold text-[#163300] dark:text-[#9FE870] leading-tight truncate">
                {title}
              </DialogPrimitive.Title>
              {subtitle && (
                <DialogPrimitive.Description className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {subtitle}
                </DialogPrimitive.Description>
              )}
            </div>
          </div>
        ) : (
          <div className="pr-14 shrink-0">
            <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>

        {/* Footer */}
        {footer !== undefined ? footer : (
          <div className="border-t border-gray-100 dark:border-neutral-800 p-4 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1"
            >
              Sluiten
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] text-sm font-semibold px-5 py-2 transition-colors"
            >
              Opslaan
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
