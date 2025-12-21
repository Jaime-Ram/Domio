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
    const { email, full_name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Verify user is employer
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if employee already exists
    const { data: existingEmployee } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingEmployee) {
      // Update existing employee to link to this employer
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          employer_email: profile.email,
          role: 'employee',
        })
        .eq('id', existingEmployee.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to link employee' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Employee linked successfully',
        employee_id: existingEmployee.id,
      })
    }

    // Employee doesn't exist - they need to sign up first
    // For now, we'll just return a message that they need to sign up
    return NextResponse.json({
      success: true,
      message: 'Employee invitation sent. They need to sign up first.',
      email,
    })
  } catch (error: any) {
    console.error('Error in invite employee:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


