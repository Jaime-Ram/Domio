'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SocialButton } from '@/components/ui/social-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/Logo'
import { X } from 'lucide-react'

export default function RegistrerenPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'employee' | 'employer'>('employer')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Vul je e-mailadres in')
      return
    }
    setStep(2)
  }

  const handleBack = () => {
    setError(null)
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (password !== confirmPassword) {
        setError('Wachtwoorden komen niet overeen')
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setError('Wachtwoord moet minimaal 6 tekens lang zijn')
        setLoading(false)
        return
      }
      await new Promise((r) => setTimeout(r, 1000))
      router.push('/dashboard/employer')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      setLoading(false)
    }
  }

  const handleSocialSignup = async () => {
    setLoading(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      router.push('/dashboard/employer')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registreren mislukt')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header: zelfde container en logo-positie als hoofdpagina */}
      <header className="flex-shrink-0 w-full bg-white shadow-sm">
        <div className="container mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-8">
          {/* Placeholder voor uitlijning met hoofdpagina (hamburgerruimte op mobiel) */}
          <div className="w-10 flex-shrink-0 md:w-0 md:min-w-0 md:overflow-hidden" aria-hidden />
          <div className="flex-1 flex justify-center md:justify-start md:flex-none md:flex-shrink-0">
            <Logo width={100} height={28} />
          </div>
          <div className="hidden md:block flex-1" aria-hidden />
          <Link
            href="/"
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Gecentreerde inhoud – ruim wit, één formulier focus */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[400px]">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#163300]">
            Maak je Domio-account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Al een account?{' '}
            <Link href="/login" className="font-medium text-[#163300] underline underline-offset-2 hover:no-underline">
              Inloggen
            </Link>
          </p>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Vul eerst je e-mailadres in
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="naam@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-gray-300 focus-visible:ring-[#163300] focus-visible:border-[#163300]"
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
                  <span className="bg-white px-3 text-sm text-gray-500">Of registreer met</span>
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
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-gray-600 hover:text-[#163300] font-medium"
              >
                ← Terug
              </button>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ik ben een</label>
                <div className="relative inline-flex w-full rounded-xl border border-gray-300 bg-gray-50 p-1">
                  <div
                    className={`absolute top-1 bottom-1 rounded-lg bg-[#163300] transition-all duration-200 ${
                      role === 'employer' ? 'left-1 right-1/2' : 'left-1/2 right-1'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      role === 'employer' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Beheerder
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      role === 'employee' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bewoner
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Naam</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Je volledige naam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl border-gray-300"
                  required
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
                  className="h-12 rounded-xl border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Bevestig wachtwoord</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Herhaal wachtwoord"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl border-gray-300"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0"
              >
                {loading ? 'Bezig...' : 'Registreren'}
              </Button>
            </form>
          )}

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
        </div>
      </main>
    </div>
  )
}
