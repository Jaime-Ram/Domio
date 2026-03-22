'use client'

import { useState, useMemo } from 'react'
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
      <SectionNavDashboard title="Compliance" items={COMPLIANCE_NAV} titleVariant="hero" />
    </>
  )
}
