'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Home,
  MapPin,
  Ruler,
  DoorOpen,
  User,
  Phone,
  Mail,
  Calendar,
  Euro,
  FileText,
  Download,
  Eye,
  Trash2,
  Upload,
  Image as ImageIcon,
  UserCircle,
  Briefcase,
  Building,
  Edit,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react'
import { propertyQueries, unitQueries, leaseQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { mockDocuments } from '@/lib/mock-data/vastgoed'
import {
  mockWwsObjects,
  mockWwsBreakdown,
  mockWwsOptimalisatieAdviezen,
  type WWSSector,
} from '@/lib/mock-data/wws-compliance'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { documentQueries } from '@/lib/supabase/queries'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

const SECTOR_LABELS: Record<WWSSector, string> = {
  sociaal: 'Sociaal',
  midden: 'Midden',
  vrij: 'Vrij',
}

function ComplianceTabContent({
  propertyId,
  propertyAddress,
  isDemo,
}: {
  propertyId: string
  propertyAddress: string
  isDemo: boolean
}) {
  if (!isDemo) {
    return (
      <div className="space-y-6">
        <Card className={dashboardCardClass()}>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Nog geen WWS-compliance gegevens.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Voeg een puntentelling toe om te beginnen.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  const wws = mockWwsObjects.find((o) => o.id === propertyId) ?? mockWwsObjects[0]
  const totaalPunten = mockWwsBreakdown.reduce((s, b) => s + b.punten, 0)

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <Card className={dashboardCardClass()}>
        <CardContent className="pt-6">
          <div
            className={`rounded-xl border-l-4 p-4 ${
              wws.status === 'compliant'
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {wws.status === 'compliant' ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-amber-600" />
              )}
              <span className="text-lg font-semibold">
                {wws.status === 'compliant' ? 'COMPLIANT' : 'ACTIE VEREIST'} — {SECTOR_LABELS[wws.sector]} ({wws.punten >= 187 ? '≥187 punten' : wws.punten <= 143 ? '≤143 punten' : '144-186 punten'})
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Laatste berekening: {format(new Date(wws.laatsteCheck), 'd MMMM yyyy', { locale: nl })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* WWS Breakdown tabel */}
      <Card className={dashboardCardClass()}>
        <CardHeader>
          <CardTitle>WWS Puntentelling Breakdown</CardTitle>
          <CardDescription>Gedetailleerde puntentoekenning per categorie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-700">
                  <th className="text-left py-3 font-medium">Categorie</th>
                  <th className="text-right py-3 font-medium">Punten</th>
                  <th className="text-left py-3 font-medium">Toelichting</th>
                </tr>
              </thead>
              <tbody>
                {mockWwsBreakdown.map((row) => (
                  <tr key={row.category} className="border-b border-gray-100 dark:border-neutral-800">
                    <td className="py-2">{row.category}</td>
                    <td className="text-right py-2">{row.punten}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{row.toelichting}</td>
                  </tr>
                ))}
                <tr className="font-semibold bg-gray-50 dark:bg-neutral-800">
                  <td className="py-3">TOTAAL</td>
                  <td className="text-right py-3">{totaalPunten}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {wws.sector === 'vrij' ? 'VRIJE SECTOR (≥187)' : wws.sector === 'sociaal' ? 'SOCIALE SECTOR (≤143)' : 'MIDDEN SECTOR (144-186)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Huurprijs analyse */}
      <Card className={dashboardCardClass()}>
        <CardHeader>
          <CardTitle>Huurprijs analyse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Maximale huur (WWS)</span>
            <span className="font-medium">€{wws.maxHuur.toLocaleString('nl-NL')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Huidige huur</span>
            <span className="font-medium">€{wws.huidigeHuur.toLocaleString('nl-NL')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Verschil</span>
            <span className={wws.verschil >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {wws.verschil >= 0 ? '+' : ''}€{wws.verschil}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Huurprijs status: {wws.verschil >= 0 ? '✅ Onder maximum' : '🔴 Boven maximum'}
          </p>
        </CardContent>
      </Card>

      {/* Optimalisatie adviezen */}
      <Card className={dashboardCardClass()}>
        <CardHeader>
          <CardTitle>Optimalisatie advies</CardTitle>
          <CardDescription>Mogelijkheden om meer punten te behalen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockWwsOptimalisatieAdviezen.map((advies) => (
            <div
              key={advies.id}
              className="rounded-xl border border-gray-200 dark:border-neutral-700 p-4 flex items-start gap-4"
            >
              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-2">{advies.titel}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Investering: ~€{advies.investering.toLocaleString('nl-NL')} | Extra punten: ~{advies.extraPunten} | Extra huur: ~€{advies.extraHuur}/mnd
                </p>
                <p className="text-sm text-gray-500">Terugverdientijd: ~{advies.terugverdientijd} jaar</p>
                <p className="text-xs text-gray-400 mt-1">
                  Huidige situatie: {advies.huidig} → Na: {advies.na}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Compliance checklist */}
      <Card className={dashboardCardClass()}>
        <CardHeader>
          <CardTitle>Compliance checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {[
              { done: true, label: 'Puntentelling actueel (< 12 maanden oud)' },
              { done: true, label: 'PDF bij huurcontract gevoegd' },
              { done: wws.verschil >= 0, label: 'Huurprijs onder WWS-maximum' },
              { done: true, label: 'Energielabel geldig' },
              { done: true, label: 'Sector correct geclassificeerd' },
              { done: false, label: 'Huurverhogingsbrief verstuurd dit jaar' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                {item.label}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actie buttons */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-[#163300] hover:bg-[#163300]/90">
          <RefreshCw className="h-4 w-4 mr-2" />
          Herbereken punten
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline">Bekijk geschiedenis</Button>
      </div>
    </div>
  )
}

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isDemo } = useDashboardUser()
  const propertyId = params.id as string
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unitLeases, setUnitLeases] = useState<Record<string, any>>({})
  const [propertyDocuments, setPropertyDocuments] = useState<any[]>([])

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const { user } = await getUser()
        if (!user) {
          router.push('/login')
          return
        }
        const data = await propertyQueries.getWithUnits(propertyId)
        setProperty(data)
      } catch (error) {
        console.error('Failed to load property:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProperty()
  }, [propertyId, router])

  // Load documents for this property (real accounts only)
  useEffect(() => {
    if (isDemo) {
      setPropertyDocuments(mockDocuments.filter((doc: any) => doc.property?.id === propertyId))
      return
    }
    documentQueries.getByProperty(propertyId).then(setPropertyDocuments).catch(() => setPropertyDocuments([]))
  }, [propertyId, isDemo])

  // Load lease data for each unit
  useEffect(() => {
    const loadUnitLeases = async () => {
      if (!property?.units || property.units.length === 0) return

      try {
        const leaseData: Record<string, any[]> = {}
        for (const unit of property.units) {
          const unitLeases = await leaseQueries.getUnitHistory(unit.id)
          leaseData[unit.id] = unitLeases || []
        }
        setUnitLeases(leaseData)
      } catch (error) {
      }
    }
    loadUnitLeases()
  }, [property?.units])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-neutral-700 rounded w-1/3" />
        <div className="h-64 bg-gray-200 dark:bg-neutral-700 rounded" />
        <div className="h-96 bg-gray-200 dark:bg-neutral-700 rounded" />
      </div>
    )
  }
  
  if (!property) {
    return (
      <>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Object niet gevonden
          </h2>
          <Button onClick={() => router.push('/dashboard/employer/portfolio')}>
            Terug naar overzicht
          </Button>
        </div>
      </>
    )
  }

  // Mock property photos
  const photos = [
    { id: '1', url: '/images/property-1.jpg', alt: 'Woonkamer' },
    { id: '2', url: '/images/property-2.jpg', alt: 'Keuken' },
    { id: '3', url: '/images/property-3.jpg', alt: 'Slaapkamer' },
    { id: '4', url: '/images/property-4.jpg', alt: 'Badkamer' },
    { id: '5', url: '/images/property-5.jpg', alt: 'Buitenaanzicht' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verhuurd':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500">Verhuurd</Badge>
      case 'leegstand':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500">Leegstand</Badge>
      case 'renovatie':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500">Renovatie</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <>
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard/employer/portfolio')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar overzicht
              </Button>
              
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {property.name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(property.status)}
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/dashboard/employer/portfolio/properties/${propertyId}/edit`)}
                  >
                    Bewerken
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="basic">Info</TabsTrigger>
                <TabsTrigger value="units">Units</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="documents">Documenten</TabsTrigger>
              </TabsList>

              {/* Tab 1: Basisinfo */}
              <TabsContent value="basic">
                <Card className={dashboardCardClass()}>
                  <CardHeader>
                    <CardTitle>Object Details</CardTitle>
                    <CardDescription>Algemene informatie over het object</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Locatie Info */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Locatie</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Adres</p>
                          <p className="font-medium text-gray-900 dark:text-white">{property.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Postcode</p>
                          <p className="font-medium text-gray-900 dark:text-white">{property.postcode || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Stad</p>
                          <p className="font-medium text-gray-900 dark:text-white">{property.city || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Kenmerken */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Kenmerken</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</p>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">{property.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bouwjaar</p>
                          <p className="font-medium text-gray-900 dark:text-white">{property.build_year || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Energielabel</p>
                          {property.energy_label ? (
                            <Badge variant="outline">{property.energy_label}</Badge>
                          ) : (
                            <p className="font-medium text-gray-900 dark:text-white">-</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Aantal units</p>
                          <div className="flex items-center gap-1">
                            <DoorOpen className="h-4 w-4 text-gray-400" />
                            <p className="font-medium text-gray-900 dark:text-white">{property.units?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financiële Gegevens */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Financiële Gegevens</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">WOZ-waarde</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {property.woz_value ? `€${property.woz_value.toLocaleString('nl-NL')}` : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tenaamstelling / Vastgoedhouder - TODO: Add to database schema */}
                    {false && property.registration && (
                      <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                        <div className="flex items-start gap-3 mb-4">
                          {property.registration.type === 'bedrijf' ? (
                            <Briefcase className="h-5 w-5 text-[#163300] dark:text-[#9FE870] mt-0.5" />
                          ) : (
                            <UserCircle className="h-5 w-5 text-[#163300] dark:text-[#9FE870] mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tenaamstelling</p>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                              {property.registration.name}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                  {property.registration.type === 'bedrijf' ? 'Bedrijf' : 'Persoon'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Adres</p>
                                <div className="flex items-start gap-1">
                                  <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {property.registration.address}
                                  </p>
                                </div>
                              </div>
                              {property.registration.kvkNumber && (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">KVK Nummer</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {property.registration.kvkNumber}
                                  </p>
                                </div>
                              )}
                              {property.registration.rsin && (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">RSIN</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {property.registration.rsin}
                                  </p>
                                </div>
                              )}
                              {property.registration.email && (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <a 
                                      href={`mailto:${property.registration.email}`}
                                      className="text-sm text-[#163300] dark:text-[#9FE870] hover:underline"
                                    >
                                      {property.registration.email}
                                    </a>
                                  </div>
                                </div>
                              )}
                              {property.registration.phone && (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Telefoon</p>
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    <a 
                                      href={`tel:${property.registration.phone}`}
                                      className="text-sm text-[#163300] dark:text-[#9FE870] hover:underline"
                                    >
                                      {property.registration.phone}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Deze informatie is belangrijk voor boekhouding en administratieve doeleinden.
                          </p>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Tenaamstelling bewerken
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Foto's */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Foto&apos;s ({photos.length}/5)
                        </p>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Foto
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {photos.map((photo) => (
                          <div 
                            key={photo.id} 
                            className="aspect-square rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden group relative"
                          >
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Units */}
              <TabsContent value="units">
                <Card className={dashboardCardClass()}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Units</CardTitle>
                        <CardDescription>Alle units in dit object</CardDescription>
                      </div>
                      <Button className="bg-[#163300] hover:bg-[#356258] text-white">
                        <DoorOpen className="h-4 w-4 mr-2" />
                        Unit Toevoegen
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {property.units && property.units.length > 0 ? (
                      <div className="space-y-4">
                        {property.units.map((unit: any) => {
                          const leases = unitLeases[unit.id] || []
                          const tenantMap = new Map<string, { id: string; full_name: string }>()
                          for (const lease of leases) {
                            if (lease?.tenants?.id && lease?.tenants?.full_name) {
                              tenantMap.set(lease.tenants.id, {
                                id: lease.tenants.id,
                                full_name: lease.tenants.full_name,
                              })
                            }
                          }
                          const tenants = Array.from(tenantMap.values())
                          return (
                            <div key={unit.id} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-6 hover:border-gray-300 dark:hover:border-neutral-600 transition-colors">
                              {/* Unit Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <DoorOpen className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{unit.unit_number}</h3>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {unit.status === 'verhuurd' && (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500">Verhuurd</Badge>
                                  )}
                                  {unit.status === 'leegstand' && (
                                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500">Leegstand</Badge>
                                  )}
                                  {unit.status === 'onderhoud' && (
                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500">Onderhoud</Badge>
                                  )}
                                  {unit.status === 'te_verhuren' && (
                                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-500">Te verhuren</Badge>
                                  )}
                                </div>
                              </div>

                              {/* Unit Details Grid */}
                              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-neutral-700">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Kamers</p>
                                  <p className="font-medium text-gray-900 dark:text-white">{unit.rooms ? `${unit.rooms}` : '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Oppervlakte</p>
                                  <p className="font-medium text-gray-900 dark:text-white">{unit.size_m2 ? `${unit.size_m2} m²` : '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Huurprijs</p>
                                  <p className="font-medium text-gray-900 dark:text-white">{unit.monthly_rent ? `€${unit.monthly_rent.toLocaleString('nl-NL')}` : '-'}</p>
                                </div>
                              </div>

                              {/* Tenants Section */}
                              <div className="mb-4">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">Huurders</p>
                                {tenants.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {tenants.map((tenant) => (
                                      <Link
                                        key={tenant.id}
                                        href={`/dashboard/employer/tenants/${tenant.id}`}
                                        className="inline-flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                                      >
                                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                                          {tenant.full_name}
                                        </span>
                                        <Eye className="h-4 w-4 text-gray-400" />
                                      </Link>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg text-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Geen huurder</span>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 justify-end">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Bewerken
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <DoorOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Geen units beschikbaar
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Voeg units toe aan dit object
                        </p>
                        <Button className="bg-[#163300] hover:bg-[#356258] text-white">
                          <DoorOpen className="h-4 w-4 mr-2" />
                          Eerste Unit Toevoegen
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Compliance (WWS) */}
              <TabsContent value="compliance">
                <ComplianceTabContent propertyId={propertyId} propertyAddress={property.address} isDemo={isDemo} />
              </TabsContent>

              {/* Tab 4: Documenten */}
              <TabsContent value="documents">
                <Card className={dashboardCardClass()}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Documenten</CardTitle>
                        <CardDescription>Alle documenten voor dit object</CardDescription>
                      </div>
                      <Button className="bg-[#163300] hover:bg-[#356258] text-white">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {propertyDocuments.length > 0 ? (
                      <div className="space-y-2">
                        {propertyDocuments.map((doc) => (
                          <div 
                            key={doc.id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {doc.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                                  <span className="text-xs text-gray-500">{doc.size}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(doc.uploadDate).toLocaleDateString('nl-NL')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Geen documenten beschikbaar
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
    </>
  )
}

