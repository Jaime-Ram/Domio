'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail } from 'lucide-react'
import { resetPassword } from '@/lib/supabase/auth'
import { ConfirmationBlock } from '@/components/ui/confirmation-block'
import { AuthPageShell } from '@/components/auth/auth-page-shell'

const transition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }

const RESEND_COOLDOWN_SEC = 20

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!submitted || resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [submitted, resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await resetPassword(email)
      if (authError) throw authError
      setSubmitted(true)
      setResendCooldown(RESEND_COOLDOWN_SEC)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij het versturen van de reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell>
          {!submitted && (
            <>
              <h1 className="text-4xl font-bold text-[#163300]">
                Wachtwoord vergeten
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Voer je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
              </p>
            </>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={transition}
                className="mt-8"
              >
                <ConfirmationBlock
                  icon={Mail}
                  title={'Controleer je e\u2011mail'}
                  description={
                    <>
                      Volg de link in de e-mail die we naar <strong className="text-gray-900">{email}</strong> hebben gestuurd. Het kan tot 1 minuut duren voordat je de e-mail ontvangt.
                    </>
                  }
                  primaryButton={{ label: 'E\u2011mail openen om goed te keuren', href: 'https://mail.google.com/mail/' }}
                  secondaryButton={{
                    label: resendCooldown > 0 ? `E-mail opnieuw sturen (${resendCooldown})` : 'E-mail opnieuw sturen',
                    disabled: resendCooldown > 0 || loading,
                    loading,
                    onClick: async () => {
                      if (resendCooldown > 0) return
                      setLoading(true)
                      setError(null)
                      try {
                        const { error: authError } = await resetPassword(email)
                        if (authError) throw authError
                        setResendCooldown(RESEND_COOLDOWN_SEC)
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Fout bij het versturen')
                      } finally {
                        setLoading(false)
                      }
                    },
                  }}
                  footerLink={{ label: '← Terug naar inloggen', href: '/login' }}
                />
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={transition}
              >
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E{'\u2011'}mailadres
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="naam@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base rounded-xl border-gray-300 focus-visible:ring-[#163300] focus-visible:border-[#163300]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0 shadow-sm"
              >
                {loading ? 'Bezig met versturen...' : 'Reset link versturen'}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm font-medium text-[#163300] underline underline-offset-2 hover:no-underline">
                  ← Terug naar inloggen
                </Link>
              </div>
              </motion.form>
            )}
          </AnimatePresence>
    </AuthPageShell>
  )
}
