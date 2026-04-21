'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DASHBOARD_SURFACE_PADDING } from '@/app/dashboard/employer/dashboard-ui'

/**
 * Groene actie-tegel naast MetricCard (zelfde patroon als AddPaymentTile op financieel).
 */
export function AddTaskTile({ onClick, className }: { onClick: () => void; className?: string }) {
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
        'bg-[#9FE870] dark:bg-[#9FE870]',
        'transition-opacity hover:opacity-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#163300] focus-visible:ring-offset-2',
        className
      )}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-full bg-[#163300]/15 text-[#163300]"
        aria-hidden
      >
        <Plus className="h-6 w-6 stroke-[2.25]" />
      </div>
      <div className="min-w-0 space-y-1 pt-4">
        <p className="text-2xl font-extrabold tracking-tight text-[#163300] sm:text-[1.75rem] leading-tight">
          Nieuwe taak
        </p>
        <p className="text-sm font-medium text-[#163300]/80">Toevoegen</p>
      </div>
    </button>
  )
}
