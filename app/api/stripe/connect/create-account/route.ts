import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // You can make this dynamic based on user input
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        userId: user.id,
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${request.nextUrl.origin}/connect/reauth`,
      return_url: `${request.nextUrl.origin}/connect/success`,
      type: 'account_onboarding',
    });

    // Store the account ID in Supabase
    // Note: You'll need to create the stripe_connect_accounts table first
    // See STRIPE_CONNECT_GUIDE.md for the SQL schema
    try {
      const { error: dbError } = await supabase
        .from('stripe_connect_accounts')
        .upsert({
          user_id: user.id,
          stripe_account_id: account.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (dbError) {
        console.error('Error saving account to database:', dbError);
        // Continue anyway - the account is created in Stripe
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway - the account is created in Stripe
    }

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

