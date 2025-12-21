'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  Settings,
  LogOut,
  Building2,
  Clock,
  CreditCard,
  FileText,
  BarChart3,
  MessageCircle,
  RotateCw,
  DollarSign
} from 'lucide-react'
import type { NavItemType, NavItemDividerType, NavItemSectionHeaderType } from "@/components/application/app-navigation/config"
import { SidebarNavigationSectionDividers } from "@/components/application/app-navigation/sidebar-navigation/sidebar-section-dividers"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScheduleShiftForm } from '@/components/schedule-shift-form'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { nl } from 'date-fns/locale'

const employerNavItemsWithDividers: (NavItemType | NavItemDividerType | NavItemSectionHeaderType)[] = [
  // 1. Overzicht & Activiteit
  { sectionHeader: true, label: "Overzicht & Activiteit" },
  {
    label: "Dashboard",
    href: "/dashboard/employer",
    icon: BarChart3,
  },
  {
    label: "Rapporten",
    href: "/dashboard/employer/reports",
    icon: FileText,
  },
  { divider: true },
  // 2. Personeelsbeheer
  { sectionHeader: true, label: "Personeelsbeheer" },
  {
    label: "Teamleden",
    href: "/dashboard/employer/team",
    icon: Users,
  },
  {
    label: "Rooster",
    href: "/dashboard/employer/schedule",
    icon: Calendar,
  },
  {
    label: "Urenregistraties",
    href: "/dashboard/employer/hours",
    icon: Clock,
  },
  { divider: true },
  // 3. Financiën
  { sectionHeader: true, label: "Financiën" },
  {
    label: "Betalingen",
    href: "/dashboard/employer/payments",
    icon: CreditCard,
  },
  { divider: true },
  // 4. Organisatie
  { sectionHeader: true, label: "Organisatie" },
  {
    label: "Mijn Restaurant",
    href: "/dashboard/employer/restaurant",
    icon: Building2,
  },
]

// Color palette for shifts
const SHIFT_COLORS = [
  'bg-orange-500',
  'bg-red-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-yellow-500',
]

