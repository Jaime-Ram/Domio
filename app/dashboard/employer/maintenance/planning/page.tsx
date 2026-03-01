'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Wrench, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'

const MAINTENANCE_NAV = [
  { label: 'Tickets', href: '/dashboard/employer/maintenance', icon: Wrench },
  { label: 'Inspecties', href: '/dashboard/employer/maintenance/inspecties', icon: ClipboardCheck },
  { label: 'Planning', href: '/dashboard/employer/maintenance/planning', icon: Calendar },
]

export default function PlanningPage() {
  return (
    <div className="space-y-6">
      <SectionNavDashboard title="Onderhoud" items={MAINTENANCE_NAV} />
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Planning</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Onderhoudsplanning en afspraken.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planning overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Planning is gekoppeld aan onderhoudstickets.
          </p>
          <Button asChild variant="default">
            <Link href="/dashboard/employer/maintenance">Naar Tickets</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
