'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth-errors'
import { ConfirmationBlock } from '@/components/ui/confirmation-block'
import { AuthPageShell } from '@/components/auth/auth-page-shell'

const transition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      for (let i = 0; i < 5; i++) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          if (!cancelled) setCheckingSession(false)
          return
        }
        await new Promise((r) => setTimeout(r, 400))
      }
      if (!cancelled) {
        setCheckingSession(false)
        router.replace('/forgot-password')
      }
    }
    check()
    return () => { cancelled = true }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }
    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens lang zijn')
      return
    }
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.updateUser({ password })
      if (authError) throw authError
      setSuccess(true)
    } catch (err) {
      setError(translateAuthError(err instanceof Error ? err.message : 'Wachtwoord wijzigen mislukt'))
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 items-center justify-center">
        <div className="animate-pulse text-gray-500">Laden...</div>
      </div>
    )
  }

  return (
    <AuthPageShell>
          <AnimatePresence mode="wait" initial={false}>
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={transition}
                className="mt-8"
              >
                <ConfirmationBlock
                  icon={CheckCircle2}
                  title="Wachtwoord gewijzigd"
                  description="Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen met je nieuwe wachtwoord."
                  primaryButton={{ label: 'Naar inloggen', href: '/login' }}
                  footerLink={{ label: '← Terug naar home', href: '/' }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={transition}
              >
              <h1 className="text-3xl font-bold text-[#163300]">
                Nieuw wachtwoord instellen
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Kies een nieuw wachtwoord voor je account.
              </p>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Nieuw wachtwoord</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimaal 6 tekens"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 text-base rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Bevestig wachtwoord</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Herhaal wachtwoord"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 text-base rounded-xl"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold"
                >
                  {loading ? 'Bezig...' : 'Wachtwoord opslaan'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm font-medium text-[#163300] underline underline-offset-2 hover:no-underline">
                  ← Terug naar inloggen
                </Link>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
    </AuthPageShell>
  )
}
