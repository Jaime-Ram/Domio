'use client'

import { cn } from '@/lib/utils'
import {
  DASHBOARD_TABLE_BLOCK_CLASS,
  DASHBOARD_TABLE_BLOCK_EMPTY_MODIFIER_CLASS,
} from '@/app/dashboard/landlord/dashboard-ui'

/**
 * Eén lichtgrijs blok met afgeronde hoeken; met data een wit datagedeelte in `tbody`.
 * Zet `empty` als er geen rijen zijn: geen wit vlak, alleen kopregel op de schil.
 */
export function DashboardTableBlock({
  className,
  empty = false,
  children,
}: {
  className?: string
  /** `true` wanneer `TableBody` geen rijen heeft */
  empty?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        DASHBOARD_TABLE_BLOCK_CLASS,
        empty && DASHBOARD_TABLE_BLOCK_EMPTY_MODIFIER_CLASS,
        className
      )}
    >
      {children}
    </div>
  )
}
