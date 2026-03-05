'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus,
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  Image as ImageIcon,
  Upload,
  Eye,
  ClipboardCheck,
  Calendar,
} from 'lucide-react'
import { mockMaintenanceRequests, mockProperties } from '@/lib/mock-data/vastgoed'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'

const getMaintenanceNav = (basePath: string) => [
  { label: 'Tickets', href: `${basePath}/maintenance`, icon: Wrench },
  { label: 'Inspecties', href: `${basePath}/maintenance/inspecties`, icon: ClipboardCheck },
  { label: 'Planning', href: `${basePath}/maintenance/planning`, icon: Calendar },
]

export default function MaintenancePage() {
  const router = useRouter()
  const { isDemo, basePath } = useDashboardUser()
  const MAINTENANCE_NAV = getMaintenanceNav(basePath)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<typeof mockMaintenanceRequests[0] | null>(null)

  const maintenanceRequests = isDemo ? mockMaintenanceRequests : []
  const properties = isDemo ? mockProperties : []
  const [showDetailModal, setShowDetailModal] = useState(false)

  // New maintenance form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    propertyId: '',
    description: '',
    priority: 'normaal',
    photos: [] as File[],
  })

  // Detail modal state for status updates
  const [detailForm, setDetailForm] = useState({
    status: '',
    notes: '',
    cost: '',
    resolvedDate: '',
  })

  const filteredRequests = maintenanceRequests.filter((request: typeof mockMaintenanceRequests[0]) => {
    if (statusFilter === 'all') return true
    return request.status === statusFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500"><Clock className="h-3 w-3 mr-1" />Open</Badge>
      case 'in_behandeling':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500"><Wrench className="h-3 w-3 mr-1" />In behandeling</Badge>
      case 'gepland':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-500"><Clock className="h-3 w-3 mr-1" />Gepland</Badge>
      case 'afgerond':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Afgerond</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'spoed':
        return <Badge variant="destructive">Spoed</Badge>
      case 'hoog':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-500">Hoog</Badge>
      case 'normaal':
        return <Badge variant="outline">Normaal</Badge>
      case 'laag':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-500">Laag</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const handleNewMaintenance = () => {
    console.log('Nieuwe melding:', maintenanceForm)
    setShowNewModal(false)
    // Reset form
    setMaintenanceForm({
      propertyId: '',
      description: '',
      priority: 'normaal',
      photos: [],
    })
  }

  const handleViewDetails = (request: typeof mockMaintenanceRequests[0]) => {
    setSelectedRequest(request)
    setDetailForm({
      status: request.status,
      notes: '',
      cost: '',
      resolvedDate: request.status === 'afgerond' ? format(new Date(), 'yyyy-MM-dd') : '',
    })
    setShowDetailModal(true)
  }

  const handleSaveDetails = () => {
    console.log('Update melding:', selectedRequest?.id, detailForm)
    setShowDetailModal(false)
    setSelectedRequest(null)
  }

  return (
    <>
            <SectionNavDashboard title="Onderhoud" items={MAINTENANCE_NAV} />
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Onderhoud
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Beheer alle onderhoudsmeldingen
                </p>
              </div>
              <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
                <DialogTrigger asChild>
                  <Button className="bg-[#163300] hover:bg-[#356258] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe Melding
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Nieuwe Onderhoudsmelding</DialogTitle>
                    <DialogDescription>
                      Registreer een nieuwe onderhoudsmelding
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="property">Selecteer pand</Label>
                      <Select value={maintenanceForm.propertyId} onValueChange={(value) => setMaintenanceForm({...maintenanceForm, propertyId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kies een pand" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property: typeof mockProperties[0]) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Beschrijving probleem</Label>
                      <Textarea
                        id="description"
                        placeholder="Bijv: De kraan in de keuken lekt constant"
                        value={maintenanceForm.description}
                        onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioriteit</Label>
                      <Select value={maintenanceForm.priority} onValueChange={(value) => setMaintenanceForm({...maintenanceForm, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normaal">Normaal</SelectItem>
                          <SelectItem value="hoog">Hoog</SelectItem>
                          <SelectItem value="spoed">Spoed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="photos">Foto&apos;s uploaden (optioneel, max 3)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="photos"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            setMaintenanceForm({...maintenanceForm, photos: files.slice(0, 3)})
                          }}
                        />
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      {maintenanceForm.photos.length > 0 && (
                        <p className="text-xs text-gray-500">{maintenanceForm.photos.length} foto(&apos;s) geselecteerd</p>
                      )}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                      <p className="text-sm text-blue-900 dark:text-blue-400">
                        De datum van de melding wordt automatisch op vandaag ingesteld.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewModal(false)}>
                      Annuleren
                    </Button>
                    <Button onClick={handleNewMaintenance} className="bg-[#163300] hover:bg-[#356258]">
                      Aanmaken
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {maintenanceRequests.filter((r: any) => r.status === 'open').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">In behandeling</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {maintenanceRequests.filter((r: any) => r.status === 'in_behandeling').length}
                      </p>
                    </div>
                    <Wrench className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Spoed</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {maintenanceRequests.filter((r: any) => r.priority === 'urgent' || r.priority === 'spoed').length}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Afgerond</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {maintenanceRequests.filter((r: any) => r.status === 'afgerond').length}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className={dashboardCardClass('mb-6')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
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
                      <DropdownMenuItem onClick={() => setStatusFilter('open')}>
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('in_behandeling')}>
                        In behandeling
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('gepland')}>
                        Gepland
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('afgerond')}>
                        Afgerond
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {statusFilter !== 'all' && (
                    <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')}>
                      Reset filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Table */}
            <Card className={dashboardCardClass()}>
              <CardHeader>
                <CardTitle>Alle Meldingen ({filteredRequests.length})</CardTitle>
                <CardDescription>Klik op een melding voor meer details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-neutral-800">
                      <TableHead>Datum Melding</TableHead>
                      <TableHead>Pand</TableHead>
                      <TableHead>Probleem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioriteit</TableHead>
                      <TableHead className="text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow 
                        key={request.id} 
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                        onClick={() => handleViewDetails(request)}
                      >
                        <TableCell>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(request.createdAt), 'd MMM yyyy', { locale: nl })}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.property.address}
                          </p>
                          {request.tenant && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {request.tenant.name}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-gray-900 dark:text-white">{request.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {request.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(request.priority)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetails(request)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Detail Modal */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Melding Details</DialogTitle>
                  <DialogDescription>
                    Bekijk en update de status van deze melding
                  </DialogDescription>
                </DialogHeader>
                {selectedRequest && (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pand</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.property.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Huurder</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedRequest.tenant?.name || 'Geen huurder'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Probleem</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Beschrijving</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Prioriteit</p>
                        {getPriorityBadge(selectedRequest.priority)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Datum melding</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {format(new Date(selectedRequest.createdAt), 'd MMMM yyyy', { locale: nl })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="update-status">Status wijzigen</Label>
                        <Select value={detailForm.status} onValueChange={(value) => setDetailForm({...detailForm, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_behandeling">In behandeling</SelectItem>
                            <SelectItem value="gepland">Gepland</SelectItem>
                            <SelectItem value="afgerond">Afgerond</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notities / Oplossing / Voortgang</Label>
                        <Textarea
                          id="notes"
                          placeholder="Voeg notities toe over de voortgang of oplossing..."
                          value={detailForm.notes}
                          onChange={(e) => setDetailForm({...detailForm, notes: e.target.value})}
                          className="min-h-[80px]"
                        />
                      </div>
                      {detailForm.status === 'afgerond' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="cost">Kosten (€)</Label>
                            <Input
                              id="cost"
                              type="number"
                              placeholder="350"
                              value={detailForm.cost}
                              onChange={(e) => setDetailForm({...detailForm, cost: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="resolved-date">Datum opgelost</Label>
                            <Input
                              id="resolved-date"
                              type="date"
                              value={detailForm.resolvedDate}
                              onChange={(e) => setDetailForm({...detailForm, resolvedDate: e.target.value})}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={handleSaveDetails} className="bg-[#163300] hover:bg-[#356258]">
                    Opslaan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
    </>
  )
}

