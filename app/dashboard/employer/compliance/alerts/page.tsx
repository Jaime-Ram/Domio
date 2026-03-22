'use client'

import { AlertTriangle, BarChart3, Calculator } from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

const getComplianceNav = (basePath: string) => [
  { label: 'WWS Overzicht', href: `${basePath}/compliance`, icon: BarChart3 },
  { label: 'Puntentelling', href: `${basePath}/compliance/puntentelling`, icon: Calculator },
  { label: 'Alerts', href: `${basePath}/compliance/alerts`, icon: AlertTriangle },
]

export default function ComplianceAlertsPage() {
  const { basePath } = useDashboardUser()
  const COMPLIANCE_NAV = getComplianceNav(basePath)
  return (
    <div className="space-y-content-blocks">
      <SectionNavDashboard title="Compliance" items={COMPLIANCE_NAV} titleVariant="hero" />
    </div>
  )
}
