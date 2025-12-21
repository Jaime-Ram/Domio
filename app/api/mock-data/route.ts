import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user by email using admin client if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminClient = supabaseServiceKey && supabaseUrl 
      ? createAdminClient(supabaseUrl, supabaseServiceKey)
      : null;

    let employerId: string | null = null;

    // First try to find in user_profiles
    const clientToUseForQuery = adminClient || supabase;
    const { data: profileData, error: profileError } = await clientToUseForQuery
      .from('user_profiles')
      .select('id, email')
      .eq('email', 'jaime21spam@gmail.com')
      .single();

    if (profileData) {
      employerId = profileData.id;
    } else if (adminClient) {
      // Try to get from auth using admin client - list users and find by email
      const { data: usersList, error: adminError } = await adminClient.auth.admin.listUsers();
      
      const foundUser = usersList?.users?.find(u => u.email === 'jaime21spam@gmail.com');
      if (foundUser) {
        employerId = foundUser.id;
      } else {
        return NextResponse.json({ 
          error: 'User not found. Please ensure jaime21spam@gmail.com exists in the database.',
          debug: adminError?.message 
        }, { status: 404 });
      }
    } else {
      // Try with regular client
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user && user.email === 'jaime21spam@gmail.com') {
        employerId = user.id;
      } else {
        return NextResponse.json({ 
          error: 'User not found and admin access not available. Please ensure jaime21spam@gmail.com exists and SUPABASE_SERVICE_ROLE_KEY is set.',
          debug: userError?.message 
        }, { status: 404 });
      }
    }

    if (!employerId) {
      return NextResponse.json({ error: 'Could not find employer ID' }, { status: 404 });
    }

    // Mock employee names
    const employeeNames = [
      { full_name: 'Emma de Vries', email: 'emma.devries@example.com' },
      { full_name: 'Lucas van der Berg', email: 'lucas.vdberg@example.com' },
      { full_name: 'Sophie Jansen', email: 'sophie.jansen@example.com' },
      { full_name: 'Noah Bakker', email: 'noah.bakker@example.com' },
      { full_name: 'Mila Smit', email: 'mila.smit@example.com' },
      { full_name: 'Daan Meijer', email: 'daan.meijer@example.com' },
      { full_name: 'Eva de Boer', email: 'eva.deboer@example.com' },
      { full_name: 'Finn Mulder', email: 'finn.mulder@example.com' },
    ];

    // Create employees (user_profiles)
    const employees = [];
    const errors: string[] = [];
    
    if (!adminClient) {
      return NextResponse.json({
        success: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY is not set. This is required to create auth users for employees.',
        message: 'Please set SUPABASE_SERVICE_ROLE_KEY in your .env.local file to create mock data.',
        hint: 'You can find the service role key in your Supabase dashboard under Settings > API > service_role key'
      }, { status: 400 });
    }
    
    for (const emp of employeeNames) {
      let userId: string | null = null;

      // Create auth user with admin client (required for foreign key constraint)
      try {
        const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
          email: emp.email,
          password: 'Test123!',
          email_confirm: true,
        });

        if (authUser?.user) {
          userId = authUser.user.id;
        } else if (authError) {
          if (authError.message.includes('already') || authError.message.includes('already registered') || authError.message.includes('User already registered')) {
            // User already exists, try to get it by listing users
            const { data: usersList } = await adminClient.auth.admin.listUsers();
            const existingUser = usersList?.users?.find(u => u.email === emp.email);
            if (existingUser) {
              userId = existingUser.id;
            } else {
              errors.push(`Could not find existing user for ${emp.email}`);
              continue;
            }
          } else {
            errors.push(`Auth error for ${emp.email}: ${authError.message}`);
            continue;
          }
        }
      } catch (err: any) {
        errors.push(`Exception creating auth user for ${emp.email}: ${err?.message || 'Unknown error'}`);
        continue;
      }

      if (!userId) {
        errors.push(`No user ID obtained for ${emp.email}`);
        continue;
      }

      // Create user profile
      const clientToUse = adminClient || supabase;
      
      const { data: profile, error: profileError } = await clientToUse
        .from('user_profiles')
        .upsert({
          id: userId,
          full_name: emp.full_name,
          email: emp.email,
          role: 'employee',
          employer_id: employerId,
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (profileError) {
        errors.push(`Profile error for ${emp.email}: ${profileError.message}`);
        console.error('Error creating profile:', profileError);
        continue;
      }

      if (profile) {
        employees.push({ ...profile, id: userId });
      }
    }

    // Create restaurant settings
    const clientForData = adminClient || supabase;
    await clientForData
      .from('restaurant_settings')
      .upsert({
        employer_id: employerId,
        restaurant_name: 'De Gouden Leeuw',
        restaurant_address: 'Hoofdstraat 123, Amsterdam',
        restaurant_phone: '+31 20 123 4567',
        restaurant_email: 'info@degoudenleeuw.nl',
        default_hourly_rate: 15.00,
        payment_schedule: 'weekly',
        timezone: 'Europe/Amsterdam',
      }, {
        onConflict: 'employer_id'
      });

    // Create shifts for the next 4 weeks
    const shifts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let week = 0; week < 4; week++) {
      for (let day = 0; day < 7; day++) {
        const shiftDate = new Date(today);
        shiftDate.setDate(today.getDate() + (week * 7) + day);
        
        // Create 2-4 shifts per day
        const shiftsPerDay = Math.floor(Math.random() * 3) + 2;
        const shiftTimes = [
          { start: '09:00', end: '14:00' },
          { start: '14:00', end: '18:00' },
          { start: '18:00', end: '22:00' },
          { start: '10:00', end: '15:00' },
        ];

        for (let i = 0; i < shiftsPerDay && i < employees.length; i++) {
          const employee = employees[i % employees.length];
          const timeSlot = shiftTimes[i % shiftTimes.length];
          
          shifts.push({
            employer_id: employerId,
            employee_id: employee.id,
            date: shiftDate.toISOString().split('T')[0],
            start_time: timeSlot.start,
            end_time: timeSlot.end,
            position: ['Bediening', 'Keuken', 'Bar', 'Host'][Math.floor(Math.random() * 4)],
            status: 'scheduled',
          });
        }
      }
    }

    // Insert shifts
    if (shifts.length > 0) {
      const { error: shiftsError } = await clientForData
        .from('shifts')
        .insert(shifts);

      if (shiftsError) {
        console.error('Error creating shifts:', shiftsError);
      }
    }

    // Create work hours for the past 30 days
    const workHours = [];
    for (let day = 0; day < 30; day++) {
      const workDate = new Date(today);
      workDate.setDate(today.getDate() - day);
      
      // Create 3-6 work hours per day
      const hoursPerDay = Math.floor(Math.random() * 4) + 3;
      
      for (let i = 0; i < hoursPerDay && i < employees.length; i++) {
        const employee = employees[i % employees.length];
        const startHour = Math.floor(Math.random() * 8) + 9; // 9-17
        const duration = Math.floor(Math.random() * 4) + 4; // 4-8 hours
        const breakMinutes = Math.floor(Math.random() * 30) + 15; // 15-45 min
        
        const startTime = new Date(workDate);
        startTime.setHours(startHour, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(startHour + duration, Math.floor(Math.random() * 60), 0, 0);

        const hourlyRate = 15.00; // Default hourly rate
        const workedHours = duration - (breakMinutes / 60);
        const totalEarnings = workedHours * hourlyRate;

        const statuses = ['pending', 'approved', 'paid'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        workHours.push({
          employer_id: employerId,
          employee_id: employee.id,
          date: workDate.toISOString().split('T')[0],
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          break_duration_minutes: breakMinutes,
          hourly_rate: hourlyRate,
          total_earnings: totalEarnings,
          status: status,
          is_paid: status === 'paid',
        });
      }
    }

    // Insert work hours
    if (workHours.length > 0) {
      const { error: hoursError } = await clientForData
        .from('work_hours')
        .insert(workHours);

      if (hoursError) {
        console.error('Error creating work hours:', hoursError);
      }
    }

    // Create payments for the past 3 months
    const payments = [];
    for (let month = 0; month < 3; month++) {
      const paymentDate = new Date(today);
      paymentDate.setMonth(today.getMonth() - month);
      
      // Create 2-4 payments per month
      const paymentsPerMonth = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < paymentsPerMonth && i < employees.length; i++) {
        const employee = employees[i % employees.length];
        const amount = Math.floor((Math.random() * 500 + 200) * 100); // €200-700 in cents
        
        payments.push({
          employer_id: employerId,
          employee_id: employee.id,
          amount: amount,
          currency: 'eur',
          status: 'completed',
          description: `Loonbetaling ${paymentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
          created_at: paymentDate.toISOString(),
        });
      }
    }

    // Insert payments
    if (payments.length > 0) {
      const { error: paymentsError } = await clientForData
        .from('payments')
        .insert(payments);

      if (paymentsError) {
        console.error('Error creating payments:', paymentsError);
      }
    }

    // Create sales/revenue data for the past 12 months (restaurant omzet)
    // Try to insert into 'sales' table, if it doesn't exist, we'll catch the error
    const sales = [];
    const salesToday = new Date();
    salesToday.setHours(0, 0, 0, 0);

    // Create daily sales for the past 12 months
    for (let day = 0; day < 365; day++) {
      const saleDate = new Date(salesToday);
      saleDate.setDate(salesToday.getDate() - day);
      
      // Skip closed days (randomly skip ~1 day per week)
      if (Math.random() < 0.15) continue;

      // Restaurant has different revenue patterns:
      // - Weekends are busier (higher revenue)
      // - Lunch time (12-14h) and dinner time (18-22h) are peak hours
      // - Weekdays: €800-2000, Weekends: €1500-3500
      const dayOfWeek = saleDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Base revenue range
      let baseRevenue: number;
      if (isWeekend) {
        baseRevenue = Math.floor(Math.random() * 2000) + 1500; // €1500-3500
      } else {
        baseRevenue = Math.floor(Math.random() * 1200) + 800; // €800-2000
      }

      // Add some seasonal variation (summer months are busier)
      const month = saleDate.getMonth();
      const isSummer = month >= 5 && month <= 7; // June, July, August
      if (isSummer) {
        baseRevenue = Math.floor(baseRevenue * 1.3);
      }

      // Add some random variation
      const variation = Math.random() * 0.4 - 0.2; // -20% to +20%
      const finalRevenue = Math.floor(baseRevenue * (1 + variation));

      // Create multiple transactions per day (lunch and dinner service)
      const transactionsPerDay = Math.floor(Math.random() * 3) + 2; // 2-4 transactions
      
      for (let i = 0; i < transactionsPerDay; i++) {
        const transactionTime = new Date(saleDate);
        // Lunch: 11-14h, Dinner: 17-21h
        if (i % 2 === 0) {
          transactionTime.setHours(11 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);
        } else {
          transactionTime.setHours(17 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);
        }
        
        const transactionAmount = Math.floor(finalRevenue / transactionsPerDay * (0.8 + Math.random() * 0.4));

        sales.push({
          employer_id: employerId,
          date: saleDate.toISOString().split('T')[0],
          amount: transactionAmount * 100, // In cents
          currency: 'eur',
          transaction_type: i % 2 === 0 ? 'lunch' : 'dinner',
          payment_method: ['card', 'cash', 'card', 'card'][Math.floor(Math.random() * 4)], // Mostly card
          created_at: transactionTime.toISOString(),
        });
      }
    }

    // Create sales/revenue data as payments (since sales table likely doesn't exist)
    // This way the revenue will show up in the dashboard's calculateRevenue function
    let salesCount = 0;
    if (sales.length > 0) {
      // Convert sales to payments format for revenue tracking
      // Note: payments table might have a check constraint on status, so we'll use a valid status
      const revenuePayments = sales.map(sale => ({
        employer_id: employerId,
        employee_id: null, // Revenue payments don't have an employee (nullable)
        amount: sale.amount,
        currency: sale.currency || 'eur',
        status: 'paid', // Try 'paid' instead of 'completed' to match the constraint
        description: `Restaurant omzet - ${sale.transaction_type || 'sale'} - ${sale.date}`,
        created_at: sale.created_at,
      }));

      // Insert in batches to avoid overwhelming the database
      const batchSize = 100;
      for (let i = 0; i < revenuePayments.length; i += batchSize) {
        const batch = revenuePayments.slice(i, i + batchSize);
        const { error: revenuePaymentsError } = await clientForData
          .from('payments')
          .insert(batch);

        if (!revenuePaymentsError) {
          salesCount += batch.length;
        } else {
          console.error(`Error creating sales batch ${i / batchSize + 1}:`, revenuePaymentsError);
          errors.push(`Error creating sales batch ${i / batchSize + 1}: ${revenuePaymentsError.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mock data created successfully',
      data: {
        employerId: employerId,
        employees: employees.length,
        shifts: shifts.length,
        workHours: workHours.length,
        payments: payments.length,
        sales: salesCount,
      },
      warnings: employees.length === 0 ? ['No employees were created. Check if user exists and SUPABASE_SERVICE_ROLE_KEY is set.'] : [],
      errors: errors.length > 0 ? errors : undefined,
      hasAdminClient: !!adminClient
    });
  } catch (error: any) {
    console.error('Error creating mock data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

