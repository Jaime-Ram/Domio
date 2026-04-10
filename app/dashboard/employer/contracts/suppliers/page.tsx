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
  Phone, Mail, Star,
} from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'

const getContractsNav = (basePath: string) => [
  { label: 'Huurcontracten', href: `${basePath}/contracts/leases`, icon: FileText },
  { label: 'Leveranciers', href: `${basePath}/contracts/suppliers`, icon: Briefcase },
  { label: 'Sjablonen', href: `${basePath}/contracts/templates`, icon: BookOpen },
]

type SupplierCategory = 'loodgieter' | 'elektricien' | 'schilder' | 'aannemer' | 'schoonmaak' | 'tuin' | 'overig'

interface Supplier {
  id: string
  name: string
  category: SupplierCategory
  phone: string
  email: string
  rating: number
  activeContracts: number
  notes?: string
}

const CAT_LABELS: Record<SupplierCategory, string> = {
  loodgieter: 'Loodgieter', elektricien: 'Elektricien', schilder: 'Schilder',
  aannemer: 'Aannemer', schoonmaak: 'Schoonmaak', tuin: 'Tuin', overig: 'Overig',
}

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'De Wit Loodgieters', category: 'loodgieter', phone: '+31 20 1234567', email: 'info@dewit.nl', rating: 5, activeContracts: 3 },
  { id: '2', name: 'Bakker Elektro', category: 'elektricien', phone: '+31 20 9876543', email: 'bakker@elektro.nl', rating: 4, activeContracts: 2, notes: 'Voorkeursleverancier elektra' },
  { id: '3', name: 'Hendriks Schilders', category: 'schilder', phone: '+31 6 87654321', email: 'h.schilders@mail.nl', rating: 4, activeContracts: 1 },
  { id: '4', name: 'Bouw & Verbouw BV', category: 'aannemer', phone: '+31 20 5551234', email: 'info@bouwverbouw.nl', rating: 3, activeContracts: 0, notes: 'Grotere verbouwingen' },
  { id: '5', name: 'Schoon NL', category: 'schoonmaak', phone: '+31 85 1112233', email: 'contact@schoon.nl', rating: 5, activeContracts: 5 },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn('h-3.5 w-3.5', s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700')} />
      ))}
    </div>
  )
}

export default function SuppliersPage() {
  const { basePath, isDemo } = useDashboardUser()
  const CONTRACTS_NAV = getContractsNav(basePath)
  const [search, setSearch] = useState('')

  const suppliers = isDemo ? mockSuppliers : []
  const filtered = suppliers.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || CAT_LABELS[s.category].toLowerCase().includes(search.toLowerCase())
  )

  const tableBleed = filtered.length > 0

  return (
    <>
      <SectionNavDashboard title="Contracten" items={CONTRACTS_NAV} titleVariant="hero" />

      <Card className={cn(dashboardCardClass(), 'overflow-hidden')}>
        <CardHeader className={cn('space-y-3', tableBleed && DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-lg text-[#163300] dark:text-[#9FE870]">Leveranciers</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filtered.length} leveranciers</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3 sm:w-[200px]">
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <Input placeholder="Zoek leverancier..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="border-0 focus-visible:ring-0 h-8 px-2 text-sm bg-transparent" />
              </div>
              <Button className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 h-9 text-sm font-medium shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Leverancier toevoegen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn('p-0', tableBleed && DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>
          <DashboardTableBlock empty={filtered.length === 0}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Naam</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Categorie</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Contact</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Beoordeling</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Actieve contracten</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Notities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
                    <TableCell className="py-3.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-[#163300]/5 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                          <Briefcase className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5">
                      <Badge className="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border-0 text-xs">
                        {CAT_LABELS[s.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Phone className="h-3 w-3 shrink-0" />{s.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Mail className="h-3 w-3 shrink-0" />{s.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5"><StarRating rating={s.rating} /></TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-700 dark:text-gray-200">{s.activeContracts}</TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-400 dark:text-gray-500 max-w-[160px] truncate">{s.notes ?? '—'}</TableCell>
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
