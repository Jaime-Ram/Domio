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
      employerAccountId, // The employer's Stripe Connect account ID
      employeeAccountId, // The employee's Stripe Connect account ID (or email)
      amount, // Amount in cents
      currency = 'usd',
      description,
    } = body;

    if (!employerAccountId || !amount) {
      return NextResponse.json(
        { error: 'Employer account ID and amount are required' },
        { status: 400 }
      );
    }

    // Create a transfer to the employee's account
    // If employeeAccountId is provided, transfer directly
    // Otherwise, you might need to create a payment intent or use other methods
    
    let transfer;
    
    if (employeeAccountId) {
      // Direct transfer to connected account
      transfer = await stripe.transfers.create({
        amount: amount,
        currency: currency,
        destination: employeeAccountId,
        metadata: {
          employerUserId: user.id,
          description: description || 'Payment to employee',
        },
      });
    } else {
      // Alternative: Create a payment intent that can be collected by the employee
      // This is useful if the employee hasn't set up their account yet
      return NextResponse.json(
        { error: 'Employee account ID is required for direct transfers' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      transferId: transfer.id,
      amount: transfer.amount,
      status: transfer.status,
      destination: transfer.destination,
    });
  } catch (error: any) {
    console.error('Stripe Connect payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


