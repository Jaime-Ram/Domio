'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass, DASHBOARD_TABLE_HEAD_SHADCN_CLASS, DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS, DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS } from '@/app/dashboard/employer/dashboard-ui'
import { DashboardTableBlock } from '@/components/dashboard/dashboard-table-block'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download,
  Eye,
  ChevronUp,
  ChevronDown,
  Search,
  BarChart3,
  Calculator,
  XCircle,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { MetricCard } from '@/components/finance/MetricCard'
import {
  mockWwsObjects,
  mockWwsAlerts,
  mockWwsSectorDistribution,
  mockWwsVorigeJaarGemiddeld,
  type WWSComplianceObject,
  type WWSSector,
} from '@/lib/mock-data/wws-compliance'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS,
  DASHBOARD_FILTER_MENU_CONTENT_CLASS,
  DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS,
} from '@/app/dashboard/employer/dashboard-ui'

const SECTOR_LABELS: Record<WWSSector, string> = {
  sociaal: 'Sociaal',
  midden: 'Midden',
  vrij: 'Vrij',
}

const SECTOR_COLORS: Record<WWSSector, string> = {
  sociaal: '#64748B',
  midden: '#F59E0B',
  vrij: '#10B981',
}

const STATUS_LABELS: Record<WWSComplianceObject['status'], string> = {
  compliant: 'Compliant',
  verlopen: 'Verlopen',
  te_hoog: 'Te hoog',
  pdf_mist: 'PDF mist',
}

type SortKey = 'address' | 'punten' | 'sector' | 'maxHuur' | 'huidigeHuur' | 'verschil' | 'status' | 'laatsteCheck'

function getStatusBadge(status: WWSComplianceObject['status']) {
  switch (status) {
    case 'compliant':
      return (
        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-0 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Compliant
        </Badge>
      )
    case 'verlopen':
      return (
        <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-0 gap-1">
          <Clock className="h-3 w-3" />
          Verlopen
        </Badge>
      )
    case 'te_hoog':
      return (
        <Badge className="bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-0 gap-1">
          <XCircle className="h-3 w-3" />
          Te hoog
        </Badge>
      )
    case 'pdf_mist':
      return (
        <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-0 gap-1">
          <FileText className="h-3 w-3" />
          PDF mist
        </Badge>
      )
  }
}

