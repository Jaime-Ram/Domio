'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
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
  RefreshCw,
  FileText,
  Download,
  Eye,
  ChevronUp,
  ChevronDown,
  Search,
  BarChart3,
  Calculator,
} from 'lucide-react'
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

function SectorDonutChart({
  data,
}: {
  data: { sector: string; count: number; color: string }[]
}) {
  const total = data.reduce((s, d) => s + d.count, 0)
  const circ = 2 * Math.PI * 45
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
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={d.color}
            strokeWidth="12"
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
  const router = useRouter()
  const { isDemo, basePath } = useDashboardUser()
  const COMPLIANCE_NAV = getComplianceNav(basePath)
  const [searchQuery, setSearchQuery] = useState('')
  const [sectorFilter, setSectorFilter] = useState<WWSSector | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('address')
  const [sortAsc, setSortAsc] = useState(true)

  const wwsObjects = isDemo ? mockWwsObjects : []
  const wwsAlerts = isDemo ? mockWwsAlerts : []
  const sectorDistribution = isDemo ? mockWwsSectorDistribution : []
  const vorigeJaarGemiddeld = isDemo ? mockWwsVorigeJaarGemiddeld : 0

  const compliantCount = wwsObjects.filter((o) => o.status === 'compliant').length
  const totalCount = wwsObjects.length
  const compliantPercent = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0
  const actieVereist = wwsObjects.filter((o) => o.status !== 'compliant').length
  const verlopenCount = wwsObjects.filter((o) => o.status === 'verlopen').length
  const withPunten = wwsObjects.filter((o) => o.punten > 0)
  const gemiddeldPunten = withPunten.length > 0 ? Math.round(withPunten.reduce((s, o) => s + o.punten, 0) / withPunten.length) : 0
  const trendDiff = gemiddeldPunten - vorigeJaarGemiddeld
  const vrijeSectorCount = wwsObjects.filter((o) => o.sector === 'vrij').length

  const filteredAndSorted = useMemo(() => {
    let list = wwsObjects.filter((o: WWSComplianceObject) => {
      if (searchQuery && !o.address.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (sectorFilter !== 'all' && o.sector !== sectorFilter) return false
      return true
    })
    list = [...list].sort((a: WWSComplianceObject, b: WWSComplianceObject) => {
      let cmp = 0
      switch (sortKey) {
        case 'address':
          cmp = a.address.localeCompare(b.address)
          break
        case 'punten':
          cmp = a.punten - b.punten
          break
        case 'sector':
          cmp = a.sector.localeCompare(b.sector)
          break
        case 'maxHuur':
          cmp = a.maxHuur - b.maxHuur
          break
        case 'huidigeHuur':
          cmp = a.huidigeHuur - b.huidigeHuur
          break
        case 'verschil':
          cmp = a.verschil - b.verschil
          break
        case 'status':
          cmp = (STATUS_LABELS[a.status] ?? '').localeCompare(STATUS_LABELS[b.status] ?? '')
          break
        case 'laatsteCheck':
          cmp = a.laatsteCheck.localeCompare(b.laatsteCheck)
          break
      }
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [searchQuery, sectorFilter, sortKey, sortAsc, wwsObjects])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const Th = ({ keyName, label }: { keyName: SortKey; label: string }) => (
    <TableHead>
      <button
        type="button"
        className="flex items-center gap-1 hover:text-[#163300] transition-colors"
        onClick={() => toggleSort(keyName)}
      >
        {label}
        {sortKey === keyName ? sortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" /> : null}
      </button>
    </TableHead>
  )

  return (
    <>
      <SectionNavDashboard title="Compliance" items={COMPLIANCE_NAV} />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">WWS Compliance</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Puntentelling en maximale huurprijs per woning. Sinds 1 januari 2025 verplicht bij elk nieuw contract.
        </p>
      </div>

      {/* Statusbanner */}
      <Card className={dashboardCardClass('mb-8')}>
        <CardContent className="pt-6">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {compliantCount} van {totalCount} woningen compliant ({compliantPercent}%)
          </p>
          <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500"
              style={{ width: `${compliantPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {actieVereist} woningen vereisen actie, {verlopenCount} puntentelling verlopen
          </p>
        </CardContent>
      </Card>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className={dashboardCardClass()}>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Gemiddeld puntenaantal</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {gemiddeldPunten}
              {trendDiff !== 0 && (
                <span className={`text-sm font-normal ml-2 ${trendDiff > 0 ? 'text-[#10B981]' : 'text-red-600'}`}>
                  {trendDiff > 0 ? '↑' : '↓'}
                  {Math.abs(trendDiff)} t.o.v. vorig jaar
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card className={dashboardCardClass()}>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Vrije sector woningen</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {vrijeSectorCount} van {totalCount} ({Math.round((vrijeSectorCount / totalCount) * 100)}%)
            </p>
          </CardContent>
        </Card>
        <Card className={dashboardCardClass()}>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Actie vereist</p>
            <p className="text-2xl font-bold text-amber-600">{actieVereist} woningen</p>
          </CardContent>
        </Card>
        <Card className={dashboardCardClass()}>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Verlopen puntentellingen</p>
            <p className="text-2xl font-bold text-red-600">{verlopenCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert sectie */}
      {wwsAlerts.length > 0 && (
        <Card className={dashboardCardClass('mb-8')}>
          <CardHeader>
            <CardTitle>Actie vereist</CardTitle>
            <CardDescription>Woningen met WWS-compliance problemen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wwsAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border-l-4 p-4 ${
                  alert.urgency === 'hoog'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-600'
                    : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-600'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={alert.urgency === 'hoog' ? 'destructive' : 'secondary'}
                        className={alert.urgency === 'hoog' ? '' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20'}
                      >
                        {alert.urgency === 'hoog' ? 'HOOG' : 'MIDDEN'}
                      </Badge>
                      <span className="font-semibold text-gray-900 dark:text-white">{alert.address}:</span>
                      <span className="text-gray-700 dark:text-gray-300">{alert.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alert.description}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Actie: {alert.actie}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`${basePath}/portfolio/properties/${alert.objectId}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          Bekijk object
                        </Link>
                      </Button>
                      <Button size="sm" className="bg-[#163300] hover:bg-[#163300]/90">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Herbereken
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Overzichtstabel + Sectorverdeling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className={dashboardCardClass()}>
            <CardHeader>
              <CardTitle>Overzicht per woning</CardTitle>
              <CardDescription>Sorteerbaar en filterbaar overzicht</CardDescription>
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Zoek op adres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'sociaal', 'midden', 'vrij'] as const).map((s) => (
                    <Button
                      key={s}
                      variant={sectorFilter === s ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSectorFilter(s)}
                      className={sectorFilter === s ? 'bg-[#163300] hover:bg-[#163300]/90' : ''}
                    >
                      {s === 'all' ? 'Alle' : SECTOR_LABELS[s]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-neutral-800">
                    <Th keyName="address" label="Adres" />
                    <Th keyName="punten" label="Punten" />
                    <Th keyName="sector" label="Sector" />
                    <Th keyName="maxHuur" label="Max huur" />
                    <Th keyName="huidigeHuur" label="Huidige huur" />
                    <Th keyName="verschil" label="Verschil" />
                    <Th keyName="status" label="Status" />
                    <Th keyName="laatsteCheck" label="Laatste check" />
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.map((obj) => (
                    <TableRow key={obj.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                      <TableCell className="font-medium">{obj.address}</TableCell>
                      <TableCell>{obj.punten}</TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center gap-1"
                          title={SECTOR_LABELS[obj.sector]}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: SECTOR_COLORS[obj.sector] }}
                          />
                          {SECTOR_LABELS[obj.sector]}
                        </span>
                      </TableCell>
                      <TableCell>€{obj.maxHuur.toLocaleString('nl-NL')}</TableCell>
                      <TableCell>€{obj.huidigeHuur.toLocaleString('nl-NL')}</TableCell>
                      <TableCell
                        className={
                          obj.verschil < 0
                            ? 'text-red-600 font-medium'
                            : obj.verschil > 0
                              ? 'text-green-600'
                              : ''
                        }
                      >
                        {obj.verschil >= 0 ? '+' : ''}
                        {obj.verschil !== 0 ? `€${obj.verschil}` : '-'}
                      </TableCell>
                      <TableCell>
                        {obj.status === 'compliant' ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Compliant
                          </Badge>
                        ) : obj.status === 'te_hoog' ? (
                          <Badge variant="destructive">Te hoog</Badge>
                        ) : obj.status === 'verlopen' ? (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-500/10">Verlopen</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-500/10">PDF mist</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(obj.laatsteCheck), 'd MMM yyyy', { locale: nl })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" title="Herbereken" asChild>
                            <Link href={`${basePath}/portfolio/properties/${obj.id}`}>
                              <RefreshCw className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" title="PDF" asChild>
                            <Link href={`${basePath}/portfolio/properties/${obj.id}`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sectorverdeling donut */}
        <div>
          <Card className={dashboardCardClass()}>
            <CardHeader>
              <CardTitle>Sectorverdeling</CardTitle>
              <CardDescription>Woningen per WWS-sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 w-48 mx-auto mb-4">
                <SectorDonutChart data={sectorDistribution} />
              </div>
              <div className="space-y-2">
                {sectorDistribution.map((d) => (
                  <div key={d.sector} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      {d.label}
                    </span>
                    <span className="font-medium">{d.count} woningen</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Buttons onderaan */}
      <div className="flex flex-wrap gap-3 mt-8">
        <Button className="bg-[#163300] hover:bg-[#163300]/90">
          <RefreshCw className="h-4 w-4 mr-2" />
          Bulk herberekening
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export compliance rapport
        </Button>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Download alle PDF&apos;s
        </Button>
      </div>
    </>
  )
}
