import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables' },
        { status: 500 }
      )
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // No-op for GET requests
          },
        },
      }
    )

    // Check if shifts table exists and get column types
    const { data: columns, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'shifts' 
          AND column_name IN ('start_time', 'end_time', 'date', 'employee_id', 'employer_id')
        ORDER BY column_name;
      `
    }).catch(async () => {
      // If RPC doesn't work, try a direct query
      const { data: testData, error: testError } = await supabase
        .from('shifts')
        .select('id')
        .limit(0)
      
      return { data: null, error: testError }
    })

    // Try to get table info via a simple query
    const { data: tableInfo, error: tableError } = await supabase
      .from('shifts')
      .select('*')
      .limit(0)

    return NextResponse.json({
      success: true,
      tableExists: !tableError || tableError.code !== '42P01', // 42P01 = table does not exist
      tableError: tableError?.message,
      columns: columns || 'RPC not available - check Supabase dashboard',
      hint: 'Check the browser console and Supabase logs for more details. If start_time and end_time are TIME type, run: ALTER TABLE shifts ALTER COLUMN start_time TYPE TEXT USING start_time::TEXT; ALTER TABLE shifts ALTER COLUMN end_time TYPE TEXT USING end_time::TEXT;'
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: error 
      },
      { status: 500 }
    )
  }
}



