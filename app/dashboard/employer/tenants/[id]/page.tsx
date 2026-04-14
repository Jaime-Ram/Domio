'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  dashboardCardClass,
  DASHBOARD_TABLE_TOOLBAR_HEADER_DASHBOARD_CLASS,
  DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS,
} from '@/app/dashboard/employer/dashboard-ui'
import { DashboardTableBlock } from '@/components/dashboard/dashboard-table-block'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardTableHead, DashboardTableCell } from '@/components/dashboard/dashboard-table'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Home,
  Euro,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Wrench,
  Shield,
  Briefcase,
  Tag,
  ExternalLink,
  Plus,
} from 'lucide-react'
import { mockPayments } from '@/lib/mock-data/vastgoed'
import { tenantQueries, leaseQueries } from '@/lib/supabase/queries'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { getUser } from '@/lib/supabase/auth'

export default function TenantDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isDemo, basePath } = useDashboardUser()
  const tenantId = params.id as string
  
  const [tenant, setTenant] = useState<any>(null)
  const [leases, setLeases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('Betrouwbare huurder, betaalt altijd op tijd.')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [tags, setTags] = useState<string[]>(isDemo ? ['Langdurige huurder'] : [])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    const loadTenant = async () => {
      try {
        const { user } = await getUser()
        if (!user) {
          router.push('/login')
          return
        }
        const tenantData = await tenantQueries.getById(tenantId)
        setTenant(tenantData)
        
        // Load leases for this tenant
        const tenantLeases = await leaseQueries.getByOwner(user.id)
        const filteredLeases = tenantLeases?.filter((l: any) => l.tenant_id === tenantId) || []
        setLeases(filteredLeases)
      } catch (error: unknown) {
        // Supabase .single() throws PGRST116 when no row found — show "not found" UI
        const err = error as { code?: string; message?: string }
        if (err?.code === 'PGRST116') {
          setTenant(null)
          return
        }
        const message = err?.message ?? (error instanceof Error ? error.message : String(error))
        console.error('Failed to load tenant:', message || error)
      } finally {
        setLoading(false)
      }
    }
    loadTenant()
  }, [tenantId, router])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-neutral-700 rounded w-1/3" />
        <div className="h-64 bg-gray-200 dark:bg-neutral-700 rounded" />
        <div className="h-96 bg-gray-200 dark:bg-neutral-700 rounded" />
      </div>
    )
  }
  
  if (!tenant) {
    return (
      <>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-[#163300] dark:text-[#9FE870] mb-4">
            Huurder niet gevonden
          </h2>
          <Button onClick={() => router.push(`${basePath}/tenants`)}>
            Terug naar overzicht
          </Button>
        </div>
      </>
    )
  }

  // Get current lease info
  const activeLease = leases?.find((l: any) => l.status === 'actief')
  
  // Payment history: mock in demo, empty for real accounts (would use paymentQueries by tenant)
  const paymentHistory = isDemo
    ? [
        { id: '1', month: 'Januari 2024', year: 2024, amount: activeLease?.monthly_rent || 0, paidOn: '2024-01-01', status: 'Betaald' },
        { id: '2', month: 'December 2023', year: 2023, amount: activeLease?.monthly_rent || 0, paidOn: '2023-12-01', status: 'Betaald' },
        { id: '3', month: 'November 2023', year: 2023, amount: activeLease?.monthly_rent || 0, paidOn: '2023-11-03', status: 'Te laat' },
        { id: '4', month: 'Oktober 2023', year: 2023, amount: activeLease?.monthly_rent || 0, paidOn: '2023-10-01', status: 'Betaald' },
        { id: '5', month: 'September 2023', year: 2023, amount: activeLease?.monthly_rent || 0, paidOn: null, status: 'Openstaand' },
      ]
    : []

  const totalArrears = paymentHistory
    .filter(p => p.status === 'Openstaand')
    .reduce((sum, p) => sum + p.amount, 0)

  const mockDocuments = isDemo ? [
    { id: '1', name: 'Huurovereenkomst 2023', category: 'Contract', date: '2023-01-01', sharedWithTenant: true },
    { id: '2', name: 'Borgovereenkomst', category: 'Borg', date: '2023-01-01', sharedWithTenant: true },
    { id: '3', name: 'Kopie ID-bewijs', category: 'Identificatie', date: '2023-01-03', sharedWithTenant: false },
    { id: '4', name: 'Salarisstrook jan 2023', category: 'Inkomen', date: '2023-01-05', sharedWithTenant: false },
    { id: '5', name: 'Plaatsbeschrijving intrede', category: 'Inspectie', date: '2023-01-05', sharedWithTenant: true },
    { id: '6', name: 'Jaarafrekening servicekosten 2025', category: 'Financieel', date: '2026-02-01', sharedWithTenant: true },
  ] : []

  const mockTickets = isDemo ? [
    { id: '1', title: 'Lekkage badkamer', category: 'Loodgieterswerk', status: 'in_behandeling', priority: 'hoog', date: '2026-04-02' },
    { id: '2', title: 'Kapotte CV-ketel', category: 'Verwarming', status: 'afgerond', priority: 'urgent', date: '2026-01-15' },
    { id: '3', title: 'Tochtige ramen woonkamer', category: 'Ramen/deuren', status: 'open', priority: 'normaal', date: '2025-11-10' },
  ] : []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Betaald':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500">Betaald</Badge>
      case 'Openstaand':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500">Openstaand</Badge>
      case 'Te laat':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500">Te laat</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Betaald':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'Openstaand':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'Te laat':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  return (
    <>
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => router.push(`${basePath}/tenants`)}
                className="mb-4 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar overzicht
              </Button>
              
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870] mb-2">
                    {tenant.full_name}
                  </h1>
                  {activeLease && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Home className="h-4 w-4" />
                      Unit {activeLease.unit_id}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {totalArrears > 0 ? (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500">
                      Achterstand: €{totalArrears.toLocaleString('nl-NL')}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500">
                      Up-to-date
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    className="rounded-full gap-2 text-sm"
                    onClick={() => window.open(`/portal/huurder/${tenantId}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Portaal
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full text-sm"
                    onClick={() => router.push(`${basePath}/tenants/${tenantId}/edit`)}
                  >
                    Bewerken
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="flex w-fit gap-1 bg-gray-100 dark:bg-neutral-800 rounded-full p-1 mb-6">
                {[
                  { value: 'details', label: 'Gegevens' },
                  { value: 'payments', label: 'Betalingen' },
                  { value: 'documents', label: 'Documenten' },
                  { value: 'tickets', label: 'Tickets' },
                ].map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}
                    className="px-4 py-1.5 rounded-full text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:text-[#163300] dark:data-[state=active]:text-[#9FE870] data-[state=active]:shadow-sm">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab 1: Gegevens */}
              <TabsContent value="details">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-content-blocks">
                  <Card className={dashboardCardClass('lg:col-span-2', isDemo)}>
                    <CardHeader>
                      <CardTitle>Persoonlijke Gegevens</CardTitle>
                      <CardDescription>Contact- en contractinformatie</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Contact gegevens */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Naam</p>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <p className="font-medium text-gray-900 dark:text-white">{tenant.full_name}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Telefoon</p>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p className="font-medium text-gray-900 dark:text-white">{tenant.phone || '-'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <p className="font-medium text-gray-900 dark:text-white">{tenant.email || '-'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Geboortedatum</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="font-medium text-gray-900 dark:text-white">{tenant.date_of_birth || '-'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Extra profiel velden */}
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Extra gegevens</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">IBAN (incasso)</p>
                            <div className="flex items-center gap-2">
                              <Euro className="h-4 w-4 text-gray-400" />
                              <p className="font-medium text-gray-900 dark:text-white">{isDemo ? 'NL91 ABNA 0417 1643 00' : '-'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Werkgever</p>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-gray-400" />
                              <p className="font-medium text-gray-900 dark:text-white">{isDemo ? 'Acme BV — vast dienstverband' : '-'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Noodcontact</p>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-400" />
                              <p className="font-medium text-gray-900 dark:text-white">{isDemo ? 'A. Jansen (partner) · +31 6 98765432' : '-'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Labels</p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {tags.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1 text-xs bg-[#163300]/5 text-[#163300] dark:bg-[#9FE870]/10 dark:text-[#9FE870] px-2 py-0.5 rounded-full">
                                  <Tag className="h-2.5 w-2.5" />{t}
                                </span>
                              ))}
                              {tags.length === 0 && <span className="text-sm text-gray-400">—</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Object & Contract</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pand</p>
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-gray-400" />
                              <Button 
                                variant="link" 
                                className="p-0 h-auto font-medium text-[#163300] dark:text-[#9FE870]"
                                onClick={() => router.push(`${basePath}/portfolio/properties/${tenant.property?.id}`)}
                              >
                                {tenant.property?.address}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Startdatum huur</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <p className="font-medium text-gray-900 dark:text-white">
                                {tenant.lease?.startDate ? new Date(tenant.lease.startDate).toLocaleDateString('nl-NL') : '-'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Huurprijs</p>
                            <div className="flex items-center gap-2">
                              <Euro className="h-4 w-4 text-gray-400" />
                              <p className="font-medium text-gray-900 dark:text-white">
                                €{tenant.lease?.monthlyRent.toLocaleString('nl-NL') || 0}/mnd
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Borgsom</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              €{((tenant.lease?.monthlyRent || 0) * 2).toLocaleString('nl-NL')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notities */}
                  <Card className={dashboardCardClass(undefined, isDemo)}>
                    <CardHeader>
                      <CardTitle>Notities</CardTitle>
                      <CardDescription>Memo&apos;s over deze huurder</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Voeg notities toe..."
                        className="min-h-[200px] resize-none"
                      />
                      <Button className="w-full mt-3" size="sm" variant="outline">
                        Opslaan
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab 2: Betalingen */}
              <TabsContent value="payments">
                <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden')}>
                  <CardHeader className="space-y-0 px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Betalingshistorie</CardTitle>
                        <CardDescription>Overzicht van alle huurbetalingen</CardDescription>
                      </div>
                      <Button 
                        className="bg-[#163300] hover:bg-[#356258] text-white"
                        onClick={() => setShowPaymentModal(true)}
                      >
                        <Euro className="h-4 w-4 mr-2" />
                        Registreer Betaling
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className={cn('p-0 px-0 pb-0', DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>
                    {/* Totale achterstand */}
                    {totalArrears > 0 && (
                      <div className="px-6 pb-4">
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <p className="font-semibold text-red-900 dark:text-red-400">Totale achterstand</p>
                          </div>
                          <p className="text-2xl font-bold text-red-900 dark:text-red-400">
                            €{totalArrears.toLocaleString('nl-NL')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Betalingen tabel — tegen kaartrand, geen dubbele CardContent-marge */}
                    <DashboardTableBlock empty={paymentHistory.length === 0}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <DashboardTableHead>Periode</DashboardTableHead>
                          <DashboardTableHead>Bedrag</DashboardTableHead>
                          <DashboardTableHead>Betaald op</DashboardTableHead>
                          <DashboardTableHead>Status</DashboardTableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                            <DashboardTableCell>
                              <p className="font-medium text-gray-900 dark:text-white">{payment.month}</p>
                            </DashboardTableCell>
                            <DashboardTableCell>
                              <p className="font-medium text-gray-900 dark:text-white">
                                €{payment.amount.toLocaleString('nl-NL')}
                              </p>
                            </DashboardTableCell>
                            <DashboardTableCell>
                              {payment.paidOn ? (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(payment.paidOn).toLocaleDateString('nl-NL')}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-400">-</p>
                              )}
                            </DashboardTableCell>
                            <DashboardTableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(payment.status)}
                                {getStatusBadge(payment.status)}
                              </div>
                            </DashboardTableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </DashboardTableBlock>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Tab 3: Documenten */}
              <TabsContent value="documents">
                <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden')}>
                  <CardHeader className="px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Documenten</CardTitle>
                        <CardDescription>Dossier van deze huurder</CardDescription>
                      </div>
                      <Button className="rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] h-9 px-4 text-sm font-medium gap-2">
                        <Plus className="h-4 w-4" />Document toevoegen
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pb-2">
                    {mockDocuments.length === 0 ? (
                      <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        Nog geen documenten opgeslagen.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
                        {mockDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-neutral-800/40">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg border border-gray-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                  {doc.category} · {new Date(doc.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.sharedWithTenant && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">Zichtbaar voor huurder</span>
                              )}
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-gray-700">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 4: Tickets */}
              <TabsContent value="tickets">
                <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden')}>
                  <CardHeader className="px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Onderhoudsmeldingen</CardTitle>
                        <CardDescription>Tickets gekoppeld aan deze huurder</CardDescription>
                      </div>
                      <Button
                        className="rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] h-9 px-4 text-sm font-medium gap-2"
                        onClick={() => router.push(`${basePath}/maintenance`)}
                      >
                        <Plus className="h-4 w-4" />Nieuw ticket
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pb-2">
                    {mockTickets.length === 0 ? (
                      <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                        <Wrench className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        Geen meldingen voor deze huurder.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
                        {mockTickets.map((ticket) => {
                          const statusMap: Record<string, { label: string; cls: string }> = {
                            open: { label: 'Open', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
                            in_behandeling: { label: 'In behandeling', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
                            afgerond: { label: 'Afgerond', cls: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-500' },
                          }
                          const s = statusMap[ticket.status] ?? statusMap.open
                          return (
                            <div key={ticket.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-neutral-800/40 cursor-pointer"
                              onClick={() => router.push(`${basePath}/maintenance`)}>
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg border border-gray-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                                  <Wrench className="h-4 w-4 text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.title}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {ticket.category} · {new Date(ticket.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium border-0', s.cls)}>{s.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
    </>
  )
}

