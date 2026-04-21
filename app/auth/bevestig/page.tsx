'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'

const transition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }

export default function BevestigAccountPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login')
        return
      }
      // Als de gebruiker al een rol heeft, stuur door naar dashboard
      if (user.user_metadata?.role) {
        const role = user.user_metadata.role as string
        router.replace(role === 'huurder' ? '/portal' : '/dashboard/employer')
        return
      }
      setEmail(user.email ?? null)
      // Detecteer OAuth provider uit identities
      const identity = user.identities?.[0]
      setProvider(identity?.provider ?? null)
    })
  }, [router])

  const handleConfirm = () => {
    router.push('/onboarding')
  }

  const handleCancel = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const providerLabel = provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple' : 'dit account'

  return (
    <AuthPageShell>
      <motion.div
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={transition}
      >
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className="mb-8 p-2 -ml-2 rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
        aria-label="Terug"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="text-4xl font-bold text-[#163300]">
        Account niet herkend
      </h1>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed">
        We hebben geen Domio-account gevonden dat gekoppeld is aan{' '}
        {email ? (
          <strong className="text-gray-900">{email}</strong>
        ) : (
          <span>{providerLabel}</span>
        )}
        .
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Wil je met dit account een nieuw Domio-account aanmaken?
      </p>

      <div className="mt-8 space-y-3">
        <Button
          onClick={handleConfirm}
          className="w-full h-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0 shadow-sm"
        >
          Ja, maak account aan
        </Button>
        <Button
          onClick={handleCancel}
          disabled={loading}
          variant="ghost"
          className="w-full h-12 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-base"
        >
          {loading ? 'Bezig...' : 'Nee, terug naar inloggen'}
        </Button>
      </div>
      </motion.div>
    </AuthPageShell>
  )
}
