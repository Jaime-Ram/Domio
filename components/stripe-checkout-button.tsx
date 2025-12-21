'use client'

import { useState } from 'react'
import { getStripe } from '@/lib/stripe/client'
import { Button } from '@/components/ui/button'

interface StripeCheckoutButtonProps {
  priceId: string
  successUrl?: string
  cancelUrl?: string
}

export function StripeCheckoutButton({
  priceId,
  successUrl,
  cancelUrl,
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: successUrl || `${window.location.origin}/success`,
          cancelUrl: cancelUrl || `${window.location.origin}/cancel`,
        }),
      })

      const { sessionId, url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        const stripe = await getStripe()
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId })
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Processing...' : 'Checkout'}
    </Button>
  )
}




