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

    const body = await request.json();
    const {
      amount, // Amount in cents
      currency = 'usd',
      connectedAccountId, // The employer's Stripe Connect account ID
      employeeEmail,
      description,
      applicationFeeAmount, // Optional platform fee
    } = body;

    if (!amount || !connectedAccountId) {
      return NextResponse.json(
        { error: 'Amount and connected account ID are required' },
        { status: 400 }
      );
    }

    // Create a payment intent on the connected account
    // This allows the employer to collect payments and pay employees
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amount,
        currency: currency,
        description: description || 'Payment from employer',
        metadata: {
          employerUserId: user.id,
          employeeEmail: employeeEmail || '',
        },
        application_fee_amount: applicationFeeAmount, // Your platform fee
      },
      {
        stripeAccount: connectedAccountId, // Create on the connected account
      }
    );

    // If you want to split the payment, you can also use destination charges
    // or create separate payment intents

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    });
  } catch (error: any) {
    console.error('Stripe Connect payment intent error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}




