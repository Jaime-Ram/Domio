'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
} from 'lucide-react'
import { mockProperties, mockDocuments } from '@/lib/mock-data/vastgoed'

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  // Find property
  const property = mockProperties.find(p => p.id === propertyId)
  
  if (!property) {
    return (
      <>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Object niet gevonden
          </h2>
          <Button onClick={() => router.push('/dashboard/employer/portfolio/properties')}>
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

  // Filter documents for this property
  const propertyDocuments = mockDocuments.filter(doc => doc.property?.id === propertyId)

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
                onClick={() => router.push('/dashboard/employer/portfolio/properties')}
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
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic">Basisinfo</TabsTrigger>
                <TabsTrigger value="contract">Huurcontract & Huurder</TabsTrigger>
                <TabsTrigger value="documents">Documenten</TabsTrigger>
              </TabsList>

              {/* Tab 1: Basisinfo */}
              <TabsContent value="basic">
                <Card className="border border-gray-200 dark:border-neutral-700">
                  <CardHeader>
                    <CardTitle>Object Details</CardTitle>
                    <CardDescription>Algemene informatie over het object</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Kenmerken */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">{property.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Oppervlakte</p>
                        <div className="flex items-center gap-1">
                          <Ruler className="h-4 w-4 text-gray-400" />
                          <p className="font-medium text-gray-900 dark:text-white">{property.size} m²</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Aantal kamers</p>
                        <div className="flex items-center gap-1">
                          <DoorOpen className="h-4 w-4 text-gray-400" />
                          <p className="font-medium text-gray-900 dark:text-white">{property.rooms}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Huurprijs</p>
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <p className="font-medium text-gray-900 dark:text-white">€{property.monthlyRent}/mnd</p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      {getStatusBadge(property.status)}
                    </div>

                    {/* Tenaamstelling / Vastgoedhouder */}
                    {property.registration && (
                      <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                        <div className="flex items-start gap-3 mb-4">
                          {property.registration.type === 'bedrijf' ? (
                            <Briefcase className="h-5 w-5 text-[#002A1F] dark:text-[#9AFF7C] mt-0.5" />
                          ) : (
                            <UserCircle className="h-5 w-5 text-[#002A1F] dark:text-[#9AFF7C] mt-0.5" />
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
                                      className="text-sm text-[#002A1F] dark:text-[#9AFF7C] hover:underline"
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
                                      className="text-sm text-[#002A1F] dark:text-[#9AFF7C] hover:underline"
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

              {/* Tab 2: Huurcontract & Huurder */}
              <TabsContent value="contract">
                <div className="space-y-6">
                  {property.tenant && property.lease ? (
                    <>
                      {/* Huurder Info */}
                      <Card className="border border-gray-200 dark:border-neutral-700">
                        <CardHeader>
                          <CardTitle>Huurder Gegevens</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white font-medium">{property.tenant.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">+31 6 12345678</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{property.tenant.email}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Contract Info */}
                      <Card className="border border-gray-200 dark:border-neutral-700">
                        <CardHeader>
                          <CardTitle>Contract Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contracttype</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {property.lease.endDate ? 'Tijdelijk' : 'Vast'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Startdatum</p>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {new Date(property.lease.startDate).toLocaleDateString('nl-NL')}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Huurprijs</p>
                              <div className="flex items-center gap-1">
                                <Euro className="h-4 w-4 text-gray-400" />
                                <p className="font-medium text-gray-900 dark:text-white">
                                  €{property.lease.monthlyRent.toLocaleString('nl-NL')}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Borgsom</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                €{(property.lease.monthlyRent * 2).toLocaleString('nl-NL')}
                              </p>
                            </div>
                          </div>

                          {/* Contract documenten */}
                          <div className="border-t pt-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Documenten</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-[#002A1F] dark:text-[#9AFF7C]" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Huurcontract.pdf</p>
                                    <p className="text-xs text-gray-500">245 KB</p>
                                  </div>
                                </div>
                                <Button size="icon" variant="ghost">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-[#002A1F] dark:text-[#9AFF7C]" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Plaatsbeschrijving.pdf</p>
                                    <p className="text-xs text-gray-500">1.2 MB</p>
                                  </div>
                                </div>
                                <Button size="icon" variant="ghost">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-3">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Document
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card className="border border-gray-200 dark:border-neutral-700">
                      <CardContent className="py-12 text-center">
                        <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Geen actieve huurder
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Dit object is momenteel niet verhuurd
                        </p>
                        <Button className="bg-[#002A1F] hover:bg-[#356258] text-white">
                          Huurder Toevoegen
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Tab 3: Documenten */}
              <TabsContent value="documents">
                <Card className="border border-gray-200 dark:border-neutral-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Documenten</CardTitle>
                        <CardDescription>Alle documenten voor dit object</CardDescription>
                      </div>
                      <Button className="bg-[#002A1F] hover:bg-[#356258] text-white">
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
                              <FileText className="h-5 w-5 text-[#002A1F] dark:text-[#9AFF7C]" />
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

