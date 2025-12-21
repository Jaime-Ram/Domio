import React from 'react'
import { CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentMethodIconProps {
  method?: string
  brand?: string
  className?: string
}

export function PaymentMethodIcon({ method, brand, className }: PaymentMethodIconProps) {
  // Determine payment method from method or brand
  const paymentType = (method || brand || '').toLowerCase()
  
  // SVG icons for different payment methods
  const getIcon = () => {
    if (paymentType.includes('visa')) {
      return (
        <svg viewBox="0 0 38 24" className="w-8 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="38" height="24" rx="4" fill="#1434CB"/>
          <path d="M16.5 7.5h-3.5l-2.5 9h3.5l1.5-4.5 1.5 4.5h3.5l-2.5-9zm8.5 6.5c0-1.5-1-2-2-2.5-1-.5-1.5-1-1.5-1.5 0-.5.5-1 1.5-1 1 0 2 .5 2.5 1l1.5-2.5c-.5-.5-1.5-1-3-1-2.5 0-4 1.5-4 3.5 0 1.5 1.5 2.5 2.5 3 1 .5 1.5 1 1.5 1.5 0 1-1 1-2 1-1.5 0-2.5-.5-3-1l-1.5 2.5c.5.5 2 1 4 1 2.5 0 4.5-1.5 4.5-3.5z" fill="white"/>
        </svg>
      )
    }
    if (paymentType.includes('mastercard') || paymentType.includes('master')) {
      return (
        <svg viewBox="0 0 38 24" className="w-8 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="38" height="24" rx="4" fill="#000"/>
          <circle cx="13" cy="12" r="6" fill="#EB001B"/>
          <circle cx="25" cy="12" r="6" fill="#F79E1B"/>
          <path d="M19 8.5c1.5 1.5 2.5 3.5 2.5 4.5s-1 3-2.5 4.5c-1.5-1.5-2.5-3.5-2.5-4.5s1-3 2.5-4.5z" fill="#FF5F00"/>
        </svg>
      )
    }
    if (paymentType.includes('apple') || paymentType.includes('applepay')) {
      return (
        <svg viewBox="0 0 38 24" className="w-8 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="38" height="24" rx="4" fill="#000"/>
          <path d="M15.5 7.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5 1-3 2-.5 1-.5 2.5 0 3.5 1 1.5 2.5 2 4 2 1 0 2-.5 2.5-1.5.5-1 .5-2.5 0-3.5zm-1 8c-1.5 0-2.5.5-3.5 1.5-1 1-1.5 2.5-1.5 4 0 1.5.5 3 1.5 4 1 1 2 1.5 3.5 1.5s2.5-.5 3.5-1.5c1-1 1.5-2.5 1.5-4 0-1.5-.5-3-1.5-4-1-1-2-1.5-3.5-1.5z" fill="white"/>
        </svg>
      )
    }
    if (paymentType.includes('google') || paymentType.includes('googlepay')) {
      return (
        <svg viewBox="0 0 38 24" className="w-8 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="38" height="24" rx="4" fill="white"/>
          <path d="M19 5c-2 0-4 1-5 2.5l-2-2C13.5 4 16 3 19 3c3 0 5.5 1 7.5 3l-2 2C23 6 21 5 19 5z" fill="#4285F4"/>
          <path d="M19 19c2 0 4-1 5-2.5l2 2C24 20 21 21 19 21c-3 0-5.5-1-7.5-3l2-2C14 18 16 19 19 19z" fill="#34A853"/>
          <path d="M11.5 12c0-1 .5-2 1-2.5l-2-2C9.5 8 9 9.5 9 12s.5 4 1.5 4.5l2-2c-.5-.5-1-1.5-1-2.5z" fill="#FBBC05"/>
          <path d="M26.5 8l-2 2c.5.5 1 1.5 1 2.5s-.5 2-1 2.5l2 2c1.5-1.5 2-3.5 2-5s-.5-3.5-2-5z" fill="#EA4335"/>
        </svg>
      )
    }
    if (paymentType.includes('paypal')) {
      return (
        <svg viewBox="0 0 38 24" className="w-8 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="38" height="24" rx="4" fill="#003087"/>
          <path d="M12 6h-4l-2 8h3l1-4h2l1 4h3l-2-8zm8 0h-4l-2 8h3l1-4h2l1 4h3l-2-8z" fill="#009CDE"/>
          <path d="M20 6h4l2 8h-3l-1-4h-2l-1 4h-3l2-8z" fill="#012169"/>
        </svg>
      )
    }
    if (paymentType.includes('ideal')) {
      return (
        <svg viewBox="0 0 38 24" className="w-8 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="38" height="24" rx="4" fill="#CC0066"/>
          <text x="19" y="15" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">iDEAL</text>
        </svg>
      )
    }
    if (paymentType.includes('amex') || paymentType.includes('american')) {
      return (
        <svg viewBox="0 0 38 24" className="w-8 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="38" height="24" rx="4" fill="#006FCF"/>
          <text x="19" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">AMEX</text>
        </svg>
      )
    }
    // Default credit card icon
    return <CreditCard className="w-5 h-5 text-gray-400" />
  }
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
      {getIcon()}
    </div>
  )
}

