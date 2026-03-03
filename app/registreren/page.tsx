'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SocialButton } from '@/components/ui/social-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, AlertCircle, Building2, Home, ChevronRight, ArrowLeft } from 'lucide-react'
import { signUp, signInWithGoogle } from '@/lib/supabase/auth'
import { ConfirmationBlock } from '@/components/ui/confirmation-block'
import { AuthPageShell } from '@/components/auth/auth-page-shell'

const transition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }

export default function RegistrerenPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'employee' | 'employer'>('employer')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [emailExists, setEmailExists] = useState(false)

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Vul je e-mailadres in')
      return
    }
    setStep(2)
  }

  const handleStep2 = () => {
    setError(null)
    setStep(3)
  }

  const handleBack = () => {
    setError(null)
    setEmailExists(false)
    if (step === 2) setStep(1)
    else setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setEmailExists(false)
    try {
      if (password.length < 6) {
        setError('Wachtwoord moet minimaal 6 tekens lang zijn')
        setLoading(false)
        return
      }

      // Proactief controleren of e-mail al bestaat (voorkomt registratie met bestaand account)
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const { exists } = (await checkRes.json()) as { exists?: boolean }
      if (exists) {
        setEmailExists(true)
        setLoading(false)
        return
      }

      const supaRole = role === 'employer' ? 'verhuurder' : 'huurder'
      const { data, error: authError } = await signUp(
        email,
        password,
        name,
        supaRole as 'verhuurder' | 'huurder',
        phone.trim() || undefined
      )

      // Fallback: Supabase retourneert soms succes met lege identities bij bestaand e-mail
      const isDuplicateEmail =
        (authError && /already|exists|registered|eerder/i.test(authError.message)) ||
        (data?.user && (!data.user.identities || data.user.identities.length === 0))

      if (isDuplicateEmail) {
        setEmailExists(true)
        setLoading(false)
        return
      }
      if (authError) throw authError
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignup = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await signInWithGoogle()
      if (authError) throw authError
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registreren mislukt')
      setLoading(false)
    }
  }

  return (
    <AuthPageShell>
          {(step === 2 || step === 3) && !emailExists && !success && (
            <button
              type="button"
              onClick={handleBack}
              className="mb-4 p-2 -ml-2 rounded-full bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300 transition-colors"
              aria-label="Terug"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          {!emailExists && !success && (
            <h1 className="text-4xl font-bold text-[#163300]">
              {step === 1
                ? "Maak je Domio\u2011account"
                : step === 2
                  ? 'Wat voor account wil je aanmaken?'
                  : 'Vul je gegevens in'}
            </h1>
          )}
          {step === 1 && (
            <p className="mt-2 text-sm text-gray-600">
              Al een account?{' '}
              <Link href="/login" className="font-medium text-[#163300] underline underline-offset-2 hover:no-underline">
                Inloggen
              </Link>
            </p>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {emailExists ? (
              <motion.div
                key="emailExists"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }}
                className="mt-8"
              >
                <ConfirmationBlock
                  icon={AlertCircle}
                  title="Dit e{'\u2011'}mailadres bestaat al"
                  description={
                    <>
                      Er is al een account gekoppeld aan <strong className="text-gray-900">{email}</strong>. Log in met je wachtwoord of vraag een nieuw wachtwoord aan.
                    </>
                  }
                  primaryButton={{ label: 'Ga naar inloggen', href: '/login' }}
                  secondaryButton={{ label: 'Wachtwoord vergeten', href: '/forgot-password' }}
                />
              </motion.div>
            ) : success ? (
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
                      Volg de link in de e-mail die we naar <strong className="text-gray-900">{email}</strong> hebben gestuurd om je account te activeren. Het kan tot 1 minuut duren voordat je de e-mail ontvangt.
                    </>
                  }
                  primaryButton={{ label: 'E\u2011mail openen om goed te keuren', href: 'https://mail.google.com/mail/' }}
                  secondaryButton={{ label: 'Naar inloggen', onClick: () => router.push('/login') }}
                />
              </motion.div>
            ) : step === 1 ? (
              <motion.form
                key="step1"
                onSubmit={handleStep1}
                className="mt-8 space-y-6"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={transition}
              >
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Vul eerst je e{'\u2011'}mailadres in
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
                className="w-full h-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0 shadow-sm"
              >
                Volgende
              </Button>

              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-gray-900 px-3 text-sm text-gray-500">Of registreer met</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <SocialButton
                  type="button"
                  variant="default"
                  size="lg"
                  className="h-12 rounded-xl border-gray-300 bg-white hover:bg-gray-50"
                  onClick={handleSocialSignup}
                  disabled={loading}
                  aria-label="Registreren met Google"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </SocialButton>
                <SocialButton
                  type="button"
                  variant="default"
                  size="lg"
                  className="h-12 rounded-xl border-gray-300 bg-white hover:bg-gray-50"
                  onClick={handleSocialSignup}
                  disabled={loading}
                  aria-label="Registreren met Facebook"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </SocialButton>
                <SocialButton
                  type="button"
                  variant="default"
                  size="lg"
                  className="h-12 rounded-xl border-gray-300 bg-white hover:bg-gray-50"
                  onClick={handleSocialSignup}
                  disabled={loading}
                  aria-label="Registreren met Apple"
                >
                  {/* Apple logo: appel-vorm (fruit met hap) */}
                  <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19z" />
                  </svg>
                </SocialButton>
              </div>
              </motion.form>
            ) : step === 2 ? (
              <motion.div
                key="step2"
                className="mt-8 space-y-6"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={transition}
              >
                <p className="text-sm text-gray-500 -mt-2">
                  Je kunt je rol later nog wijzigen in de instellingen.
                </p>

                <div className="space-y-0 divide-y divide-gray-100">
                  <button
                    type="button"
                    onClick={() => { setRole('employer'); handleStep2() }}
                    className="flex w-full items-center gap-4 py-4 pr-2 text-left hover:bg-gray-50/80 active:bg-gray-100 transition-colors -mx-1 px-1 rounded-block"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
                      <Building2 className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">Beheerder</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        Ik beheer panden en huurders
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('employee'); handleStep2() }}
                    className="flex w-full items-center gap-4 py-4 pr-2 text-left hover:bg-gray-50/80 active:bg-gray-100 transition-colors -mx-1 px-1 rounded-block"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
                      <Home className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">Bewoner</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        Ik woon in een pand
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="step3"
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={transition}
              >
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Naam</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Je volledige naam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-base rounded-block border-gray-300 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefoon</label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+31 6 12345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 text-base rounded-block border-gray-300 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Wachtwoord</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimaal 6 tekens"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base rounded-block border-gray-300 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-brand-accent text-brand-primary hover:bg-brand-accent/90 font-semibold text-base border-0"
              >
                {loading ? 'Bezig...' : 'Registreren'}
              </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-xs text-gray-500 leading-relaxed">
            Door te registreren ga je akkoord met onze{' '}
            <Link href="/algemene-voorwaarden" className="font-medium text-[#163300] underline underline-offset-2">
              Algemene voorwaarden
            </Link>{' '}
            en{' '}
            <Link href="/privacy" className="font-medium text-[#163300] underline underline-offset-2">
              Privacybeleid
            </Link>
            .
          </p>
    </AuthPageShell>
  )
}
