import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      employee_id,
      employer_id,
      date,
      start_time,
      end_time,
      break_duration_minutes = 0,
      hourly_rate,
      notes,
    } = body

    if (!employee_id || !employer_id || !date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user is the employee
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'employee' && profile?.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // If employee, verify they're adding hours for themselves
    if (profile?.role === 'employee' && employee_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Insert work hours
    const { data, error } = await supabase
      .from('work_hours')
      .insert({
        employee_id,
        employer_id,
        date,
        start_time: new Date(start_time).toISOString(),
        end_time: new Date(end_time).toISOString(),
        break_duration_minutes,
        hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
        notes,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating work hours:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create work hours' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create work hours:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