export default function SchedulePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [restaurantSettings, setRestaurantSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [showShiftForm, setShowShiftForm] = useState(false)
  const [selectedEmployeeForShift, setSelectedEmployeeForShift] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'employees' | 'shifts'>('employees')
  
  // Date range state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    return startOfWeek(today, { weekStartsOn: 1 }) // Monday
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
      }

      // Fetch restaurant settings
      const { data: settings } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('employer_id', user.id)
        .single()

      if (settings) {
        setRestaurantSettings(settings)
      }

      await Promise.all([
        fetchEmployees(user.id, user.email || profile?.email || ''),
        fetchShifts(user.id)
      ])

      setLoading(false)
    }

    fetchData()
  }, [router, supabase])

  const fetchEmployees = async (employerId: string, employerEmail: string) => {
    try {
      // Normalize email (lowercase, trim)
      const normalizedEmail = employerEmail?.toLowerCase().trim() || ''
      
      // Query 1: Haal employees op die gekoppeld zijn via employer_id
      const { data: dataById, error: errorById } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'employee')
        .eq('employer_id', employerId)
      
      // Query 2: Haal employees op die gekoppeld zijn via employer_email (case-insensitive)
      const { data: dataByEmail, error: errorByEmail } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'employee')
        .not('employer_email', 'is', null)
      
      // Filter lokaal op email match (case-insensitive)
      const filteredByEmail = (dataByEmail || []).filter((emp: any) => {
        const empEmail = (emp.employer_email || '').toLowerCase().trim()
        return empEmail === normalizedEmail && emp.employer_id !== employerId
      })
      
      // Combineer beide resultaten en verwijder duplicaten
      const allEmployees = [
        ...(dataById || []),
        ...filteredByEmail.filter((emp: any) =>
          !dataById?.some((e: any) => e.id === emp.id)
        )
      ]
      
      // Sorteer op naam
      allEmployees.sort((a, b) => {
        const nameA = (a.full_name || a.email || '').toLowerCase()
        const nameB = (b.full_name || b.email || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
      
      setEmployees(allEmployees)
      
      // Debug logging
      console.log('Fetching employees:', {
        employerId,
        employerEmail: normalizedEmail,
        foundById: dataById?.length || 0,
        foundByEmail: filteredByEmail.length,
        total: allEmployees.length,
        employees: allEmployees.map(e => ({
          id: e.id,
          name: e.full_name || e.email,
          employer_id: e.employer_id,
          employer_email: e.employer_email
        }))
      })
      
      // Als er employees zijn gevonden via email maar niet via ID, probeer ze te koppelen
      if (filteredByEmail.length > 0 && user?.id) {
        console.log('Found employees by email but not by ID, attempting to link...')
        // Trigger een update om de trigger te activeren
        for (const emp of filteredByEmail) {
          try {
            await supabase
              .from('user_profiles')
              .update({ employer_email: emp.employer_email }) // Trigger update
              .eq('id', emp.id)
          } catch (err) {
            console.error('Error updating employee:', err)
          }
        }
        // Refresh na korte delay
        setTimeout(() => {
          fetchEmployees(employerId, employerEmail)
        }, 1000)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    }
  }

  const fetchShifts = async (employerId: string) => {
    const weekStart = currentWeekStart
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    const { data } = await supabase
      .from('shifts')
      .select(`
        *,
        employee:user_profiles!shifts_employee_id_fkey(full_name, email, id)
      `)
      .eq('employer_id', employerId)
      .gte('date', format(weekStart, 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'))
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (data) {
      setShifts(data)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchShifts(user.id)
    }
  }, [currentWeekStart, user?.id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleEmployeeExpanded = (employeeId: string) => {
    setExpandedEmployees(prev => {
      const next = new Set(prev)
      if (next.has(employeeId)) {
        next.delete(employeeId)
      } else {
        next.add(employeeId)
      }
      return next
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => 
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    )
  }

  // Get days in current week
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  })

  // Group shifts by employee
  const shiftsByEmployee = shifts.reduce((acc, shift) => {
    const empId = shift.employee_id
    if (!acc[empId]) {
      acc[empId] = []
    }
    acc[empId].push(shift)
    return acc
  }, {} as Record<string, typeof shifts>)

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => {
    const name = (emp.full_name || emp.email || '').toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  // Calculate shift position and width for Gantt chart
  const getShiftStyle = (shift: any, dayIndex: number) => {
    const shiftDate = new Date(shift.date)
    const dayDate = weekDays[dayIndex]
    
    if (!isSameDay(shiftDate, dayDate)) {
      return { display: 'none' }
    }

    // Parse start and end times
    const [startHour, startMin] = shift.start_time.split(':').map(Number)
    const [endHour, endMin] = shift.end_time.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const duration = endMinutes - startMinutes
    
    // Calculate position (0-100% of day)
    const dayStart = 0 // 00:00
    const dayEnd = 24 * 60 // 24:00 in minutes
    const leftPercent = (startMinutes / dayEnd) * 100
    const widthPercent = (duration / dayEnd) * 100

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    }
  }

  const getEmployeeColor = (employeeId: string) => {
    const index = employees.findIndex(e => e.id === employeeId)
    return SHIFT_COLORS[index % SHIFT_COLORS.length]
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002A1F] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SidebarNavigationSectionDividers
        items={employerNavItemsWithDividers}
        activeUrl="/dashboard/employer/schedule"
        footerItems={[
          {
            label: "Instellingen",
            href: "/dashboard/employer#settings",
            icon: Settings,
          },
          {
            label: "Support",
            href: "/dashboard/employer/support",
            icon: MessageCircle,
          },
          {
            label: "Uitloggen",
            href: "#",
            icon: LogOut,
            onClick: handleLogout,
          },
        ]}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 z-50 w-auto border-b bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold">
                {restaurantSettings?.restaurant_name || userProfile?.restaurant_name || 'Restaurant'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 px-3 py-1 border rounded-md">
                  <span className="text-sm font-medium">
                    {format(weekDays[0], 'd MMM', { locale: nl })} - {format(weekDays[weekDays.length - 1], 'd MMM yyyy', { locale: nl })}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setShowShiftForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Shift Toevoegen
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 mt-16">
          <div className="flex h-full gap-4">
            {/* Left Pane - Employees List */}
            <div className="w-80 shrink-0 border-r border-gray-200 dark:border-gray-800 pr-4">
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setViewMode('employees')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewMode === 'employees'
                      ? 'bg-[#002A1F] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Werknemers
                </button>
                <button
                  onClick={() => setViewMode('shifts')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewMode === 'shifts'
                      ? 'bg-[#002A1F] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Shifts
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoek werknemers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-20"
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      if (user?.id) {
                        fetchEmployees(user.id, user.email || userProfile?.email || '')
                      }
                    }}
                    title="Ververs werknemerslijst"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowShiftForm(true)}
                    title="Nieuwe shift"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Employees List */}
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Geen werknemers gevonden
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchQuery ? 'Probeer een andere zoekterm' : 'Nodig werknemers uit via Teamleden'}
                    </p>
                  </div>
                ) : (
                  filteredEmployees.map((employee) => {
                    const employeeShifts = shiftsByEmployee[employee.id] || []
                    const totalHours = employeeShifts.reduce((sum: number, shift: any) => {
                      const [startHour, startMin] = shift.start_time.split(':').map(Number)
                      const [endHour, endMin] = shift.end_time.split(':').map(Number)
                      const start = startHour * 60 + startMin
                      const end = endHour * 60 + endMin
                      return sum + (end - start) / 60
                    }, 0)
                    const isExpanded = expandedEmployees.has(employee.id)
                    const shiftsThisWeek = employeeShifts.length

                    return (
                      <div 
                        key={employee.id} 
                        className="border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div
                            className={`w-4 h-4 rounded-full shrink-0 ${getEmployeeColor(employee.id)}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                              {employee.full_name || employee.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {totalHours.toFixed(1)}h deze week
                              </p>
                              {shiftsThisWeek > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {shiftsThisWeek} {shiftsThisWeek === 1 ? 'shift' : 'shifts'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setSelectedEmployeeForShift(employee.id)
                                setShowShiftForm(true)
                              }}
                              title="Shift toevoegen voor deze werknemer"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => toggleEmployeeExpanded(employee.id)}
                              title={isExpanded ? 'Details verbergen' : 'Details tonen'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2">
                            {employeeShifts.length > 0 ? (
                              <>
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Shifts deze week:
                                </p>
                                <div className="space-y-1">
                                  {employeeShifts.map((shift: any) => (
                                    <div
                                      key={shift.id}
                                      className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                                    >
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                          {format(new Date(shift.date), 'EEE d MMM', { locale: nl })}
                                        </p>
                                        <Badge variant="outline" className="text-xs">
                                          {shift.start_time} - {shift.end_time}
                                        </Badge>
                                      </div>
                                      {shift.position && (
                                        <p className="text-gray-500 mt-1">
                                          {shift.position}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-xs text-gray-500 mb-2">
                                  Geen shifts deze week
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => {
                                    setSelectedEmployeeForShift(employee.id)
                                    setShowShiftForm(true)
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Eerste shift toevoegen
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedEmployeeForShift(null)
                    setShowShiftForm(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Shift
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/dashboard/employer/team')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Werknemer Uitnodigen
                </Button>
              </div>
            </div>

            {/* Right Pane - Gantt Chart */}
            <div className="flex-1 overflow-x-auto">
              {/* Timeline Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b">
                <div className="flex">
                  <div className="w-80 shrink-0 border-r p-2"></div>
                  <div className="flex-1 flex">
                    {weekDays.map((day, index) => {
                      const isToday = isSameDay(day, new Date())
                      return (
                        <div
                          key={index}
                          className="flex-1 border-r last:border-r-0 p-2 text-center"
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {format(day, 'EEE', { locale: nl })}
                          </div>
                          <div
                            className={`text-sm font-semibold ${
                              isToday ? 'text-[#002A1F]' : ''
                            }`}
                          >
                            {format(day, 'd')}
                          </div>
                          {isToday && (
                            <div className="w-full h-0.5 bg-[#002A1F] mt-1" />
                          )}
                        </div>
                      )}
                    )}
                  </div>
                </div>
              </div>

              {/* Gantt Rows */}
              <div className="divide-y">
                {filteredEmployees.map((employee) => {
                  const employeeShifts = shiftsByEmployee[employee.id] || []
                  const color = getEmployeeColor(employee.id)

                  return (
                    <div key={employee.id} className="flex min-h-[60px]">
                      {/* Employee Name Column */}
                      <div className="w-80 shrink-0 border-r p-3 flex items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color}`} />
                          <span className="text-sm font-medium">
                            {employee.full_name || employee.email}
                          </span>
                        </div>
                      </div>

                      {/* Timeline Cells */}
                      <div className="flex-1 flex relative">
                        {weekDays.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className="flex-1 border-r last:border-r-0 relative"
                          >
                             {employeeShifts
                              .filter((shift: any) => isSameDay(new Date(shift.date), day))
                              .map((shift: any) => {
                                const style = getShiftStyle(shift, dayIndex)
                                return (
                                  <div
                                    key={shift.id}
                                    className={`absolute top-2 bottom-2 ${color} rounded px-2 py-1 text-white text-xs flex items-center cursor-pointer hover:opacity-90`}
                                    style={style}
                                    title={`${shift.start_time} - ${shift.end_time}`}
                                  >
                                    <span className="truncate">
                                      {shift.start_time} - {shift.end_time}
                                    </span>
                                  </div>
                                )
                              })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Shift Form Modal */}
      {showShiftForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nieuwe Shift</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShiftForm(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScheduleShiftForm
                employerId={user.id}
                employees={employees}
                preselectedEmployeeId={selectedEmployeeForShift || undefined}
                onSuccess={() => {
                  setShowShiftForm(false)
                  setSelectedEmployeeForShift(null)
                  fetchShifts(user.id)
                  fetchEmployees(user.id, userProfile?.email || '')
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

