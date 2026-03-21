'use client'

import { cn } from '@/lib/utils'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Card, CardContent } from '@/components/ui/card'

type AccentColor = 'green' | 'blue' | 'amber' | 'red'

const accentStyles: Record<AccentColor, { iconBg: string; iconText: string; border: string }> = {
  green: {
    iconBg: 'bg-[#ECFDF3] dark:bg-[#054F31]/30',
    iconText: 'text-[#067647] dark:text-[#75E0A7]',
    border: 'border-[#ABEFC6]/40 dark:border-[#054F31]/50',
  },
  blue: {
    iconBg: 'bg-[#EFF8FF] dark:bg-[#194185]/30',
    iconText: 'text-[#175CD3] dark:text-[#84CAFF]',
    border: 'border-[#B2DDFF]/40 dark:border-[#194185]/50',
  },
  amber: {
    iconBg: 'bg-[#FFFAEB] dark:bg-[#7A2E0E]/30',
    iconText: 'text-[#B54708] dark:text-[#FDB022]',
    border: 'border-[#FEDF89]/40 dark:border-[#7A2E0E]/50',
  },
  red: {
    iconBg: 'bg-[#FEF3F2] dark:bg-[#7A271A]/30',
    iconText: 'text-[#B42318] dark:text-[#FDA29B]',
    border: 'border-[#FECDCA]/40 dark:border-[#7A271A]/50',
  },
}

interface MetricCardProps {
  label: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  accent: AccentColor
}

export function MetricCard({ label, value, subtitle, icon, accent }: MetricCardProps) {
  const styles = accentStyles[accent]

  return (
    <Card className={dashboardCardClass(`border ${styles.border}`)}>
      <CardContent className="pt-5 pb-5 px-5">
        <div className="flex items-start gap-4">
          {/* Icon container — Untitled UI style: rounded-lg with tinted bg */}
          <div className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border',
            styles.iconBg,
            styles.border,
          )}>
            <span className={styles.iconText}>{icon}</span>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-tight">
              {label}
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight leading-none">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
