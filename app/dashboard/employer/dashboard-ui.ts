import { cn } from '@/lib/utils'

/** Kaartstijl zoals Functies-sectie: grote ronde hoeken, shadow, lichte rand */
export const DASHBOARD_CARD_CLASS =
  'rounded-card border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg'

/** Demo: kaart zonder schaduw of rand, alleen wit/grijs */
export const DASHBOARD_CARD_CLASS_DEMO =
  'rounded-card border-0 shadow-none bg-white dark:bg-neutral-900'

/** Binnenblok in kaart: grijze achtergrond, ronde hoeken */
export const DASHBOARD_INNER_BLOCK_CLASS =
  'rounded-block bg-gray-100 dark:bg-neutral-800'

/** Demo: binnenblok zonder rand */
export const DASHBOARD_INNER_BLOCK_CLASS_DEMO =
  'rounded-block bg-gray-100 dark:bg-neutral-800'

/** Ronde donkere icooncirkel */
export const DASHBOARD_ICON_CIRCLE_CLASS =
  'h-10 w-10 rounded-full bg-brand-primary dark:bg-brand-primary flex items-center justify-center shrink-0'

export function dashboardCardClass(extra?: string, isDemo?: boolean) {
  if (isDemo) return cn(DASHBOARD_CARD_CLASS_DEMO, extra)
  return cn(DASHBOARD_CARD_CLASS, extra)
}
