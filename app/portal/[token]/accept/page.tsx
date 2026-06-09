'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { supabase } from '@/lib/supabase/client'

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [checkingSession, setCheckingSession] = useState(true)
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // Bepaal of de bezoeker al is ingelogd
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedInEmail(data.user?.email ?? null)
      setCheckingSession(false)
    })
  }, [])

  async function accept(body: Record<string, unknown>) {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Onbekende fout')
      setDone(true)
      setTimeout(() => router.push('/dashboard/tenant'), 1800)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Ingelogd: accepteer in één klik (geen wachtwoord nodig)
  function handleOneClickAccept() {
    accept({})
  }

  // Niet ingelogd: wachtwoord instellen / invullen
  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Wachtwoord moet minimaal 8 tekens zijn.'); return }
    if (password !== confirmPassword) { setError('Wachtwoorden komen niet overeen.'); return }
    accept({ password })
  }

  const inputCls = 'w-full bg-[#f4f4f4] rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#163300]/15 transition-all'
  const ctaCls = 'flex items-center justify-center gap-2 w-full bg-[#9FE870] text-[#163300] font-bold text-base py-4 rounded-full hover:bg-[#8AD45F] transition-colors disabled:opacity-50'

  if (done) {
    return (
      <Shell>
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[#9FE870]/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-[#15803D]" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Aanvraag geaccepteerd!</h1>
          <p className="text-sm text-gray-400">Je wordt doorgestuurd naar je portaal…</p>
        </div>
      </Shell>
    )
  }

  if (checkingSession) {
    return (
      <Shell>
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </Shell>
    )
  }

  // ── Ingelogd: één klik ──
  if (loggedInEmail) {
    return (
      <Shell>
        <div className="w-full max-w-sm">
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight text-center leading-tight mb-3">
            Aanvraag accepteren
          </h1>
          <p className="text-sm text-gray-500 text-center leading-relaxed mb-8">
            Je bent ingelogd als <strong className="text-gray-700">{loggedInEmail}</strong>. Accepteer de aanvraag om toegang te krijgen tot je huurportaal.
          </p>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-3 mb-3">{error}</p>
          )}

          <button onClick={handleOneClickAccept} disabled={loading} className={ctaCls}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Aanvraag accepteren
          </button>
        </div>
      </Shell>
    )
  }

  // ── Niet ingelogd: wachtwoord instellen of invullen ──
  return (
    <Shell>
      <div className="w-full max-w-sm">
        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight text-center leading-tight mb-3">
          Aanvraag accepteren
        </h1>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-8">
          Kies een wachtwoord om je aanvraag te bevestigen. Heb je al een Domio-account met dit e-mailadres? Vul dan je bestaande wachtwoord in.
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={inputCls + ' pr-11'}
              placeholder="Wachtwoord (min. 8 tekens)"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={inputCls}
            placeholder="Bevestig wachtwoord"
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-3">{error}</p>
          )}

          <div className="pt-2">
            <button type="submit" disabled={loading} className={ctaCls}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Aanvraag accepteren
            </button>
          </div>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Door verder te gaan ga je akkoord met ons{' '}
          <a href="https://domiovastgoedbeheer.nl/privacy" className="underline underline-offset-2">
            privacybeleid
          </a>.
        </p>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-12 pb-16">
      <div className="mb-10"><Logo width={120} height={32} href="#" /></div>
      {children}
    </div>
  )
}
