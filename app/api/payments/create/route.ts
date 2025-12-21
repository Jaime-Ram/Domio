import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

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
    const {
      employee_id,
      amount, // in cents
      currency = 'eur',
      description,
      stripe_transfer_id,
      bank_account_id,
    } = body

    if (!employee_id || !amount) {
      return NextResponse.json(
        { error: 'Employee ID and amount are required' },
        { status: 400 }
      )
    }

    // Verify user is employer
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get employer's Stripe account
    const { data: stripeAccount } = await supabase
      .from('stripe_connect_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!stripeAccount) {
      return NextResponse.json(
        { error: 'Stripe account not connected' },
        { status: 400 }
      )
    }

    // Get employee's Stripe account if available
    const { data: employeeStripeAccount } = await supabase
      .from('stripe_connect_accounts')
      .select('stripe_account_id')
      .eq('user_id', employee_id)
      .eq('is_active', true)
      .single()

    // If Stripe transfer ID is provided, use it; otherwise create a new transfer
    let finalTransferId = stripe_transfer_id
    let paymentStatus = 'pending'

    if (!finalTransferId && employeeStripeAccount?.stripe_account_id) {
      try {
        // Create transfer to employee's Stripe account
        const transfer = await stripe.transfers.create({
          amount: amount,
          currency: currency,
          destination: employeeStripeAccount.stripe_account_id,
          metadata: {
            employerUserId: user.id,
            employeeUserId: employee_id,
            description: description || 'Payment to employee',
          },
        }, {
          stripeAccount: stripeAccount.stripe_account_id,
        })

        finalTransferId = transfer.id
        paymentStatus = 'completed'
      } catch (stripeError: any) {
        console.error('Stripe transfer error:', stripeError)
        // Continue without Stripe transfer - payment will be marked as pending
        paymentStatus = 'pending'
      }
    } else if (!employeeStripeAccount) {
      // No Stripe account - payment will be marked as pending
      paymentStatus = 'pending'
    }

    // Create payment record in database
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        employer_id: user.id,
        employee_id,
        amount,
        currency,
        status: paymentStatus,
        stripe_transfer_id: finalTransferId,
        description: description || 'Payment to employee',
        bank_account_id: bank_account_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating payment:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create payment:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

