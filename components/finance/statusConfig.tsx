'use client'

import { AlertCircle, CheckCircle2, Clock, HelpCircle } from 'lucide-react'
import type { UnitStatus } from '@/lib/finance/classification'

export const STATUS_CONFIG: Record<UnitStatus, { label: string; classes: string; icon: React.ReactNode }> = {
  betaald: {
    label: 'Betaald',
    classes: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  verwacht: {
    label: 'Verwacht',
    classes: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  aandacht: {
    label: 'Aandacht',
    classes: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    icon: <HelpCircle className="h-3.5 w-3.5" />,
  },
  achterstand: {
    label: 'Achterstand',
    classes: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
}
