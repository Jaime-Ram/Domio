import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    // Create supabase client with cookies from request (like middleware does)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables' },
        { status: 500 }
      )
    }

    let response = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    
    // First try to get the session (this refreshes if needed)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Then get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const allCookies = request.cookies.getAll()
      console.error('Auth error for employer:', {
        error: authError?.message,
        code: authError?.code,
        status: authError?.status,
        sessionError: sessionError?.message,
        hasSession: !!session,
        sessionUser: session?.user?.email,
        cookieNames: allCookies.map(c => c.name),
        cookieCount: allCookies.length,
        hasAuthCookie: allCookies.some(c => c.name.includes('auth') || c.name.includes('supabase')),
        url: request.url,
      })
      
      // Return response with updated cookies if session was refreshed
      return NextResponse.json(
        { 
          error: 'Unauthorized: No user session',
          details: authError?.message || sessionError?.message || 'No active session found. Please log in again.',
          debug: {
            hasSession: !!session,
            sessionUser: session?.user?.email,
            cookieCount: allCookies.length,
          }
        },
        { 
          status: 401,
          headers: response.headers,
        }
      )
    }

    const body = await request.json()
    let {
      employer_id,
      employee_id,
      date,
      start_time,
      end_time,
      break_duration_minutes = 0,
      position,
      notes,
    } = body

    // Trim and validate all string inputs
    employer_id = employer_id?.trim()
    employee_id = employee_id?.trim()
    date = date?.trim()
    start_time = start_time?.trim()
    end_time = end_time?.trim()
    position = position?.trim() || null
    notes = notes?.trim() || null

    if (!employer_id || !employee_id || !date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate date format (should be YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    // Validate time format (should be HH:MM from HTML time input)
    const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timePattern.test(start_time)) {
      return NextResponse.json(
        { error: `Invalid start_time format: "${start_time}". Use HH:MM format (e.g., 09:00, 14:30)` },
        { status: 400 }
      )
    }
    if (!timePattern.test(end_time)) {
      return NextResponse.json(
        { error: `Invalid end_time format: "${end_time}". Use HH:MM format (e.g., 09:00, 14:30)` },
        { status: 400 }
      )
    }

    // Since we're using TEXT type now, we can keep it as HH:MM
    // No need to add seconds
    const formattedStartTime = start_time.trim()
    const formattedEndTime = end_time.trim()
    
    console.log('Time formatting:', {
      originalStart: start_time,
      formattedStart: formattedStartTime,
      originalEnd: end_time,
      formattedEnd: formattedEndTime,
    })

    // Verify user is employer
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to verify user profile', details: profileError.message },
        { status: 500 }
      )
    }

    if (profile?.role !== 'employer') {
      console.error('User is not an employer:', { userId: user.id, role: profile?.role })
      return NextResponse.json(
        { error: 'Unauthorized: User is not an employer' },
        { status: 403 }
      )
    }

    if (user.id !== employer_id) {
      console.error('User ID mismatch:', { userId: user.id, employerId: employer_id })
      return NextResponse.json(
        { error: 'Unauthorized: User ID does not match employer ID' },
        { status: 403 }
      )
    }

    // Verify employee exists and is linked to this employer
    const { data: employee, error: employeeError } = await supabase
      .from('user_profiles')
      .select('id, employer_id, employer_email')
      .eq('id', employee_id)
      .eq('role', 'employee')
      .single()

    if (employeeError || !employee) {
      console.error('Employee not found:', employeeError)
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Check if employee is linked to this employer
    const isLinked = employee.employer_id === employer_id || 
                    (employee.employer_email && 
                     employee.employer_email.toLowerCase().trim() === user.email?.toLowerCase().trim())

    if (!isLinked) {
      console.error('Employee not linked to employer:', {
        employeeId: employee_id,
        employeeEmployerId: employee.employer_id,
        employeeEmployerEmail: employee.employer_email,
        employerId: employer_id,
        employerEmail: user.email
      })
      return NextResponse.json(
        { error: 'Employee is not linked to this employer' },
        { status: 403 }
      )
    }

    // Insert shift using service role or ensure RLS allows it
    // Log the data we're trying to insert for debugging
    console.log('Inserting shift with data:', {
      employer_id: user.id,
      employee_id,
      date,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      break_duration_minutes: parseInt(String(break_duration_minutes)) || 0,
      position: position || null,
      notes: notes || null,
      status: 'scheduled',
    })

    // Insert shift - ensure all data is properly formatted
    // Try with time as string first (HH:MM:SS format)
    // If that fails, we might need to use a different approach
    const insertPayload: any = {
      employer_id: user.id,
      employee_id,
      date,
      start_time: formattedStartTime, // Format: HH:MM:SS
      end_time: formattedEndTime, // Format: HH:MM:SS
      break_duration_minutes: parseInt(String(break_duration_minutes)) || 0,
      position: position || null,
      notes: notes || null,
      status: 'scheduled', // Must be one of: scheduled, confirmed, completed, cancelled, no_show
    }

    console.log('Attempting to insert shift with payload:', {
      ...insertPayload,
      start_time_type: typeof insertPayload.start_time,
      end_time_type: typeof insertPayload.end_time,
      start_time_length: insertPayload.start_time?.length,
      end_time_length: insertPayload.end_time?.length,
      start_time_value: insertPayload.start_time,
      end_time_value: insertPayload.end_time,
    })

    const { data, error } = await supabase
      .from('shifts')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error('Error creating shift:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        error,
        insertedData: {
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          date,
          status: 'scheduled',
        },
        fullError: JSON.stringify(error, null, 2)
      })
      
      // Check if it's a pattern/format error (PostgreSQL error code 22P02 is invalid input syntax)
      // Error code 42804 is datatype mismatch
      if (error.message?.toLowerCase().includes('pattern') || 
          error.message?.toLowerCase().includes('format') || 
          error.code === '22P02' ||
          error.code === '42804' ||
          error.message?.toLowerCase().includes('invalid input') ||
          error.message?.toLowerCase().includes('expected pattern')) {
        return NextResponse.json(
          { 
            error: 'Invalid data format',
            details: `De tabelkolommen zijn waarschijnlijk nog TIME type in plaats van TEXT. Ontvangen: start_time="${formattedStartTime}", end_time="${formattedEndTime}", date="${date}".`,
            hint: error.hint || 'Voer het SQL script uit in Supabase SQL Editor: ALTER TABLE shifts ALTER COLUMN start_time TYPE TEXT USING start_time::TEXT; ALTER TABLE shifts ALTER COLUMN end_time TYPE TEXT USING end_time::TEXT; Of gebruik het bestand database/FIX_SHIFTS_TABLE.sql',
            receivedValues: {
              start_time: formattedStartTime,
              end_time: formattedEndTime,
              date: date,
            },
            postgresError: {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            }
          },
          { status: 400 }
        )
      }
      
      // Check if it's an RLS error
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        return NextResponse.json(
          { 
            error: 'Permission denied. Check RLS policies on shifts table.',
            details: error.message 
          },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { 
          error: error.message || 'Failed to create shift', 
          details: error.details || error.hint || 'Unknown error',
          code: error.code
        },
        { status: 500 }
      )
    }

    // Create JSON response with updated cookies from session refresh
    const jsonResponse = NextResponse.json({ success: true, data }, { status: 201 })
    
    // Copy cookies from response to jsonResponse
    response.cookies.getAll().forEach(cookie => {
      jsonResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as 'lax' | 'strict' | 'none',
        path: cookie.path,
        maxAge: cookie.maxAge,
      })
    })
    
    return jsonResponse
  } catch (error: any) {
    console.error('Error in create shift:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', details: error },
      { status: 500 }
    )
  }
}




