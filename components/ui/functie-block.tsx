'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FunctieBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icoon linksboven (bijv. Lucide icon). Optioneel in marketing-layout. */
  icon?: React.ReactNode
  /** Optioneel: kleine trend/grafiek rechtsboven (bijv. golfje of TrendingUp) */
  trend?: React.ReactNode
  /** Optioneel: badge boven de content (bijv. "Compleet!" groene pill) */
  badge?: React.ReactNode
  /** Optioneel: preview boven titel (bericht, transactie, avatars) */
  preview?: React.ReactNode
  /** Label/titel onder de iconen (bijv. "Panden beheren") */
  title: string
  /** Hoofdwaarde of tekst onder de titel (groot getal of korte zin) */
  value?: React.ReactNode
  /** Optionele ondertitel onder value */
  subtitle?: string
  /** Lange beschrijving (voor grote blokken) */
  description?: string
  /** Achtergrondkleur icoon (default: brand-primary) */
  iconBgClassName?: string
  /** Extra inhoud onder value (beschrijving, knop) */
  children?: React.ReactNode
  /** Compacte variant (klein blok, minder padding) */
  compact?: boolean
}

/**
 * Blok in de stijl van de demo: witte kaart, afgeronde hoeken,
 * icoon linksboven, optioneel trend rechtsboven, titel, grote value.
 * Zelfde component voor Functies-sectie (landing) en demo/dashboard.
 */
const FunctieBlock = React.forwardRef<HTMLDivElement, FunctieBlockProps>(
  (
    {
      className,
      icon,
      trend,
      badge,
      preview,
      title,
      value,
      subtitle,
      description,
      iconBgClassName = 'bg-brand-primary',
      children,
      compact = false,
      ...props
    },
    ref
  ) => {
    const showIconRow = icon != null || trend != null

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-card border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden',
          compact ? 'p-3' : 'p-5',
          className
        )}
        {...props}
      >
        {badge != null && <div className="mb-3">{badge}</div>}
        {preview != null && <div className={showIconRow ? 'mb-3' : 'mb-4'}>{preview}</div>}

        {showIconRow && (
          <div className="flex items-start justify-between gap-3 mb-3">
            {icon != null && (
              <div
                className={cn(
                  'rounded-full flex items-center justify-center flex-shrink-0 text-white [&>svg]:h-4 [&>svg]:w-4',
                  compact ? 'w-8 h-8' : 'w-10 h-10',
                  iconBgClassName
                )}
              >
                {icon}
              </div>
            )}
            {trend != null && (
              <div className="flex-shrink-0 text-brand-primary dark:text-brand-accent [&>svg]:h-5 [&>svg]:w-5">
                {trend}
              </div>
            )}
          </div>
        )}
        <p className={cn('font-semibold text-gray-900 dark:text-white mb-1', compact ? 'text-sm' : 'text-base')}>
          {title}
        </p>
        {value != null && (
          <div className={cn('rounded-2xl bg-gray-100 dark:bg-neutral-800 p-3 mt-2', compact && 'p-2')}>
            <div className={cn('font-bold text-brand-primary dark:text-brand-accent tracking-tight', compact ? 'text-base' : 'text-2xl')}>
              {value}
            </div>
            {subtitle != null && subtitle !== '' && (
              <p className={cn('text-gray-500 dark:text-gray-400 mt-0.5', 'text-xs')}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {value == null && subtitle != null && subtitle !== '' && (
          <p className={cn('text-gray-500 dark:text-gray-400 mt-0.5', 'text-xs')}>
            {subtitle}
          </p>
        )}
        {description != null && description !== '' && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
        {children != null && <div className="mt-3">{children}</div>}
      </div>
    )
  }
)
FunctieBlock.displayName = 'FunctieBlock'

export { FunctieBlock }
