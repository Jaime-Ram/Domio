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
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set(name, value)
          },
          remove(name: string, options: any) {
            request.cookies.delete(name)
          },
        },
      }
    )

    // Check if shifts table exists and get column types
    let columns = null
    let rpcError = null
    try {
      const result = await supabase.rpc('exec_sql', {
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
      })
      columns = result.data
      rpcError = result.error
    } catch (err) {
      rpcError = err
    }

    // Try to get table info via a simple query
    const { data: tableInfo, error: tableError } = await supabase
      .from('shifts')
      .select('*')
      .limit(0)

    return NextResponse.json({
      success: true,
      tableExists: !tableError || tableError.code !== '42P01', // 42P01 = table does not exist
      tableError: tableError?.message,
      columns: columns || (rpcError ? 'RPC not available - check Supabase dashboard' : null),
      rpcError: rpcError && typeof rpcError === 'object' && 'message' in rpcError ? (rpcError as any).message : String(rpcError || ''),
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



