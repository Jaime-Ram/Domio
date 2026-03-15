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
  Euro,
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Upload,
  Receipt,
  CreditCard,
  Scan,
} from 'lucide-react'
import { mockPayments, mockExpenses, mockTenants, mockProperties } from '@/lib/mock-data/vastgoed'
import { demoLinkedAccounts } from '@/lib/mock-data/domio-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'

const getFinancialNav = (basePath: string) => [
  { label: 'Facturatie', href: `${basePath}/financial`, icon: Receipt },
  { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
  { label: 'Rendement', href: `${basePath}/financial/rendement`, icon: TrendingUp },
  { label: 'Bankimport', href: `${basePath}/financial/bankimport`, icon: Scan },
]

const FINANCIAL_WIDGET_IDS = ['totalCards', 'inkomsten', 'uitgaven'] as const
type FinancialWidgetId = (typeof FINANCIAL_WIDGET_IDS)[number]
const defaultFinancialWidgets: Record<FinancialWidgetId, boolean> = { totalCards: false, inkomsten: false, uitgaven: false }

export default function FinancialPage() {
  const router = useRouter()
  const { isDemo, basePath, profile } = useDashboardUser()
  const showLinkedAccounts = isDemo || profile?.full_name?.trim() === 'Jaime Ram'
  const FINANCIAL_NAV = getFinancialNav(basePath)
  const [visibleWidgets, setVisibleWidgets] = useState<Record<FinancialWidgetId, boolean>>(defaultFinancialWidgets)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    tenantId: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'betaald',
    notes: '',
  })

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    propertyId: '',
    invoice: null as File | null,
  })

  // Calculate totals for this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const payments = isDemo ? mockPayments : []
  const expenses = isDemo ? mockExpenses : []
  const tenants = isDemo ? mockTenants : []
  const properties = isDemo ? mockProperties : []

  const monthlyIncome = payments
    .filter((p: any) => {
      const paymentDate = p.paidDate ? new Date(p.paidDate) : new Date(p.dueDate)
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear &&
             p.status === 'betaald'
    })
    .reduce((sum: number, p: any) => sum + p.amount, 0)

  const monthlyExpenses = expenses
    .filter((e: any) => {
      const expenseDate = new Date(e.date)
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear
    })
    .reduce((sum: number, e: any) => sum + e.amount, 0)

  const balance = monthlyIncome - monthlyExpenses

  const getPaymentStatusBadge = (status: string, dueDate: string, paidDate: string | null) => {
    if (status === 'betaald') {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Betaald</Badge>
    }
    const isOverdue = new Date(dueDate) < new Date()
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500"><AlertCircle className="h-3 w-3 mr-1" />Achterstallig</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500"><Clock className="h-3 w-3 mr-1" />Openstaand</Badge>
  }

  const handleRegisterPayment = () => {
    console.log('Registreer betaling:', paymentForm)
    setShowPaymentModal(false)
    // Reset form
    setPaymentForm({
      tenantId: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'betaald',
      notes: '',
    })
  }

  const handleAddExpense = () => {
    console.log('Voeg uitgave toe:', expenseForm)
    setShowExpenseModal(false)
    // Reset form
    setExpenseForm({
      description: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      propertyId: '',
      invoice: null,
    })
  }

  const exportToCSV = () => {
    console.log('Exporteer naar Excel/CSV')
    // Implementation for CSV export
  }

  return (
    <>
            <SectionNavDashboard
              title="Financieel"
              items={FINANCIAL_NAV}
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



