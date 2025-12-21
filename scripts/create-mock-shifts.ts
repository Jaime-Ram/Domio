import { createClient } from '@supabase/supabase-js'
import { startOfWeek, addDays, format } from 'date-fns'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createMockShifts() {
  try {
    // Find user by email using listUsers
    const { data: usersData, error: userError } = await supabase.auth.admin.listUsers()
    const userData = usersData?.users.find(u => u.email === 'jaime21spam@gmail.com')
    
    if (userError || !userData) {
      console.error('Error finding user:', userError)
      return
    }

    const userId = userData.id
    console.log(`Found user: ${userId}`)

    // Get user profile to find employer_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error finding user profile:', profileError)
      return
    }

    const employerId = profile.id
    console.log(`Employer ID: ${employerId}`)

    // Get employees for this employer
    let { data: employees, error: employeesError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('employer_id', employerId)
      .limit(10)

    if (employeesError) {
      console.error('Error fetching employees:', employeesError)
      return
    }

    if (!employees || employees.length === 0) {
      console.log('No employees found. Creating mock employees first...')
      
      // Create mock employees
      const mockEmployees = [
        { full_name: 'Jan Jansen', email: 'jan.jansen@example.com' },
        { full_name: 'Maria de Vries', email: 'maria.devries@example.com' },
        { full_name: 'Pieter Bakker', email: 'pieter.bakker@example.com' },
      ]

      const createdEmployees = []
      for (const emp of mockEmployees) {
        // Create auth user first
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: emp.email,
          password: 'TempPassword123!',
          email_confirm: true,
        })

        if (authError) {
          console.error(`Error creating auth user for ${emp.email}:`, authError)
          continue
        }

        // Create user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authUser.user.id,
            full_name: emp.full_name,
            email: emp.email,
            employer_id: employerId,
            role: 'employee',
          })
          .select()
          .single()

        if (profileError) {
          console.error(`Error creating profile for ${emp.email}:`, profileError)
          continue
        }

        createdEmployees.push(profile)
        console.log(`Created employee: ${emp.full_name}`)
      }

      employees = createdEmployees
    }

    console.log(`Found ${employees.length} employees`)

    // Generate shifts for the next 2 weeks
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 1 })
    const shifts = []

    const timeSlots = [
      { start: '09:00', end: '17:00', position: 'Server' },
      { start: '10:00', end: '18:00', position: 'Kok' },
      { start: '11:00', end: '19:00', position: 'Bartender' },
      { start: '12:00', end: '20:00', position: 'Server' },
    ]

    for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
      for (let day = 0; day < 7; day++) {
        const shiftDate = addDays(weekStart, day + (weekOffset * 7))
        const employeeIndex = day % employees.length
        const timeSlot = timeSlots[day % timeSlots.length]
        const employee = employees[employeeIndex]

        shifts.push({
          employer_id: employerId,
          employee_id: employee.id,
          date: format(shiftDate, 'yyyy-MM-dd'),
          start_time: timeSlot.start,
          end_time: timeSlot.end,
          position: timeSlot.position,
          break_duration_minutes: 30,
          notes: `Shift voor ${employee.full_name}`,
        })
      }
    }

    console.log(`Creating ${shifts.length} shifts...`)

    // Insert shifts in batches
    const batchSize = 10
    for (let i = 0; i < shifts.length; i += batchSize) {
      const batch = shifts.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('shifts')
        .insert(batch)
        .select()

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        console.log(`Inserted batch ${i / batchSize + 1}: ${batch.length} shifts`)
      }
    }

    console.log('✅ Mock shifts created successfully!')
  } catch (error) {
    console.error('Error creating mock shifts:', error)
  }
}

createMockShifts()



