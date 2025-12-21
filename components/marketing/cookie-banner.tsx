'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      // Show banner after a short delay
      setTimeout(() => {
        setIsVisible(true)
      }, 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setIsVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 end-0 z-60 sm:max-w-xl w-full mx-auto p-6">
      {/* Card */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-y-3 sm:gap-y-0 sm:gap-x-5">
          <div className="grow">
            <h2 className="text-gray-500 dark:text-neutral-500">
              <span className="font-semibold text-gray-800 dark:text-neutral-200">
                We gebruiken cookies
              </span>{' '}
              om ons verkeer te analyseren en een soepele gebruikerservaring te creëren.
            </h2>
          </div>
          <div className="inline-flex gap-x-2">
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleReject}
                className="py-2 px-3 text-sm font-medium rounded-lg border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
              >
                Weigeren
              </Button>
            </div>
            <div>
              <Button
                type="button"
                onClick={handleAccept}
                className="py-2 px-3 text-sm font-medium rounded-lg bg-[#002A1F] text-white hover:bg-[#356258]"
              >
                Accepteren
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* End Card */}
    </div>
  )
}

