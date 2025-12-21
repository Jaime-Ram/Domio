import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;

    // Fetch account from database
    const { data, error } = await supabase
      .from('stripe_connect_accounts')
      .select('stripe_account_id, is_active, charges_enabled, payouts_enabled')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No account found
        return NextResponse.json({ accountId: null });
      }
      throw error;
    }

    return NextResponse.json({
      accountId: data.stripe_account_id,
      isActive: data.is_active,
      chargesEnabled: data.charges_enabled,
      payoutsEnabled: data.payouts_enabled,
    });
  } catch (error: any) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}




