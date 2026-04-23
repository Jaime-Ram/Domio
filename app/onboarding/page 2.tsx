'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Building2, Home, ChevronRight } from 'lucide-react'
import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { supabase } from '@/lib/supabase/client'

const transition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSelect = async (role: 'verhuurder' | 'huurder') => {
    setLoading(true)
    await supabase.auth.updateUser({ data: { role } })
    router.replace(role === 'huurder' ? '/portal' : '/dashboard/employer')
  }

  return (
    <AuthPageShell>
      <motion.div
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={transition}
      >
      <h1 className="text-4xl font-bold text-[#163300]">
        Wat voor account wil je aanmaken?
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Kies hoe je Domio wilt gebruiken.
      </p>

      <div className="mt-8 space-y-0 divide-y divide-gray-100">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSelect('verhuurder')}
          className="flex w-full items-center gap-4 py-4 pr-2 text-left hover:bg-gray-50/80 active:bg-gray-100 transition-colors -mx-1 px-1 rounded-block disabled:opacity-50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
            <Building2 className="h-5 w-5 text-[#163300]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900">Beheerder</div>
            <div className="text-sm text-gray-500 mt-0.5">Ik beheer panden en huurders</div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleSelect('huurder')}
          className="flex w-full items-center gap-4 py-4 pr-2 text-left hover:bg-gray-50/80 active:bg-gray-100 transition-colors -mx-1 px-1 rounded-block disabled:opacity-50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
            <Home className="h-5 w-5 text-[#163300]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900">Bewoner</div>
            <div className="text-sm text-gray-500 mt-0.5">Ik woon in een pand</div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
        </button>
      </div>
      </motion.div>
    </AuthPageShell>
  )
}
