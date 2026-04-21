import { cn } from '@/lib/utils'

/**
 * Uniforme “toevoegen”-dialog (Nieuwe taak, Pand toevoegen, …):
 * titel links + sluit-kruis rechts, horizontale scheidingslijn, scrollbare inhoud,
 * onderaan weer een lijn en rechts de primaire actie (geen Annuleren; sluiten = kruis of overlay).
 */

export const ADD_DIALOG_CLOSE_BUTTON_CLASS =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700 dark:hover:text-gray-200'

/** Basis voor `DialogContent` (geen padding; secties zetten eigen padding). */
export function addDialogContentClassName(extra?: string) {
  return cn('p-0 gap-0 overflow-hidden', extra)
}

export const ADD_DIALOG_HEADER_CLASS =
  'px-6 pt-6 pb-5 border-b border-gray-100 dark:border-neutral-800 pr-14 text-left'

export const ADD_DIALOG_BODY_CLASS = 'px-6 py-5 space-y-3 min-h-0'

/** Standaard body met verticale scroll bij lange formulieren. */
export const ADD_DIALOG_BODY_SCROLL_CLASS =
  'px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto min-h-0'

/** Eén primaire actie rechts (standaard). Ook op `footer`/`div` bruikbaar (niet alleen met `DialogFooter`). */
export const ADD_DIALOG_FOOTER_CLASS =
  'border-t border-gray-100 dark:border-neutral-800 p-4 flex w-full flex-row justify-end gap-0'

/**
 * Terug links + actie rechts.
 * Gebruik op een `footer` of `div`, niet op `DialogFooter`: die zet `sm:justify-end` en zet beide knoppen rechts.
 */
export const ADD_DIALOG_FOOTER_SPLIT_CLASS =
  'border-t border-gray-100 dark:border-neutral-800 p-4 flex w-full flex-row items-center justify-between gap-3'

export const ADD_DIALOG_TITLE_CLASS = 'text-xl font-bold text-[#163300] dark:text-[#9FE870]'
