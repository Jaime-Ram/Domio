import { cn } from '@/lib/utils'

// --- Tokens: één set voor het employer/demo dashboard (geen globale !important hacks) ---

/**
 * Binnen MetricCard / tegels: iets strakker dan shadcn-`Card` (`p-5`), visueel één lijn met kaarten.
 */
export const DASHBOARD_SURFACE_PADDING = 'p-5'

/**
 * Één linker gutter voor de hele employer-main inhoud (layout).
 * Titel, pills en kaarten delen dezelfde verticale lijn — geen dubbele `pl-*` op kinderen.
 */
export const DASHBOARD_PAGE_GUTTER_CLASS = 'pl-5'

/**
 * @deprecated Gebruik niet meer: gutter zit in `app/dashboard/employer/layout.tsx` via
 * `DASHBOARD_PAGE_GUTTER_CLASS`. Alleen behouden voor oude imports / geleidelijke migratie.
 */
export const DASHBOARD_PAGE_TITLE_INSET = DASHBOARD_PAGE_GUTTER_CLASS

/** @deprecated Gebruik `DASHBOARD_PAGE_GUTTER_CLASS` */
export const DASHBOARD_TITLE_ALIGN_CLASS = DASHBOARD_PAGE_GUTTER_CLASS

/**
 * Lichtgrijze tint voor tabelkop / schil (neutraal; geen groen-grijs).
 */
export const DASHBOARD_TABLE_HEADER_TINT_CLASS =
  'bg-gray-100 dark:bg-neutral-800/90'

/**
 * Tabellen in dashboard-kaarten: `DashboardTableHead` (`px-5`); groene accenttekst op grijze kop (zie `DASHBOARD_TABLE_HEADER_TINT_CLASS` op `thead tr`).
 */
export const DASHBOARD_TABLE_HEAD_CLASS =
  'h-auto min-h-12 px-5 py-3 text-left align-middle text-sm font-semibold text-[#163300] dark:text-[#9FE870]'

/**
 * Shadcn-tabelkoppen (gelijk aan toolbar); zelfde tint/tekst als `DASHBOARD_TABLE_HEAD_CLASS`.
 */
export const DASHBOARD_TABLE_HEAD_SHADCN_CLASS =
  'h-auto min-h-12 px-3.5 py-3 text-left align-middle text-sm font-semibold text-[#163300] dark:text-[#9FE870]'

export const DASHBOARD_TABLE_CELL_CLASS =
  'px-5 py-3 align-middle text-sm'

/**
 * Container rond een icoon in een tabelrij: **alleen rand, geen vulling** (rustiger).
 * Combineer met vaste maat, bv. `h-10 w-10` + `rounded-lg` of `rounded-full`.
 */
export const DASHBOARD_TABLE_ICON_WRAP_CLASS =
  'flex shrink-0 items-center justify-center border border-gray-200/90 bg-transparent dark:border-neutral-600'

/**
 * Één afgerond blok (`rounded-card`) voor **toolbar + tabel**: geen aparte CardHeader-rand naast tabelrand.
 * Binnen een `Card` met `p-0` vult dit het vlak; zelfde uitlijning voor boven- en onderdeel.
 */
export const DASHBOARD_TABLE_FRAME_CLASS =
  'flex min-h-0 flex-col overflow-hidden rounded-card border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'

/** Toolbar boven shadcn-default tabel (kolommen gelijk aan `DASHBOARD_TABLE_HEAD_SHADCN_CLASS`). */
export const DASHBOARD_TABLE_FRAME_TOOLBAR_SHADCN = 'space-y-3 p-0 px-3.5 pt-5 pb-2.5'

/** Toolbar boven `DashboardTableHead` (`px-5`). */
export const DASHBOARD_TABLE_FRAME_TOOLBAR_DASHBOARD = 'space-y-3 p-0 px-5 pt-5 pb-2.5'

/** Alleen het tabelgedeelte (scheidingslijn, scroll). */
export const DASHBOARD_TABLE_FRAME_TABLE_CLASS =
  'min-h-0 overflow-x-auto border-t border-gray-200 dark:border-neutral-700'

/**
 * Wanneer toolbar nog in `CardHeader` zit maar de tabel er direct onder: één visueel blok met ronde hoeken.
 * Header: boven + zijkanten; body: onder + zijkanten + dunne scheiding boven de tabel.
 */
export const DASHBOARD_TABLE_SHELL_HEADER_CLASS =
  'rounded-t-card border-x border-t border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'

