'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DASHBOARD_SURFACE_PADDING } from '@/app/dashboard/landlord/dashboard-ui'

/**
 * Groene actie-tegel (Domio-accent): zelfde padding, kolomlayout en icoonafstand als MetricCard.
 */
export function AddPaymentTile({
  onClick,
  className,
  title = 'Betaling',
  subtitle = 'Handmatig registreren',
}: {
  onClick: () => void
  className?: string
  title?: string
  subtitle?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left',
        'rounded-3xl border-0 shadow-none',
        'min-h-[160px] h-full',
        DASHBOARD_SURFACE_PADDING,
        'flex flex-col justify-between',
        'bg-[#c8e957] dark:bg-[#c8e957]',
        'transition-opacity hover:opacity-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d3014] focus-visible:ring-offset-2',
        className
      )}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-full bg-[#1d3014]/15 text-[#1d3014]"
        aria-hidden
      >
        <Plus className="h-6 w-6 stroke-[2.25]" />
      </div>
      <div className="min-w-0 space-y-1 pt-4">
        <p className="text-2xl font-extrabold tracking-tight text-[#1d3014] sm:text-[1.75rem] leading-tight">
          {title}
        </p>
        <p className="text-sm font-medium text-[#1d3014]/80">{subtitle}</p>
      </div>
    </button>
  )
}
