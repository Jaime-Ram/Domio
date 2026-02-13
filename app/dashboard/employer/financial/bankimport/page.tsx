'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Scan } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BankimportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Bankimport</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Banktransacties importeren en matchen.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Bankimport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Bankimport en matching vind je in het financiële dashboard.
          </p>
          <Button asChild variant="default">
            <Link href="/dashboard/employer/financial">Naar Financieel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
