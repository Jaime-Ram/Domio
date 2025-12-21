'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StripeConnectOnboarding } from '@/components/stripe-connect-onboarding'
import { PayEmployeeForm } from '@/components/pay-employee-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ConnectPage() {
  const [accountId, setAccountId] = useState<string | null>(null)
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Fetch the account ID from the database
    const fetchAccount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Fetch from database
        const response = await fetch(`/api/stripe/connect/get-account?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.accountId) {
            setAccountId(data.accountId)
            checkAccountStatus(data.accountId)
            return
          }
        }
      } catch (error) {
        console.error('Error fetching account:', error)
      }
      setLoading(false)
    }

    fetchAccount()
  }, [])

  const checkAccountStatus = async (accountId: string) => {
    try {
      const response = await fetch(
        `/api/stripe/connect/account-status?accountId=${accountId}`
      )
      const data = await response.json()
      setAccountStatus(data)
    } catch (error) {
      console.error('Error checking account status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLoginLink = async () => {
    if (!accountId) return

    try {
      const response = await fetch('/api/stripe/connect/create-login-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      })

      const data = await response.json()

      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Error creating login link:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Stripe Connect Dashboard</h1>

      {!accountId ? (
        <StripeConnectOnboarding />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>
                Your Stripe Connect account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountStatus ? (
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Account ID:</span>{' '}
                    {accountStatus.accountId}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{' '}
                    <span
                      className={
                        accountStatus.isActive
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }
                    >
                      {accountStatus.isActive ? 'Active' : 'Pending'}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Charges Enabled:</span>{' '}
                    {accountStatus.chargesEnabled ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <span className="font-semibold">Payouts Enabled:</span>{' '}
                    {accountStatus.payoutsEnabled ? 'Yes' : 'No'}
                  </p>
                  <div className="mt-4">
                    <Button onClick={handleCreateLoginLink} variant="outline">
                      Open Stripe Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                <p>Loading account status...</p>
              )}
            </CardContent>
          </Card>

          {accountStatus?.isActive && (
            <PayEmployeeForm employerAccountId={accountId} />
          )}
        </div>
      )}
    </div>
  )
}

