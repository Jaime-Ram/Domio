'use client'

import React from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

// ─── Class constants (backward compat) ────────────────────────────────────────

export const ADD_DIALOG_CLOSE_BUTTON_CLASS =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700 dark:hover:text-gray-200'

export function addDialogContentClassName(extra?: string) {
  return cn('p-0 gap-0 overflow-hidden', extra)
}

export const ADD_DIALOG_HEADER_CLASS =
  'px-6 pt-6 pb-5 border-b border-gray-100 dark:border-neutral-800 pr-14 text-left'

export const ADD_DIALOG_BODY_CLASS = 'px-6 py-5 space-y-3 min-h-0'

export const ADD_DIALOG_BODY_SCROLL_CLASS =
  'px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto min-h-0'

export const ADD_DIALOG_FOOTER_CLASS =
  'border-t border-gray-100 dark:border-neutral-800 p-4 flex w-full flex-row justify-end gap-0'

export const ADD_DIALOG_FOOTER_SPLIT_CLASS =
  'border-t border-gray-100 dark:border-neutral-800 p-4 flex w-full flex-row items-center justify-between gap-3'

export const ADD_DIALOG_TITLE_CLASS = 'text-xl font-bold text-[#163300] dark:text-[#9FE870]'

// ─── CreateDialogShell ────────────────────────────────────────────────────────

interface CreateDialogShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Titeltekst in de header */
  title: string
  /** Optionele ondertitel onder de titel */
  subtitle?: string
  /** Label van de primaire actieknop (bijv. "Aanmaken", "Indienen", "Activeren") */
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  primaryLoading?: boolean
  /** Huidige stap (1-based). Geef mee bij multi-step flows. */
  step?: number
  /** Totaal aantal stappen. Geef mee bij multi-step flows. */
  totalSteps?: number
  /** Callback voor "terug". Als opgegeven én step > 1, verschijnt de terug-knop linksonder. */
  onBack?: () => void
  /** Gebruik scrollbare body (bij lange formulieren). Default: false. */
  scrollBody?: boolean
  /** Optionele tweede actieknop links van de primaire knop */
  secondaryLabel?: string
  onSecondary?: () => void
  secondaryDisabled?: boolean
  secondaryLoading?: boolean
  children: React.ReactNode
}

export function CreateDialogShell({
  open,
  onOpenChange,
  title,
  subtitle,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryLoading,
  secondaryLabel,
  onSecondary,
  secondaryDisabled,
  secondaryLoading,
  step,
  totalSteps,
  onBack,
  scrollBody = false,
  children,
}: CreateDialogShellProps) {
  const isMultiStep = totalSteps && totalSteps > 1
  const isLastStep = !isMultiStep || step === totalSteps
  const showBack = !!(isMultiStep && step && step > 1 && onBack)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={addDialogContentClassName()}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        {/* Header */}
        <div className={ADD_DIALOG_HEADER_CLASS}>
          <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>{title}</DialogTitle>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Body */}
        <div className={scrollBody ? ADD_DIALOG_BODY_SCROLL_CLASS : ADD_DIALOG_BODY_CLASS}>
          {children}
        </div>

        {/* Footer */}
        <div
          className={cn(
            'border-t border-gray-100 dark:border-neutral-800 p-4 flex w-full flex-row items-center',
            showBack ? 'justify-between' : 'justify-end',
          )}
        >
          {/* Terug-knop (linksonder, zelfde stijl als sluiten-kruisje) */}
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Terug
            </button>
          ) : (
            <span />
          )}

          {/* Rechts: Annuleren + optionele secondary + primaire actie */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1"
            >
              Annuleren
            </button>
            {secondaryLabel && onSecondary && (
              <button
                type="button"
                onClick={onSecondary}
                disabled={secondaryDisabled || secondaryLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 text-gray-700 dark:text-gray-300 text-sm font-semibold px-4 py-2 transition-colors"
              >
                {secondaryLoading ? `${secondaryLabel}…` : secondaryLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onPrimary}
              disabled={primaryDisabled || primaryLoading}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] disabled:opacity-50 text-[#163300] text-sm font-semibold px-4 py-2 transition-colors"
            >
              {isLastStep ? (
                primaryLoading ? `${primaryLabel}…` : primaryLabel
              ) : (
                <>
                  {primaryLoading ? 'Laden…' : 'Volgende'}
                  {!primaryLoading && <ChevronRight className="h-4 w-4" />}
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
