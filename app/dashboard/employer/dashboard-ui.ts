import { cn } from '@/lib/utils'

/** Kaartstijl: flat design — geen schaduwen, geen borders */
export const DASHBOARD_CARD_CLASS =
  'rounded-card border-0 shadow-none bg-white dark:bg-neutral-900'

/** @deprecated Gebruik DASHBOARD_CARD_CLASS — flat design is nu standaard */
export const DASHBOARD_CARD_CLASS_DEMO = DASHBOARD_CARD_CLASS

/** Binnenblok in kaart: grijze achtergrond, ronde hoeken */
export const DASHBOARD_INNER_BLOCK_CLASS =
  'rounded-block bg-[#f4f4f4] dark:bg-neutral-800'

/** @deprecated Gebruik DASHBOARD_INNER_BLOCK_CLASS */
export const DASHBOARD_INNER_BLOCK_CLASS_DEMO = DASHBOARD_INNER_BLOCK_CLASS

/** Ronde donkere icooncirkel */
export const DASHBOARD_ICON_CIRCLE_CLASS =
  'h-10 w-10 rounded-full bg-brand-primary dark:bg-brand-primary flex items-center justify-center shrink-0'

export function dashboardCardClass(extra?: string, _isDemo?: boolean) {
  return cn(DASHBOARD_CARD_CLASS, extra)
}
