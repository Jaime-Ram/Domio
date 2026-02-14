'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Building2,
  Plus,
  Search,
  MapPin,
  Home,
  Euro,
  Users,
  Eye,
  Grid3x3,
  Table2,
  Image as ImageIcon,
  Ruler,
  DoorOpen,
  UserCircle,
  Briefcase,
} from 'lucide-react'
import { mockProperties } from '@/lib/mock-data/vastgoed'
import Link from 'next/link'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'

export default function PortfolioPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const filteredProperties = mockProperties.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verhuurd':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500">Verhuurd</Badge>
      case 'leegstand':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-500">Leegstand</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-500">{status}</Badge>
    }
  }

  const getTotalTenants = (property: typeof mockProperties[0]) => {
    // Voor appartementen is dit meestal 1 huurder, voor kantoren kan dit meer zijn
    return property.tenant ? 1 : 0
  }

  const getMonthlyIncome = (property: typeof mockProperties[0]) => {
    return property.status === 'verhuurd' ? property.monthlyRent : 0
  }

  // Group properties by registration/owner
  type Property = typeof mockProperties[0]
  type Registration = NonNullable<Property['registration']>
  
  const groupedByOwner = mockProperties.reduce((acc, property) => {
    if (property.registration) {
      const key = property.registration.name
      if (!acc[key]) {
        acc[key] = {
          registration: property.registration,
          properties: [] as Property[],
          totalIncome: 0,
          totalProperties: 0,
        }
      }
      acc[key].properties.push(property)
      acc[key].totalIncome += getMonthlyIncome(property)
      acc[key].totalProperties += 1
    }
    return acc
  }, {} as Record<string, {
    registration: Registration
    properties: Property[]
    totalIncome: number
    totalProperties: number
  }>)

  const ownerGroups = Object.values(groupedByOwner)

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Portefeuille
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overzicht van al je panden en objecten
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/employer/portfolio/properties/new')}
          className="bg-[#002A1F] hover:bg-[#356258] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuw Pand
        </Button>
      </div>

      {/* Vastgoedhouders / Tenaamstellingen Overzicht */}
      {ownerGroups.length > 0 && (
        <Card className={dashboardCardClass('mb-6')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#002A1F] dark:text-[#9FE870]" />
              Vastgoedhouders & Tenaamstellingen
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Overzicht van panden gegroepeerd per vastgoedhouder of tenaamstelling
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownerGroups.map((group, index) => (
                <Card 
                  key={index}
                  className={dashboardCardClass('hover:border-[#002A1F] dark:hover:border-[#9FE870] transition-colors cursor-pointer')}
                  onClick={() => {
                    // Filter properties by this owner
                    const ownerProperties = group.properties
                    console.log('Filter by owner:', group.registration.name, ownerProperties)
                    // You could add filtering functionality here
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {group.registration.type === 'bedrijf' ? (
                        <Briefcase className="h-5 w-5 text-[#002A1F] dark:text-[#9FE870] mt-0.5" />
                      ) : (
                        <UserCircle className="h-5 w-5 text-[#002A1F] dark:text-[#9FE870] mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {group.registration.name}
                        </CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-2">
                          {group.registration.type === 'bedrijf' ? 'Bedrijf' : 'Persoon'}
                        </p>
                        {group.registration.kvkNumber && (
                          <Badge variant="outline" className="text-xs">
                            KVK: {group.registration.kvkNumber}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Panden</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {group.totalProperties}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Maandinkomsten</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          €{group.totalIncome.toLocaleString('nl-NL')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{group.registration.address}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and View Toggle */}
      <Card className={dashboardCardClass('mb-6')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Zoek op naam, adres of type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-neutral-700 pl-4">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-[#002A1F] text-white hover:bg-[#356258]' : ''}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('table')}
                className={viewMode === 'table' ? 'bg-[#002A1F] text-white hover:bg-[#356258]' : ''}
              >
                <Table2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Overview - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card 
              key={property.id} 
              className="border border-gray-200 dark:border-neutral-700 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(`/dashboard/employer/portfolio/properties/${property.id}`)}
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-neutral-800 overflow-hidden rounded-t-lg">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#002A1F]/10 to-[#356258]/10">
                  <Building2 className="h-16 w-16 text-[#002A1F]/50 dark:text-[#9FE870]/50" />
                </div>
                <div className="absolute top-3 right-3">
                  {getStatusBadge(property.status)}
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {property.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{property.address}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Tenaamstelling */}
                {property.registration && (
                  <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                    <div className="flex items-start gap-2">
                      {property.registration.type === 'bedrijf' ? (
                        <Briefcase className="h-4 w-4 text-gray-400 mt-0.5" />
                      ) : (
                        <UserCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tenaamstelling</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {property.registration.name}
                        </p>
                        {property.registration.kvkNumber && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            KVK: {property.registration.kvkNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Property Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                      <p className="font-medium text-gray-900 dark:text-white">{property.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Huurders</p>
                      <p className="font-medium text-gray-900 dark:text-white">{getTotalTenants(property)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Euro className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Maandinkomsten</p>
                      <p className="font-medium text-gray-900 dark:text-white">€{getMonthlyIncome(property).toLocaleString('nl-NL')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Ruler className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Oppervlakte</p>
                      <p className="font-medium text-gray-900 dark:text-white">{property.size} m²</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <DoorOpen className="h-4 w-4" />
                    <span>{property.rooms} {property.rooms === 1 ? 'kamer' : 'kamers'}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#002A1F] hover:text-[#002A1F] hover:bg-[#002A1F]/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/employer/portfolio/properties/${property.id}`)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Bekijken
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Properties Overview - Table View */}
      {viewMode === 'table' && (
        <Card className={dashboardCardClass()}>
          <CardHeader>
            <CardTitle>Alle Panden ({filteredProperties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Pand</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tenaamstelling</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Soort</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Huurders</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Maandinkomsten</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Oppervlakte</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr 
                      key={property.id} 
                      className="border-b border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/employer/portfolio/properties/${property.id}`)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-gray-200 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#002A1F]/10 to-[#356258]/10">
                              <Building2 className="h-6 w-6 text-[#002A1F]/50 dark:text-[#9FE870]/50" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{property.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property.address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                        {property.type}
                      </td>
                      <td className="py-4 px-4">
                        {property.registration ? (
                          <div className="flex items-center gap-2">
                            {property.registration.type === 'bedrijf' ? (
                              <Briefcase className="h-4 w-4 text-gray-400" />
                            ) : (
                              <UserCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {property.registration.name}
                              </div>
                              {property.registration.kvkNumber && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  KVK: {property.registration.kvkNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Niet opgegeven</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {property.type === 'Appartement' ? 'Woonruimte' : 'Commercieel'}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                        {getTotalTenants(property)}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                        €{getMonthlyIncome(property).toLocaleString('nl-NL')}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {property.size} m²
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(property.status)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/employer/portfolio/properties/${property.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredProperties.length === 0 && (
        <Card className={dashboardCardClass()}>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Geen panden gevonden</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}

