'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  BarChart3,
  Menu
} from 'lucide-react'

interface ReportData {
  data: any[]
  statistics: any
  grouped?: Record<string, any[]>
}

export default function ReportsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('hours')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  
  // Filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/dashboard/employee')
        return
      }

      setUser(profile)
      setLoading(false)
    }

    fetchUser()
    fetchEmployees()
  }, [router, supabase])

  useEffect(() => {
    if (user) {
      fetchReportData()
    }
  }, [activeTab, startDate, endDate, selectedEmployee, period, user])

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'employee')
        .order('full_name', { ascending: true })

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchReportData = async () => {
    setLoadingData(true)
    try {
      const params = new URLSearchParams({
        type: activeTab,
        startDate,
        endDate,
        period,
      })

      if (selectedEmployee !== 'all') {
        params.append('employeeId', selectedEmployee)
      }

      const response = await fetch(`/api/reports?${params.toString()}`)
      const data = await response.json()

      if (data.error) {
        console.error('Error fetching report:', data.error)
        setReportData(null)
      } else {
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      setReportData(null)
    } finally {
      setLoadingData(false)
    }
  }

  const exportToExcel = () => {
    if (!reportData?.data) return

    // Simple CSV export
    const headers = getHeadersForTab(activeTab)
    const rows = reportData.data.map(item => getRowForTab(activeTab, item))
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = () => {
    // For PDF export, we'll use window.print() for now
    // In production, you might want to use a library like jsPDF or generate on the server
    window.print()
  }

  const getHeadersForTab = (tab: string): string[] => {
    switch (tab) {
      case 'hours':
        return ['Datum', 'Werknemer', 'Starttijd', 'Eindtijd', 'Uren', 'Status', 'Uurtarief', 'Totaal']
      case 'payroll':
        return ['Datum', 'Werknemer', 'Werkgever', 'Bedrag', 'Status', 'Beschrijving']
      case 'productivity':
        return ['Werknemer', 'Totaal Uren', 'Aantal Dagen', 'Gem. Uren/Dag']
      case 'trends':
        return ['Datum', 'Aantal Urenregistraties', 'Aantal Shifts', 'Totaal Uren']
      default:
        return []
    }
  }

  const getRowForTab = (tab: string, item: any): any[] => {
    switch (tab) {
      case 'hours': {
        const start = new Date(item.start_time)
        const end = new Date(item.end_time)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        const breakHours = (item.break_duration_minutes || 0) / 60
        const workedHours = hours - breakHours
        const total = workedHours * (item.hourly_rate || 0)
        return [
          item.date,
          item.employee?.full_name || item.employee?.email || 'N/A',
          new Date(item.start_time).toLocaleTimeString('nl-NL'),
          new Date(item.end_time).toLocaleTimeString('nl-NL'),
          workedHours.toFixed(2),
          item.status,
          item.hourly_rate ? `€${item.hourly_rate.toFixed(2)}` : 'N/A',
          `€${total.toFixed(2)}`
        ]
      }
      case 'payroll':
        return [
          new Date(item.created_at).toLocaleDateString('nl-NL'),
          item.employee?.full_name || item.employee?.email || 'N/A',
          item.employer?.full_name || item.employer?.email || 'N/A',
          `€${(item.amount / 100).toFixed(2)}`,
          item.status,
          item.description || ''
        ]
      case 'productivity':
        return [
          item.employee?.full_name || item.employee?.email || 'N/A',
          item.totalHours.toFixed(2),
          item.totalDays,
          item.averageHoursPerDay.toFixed(2)
        ]
      case 'trends':
        return [
          item.date,
          item.workHoursCount,
          item.shiftsCount,
          item.totalHours.toFixed(2)
        ]
      default:
        return []
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatHours = (hours: number) => {
    return `${hours.toFixed(2)} uur`
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="w-full lg:ps-64">
        <DashboardHeader />

        <div className="sticky top-[57px] inset-x-0 z-20 bg-white border-y border-gray-200 px-4 sm:px-6 lg:px-8 lg:hidden dark:bg-neutral-800 dark:border-neutral-700">
          <div className="flex items-center py-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="shrink-0 size-4" />
              <span className="sr-only">Toggle Navigation</span>
            </Button>
            <ol className="ms-3 flex items-center whitespace-nowrap">
              <li className="flex items-center text-sm text-gray-800 dark:text-neutral-400">
                Admin Dashboard
                <svg className="shrink-0 mx-3 overflow-visible size-2.5 text-gray-400 dark:text-neutral-500" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </li>
              <li className="text-sm font-semibold text-gray-800 truncate dark:text-neutral-400" aria-current="page">
                Rapporten
              </li>
            </ol>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-neutral-200">
                Rapporten
              </h1>
              <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                Bekijk en exporteer gedetailleerde rapportages
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToExcel} disabled={!reportData?.data}>
                <Download className="size-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={exportToPDF} disabled={!reportData?.data}>
                <FileText className="size-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="border border-gray-200 dark:border-neutral-700">
            <CardHeader className="p-4 md:p-5">
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-5 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Startdatum
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Einddatum
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Werknemer
                  </label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle werknemers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle werknemers</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name || emp.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Periode
                  </label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Dag</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Maand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          {reportData?.statistics && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {activeTab === 'hours' && (
                <>
                  <Card className="border border-gray-200 dark:border-neutral-700">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-blue-600" />
                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                          Totaal Uren
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200 mt-1">
                        {formatHours(reportData.statistics.totalHours)}
                      </h3>
                    </CardHeader>
                  </Card>
                  <Card className="border border-gray-200 dark:border-neutral-700">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="size-5 text-green-600" />
                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                          Goedgekeurd
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200 mt-1">
                        {formatHours(reportData.statistics.approvedHours)}
                      </h3>
                    </CardHeader>
                  </Card>
                  <Card className="border border-gray-200 dark:border-neutral-700">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-yellow-600" />
                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                          In Afwachting
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200 mt-1">
                        {formatHours(reportData.statistics.pendingHours)}
                      </h3>
                    </CardHeader>
                  </Card>
                  <Card className="border border-gray-200 dark:border-neutral-700">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <FileText className="size-5 text-purple-600" />
                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                          Totaal Records
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200 mt-1">
                        {reportData.statistics.totalRecords}
                      </h3>
                    </CardHeader>
                  </Card>
                </>
              )}

              {activeTab === 'payroll' && (
                <>
                  <Card className="border border-gray-200 dark:border-neutral-700">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-5 text-green-600" />
                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                          Totaal Bedrag
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200 mt-1">
                        {formatCurrency(reportData.statistics.totalAmount)}
                      </h3>
                    </CardHeader>
                  </Card>
                  <Card className="border border-gray-200 dark:border-neutral-700">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="size-5 text-green-600" />
                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                          Voltooid
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200 mt-1">
                        {formatCurrency(reportData.statistics.completedAmount)}
                      </h3>
                    </CardHeader>
                  </Card>
                  <Card className="border border-gray-200 dark:border-neutral-700">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-yellow-600" />
                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                          In Afwachting
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200 mt-1">
                        {formatCurrency(reportData.statistics.pendingAmount)}
                      </h3>
                    </CardHeader>
                  </Card>
                  <Card className="border border-gray-200 dark:border-neutral-700">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <FileText className="size-5 text-purple-600" />
                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                          Totaal Betalingen
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200 mt-1">
                        {reportData.statistics.totalRecords}
                      </h3>
                    </CardHeader>
                  </Card>
                </>
              )}

              {activeTab === 'productivity' && (
                <>
                  <Card className="border border-gray-200 dark:border-neutral-700">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <Users className="size-5 text-blue-600" />
                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                          Werknemers
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200 mt-1">
                        {reportData.statistics.totalEmployees}
                      </h3>
                    </CardHeader>
                  </Card>
                  <Card className="border border-gray-200 dark:border-neutral-700">
                    <CardHeader className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-green-600" />
                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                          Gem. Uren/Werknemer
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200 mt-1">
                        {formatHours(reportData.statistics.averageHoursPerEmployee)}
                      </h3>
                    </CardHeader>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Report Tabs */}
          <Card className="border border-gray-200 dark:border-neutral-700">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-gray-200 dark:border-neutral-700 px-4 md:px-6">
                  <TabsList className="bg-transparent h-auto p-0">
                    <TabsTrigger 
                      value="hours" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary-600 rounded-none"
                    >
                      <Clock className="size-4 mr-2" />
                      Urenrapportages
                    </TabsTrigger>
                    <TabsTrigger 
                      value="payroll"
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary-600 rounded-none"
                    >
                      <DollarSign className="size-4 mr-2" />
                      Loonkosten
                    </TabsTrigger>
                    <TabsTrigger 
                      value="productivity"
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary-600 rounded-none"
                    >
                      <BarChart3 className="size-4 mr-2" />
                      Productiviteit
                    </TabsTrigger>
                    <TabsTrigger 
                      value="trends"
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary-600 rounded-none"
                    >
                      <TrendingUp className="size-4 mr-2" />
                      Trendanalyse
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="hours" className="m-0">
                  <div className="p-4 md:p-6">
                    {loadingData ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Laden...</p>
                      </div>
                    ) : reportData?.data && reportData.data.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-neutral-800">
                              <TableHead>Datum</TableHead>
                              <TableHead>Werknemer</TableHead>
                              <TableHead>Starttijd</TableHead>
                              <TableHead>Eindtijd</TableHead>
                              <TableHead>Uren</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Uurtarief</TableHead>
                              <TableHead>Totaal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.data.map((item) => {
                              const start = new Date(item.start_time)
                              const end = new Date(item.end_time)
                              const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                              const breakHours = (item.break_duration_minutes || 0) / 60
                              const workedHours = hours - breakHours
                              const total = workedHours * (item.hourly_rate || 0)

                              return (
                                <TableRow key={item.id}>
                                  <TableCell>{new Date(item.date).toLocaleDateString('nl-NL')}</TableCell>
                                  <TableCell>
                                    {item.employee?.full_name || item.employee?.email || 'N/A'}
                                  </TableCell>
                                  <TableCell>{start.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                  <TableCell>{end.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                  <TableCell>{workedHours.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      className={
                                        item.status === 'approved' 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500'
                                          : item.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500'
                                          : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500'
                                      }
                                    >
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {item.hourly_rate ? formatCurrency(item.hourly_rate) : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {item.hourly_rate ? formatCurrency(total) : 'N/A'}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Geen data beschikbaar voor de geselecteerde periode
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="payroll" className="m-0">
                  <div className="p-4 md:p-6">
                    {loadingData ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Laden...</p>
                      </div>
                    ) : reportData?.data && reportData.data.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-neutral-800">
                              <TableHead>Datum</TableHead>
                              <TableHead>Werknemer</TableHead>
                              <TableHead>Werkgever</TableHead>
                              <TableHead>Bedrag</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Beschrijving</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.data.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  {new Date(item.created_at).toLocaleDateString('nl-NL')}
                                </TableCell>
                                <TableCell>
                                  {item.employee?.full_name || item.employee?.email || 'N/A'}
                                </TableCell>
                                <TableCell>
                                  {item.employer?.full_name || item.employer?.email || 'N/A'}
                                </TableCell>
                                <TableCell>{formatCurrency(item.amount / 100)}</TableCell>
                                <TableCell>
                                  <Badge 
                                    className={
                                      item.status === 'completed' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500'
                                        : item.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500'
                                        : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500'
                                    }
                                  >
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{item.description || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Geen data beschikbaar voor de geselecteerde periode
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="productivity" className="m-0">
                  <div className="p-4 md:p-6">
                    {loadingData ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Laden...</p>
                      </div>
                    ) : reportData?.data && reportData.data.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-neutral-800">
                              <TableHead>Werknemer</TableHead>
                              <TableHead>Totaal Uren</TableHead>
                              <TableHead>Aantal Dagen</TableHead>
                              <TableHead>Gem. Uren/Dag</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.data.map((item: any, index: number) => (
                              <TableRow key={item.employee?.id || index}>
                                <TableCell>
                                  {item.employee?.full_name || item.employee?.email || 'N/A'}
                                </TableCell>
                                <TableCell>{formatHours(item.totalHours)}</TableCell>
                                <TableCell>{item.totalDays}</TableCell>
                                <TableCell>{formatHours(item.averageHoursPerDay)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Geen data beschikbaar voor de geselecteerde periode
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="trends" className="m-0">
                  <div className="p-4 md:p-6">
                    {loadingData ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Laden...</p>
                      </div>
                    ) : reportData?.dailyTrends && reportData.dailyTrends.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-neutral-800">
                              <TableHead>Datum</TableHead>
                              <TableHead>Aantal Urenregistraties</TableHead>
                              <TableHead>Aantal Shifts</TableHead>
                              <TableHead>Totaal Uren</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.dailyTrends.map((item: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {new Date(item.date).toLocaleDateString('nl-NL')}
                                </TableCell>
                                <TableCell>{item.workHoursCount}</TableCell>
                                <TableCell>{item.shiftsCount}</TableCell>
                                <TableCell>{formatHours(item.totalHours)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Geen data beschikbaar voor de geselecteerde periode
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


