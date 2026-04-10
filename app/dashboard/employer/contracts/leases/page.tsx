'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass, DASHBOARD_TABLE_HEAD_SHADCN_CLASS, DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS, DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS } from '@/app/dashboard/employer/dashboard-ui'
import { DashboardTableBlock } from '@/components/dashboard/dashboard-table-block'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  FileText, Briefcase, BookOpen, Plus, Search,
  CheckCircle2, Clock, AlertTriangle, Download, Eye,
  User, MapPin,
} from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import { nl } from 'date-fns/locale'

const getContractsNav = (basePath: string) => [
  { label: 'Huurcontracten', href: `${basePath}/contracts/leases`, icon: FileText },
  { label: 'Leveranciers', href: `${basePath}/contracts/suppliers`, icon: Briefcase },
  { label: 'Sjablonen', href: `${basePath}/contracts/templates`, icon: BookOpen },
]

type LeaseStatus = 'actief' | 'verlopen' | 'eindigt_binnenkort' | 'concept'

interface Lease {
  id: string
  tenantName: string
  address: string
  startDate: string
  endDate: string | null
  monthlyRent: number
  status: LeaseStatus
  type: 'onbepaalde_tijd' | 'bepaalde_tijd'
}

const mockLeases: Lease[] = [
  { id: '1', tenantName: 'J. van der Berg', address: 'Keizersgracht 12-A', startDate: '2023-01-01', endDate: null, monthlyRent: 1450, status: 'actief', type: 'onbepaalde_tijd' },
  { id: '2', tenantName: 'A. Yilmaz', address: 'Keizersgracht 12-B', startDate: '2022-06-01', endDate: null, monthlyRent: 1050, status: 'actief', type: 'onbepaalde_tijd' },
  { id: '3', tenantName: 'S. de Boer', address: 'Prinsengracht 8-1', startDate: '2021-09-01', endDate: null, monthlyRent: 1180, status: 'actief', type: 'onbepaalde_tijd' },
  { id: '4', tenantName: 'K. Meijer', address: 'Prinsengracht 8-3', startDate: '2023-04-01', endDate: '2026-03-31', monthlyRent: 1550, status: 'eindigt_binnenkort', type: 'bepaalde_tijd' },
  { id: '5', tenantName: 'R. Hendriks', address: 'Herengracht 45-2', startDate: '2022-11-01', endDate: null, monthlyRent: 1780, status: 'actief', type: 'onbepaalde_tijd' },
  { id: '6', tenantName: 'E. de Groot', address: 'Vondelstraat 22', startDate: '2023-07-01', endDate: null, monthlyRent: 1100, status: 'actief', type: 'onbepaalde_tijd' },
  { id: '7', tenantName: 'P. Jansen', address: 'Singel 88', startDate: '2020-03-01', endDate: null, monthlyRent: 1380, status: 'actief', type: 'onbepaalde_tijd' },
  { id: '8', tenantName: 'F. El Amrani', address: 'Rozengracht 14-1', startDate: '2024-02-01', endDate: '2026-01-31', monthlyRent: 780, status: 'verlopen', type: 'bepaalde_tijd' },
  { id: '9', tenantName: 'L. Visser', address: 'Westerstraat 67', startDate: '2022-08-01', endDate: null, monthlyRent: 1520, status: 'actief', type: 'onbepaalde_tijd' },
]

function getStatusBadge(status: LeaseStatus) {
  switch (status) {
    case 'actief': return <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-0 gap-1"><CheckCircle2 className="h-3 w-3" />Actief</Badge>
    case 'verlopen': return <Badge className="bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-0 gap-1"><AlertTriangle className="h-3 w-3" />Verlopen</Badge>
    case 'eindigt_binnenkort': return <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-0 gap-1"><Clock className="h-3 w-3" />Eindigt binnenkort</Badge>
    case 'concept': return <Badge className="bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-gray-300 border-0">Concept</Badge>
  }
}

export default function LeasesPage() {
  const { basePath, isDemo } = useDashboardUser()
  const CONTRACTS_NAV = getContractsNav(basePath)
  const [search, setSearch] = useState('')

  const leases = isDemo ? mockLeases : []
  const filtered = leases.filter((l) =>
    !search || l.tenantName.toLowerCase().includes(search.toLowerCase()) || l.address.toLowerCase().includes(search.toLowerCase())
  )

  const actief = leases.filter((l) => l.status === 'actief').length
  const eindigend = leases.filter((l) => l.status === 'eindigt_binnenkort').length
  const verlopen = leases.filter((l) => l.status === 'verlopen').length
  const totalRent = leases.filter((l) => l.status === 'actief').reduce((s, l) => s + l.monthlyRent, 0)

  const tableBleed = filtered.length > 0

  return (
    <>
      <SectionNavDashboard title="Contracten" items={CONTRACTS_NAV} titleVariant="hero" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-content-blocks">
        {[
          { label: 'Actieve contracten', value: isDemo ? String(actief) : '—', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Eindigt binnenkort', value: isDemo ? String(eindigend) : '—', icon: Clock, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'Verlopen', value: isDemo ? String(verlopen) : '—', icon: AlertTriangle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
          { label: 'Huursom actief', value: isDemo ? `€${totalRent.toLocaleString('nl-NL')}` : '—', icon: FileText, color: 'text-[#163300] dark:text-[#9FE870]', bg: 'bg-[#163300]/5 dark:bg-[#9FE870]/10' },
        ].map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.label} className={dashboardCardClass()}>
              <CardContent className="p-5">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', m.bg)}>
                  <Icon className={cn('h-5 w-5', m.color)} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{m.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{m.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className={cn(dashboardCardClass(), 'overflow-hidden')}>
        <CardHeader className={cn('space-y-3', tableBleed && DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-lg text-[#163300] dark:text-[#9FE870]">Huurcontracten</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filtered.length} contracten</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3 sm:w-[200px]">
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <Input placeholder="Zoek huurder of adres..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="border-0 focus-visible:ring-0 h-8 px-2 text-sm bg-transparent" />
              </div>
              <Button className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 h-9 text-sm font-medium shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Nieuw contract
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn('p-0', tableBleed && DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>
          <DashboardTableBlock empty={filtered.length === 0}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Huurder</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Adres</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Type</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Ingangsdatum</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Einddatum</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Huur/mnd</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Status</TableHead>
                  <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'text-right')}>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lease) => (
                  <TableRow key={lease.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
                    <TableCell className="py-3.5 px-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#163300]/5 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                          <User className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{lease.tenantName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {lease.address}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-700 dark:text-gray-200 capitalize">
                      {lease.type === 'onbepaalde_tijd' ? 'Onbepaalde tijd' : 'Bepaalde tijd'}
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {format(new Date(lease.startDate), 'd MMM yyyy', { locale: nl })}
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {lease.endDate ? format(new Date(lease.endDate), 'd MMM yyyy', { locale: nl }) : '—'}
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm font-medium text-gray-900 dark:text-white">
                      €{lease.monthlyRent.toLocaleString('nl-NL')}
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5">{getStatusBadge(lease.status)}</TableCell>
                    <TableCell className="py-3.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" className="rounded-full h-7 px-2.5 text-xs gap-1">
                          <Eye className="h-3 w-3" />
                          Bekijk
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full h-7 px-2.5 text-xs gap-1">
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardTableBlock>
        </CardContent>
      </Card>
    </>
  )
}
