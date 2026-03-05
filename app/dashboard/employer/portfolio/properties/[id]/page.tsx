'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  MapPin,
  DoorOpen,
  FileText,
  Download,
  Eye,
  Trash2,
  Upload,
  Edit,
} from 'lucide-react'
import { propertyQueries, leaseQueries, documentQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { basePath } = useDashboardUser()
  const propertyId = params.id as string
  const initialTab = searchParams.get('tab') || 'basic'
  const [activeTab, setActiveTab] = useState(initialTab)
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

  // Load documents for this property
  useEffect(() => {
    documentQueries.getByProperty(propertyId).then(setPropertyDocuments).catch(() => setPropertyDocuments([]))
  }, [propertyId])

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
          <Button onClick={() => router.push(`${basePath}/portfolio`)}>
            Terug naar overzicht
          </Button>
        </div>
      </>
    )
  }

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
                onClick={() => router.push(`${basePath}/portfolio`)}
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
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`${basePath}/portfolio/properties/${propertyId}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Bewerken
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic">Info</TabsTrigger>
                <TabsTrigger value="units">Units</TabsTrigger>
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
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Totale maandhuur</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            €{(property.units?.reduce((sum: number, u: any) => sum + (u.monthly_rent || 0), 0) || 0).toLocaleString('nl-NL')}
                          </p>
                        </div>
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
                      <Button 
                        className="bg-[#163300] hover:bg-[#356258] text-white"
                        onClick={() => router.push(`/dashboard/employer/portfolio/properties/${propertyId}/units/new`)}
                      >
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
                                        href={`${basePath}/tenants/${tenant.id}`}
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
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => router.push(`/dashboard/employer/portfolio/properties/${propertyId}/units/${unit.id}/edit`)}
                                >
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
                        <Button 
                          className="bg-[#163300] hover:bg-[#356258] text-white"
                          onClick={() => router.push(`/dashboard/employer/portfolio/properties/${propertyId}/units/new`)}
                        >
                          <DoorOpen className="h-4 w-4 mr-2" />
                          Eerste Unit Toevoegen
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Documenten */}
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

