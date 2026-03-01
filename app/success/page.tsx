'use client'

import { CheckCircle2 } from 'lucide-react'
import { ConfirmationBlock } from '@/components/ui/confirmation-block'
import { Logo } from '@/components/Logo'

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="flex-shrink-0 w-full bg-white shadow-sm">
        <div className="container mx-auto flex h-16 w-full max-w-7xl items-center justify-center px-4 md:px-8">
          <Logo width={100} height={28} />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[440px]">
          <ConfirmationBlock
            icon={CheckCircle2}
            title="Gelukt!"
            description={
              <>
                Je betaling is succesvol verwerkt. Je ontvangt binnenkort een bevestiging per e-mail.
              </>
            }
            primaryButton={{ label: 'Naar home', href: '/' }}
            secondaryButton={{ label: 'Naar dashboard', href: '/dashboard/employer' }}
          />
        </div>
      </main>
    </div>
  )
}
