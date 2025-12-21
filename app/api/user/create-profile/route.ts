import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, fullName, role } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a service role client for admin operations
    // Or use the user's session if available
    const supabase = await createClient();
    
    // Try to get user, but don't fail if not authenticated yet (during signup)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is authenticated, verify it's their own profile
    if (user && userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Try to create the profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: fullName,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      // Check if table doesn't exist
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation') && error.message?.includes('not found')) {
        return NextResponse.json(
          {
            error: 'Database table not found',
            message: 'Please run the database migration first. See SUPABASE_SQL.sql for instructions.',
            code: 'TABLE_NOT_FOUND',
            details: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          error: error.message || 'Failed to create profile',
          code: error.code || 'UNKNOWN',
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

