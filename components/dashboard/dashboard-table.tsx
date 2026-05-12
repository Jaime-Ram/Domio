'use client'

import * as React from 'react'
import { TableHead, TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  DASHBOARD_TABLE_HEAD_CLASS,
  DASHBOARD_TABLE_CELL_CLASS,
} from '@/app/dashboard/landlord/dashboard-ui'

/**
 * TableHead / TableCell met vaste dashboard-marges (`px-5`), hergebruik op financiële tabellen e.d.
 */
export const DashboardTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableHead ref={ref} className={cn(DASHBOARD_TABLE_HEAD_CLASS, className)} {...props} />
))
DashboardTableHead.displayName = 'DashboardTableHead'

export const DashboardTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableCell ref={ref} className={cn(DASHBOARD_TABLE_CELL_CLASS, className)} {...props} />
))
DashboardTableCell.displayName = 'DashboardTableCell'
