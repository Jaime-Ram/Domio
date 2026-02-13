import { cn } from '@/lib/utils'

/** Kaartstijl zoals Functies-sectie: grote ronde hoeken, shadow, lichte rand */
export const DASHBOARD_CARD_CLASS =
  'rounded-[1.75rem] border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg'

/** Binnenblok in kaart: grijze achtergrond, ronde hoeken */
export const DASHBOARD_INNER_BLOCK_CLASS =
  'rounded-2xl bg-gray-100 dark:bg-neutral-800'

/** Ronde donkere icooncirkel */
export const DASHBOARD_ICON_CIRCLE_CLASS =
  'h-10 w-10 rounded-full bg-[#002A1F] dark:bg-[#002A1F] flex items-center justify-center shrink-0'

export function dashboardCardClass(extra?: string) {
  return cn(DASHBOARD_CARD_CLASS, extra)
}
