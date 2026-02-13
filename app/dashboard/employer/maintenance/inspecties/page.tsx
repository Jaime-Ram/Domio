'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function InspectiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Inspecties</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Geplande en uitgevoerde inspecties.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Inspecties overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Inspecties worden gekoppeld aan onderhoudstickets.
          </p>
          <Button asChild variant="default">
            <Link href="/dashboard/employer/maintenance">Naar Tickets</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
