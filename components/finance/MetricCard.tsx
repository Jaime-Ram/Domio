'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

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
}

/**
 * Financieel dashboard: grijze tegel (zelfde tint als inner blocks), sterk afgerond, geen rand.
 * Volgorde: icoon → bedrag → beschrijving; geen munteenheid (alles NL / euro in het getal).
 */
export function MetricCard({ label, value, subtitle, icon, variant = 'default', accent: _accent }: MetricCardProps) {
  const isBrightGreen = variant === 'bright-green'
  const showSubtitle = Boolean(subtitle)

  return (
    <Card
      className={cn(
        'rounded-[1.25rem] sm:rounded-4xl border-0 shadow-none overflow-hidden',
        isBrightGreen
          ? 'bg-[#9FE870] dark:bg-[#9FE870]'
          : 'bg-[#f4f4f4] dark:bg-neutral-800'
      )}
    >
      <CardContent className="p-5 pt-5 pb-5">
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              '[&>svg]:h-5 [&>svg]:w-5 shrink-0',
              isBrightGreen ? 'text-[#163300]' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {icon}
          </div>

          <div className="min-w-0 space-y-1">
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
        </div>
      </CardContent>
    </Card>
  )
}
