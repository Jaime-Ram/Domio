'use client'

import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string
  icon: React.ReactNode
  delta?: string
  className?: string
  /** @deprecated */
  subtitle?: string
  /** @deprecated */
  variant?: string
  /** @deprecated */
  accent?: string
}

export function MetricCard({ label, value, icon, delta, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-[#f4f4f4] dark:bg-neutral-800 rounded-2xl px-4 pt-3 pb-4 flex flex-col justify-between min-h-[110px]',
        className
      )}
    >
      <div className="flex justify-end [&_svg]:h-5 [&_svg]:w-5 text-[#97978f] dark:text-[#97978f]">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-[#1d3014] dark:text-[#c8e957] leading-tight">{value}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="text-sm text-[#97978f] dark:text-[#97978f] font-medium">{label}</p>
          {delta && (
            <span className="text-xs font-semibold text-[#15803D] dark:text-[#4ADE80]">{delta}</span>
          )}
        </div>
      </div>
    </div>
  )
}
