'use client'

import type { TransactionRow, PropertyHierarchy } from './TransactionsInbox'

interface AssignDrawerProps {
  transaction: TransactionRow | null
  properties: PropertyHierarchy[]
  open: boolean
  onClose: () => void
  onAssigned: () => void
  existingAssignment?: {
    property_id: string | null
    unit_id: string | null
    tenant_id: string | null
    lease_id: string | null
    category: string | null
  }
}

// TODO: implement full assign drawer UI
export function AssignDrawer(_props: AssignDrawerProps) {
  return null
}
