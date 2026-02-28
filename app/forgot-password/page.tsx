'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/Logo'
import { X } from 'lucide-react'
import { resetPassword } from '@/lib/supabase/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await resetPassword(email)
      if (authError) throw authError
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij het versturen van de reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="flex-shrink-0 w-full bg-white shadow-sm">
        <div className="container mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-8">
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

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[400px]">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#163300]">
            Wachtwoord vergeten
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Voer je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
          </p>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {submitted ? (
            <div className="mt-8 space-y-4">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                <p className="text-lg font-semibold text-emerald-800">Link verstuurd!</p>
                <p className="text-sm text-emerald-700 mt-2">
                  We hebben een reset link gestuurd naar <strong>{email}</strong>.
                  Check je inbox (en spam-map) en klik op de link om je wachtwoord te wijzigen.
                </p>
              </div>
              <Button
                onClick={() => { setSubmitted(false); setEmail('') }}
                variant="outline"
                className="w-full h-12 rounded-full font-semibold"
              >
                Opnieuw versturen
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-sm font-medium text-[#163300] underline underline-offset-2 hover:no-underline">
                  ← Terug naar inloggen
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mailadres
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
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
