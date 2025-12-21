'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Building2,
  Plus,
  Search,
  Filter,
  Home,
  MapPin,
  Users,
  Euro,
  Eye,
  Edit,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { mockProperties } from '@/lib/mock-data/vastgoed'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function PropertiesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = 
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.tenant?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
    <div className="container mx-auto max-w-7xl px-4">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Objecten
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Beheer al je vastgoedobjecten
                </p>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/employer/portfolio/properties/new')}
                className="bg-[#002A1F] hover:bg-[#356258] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Object
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6 border border-gray-200 dark:border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Zoek op naam, adres of huurder..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Status: {statusFilter === 'all' ? 'Alle' : statusFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                        Alle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('verhuurd')}>
                        Verhuurd
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('leegstand')}>
                        Leegstand
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('renovatie')}>
                        Renovatie
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* Properties Table */}
            <Card className="border border-gray-200 dark:border-neutral-700">
              <CardHeader>
                <CardTitle>Alle Objecten ({filteredProperties.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-neutral-800">
                      <TableHead>Object</TableHead>
                      <TableHead>Adres</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Huurder</TableHead>
                      <TableHead>Huurprijs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#002A1F]/10 dark:bg-[#9AFF7C]/20 flex items-center justify-center">
                              <Home className="h-5 w-5 text-[#002A1F] dark:text-[#9AFF7C]" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {property.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {property.size}m² • {property.rooms} {property.rooms === 1 ? 'kamer' : 'kamers'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4" />
                            {property.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{property.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {property.tenant ? (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{property.tenant.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Geen huurder</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Euro className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">€{property.monthlyRent.toLocaleString('nl-NL')}</span>
                            <span className="text-sm text-gray-500">/maand</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(property.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/employer/portfolio/properties/${property.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Bekijken
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/employer/portfolio/properties/${property.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Bewerken
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
  )
}

