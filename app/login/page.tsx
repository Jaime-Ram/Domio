'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { SocialButton } from '@/components/ui/social-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { KeyRound, ArrowLeft } from 'lucide-react'
import { signIn, signInWithGoogle, signInWithApple, getMfaAssuranceLevel, listMfaFactors, verifyMfa, getUser } from '@/lib/supabase/auth'
import { translateAuthError } from '@/lib/auth-errors'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'
import { AuthPageShell } from '@/components/auth/auth-page-shell'

type Step = 'login' | 'totp' | 'email-2fa'

const transition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }
const slideIn = { initial: { opacity: 0, x: 32 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -32 }, transition }

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [step, setStep] = useState<Step>('login')

  // TOTP
  const [totpFactorId, setTotpFactorId] = useState('')
  const [totpCode, setTotpCode] = useState('')

  // Email 2FA
  const [emailCode, setEmailCode] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const err = searchParams.get('error')
    if (err) setError(translateAuthError(decodeURIComponent(err)))
  }, [searchParams])

  // If arriving with an existing session (e.g. redirected from dashboard), detect 2FA needs
  useEffect(() => {
    async function checkExistingSession() {
      const { user } = await getUser()
      if (!user) return

      // Check preferred 2FA method from profile first
      const hasCookie = typeof document !== 'undefined' && document.cookie.includes('two_fa_verified=1')
      if (!hasCookie) {
        const res = await fetch('/api/auth/2fa/required')
        const data = await res.json().catch(() => ({}))
        if (data.required && data.method === 'email') {
          setStep('email-2fa')
          sendEmailCode()
          return
        }
      }

      // Check Supabase TOTP AAL2
      const { data: aal } = await getMfaAssuranceLevel()
      if (aal?.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
        const { data: factors } = await listMfaFactors()
        const first = factors?.totp?.[0]
        if (first) {
          setTotpFactorId(first.id)
          setStep('totp')
          return
        }
      }

      // Session is valid and no 2FA pending
      router.replace('/dashboard')
    }
    checkExistingSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearDemoCookie = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'domio_demo=; path=/; max-age=0'
    }
  }

  const sendEmailCode = async () => {
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/2fa/email/send', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) setError(data.error || 'Code kon niet worden verstuurd')
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await signIn(email, password)
      if (authError) throw authError
      clearDemoCookie()

      // Check preferred 2FA method from profile first
      const res = await fetch('/api/auth/2fa/required')
      const mfaData = await res.json().catch(() => ({}))

      if (mfaData.required && mfaData.method === 'email') {
        setStep('email-2fa')
        await sendEmailCode()
        setLoading(false)
        return
      }

      // Check Supabase TOTP AAL2 (for totp method or as fallback)
      const { data: aal } = await getMfaAssuranceLevel()
      if (aal?.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
        const { data: factors } = await listMfaFactors()
        const first = factors?.totp?.[0]
        if (first) {
          setTotpFactorId(first.id)
          setStep('totp')
          setLoading(false)
          return
        }
      }

      setTransitioning(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(translateAuthError(msg))
      setLoading(false)
    }
  }

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: verifyError } = await verifyMfa(totpFactorId, totpCode)
      if (verifyError) throw verifyError
      setTransitioning(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(translateAuthError(msg))
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = emailCode.replace(/\s/g, '')
    if (trimmed.length !== 6) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/2fa/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Code ongeldig of verlopen')
      document.cookie = 'two_fa_verified=1; path=/; max-age=86400; SameSite=Lax'
      setTransitioning(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(translateAuthError(msg))
      setLoading(false)
    }
  }

  const handleSocialLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await signInWithGoogle()
      if (authError) throw authError
    } catch (err: unknown) {
      setError(translateAuthError(err instanceof Error ? err.message : 'Inloggen met Google mislukt'))
      setLoading(false)
    }
  }

  const handlePasskeyLogin = async () => {
    if (!window.PublicKeyCredential) {
      setError('Passkeys worden niet ondersteund in deze browser. Gebruik een moderne browser (Chrome, Safari, Edge).')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)
      const options: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: typeof window !== 'undefined' ? window.location.hostname : undefined,
        timeout: 60000,
        userVerification: 'preferred',
      }
      const credential = await navigator.credentials.get({
        publicKey: options,
        mediation: 'optional',
      })
      if (credential && credential.type === 'public-key') {
        await new Promise((r) => setTimeout(r, 500))
        clearDemoCookie()
        router.push('/dashboard')
      } else {
        setError('Geen passkey geselecteerd. Probeer opnieuw of log in met e-mail.')
      }
    } catch (err: unknown) {
      const msg = translateAuthError(err instanceof Error ? err.message : 'Passkey-inloggen mislukt')
      if (String(msg).includes('cancel') || String(msg).includes('NotAllowed')) {
        setError(null)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  if (transitioning) {
    return (
      <AuthLoadingScreen
        onAnimationComplete={() => {
          router.push('/dashboard')
        }}
      />
    )
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === 'totp' ? (
        <motion.div key="totp" {...slideIn}>
          <button
            onClick={() => { setStep('login'); setTotpCode(''); setError(null) }}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </button>
          <h1 className="text-4xl font-bold text-[#163300]">Verificatie</h1>
          <p className="mt-2 text-sm text-gray-600">
            Voer de 6-cijferige code uit je authenticator-app in.
          </p>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleVerifyTotp} className="mt-8 space-y-6">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="h-12 text-center text-xl tracking-[0.5em] font-mono rounded-xl border-gray-300 focus-visible:ring-[#163300] focus-visible:border-[#163300]"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="w-full h-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0 shadow-sm"
            >
              {loading ? 'Controleren…' : 'Bevestigen'}
            </Button>
          </form>
        </motion.div>
      ) : step === 'email-2fa' ? (
        <motion.div key="email-2fa" {...slideIn}>
          <button
            onClick={() => { setStep('login'); setEmailCode(''); setError(null) }}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </button>
          <h1 className="text-4xl font-bold text-[#163300]">Verificatie</h1>
          <p className="mt-2 text-sm text-gray-600">
            We hebben een 6-cijferige code naar je e-mailadres gestuurd. Voer die hieronder in.
          </p>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleVerifyEmail} className="mt-8 space-y-6">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="h-12 text-center text-xl tracking-[0.5em] font-mono rounded-xl border-gray-300 focus-visible:ring-[#163300] focus-visible:border-[#163300]"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading || emailCode.length !== 6}
              className="w-full h-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0 shadow-sm"
            >
              {loading ? 'Controleren…' : 'Bevestigen'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              onClick={sendEmailCode}
              disabled={sending}
            >
              {sending ? 'Bezig…' : 'Code opnieuw versturen'}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div key="login" {...slideIn}>
          <h1 className="text-4xl font-bold text-[#163300]">
            Welkom terug!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Nog geen account?{' '}
            <Link href="/registreren" className="font-medium text-[#163300] underline underline-offset-2 hover:no-underline">
              Registreren
            </Link>
          </p>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Wachtwoord
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#163300] underline underline-offset-2 hover:no-underline"
                >
                  Vergeten?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base rounded-xl border-gray-300 focus-visible:ring-[#163300] focus-visible:border-[#163300]"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
              >
                Onthoud mij
              </label>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0 shadow-sm"
            >
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </Button>
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-gray-900 px-3 text-sm text-gray-500">Of log in met</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SocialButton
                type="button"
                variant="default"
                size="lg"
                className="h-12 rounded-xl border-gray-300 bg-white hover:bg-gray-50"
                onClick={handleSocialLogin}
                disabled={loading}
                aria-label="Inloggen met Google"
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
                onClick={async () => {
                  setLoading(true); setError(null)
                  try { const { error: e } = await signInWithApple(); if (e) throw e } catch (err: unknown) { setError(translateAuthError(err instanceof Error ? err.message : 'Inloggen met Apple mislukt')); setLoading(false) }
                }}
                disabled={loading}
                aria-label="Inloggen met Apple"
              >
                <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19z" />
                </svg>
              </SocialButton>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <SocialButton
                type="button"
                variant="default"
                size="lg"
                className="w-full h-12 rounded-xl border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={handlePasskeyLogin}
                disabled={loading}
                aria-label="Inloggen met passkey"
              >
                <KeyRound className="h-5 w-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Inloggen met passkey</span>
              </SocialButton>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function LoginPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>
    </AuthPageShell>
  )
}
