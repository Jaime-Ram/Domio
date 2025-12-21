import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'hours'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const employeeId = searchParams.get('employeeId')
    const period = searchParams.get('period') || 'month' // day, week, month

    switch (reportType) {
      case 'hours': {
        // Fetch work hours with employee and employer info
        let query = supabase
          .from('work_hours')
          .select(`
            *,
            employee:user_profiles!work_hours_employee_id_fkey(id, full_name, email),
            employer:user_profiles!work_hours_employer_id_fkey(id, full_name, email)
          `)
          .order('date', { ascending: false })

        if (startDate) {
          query = query.gte('date', startDate)
        }
        if (endDate) {
          query = query.lte('date', endDate)
        }
        if (employeeId) {
          query = query.eq('employee_id', employeeId)
        }

        const { data: workHours, error } = await query

        if (error) {
          console.error('Error fetching work hours:', error)
          return NextResponse.json({
            data: [],
            statistics: {
              totalHours: 0,
              approvedHours: 0,
              pendingHours: 0,
              totalRecords: 0,
            },
            grouped: {},
          })
        }

        // Calculate statistics
        const totalHours = workHours?.reduce((sum, wh) => {
          const start = new Date(wh.start_time)
          const end = new Date(wh.end_time)
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          const breakHours = (wh.break_duration_minutes || 0) / 60
          return sum + (hours - breakHours)
        }, 0) || 0

        const approvedHours = workHours?.filter(wh => wh.status === 'approved').reduce((sum, wh) => {
          const start = new Date(wh.start_time)
          const end = new Date(wh.end_time)
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          const breakHours = (wh.break_duration_minutes || 0) / 60
          return sum + (hours - breakHours)
        }, 0) || 0

        // Group by period
        const grouped = groupByPeriod(workHours || [], period)

        return NextResponse.json({
          data: workHours || [],
          statistics: {
            totalHours: Math.round(totalHours * 100) / 100,
            approvedHours: Math.round(approvedHours * 100) / 100,
            pendingHours: Math.round((totalHours - approvedHours) * 100) / 100,
            totalRecords: workHours?.length || 0,
          },
          grouped,
        })
      }

      case 'payroll': {
        // Fetch payments with employee and employer info
        let query = supabase
          .from('payments')
          .select(`
            *,
            employee:user_profiles!payments_employee_id_fkey(id, full_name, email),
            employer:user_profiles!payments_employer_id_fkey(id, full_name, email)
          `)
          .order('created_at', { ascending: false })

        if (startDate) {
          query = query.gte('created_at', startDate)
        }
        if (endDate) {
          query = query.lte('created_at', endDate)
        }
        if (employeeId) {
          query = query.eq('employee_id', employeeId)
        }

        const { data: payments, error } = await query

        if (error) {
          console.error('Error fetching payments:', error)
          return NextResponse.json({
            data: [],
            statistics: {
              totalAmount: 0,
              completedAmount: 0,
              pendingAmount: 0,
              totalRecords: 0,
            },
            grouped: {},
          })
        }

        const totalAmount = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        const completedAmount = payments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        const pendingAmount = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0

        // Group by period
        const grouped = groupByPeriod(payments || [], period, 'created_at')

        return NextResponse.json({
          data: payments || [],
          statistics: {
            totalAmount: totalAmount / 100, // Convert from cents
            completedAmount: completedAmount / 100,
            pendingAmount: pendingAmount / 100,
            totalRecords: payments?.length || 0,
          },
          grouped,
        })
      }

      case 'productivity': {
        // Fetch work hours and calculate productivity metrics
        let query = supabase
          .from('work_hours')
          .select(`
            *,
            employee:user_profiles!work_hours_employee_id_fkey(id, full_name, email)
          `)
          .eq('status', 'approved')
          .order('date', { ascending: false })

        if (startDate) {
          query = query.gte('date', startDate)
        }
        if (endDate) {
          query = query.lte('date', endDate)
        }
        if (employeeId) {
          query = query.eq('employee_id', employeeId)
        }

        const { data: workHours, error } = await query

        if (error) {
          console.error('Error fetching work hours for productivity:', error)
          return NextResponse.json({
            data: [],
            statistics: {
              totalEmployees: 0,
              averageHoursPerEmployee: 0,
            },
          })
        }

        // Calculate productivity by employee
        const employeeStats = (workHours || []).reduce((acc: any, wh: any) => {
          const empId = wh.employee_id
          if (!acc[empId]) {
            acc[empId] = {
              employee: wh.employee,
              totalHours: 0,
              totalDays: new Set(),
              averageHoursPerDay: 0,
            }
          }

          const start = new Date(wh.start_time)
          const end = new Date(wh.end_time)
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          const breakHours = (wh.break_duration_minutes || 0) / 60
          const workedHours = hours - breakHours

          acc[empId].totalHours += workedHours
          acc[empId].totalDays.add(wh.date)
        }, {})

        // Calculate averages
        Object.keys(employeeStats).forEach(empId => {
          const stats = employeeStats[empId]
          stats.totalDays = stats.totalDays.size
          stats.averageHoursPerDay = stats.totalDays > 0 ? stats.totalHours / stats.totalDays : 0
        })

        return NextResponse.json({
          data: Object.values(employeeStats),
          statistics: {
            totalEmployees: Object.keys(employeeStats).length,
            averageHoursPerEmployee: Object.values(employeeStats).reduce((sum: number, s: any) => sum + s.totalHours, 0) / (Object.keys(employeeStats).length || 1),
          },
        })
      }

      case 'trends': {
        // Fetch work hours and shifts for trend analysis
        const workHoursQuery = supabase
          .from('work_hours')
          .select('*')
          .order('date', { ascending: true })

        if (startDate) {
          workHoursQuery.gte('date', startDate)
        }
        if (endDate) {
          workHoursQuery.lte('date', endDate)
        }

        const shiftsQuery = supabase
          .from('shifts')
          .select('*')
          .order('date', { ascending: true })

        if (startDate) {
          shiftsQuery.gte('date', startDate)
        }
        if (endDate) {
          shiftsQuery.lte('date', endDate)
        }

        const [{ data: workHours }, { data: shifts }] = await Promise.all([
          workHoursQuery,
          shiftsQuery,
        ])

        // Analyze trends
        const dailyTrends = analyzeDailyTrends(workHours || [], shifts || [])

        return NextResponse.json({
          dailyTrends,
          statistics: {
            totalWorkHours: workHours?.length || 0,
            totalShifts: shifts?.length || 0,
          },
        })
      }

      case 'employees': {
        // Fetch all employees with their stats
        const { data: employees, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('role', 'employee')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching employees:', error)
          return NextResponse.json({
            data: [],
            statistics: {
              totalEmployees: 0,
            },
          })
        }

        // Get work hours for each employee
        const employeesWithStats = await Promise.all(
          (employees || []).map(async (emp) => {
            const { data: workHours } = await supabase
              .from('work_hours')
              .select('*')
              .eq('employee_id', emp.id)

            const totalHours = workHours?.reduce((sum, wh) => {
              const start = new Date(wh.start_time)
              const end = new Date(wh.end_time)
              const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
              const breakHours = (wh.break_duration_minutes || 0) / 60
              return sum + (hours - breakHours)
            }, 0) || 0

            return {
              ...emp,
              totalHours: Math.round(totalHours * 100) / 100,
              totalRecords: workHours?.length || 0,
            }
          })
        )

        return NextResponse.json({
          data: employeesWithStats,
          statistics: {
            totalEmployees: employeesWithStats.length,
          },
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error fetching report data:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function groupByPeriod(data: any[], period: string, dateField: string = 'date') {
  const grouped: Record<string, any[]> = {}

  data.forEach((item) => {
    const date = new Date(item[dateField])
    let key = ''

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = `Week ${weekStart.toISOString().split('T')[0]}`
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(item)
  })

  return grouped
}

function analyzeDailyTrends(workHours: any[], shifts: any[]) {
  const trends: Record<string, any> = {}

  // Analyze work hours
  workHours.forEach((wh) => {
    const date = wh.date
    if (!trends[date]) {
      trends[date] = {
        date,
        workHoursCount: 0,
        shiftsCount: 0,
        totalHours: 0,
      }
    }

    const start = new Date(wh.start_time)
    const end = new Date(wh.end_time)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    const breakHours = (wh.break_duration_minutes || 0) / 60
    const workedHours = hours - breakHours

    trends[date].workHoursCount++
    trends[date].totalHours += workedHours
  })

  // Analyze shifts
  shifts.forEach((shift) => {
    const date = shift.date
    if (!trends[date]) {
      trends[date] = {
        date,
        workHoursCount: 0,
        shiftsCount: 0,
        totalHours: 0,
      }
    }
    trends[date].shiftsCount++
  })

  return Object.values(trends).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

