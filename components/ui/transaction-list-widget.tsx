'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TransactionListWidgetItem {
  /** Icoon (bijv. Lucide) */
  icon: React.ReactNode
  /** Groene cirkel (accent) of grijze cirkel */
  iconAccent?: boolean
  /** Naam / titel (vet) */
  name: string
  /** Ondertitel / status (kleiner, grijs) */
  description: string
  /** Optioneel bedrag rechts (vet) */
  amount?: string
}

export interface TransactionListWidgetProps {
  /** Titel boven de lijst */
  title: string
  /** Link rechts (bijv. "Alles" / "See all") */
  seeAllHref?: string
  seeAllLabel?: string
  /** Lijst items */
  items: TransactionListWidgetItem[]
  /** Extra class op de kaart */
  className?: string
  /** Compacte rijen (minder padding) */
  compact?: boolean
  /** Gebruik shadow-card-elevated en overflow-visible (voor Functies-sectie op gekleurde achtergrond) */
  elevatedShadow?: boolean
  /** Demo-stijl: wit/grijs, geen schaduw, geen rand (zoals overige demo-blokken) */
  demoStyle?: boolean
}

const CARD_CLASS =
  'rounded-card border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden'
const ICON_ACCENT = 'h-10 w-10 rounded-full bg-brand-primary flex items-center justify-center shrink-0 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-white'
const ICON_NEUTRAL =
  'h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center shrink-0 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-gray-600 dark:[&_svg]:text-gray-400'

/**
 * SaaS-style widget: kaart met titel, "See all"-link en lijst van transacties/activiteiten.
 * Elk item: rond icoon (accent of grijs), naam, beschrijving, optioneel bedrag rechts.
 * Te gebruiken op de marketing-functiespagina en in het dashboard.
 */
export function TransactionListWidget({
  title,
  seeAllHref,
  seeAllLabel = 'Alles',
  items,
  className,
  compact = false,
  elevatedShadow = false,
  demoStyle = false,
}: TransactionListWidgetProps) {
  const cardClass = demoStyle
    ? 'rounded-card bg-gray-100 dark:bg-neutral-800 overflow-hidden'
    : elevatedShadow
      ? 'rounded-card border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-card-elevated overflow-visible'
      : CARD_CLASS
  return (
    <div className={cn(cardClass, 'p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {seeAllHref != null && (
          <Link
            href={seeAllHref}
            className="text-sm text-brand-primary dark:text-brand-accent font-medium flex items-center gap-1 hover:underline underline-offset-2"
          >
            {seeAllLabel}
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Link>
        )}
      </div>
      <div className={cn('pt-3', !demoStyle && 'border-t border-gray-200/80 dark:border-neutral-700')}>
        <ul className="space-y-0">
          {items.map((item, index) => (
            <li
              key={index}
              className={cn(
                'flex items-center gap-3 w-full text-left',
                compact ? 'py-2.5' : 'py-3',
                !demoStyle && index > 0 && 'border-t border-gray-100 dark:border-neutral-800'
              )}
            >
              <div
                className={demoStyle ? ICON_NEUTRAL : (item.iconAccent !== false ? ICON_ACCENT : ICON_NEUTRAL)}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {item.description}
                </p>
              </div>
              {item.amount != null && item.amount !== '' && (
                <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                  {item.amount}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