function SectorDonutChart({ data }: { data: { sector: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  const circ = 2 * Math.PI * 38
  let offset = 0
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      {data.map((d) => {
        const pct = d.count / total
        const dash = pct * circ
        const strokeDasharray = `${dash} ${circ - dash}`
        const strokeDashoffset = -offset
        offset += dash
        return (
          <circle
            key={d.sector}
            cx="50" cy="50" r="38"
            fill="none"
            stroke={d.color}
            strokeWidth="14"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        )
      })}
    </svg>
  )
}

const getComplianceNav = (basePath: string) => [
  { label: 'WWS Overzicht', href: `${basePath}/compliance`, icon: BarChart3 },
  { label: 'Puntentelling', href: `${basePath}/compliance/puntentelling`, icon: Calculator },
  { label: 'Alerts', href: `${basePath}/compliance/alerts`, icon: AlertTriangle },
]

export default function CompliancePage() {
  const { isDemo, basePath } = useDashboardUser()
  const COMPLIANCE_NAV = getComplianceNav(basePath)
  const [searchQuery, setSearchQuery] = useState('')
  const [sectorFilter, setSectorFilter] = useState<Record<WWSSector, boolean>>({ sociaal: true, midden: true, vrij: true })
  const [statusFilter, setStatusFilter] = useState<Record<string, boolean>>({ compliant: true, verlopen: true, te_hoog: true, pdf_mist: true })
  const [sortKey, setSortKey] = useState<SortKey>('address')
  const [sortAsc, setSortAsc] = useState(true)

  const wwsObjects = isDemo ? mockWwsObjects : []
  const wwsAlerts = isDemo ? mockWwsAlerts : []
  const sectorDistribution = isDemo ? mockWwsSectorDistribution : []

  const compliantCount = wwsObjects.filter((o) => o.status === 'compliant').length
  const totalCount = wwsObjects.length
  const compliantPercent = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0
  const actieVereist = wwsObjects.filter((o) => o.status !== 'compliant').length
  const withPunten = wwsObjects.filter((o) => o.punten > 0)
  const gemiddeldPunten = withPunten.length > 0 ? Math.round(withPunten.reduce((s, o) => s + o.punten, 0) / withPunten.length) : 0
  const trendDiff = gemiddeldPunten - mockWwsVorigeJaarGemiddeld
  const vrijeSectorCount = wwsObjects.filter((o) => o.sector === 'vrij').length

  const filteredAndSorted = useMemo(() => {
    let list = wwsObjects.filter((o: WWSComplianceObject) => {
      if (searchQuery && !o.address.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (!sectorFilter[o.sector]) return false
      if (!statusFilter[o.status]) return false
      return true
    })
    list = [...list].sort((a: WWSComplianceObject, b: WWSComplianceObject) => {
      let cmp = 0
      switch (sortKey) {
        case 'address': cmp = a.address.localeCompare(b.address, 'nl'); break
        case 'punten': cmp = a.punten - b.punten; break
        case 'sector': cmp = a.sector.localeCompare(b.sector); break
        case 'maxHuur': cmp = a.maxHuur - b.maxHuur; break
        case 'huidigeHuur': cmp = a.huidigeHuur - b.huidigeHuur; break
        case 'verschil': cmp = a.verschil - b.verschil; break
        case 'status': cmp = a.status.localeCompare(b.status); break
        case 'laatsteCheck': cmp = a.laatsteCheck.localeCompare(b.laatsteCheck); break
      }
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [searchQuery, sectorFilter, statusFilter, sortKey, sortAsc, wwsObjects])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(true) }
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortAsc
        ? <ChevronUp className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
        : <ChevronDown className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
      : <ChevronDown className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />

  const tableBleed = filteredAndSorted.length > 0

  return (
    <>
      <SectionNavDashboard title="Compliance" items={COMPLIANCE_NAV} titleVariant="hero" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Compliant" value={isDemo ? `${compliantPercent}%` : '0%'} subtitle={isDemo ? `${compliantCount} van ${totalCount} objecten` : undefined} icon={<ShieldCheck />} />
        <MetricCard label="Acties vereist" value={isDemo ? String(actieVereist) : '0'} subtitle={isDemo && actieVereist > 0 ? `${wwsAlerts.length} alertmeldingen` : 'Geen acties vereist'} icon={<AlertTriangle />} />
        <MetricCard label="Gem. punten" value={isDemo ? String(gemiddeldPunten) : '0'} subtitle={isDemo ? (trendDiff >= 0 ? `+${trendDiff} t.o.v. vorig jaar` : `${trendDiff} t.o.v. vorig jaar`) : undefined} icon={<Calculator />} />
        <MetricCard label="Vrije sector" value={isDemo ? String(vrijeSectorCount) : '0'} subtitle={isDemo ? `${Math.round(vrijeSectorCount / totalCount * 100)}% van portefeuille` : undefined} icon={<BarChart3 />} />
      </div>

      {/* Sector verdeling + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-content-blocks">
        {/* Sector donut */}
        <Card className={dashboardCardClass(undefined, isDemo)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Sectorverdeling</CardTitle>
          </CardHeader>
          <CardContent>
            {isDemo ? (
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 shrink-0">
                  <SectorDonutChart data={sectorDistribution} />
                </div>
                <div className="space-y-2">
                  {sectorDistribution.map((d) => (
                    <div key={d.sector} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{d.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4">Voeg objecten toe om de sectorverdeling te zien.</p>
            )}
          </CardContent>
        </Card>

        {/* Active alerts */}
        <Card className={cn(dashboardCardClass(undefined, isDemo), 'lg:col-span-2')}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Actieve alerts</CardTitle>
            {isDemo && wwsAlerts.length > 0 && (
              <Link href={`${basePath}/compliance/alerts`}>
                <Button variant="ghost" size="sm" className="text-xs h-7 rounded-full text-gray-500 hover:text-[#163300] dark:hover:text-[#9FE870]">
                  Alle alerts
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {isDemo && wwsAlerts.length > 0 ? (
              <div className="space-y-3">
                {wwsAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      alert.urgency === 'hoog' ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-500/10')}>
                      <AlertTriangle className={cn('h-4 w-4', alert.urgency === 'hoog' ? 'text-red-500' : 'text-amber-500')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{alert.address} — {alert.description}</p>
                      <p className="text-xs text-[#163300] dark:text-[#9FE870] mt-1 font-medium">→ {alert.actie}</p>
                    </div>
                    <Badge className={cn('shrink-0 border-0 text-xs',
                      alert.urgency === 'hoog'
                        ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400')}>
                      {alert.urgency === 'hoog' ? 'Hoog' : 'Middel'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 py-6 text-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Geen actieve compliance alerts</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* WWS Object table */}
      <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden')}>
        <CardHeader className={cn('space-y-3', tableBleed && DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-lg text-[#163300] dark:text-[#9FE870]">WWS Objecten</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredAndSorted.length} van {wwsObjects.length} objecten
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-[200px] flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3">
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <Input
                  placeholder="Zoek adres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 h-8 px-2 text-sm bg-transparent"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={cn('inline-flex', DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS)}>
                    <span>Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className={DASHBOARD_FILTER_MENU_CONTENT_CLASS}>
                  <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Sector</DropdownMenuLabel>
                  {(['sociaal', 'midden', 'vrij'] as WWSSector[]).map((s) => (
                    <DropdownMenuCheckboxItem key={s} checked={sectorFilter[s]}
                      onCheckedChange={(v) => setSectorFilter((f) => ({ ...f, [s]: Boolean(v) }))}
                      onSelect={(e) => e.preventDefault()}
                      className={cn(DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS, 'capitalize')}>
                      {SECTOR_LABELS[s]}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuLabel className="px-2 pb-1 pt-2 text-xs font-medium text-gray-500 dark:text-gray-400">Status</DropdownMenuLabel>
                  {(['compliant', 'verlopen', 'te_hoog', 'pdf_mist'] as const).map((s) => (
                    <DropdownMenuCheckboxItem key={s} checked={statusFilter[s]}
                      onCheckedChange={(v) => setStatusFilter((f) => ({ ...f, [s]: Boolean(v) }))}
                      onSelect={(e) => e.preventDefault()}
                      className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}>
                      {STATUS_LABELS[s]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 h-9 text-sm font-medium shrink-0">
                <Download className="h-4 w-4 mr-2" />
                Exporteer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn('p-0', tableBleed && DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>
          <DashboardTableBlock empty={filteredAndSorted.length === 0}>
            <Table>
              <TableHeader>
                <TableRow>
                  {([
                    { key: 'address', label: 'Adres' },
                    { key: 'punten', label: 'Punten' },
                    { key: 'sector', label: 'Sector' },
                    { key: 'maxHuur', label: 'Max huur' },
                    { key: 'huidigeHuur', label: 'Huidig' },
                    { key: 'verschil', label: 'Marge' },
                    { key: 'status', label: 'Status' },
                    { key: 'laatsteCheck', label: 'Check' },
                  ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                    <TableHead key={key} className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort(key)}>
                        {label}
                        <SortIcon col={key} />
                      </button>
                    </TableHead>
                  ))}
                  <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'text-right')}>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.map((obj) => (
                  <TableRow key={obj.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
                    <TableCell className="py-3.5 px-3.5 font-medium text-gray-900 dark:text-white">{obj.address}</TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-700 dark:text-gray-200">{obj.punten}</TableCell>
                    <TableCell className="py-3.5 px-3.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: SECTOR_COLORS[obj.sector] }} />
                        {SECTOR_LABELS[obj.sector]}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-700 dark:text-gray-200">€{obj.maxHuur.toLocaleString('nl-NL')}</TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-700 dark:text-gray-200">€{obj.huidigeHuur.toLocaleString('nl-NL')}</TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm">
                      <span className={cn('font-medium', obj.verschil >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        {obj.verschil >= 0 ? '+' : ''}€{obj.verschil}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5">{getStatusBadge(obj.status)}</TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {format(new Date(obj.laatsteCheck), 'd MMM yyyy', { locale: nl })}
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5 text-right">
                      <Button size="sm" variant="outline" className="rounded-full h-7 px-3 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Bekijk
                      </Button>
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
