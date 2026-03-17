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
  Ticket,
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
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'

const getMaintenanceNav = (basePath: string) => [
  { label: 'Tickets', href: `${basePath}/maintenance`, icon: Ticket },
  { label: 'Inspecties', href: `${basePath}/maintenance/inspecties`, icon: ClipboardCheck },
  { label: 'Planning', href: `${basePath}/maintenance/planning`, icon: Calendar },
]

const MAINTENANCE_WIDGET_IDS = ['stats', 'filters', 'ticketsList'] as const
type MaintenanceWidgetId = (typeof MAINTENANCE_WIDGET_IDS)[number]
const defaultMaintenanceWidgets: Record<MaintenanceWidgetId, boolean> = { stats: false, filters: false, ticketsList: false }

export default function MaintenancePage() {
  const router = useRouter()
  const { isDemo, basePath } = useDashboardUser()
  const MAINTENANCE_NAV = getMaintenanceNav(basePath)
  const [visibleWidgets, setVisibleWidgets] = useState<Record<MaintenanceWidgetId, boolean>>(defaultMaintenanceWidgets)
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
            <SectionNavDashboard
            title="Onderhoud"
            items={MAINTENANCE_NAV}
            titleVariant="hero"
            widgetMenu={
              <SectionWidgetMenu>
                <SectionWidgetMenuPlaceholder />
              </SectionWidgetMenu>
            }
          />
    </>
  )
}

