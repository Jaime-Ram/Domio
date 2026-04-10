'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText, Briefcase, BookOpen, Plus, Download, Eye,
  Clock,
} from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'

const getContractsNav = (basePath: string) => [
  { label: 'Huurcontracten', href: `${basePath}/contracts/leases`, icon: FileText },
  { label: 'Leveranciers', href: `${basePath}/contracts/suppliers`, icon: Briefcase },
  { label: 'Sjablonen', href: `${basePath}/contracts/templates`, icon: BookOpen },
]

const mockTemplates = [
  { id: '1', name: 'Standaard huurcontract (onbepaalde tijd)', category: 'Woonruimte', updated: '2026-01-10', official: true },
  { id: '2', name: 'Huurcontract bepaalde tijd (max 2 jaar)', category: 'Woonruimte', updated: '2026-01-10', official: true },
  { id: '3', name: 'Tijdelijk huurcontract (studenten)', category: 'Woonruimte', updated: '2025-08-15', official: false },
  { id: '4', name: 'Huurcontract commerciële ruimte', category: 'Bedrijfsruimte', updated: '2025-11-20', official: true },
  { id: '5', name: 'Onderhuurcontract', category: 'Woonruimte', updated: '2025-06-01', official: false },
  { id: '6', name: 'Leveranciersovereenkomst', category: 'Leverancier', updated: '2026-02-05', official: false },
]

export default function TemplatesPage() {
  const { basePath, isDemo } = useDashboardUser()
  const CONTRACTS_NAV = getContractsNav(basePath)
  const templates = isDemo ? mockTemplates : []

  return (
    <>
      <SectionNavDashboard title="Contracten" items={CONTRACTS_NAV} titleVariant="hero" />

      <div className="flex justify-end">
        <Button className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 h-9 text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" />
          Sjabloon uploaden
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className={dashboardCardClass()}>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Nog geen contractsjablonen.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-content-blocks">
          {templates.map((t) => (
            <Card key={t.id} className={cn(dashboardCardClass(), 'hover:border-gray-300 dark:hover:border-neutral-600 transition-colors cursor-pointer group')}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#163300]/5 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{t.name}</p>
                    <Badge className="mt-1 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 border-0 text-xs">
                      {t.category}
                    </Badge>
                  </div>
                  {t.official && (
                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-0 text-xs shrink-0">
                      Officieel
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
                  <Clock className="h-3 w-3" />
                  Bijgewerkt {new Date(t.updated).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 rounded-full h-8 text-xs gap-1">
                    <Eye className="h-3 w-3" />
                    Bekijk
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full h-8 px-3 text-xs gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
