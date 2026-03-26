'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { DASHBOARD_SURFACE_PADDING } from '@/app/dashboard/employer/dashboard-ui'

/** @deprecated Accent wordt niet meer gebruikt voor styling. */
type AccentColor = 'green' | 'blue' | 'amber' | 'red'

interface MetricCardProps {
  /** Omschrijving onder het bedrag (bijv. "Totaal ontvangen") */
  label: string
  /** Groot weergegeven bedrag of getal */
  value: string
  /** Optionele extra regel onder de omschrijving (bijv. "transacties", uitsplitsing) */
  subtitle?: string
  icon: React.ReactNode
  /** Felgroene tegel (Domio-accent), o.a. “Verwacht deze maand” */
  variant?: 'default' | 'bright-green'
  /** @deprecated Niet meer gebruikt voor styling */
  accent?: AccentColor
  className?: string
}

/**
 * Financieel dashboard: grijze tegel (zelfde tint als inner blocks), sterk afgerond, geen rand.
 * Volgorde: icoon → bedrag → beschrijving; geen munteenheid (alles NL / euro in het getal).
 */
export function MetricCard({
  label,
  value,
  subtitle,
  icon,
  variant = 'default',
  accent: _accent,
  className,
}: MetricCardProps) {
  const isBrightGreen = variant === 'bright-green'
  const showSubtitle = Boolean(subtitle)

  return (
    <Card
      className={cn(
        'h-full rounded-3xl border-0 shadow-none overflow-hidden',
        isBrightGreen
          ? 'bg-[#9FE870] dark:bg-[#9FE870]'
          : 'bg-[#f4f4f4] dark:bg-neutral-800',
        className
      )}
    >
      <CardContent
        className={cn(
          DASHBOARD_SURFACE_PADDING,
          'flex min-h-[160px] h-full flex-col justify-between'
        )}
      >
        <div
          className={cn(
            'shrink-0 self-start [&_svg]:h-6 [&_svg]:w-6',
            isBrightGreen
              ? 'flex h-11 w-11 items-center justify-center rounded-full bg-[#163300]/15 text-[#163300]'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {icon}
        </div>

        <div className="min-w-0 space-y-1 pt-4">
          <p
            className={cn(
              'text-3xl sm:text-[2rem] font-bold tracking-tight tabular-nums leading-none',
              isBrightGreen ? 'text-[#163300]' : 'text-gray-900 dark:text-white'
            )}
          >
            {value}
          </p>
          <p
            className={cn(
              'text-sm font-medium leading-snug pt-0.5',
              isBrightGreen ? 'text-[#163300]/85' : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {label}
          </p>
          {showSubtitle ? (
            <p
              className={cn(
                'text-xs pt-0.5',
                isBrightGreen ? 'text-[#163300]/70' : 'text-gray-500 dark:text-gray-500'
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
