'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Home,
  Euro,
  Eye,
  Edit,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { mockTenants } from '@/lib/mock-data/vastgoed'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function TenantsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTenants = mockTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.property.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getBalanceBadge = (balance: number) => {
    if (balance === 0) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500">Op peil</Badge>
    } else if (balance < 0) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500">Openstaand</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500">Teveel betaald</Badge>
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Huurders
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Beheer al je huurders en hun contracten
                </p>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/employer/tenants/new')}
                className="bg-[#002A1F] hover:bg-[#356258] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Huurder
              </Button>
            </div>

            {/* Search */}
            <Card className="mb-6 border border-gray-200 dark:border-neutral-700">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Zoek op naam, email of object..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tenants Table */}
            <Card className="border border-gray-200 dark:border-neutral-700">
              <CardHeader>
                <CardTitle>Alle Huurders ({filteredTenants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-neutral-800">
                      <TableHead>Huurder</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Object</TableHead>
                      <TableHead>Contract</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTenants.map((tenant) => (
                      <TableRow key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#002A1F]/10 dark:bg-[#9AFF7C]/20 flex items-center justify-center">
                              <Users className="h-5 w-5 text-[#002A1F] dark:text-[#9AFF7C]" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {tenant.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {tenant.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-3 w-3" />
                              {tenant.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="h-3 w-3" />
                              {tenant.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{tenant.property.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">€{tenant.lease.monthlyRent.toLocaleString('nl-NL')}/maand</div>
                            <div className="text-gray-500">Tot {new Date(tenant.lease.endDate).toLocaleDateString('nl-NL')}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tenant.balance !== 0 && (
                            <div className="flex items-center gap-1">
                              <Euro className="h-4 w-4 text-gray-400" />
                              <span className={`font-medium ${tenant.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                €{Math.abs(tenant.balance).toLocaleString('nl-NL')}
                              </span>
                            </div>
                          )}
                          {getBalanceBadge(tenant.balance)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500">
                            {tenant.status === 'actief' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                            {tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/employer/tenants/${tenant.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Bekijken
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/employer/tenants/${tenant.id}/edit`)}>
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