export const DASHBOARD_TABLE_SHELL_BODY_CLASS =
  'min-h-0 overflow-x-auto rounded-b-card border-x border-b border-t border-gray-200 dark:border-neutral-700'

/**
 * Eén visueel blok: lichtgrijze schil met afgeronde hoeken; één shadcn-`Table` erin.
 * — `thead`:zelfde tint, kolomtitels groen (Domio).
 * — `tbody`: **één doorlopend wit vlak** (`tbody` krijgt `bg-white`); cellen transparant zodat dat vlak zichtbaar is;
 *   hoeken alleen op de buitenrand van dat witte vlak; rijen gescheiden door dunne lijn; hover grijs per rij (`td`).
 */
export const DASHBOARD_TABLE_BLOCK_CLASS =
  'min-h-0 w-full rounded-card overflow-hidden ' +
  // Iets minder padding boven: anders oogt de kopregel te “dik”
  'bg-gray-100 dark:bg-neutral-800/90 px-2.5 pb-2.5 pt-1.5 ' +
  '[&_table]:w-full [&_table]:border-separate [&_table]:border-spacing-0 ' +
  '[&_thead_tr]:!border-b-0 [&_tfoot_tr]:!border-b-0 ' +
  '[&_thead_tr]:bg-gray-100 dark:[&_thead_tr]:bg-neutral-800/90 ' +
  '[&_thead_tr]:hover:!bg-gray-100 dark:[&_thead_tr]:hover:!bg-neutral-800/90 ' +
  '[&_thead_th]:!min-h-0 [&_thead_th]:!py-2.5 [&_thead_th]:text-[#163300] dark:[&_thead_th]:text-[#9FE870] ' +
  '[&_tbody]:bg-white dark:[&_tbody]:bg-neutral-900 ' +
  '[&_tbody_td]:bg-transparent ' +
  '[&_tbody_td]:transition-colors duration-150 ' +
  '[&_tbody_tr]:border-b-0 [&_tfoot_tr]:border-b-0 ' +
  '[&_tbody_tr:not(:first-child)_td]:border-t [&_tbody_tr:not(:first-child)_td]:border-gray-100 dark:[&_tbody_tr:not(:first-child)_td]:border-t-neutral-800 ' +
  '[&_tbody_tr:first-child_td:first-child]:rounded-tl-card [&_tbody_tr:first-child_td:last-child]:rounded-tr-card ' +
  '[&_tbody_tr:last-child_td:first-child]:rounded-bl-card [&_tbody_tr:last-child_td:last-child]:rounded-br-card ' +
  '[&_tbody_tr:first-child:last-child_td:only-child]:rounded-card ' +
  '[&_tbody_tr:hover]:!bg-transparent ' +
  '[&_tbody_tr:hover>td]:bg-gray-100/95 dark:[&_tbody_tr:hover>td]:bg-neutral-800 ' +
  '[&>div]:min-w-0 [&>div]:overflow-x-auto '

/**
 * Lijst zonder rijen: geen wit/neutral-900 datavlak onder de kop; tbody blijft visueel onderdeel van de lichtgrijze schil.
 */
export const DASHBOARD_TABLE_BLOCK_EMPTY_MODIFIER_CLASS =
  '[&_tbody]:!bg-transparent dark:[&_tbody]:!bg-transparent [&_tbody]:min-h-0'

/**
 * `CardContent` direct onder toolbar: kleine top-padding tussen controls en tabelrand (niet `pt-0`, niet oude `pt-3`).
 */
export const DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS = 'pt-2'

/**
 * CardHeader boven shadcn-tabel: zelfde horizontale inset als tabelkoppen; weinig ruimte onder de toolbar (overschrijft default `CardHeader`-padding).
 */
export const DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS =
  'space-y-3 p-0 px-3.5 pt-5 pb-2.5'

/**
 * CardHeader boven `DashboardTableHead` (`px-5`).
 */
export const DASHBOARD_TABLE_TOOLBAR_HEADER_DASHBOARD_CLASS =
  'space-y-3 p-0 px-5 pt-5 pb-2.5'

/**
 * @deprecated Gebruik `DASHBOARD_TABLE_FRAME_CLASS` + `DASHBOARD_TABLE_FRAME_TABLE_CLASS`.
 */
export const DASHBOARD_TABLE_BLEED_SURFACE_CLASS = DASHBOARD_TABLE_FRAME_TABLE_CLASS

/**
 * @deprecated Gebruik `DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS`.
 */
export const DASHBOARD_TABLE_HEADER_PAD_MATCH_SHADCN = 'px-3.5'

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
