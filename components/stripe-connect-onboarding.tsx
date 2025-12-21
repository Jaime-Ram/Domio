'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function StripeConnectOnboarding() {
  const [loading, setLoading] = useState(false)
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null)

  const handleCreateAccount = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl
      } else if (data.error) {
        console.error('Error:', data.error)
        alert('Failed to create account: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error)
      alert('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Your Stripe Account</CardTitle>
        <CardDescription>
          Set up Stripe to receive payments and pay your team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCreateAccount} disabled={loading} className="w-full">
          {loading ? 'Setting up...' : 'Connect Stripe Account'}
        </Button>
      </CardContent>
    </Card>
  )
}




