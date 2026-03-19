'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MobileAppOnlyScreen() {
  const handleOpenApp = () => {
    // Pas dit schema aan als jullie app een andere deeplink gebruikt.
    window.location.href = 'domio://open'
  }

  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center px-6">
      <Button
        asChild
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 rounded-full bg-gray-100 border-0 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
      >
        <Link href="/" aria-label="Terug">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>

      <div className="max-w-sm w-full text-center">
        <div className="relative mx-auto mb-7 h-28 w-28 flex items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-[26px] bg-[#9FE870]/22 blur-[14px]"
          />
          <span
            aria-hidden
            className="absolute -inset-3 rounded-[32px] bg-[radial-gradient(circle_at_center,rgba(159,232,112,0.24)_0%,rgba(159,232,112,0.12)_44%,rgba(159,232,112,0)_74%)]"
          />
          <div className="relative h-24 w-24 rounded-[22px] bg-[#9FE870] flex items-center justify-center shadow-[0_10px_22px_rgba(22,51,0,0.16),0_4px_10px_rgba(22,51,0,0.12),inset_0_1px_0_rgba(255,255,255,0.32)]">
          <img
            src="/images/offerla:ZA.png"
            alt="Domio app icoon"
            className="h-[56%] w-[56%] object-contain drop-shadow-[0_2px_4px_rgba(22,51,0,0.14)]"
          />
        </div>
        </div>
        <h1 className="text-4xl font-bold text-[#163300] mb-2">Open Domio in de app</h1>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          Je omgeving is op mobiel alleen beschikbaar via de Domio-app. Open de app om veilig en
          snel verder te gaan met je beheer.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3">
          <Button
            asChild
            className="w-full h-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0 shadow-sm"
          >
            <Link href="/">App downloaden</Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleOpenApp}
            className="w-full h-12 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-base border-0"
          >
            App openen
          </Button>
        </div>
      </div>
    </div>
  )
}

