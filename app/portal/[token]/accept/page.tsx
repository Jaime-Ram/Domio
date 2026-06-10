'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle2, MapPin } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { supabase } from '@/lib/supabase/client'

interface Summary {
  email: string
  status: string
  landlord: string
  property: string | null
  monthlyRent: number | null
}

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [summary, setSummary] = useState<Summary | null>(null)
  const [loadingPage, setLoadingPage] = useState(true)
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [done, setDone] = useState(false)

  // Samenvatting + sessie ophalen
  useEffect(() => {
    Promise.all([
      fetch(`/api/invitations/summary?token=${encodeURIComponent(token)}`).then((r) => r.json()).catch(() => null),
      supabase.auth.getUser().then(({ data }) => data.user?.email ?? null).catch(() => null),
    ]).then(([sum, email]) => {
      if (sum && !sum.error) setSummary(sum)
      setLoggedInEmail(email)
      setLoadingPage(false)
    })
  }, [token])

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

  function handleOneClickAccept() {
    accept({})
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Wachtwoord moet minimaal 8 tekens zijn.'); return }
    if (password !== confirmPassword) { setError('Wachtwoorden komen niet overeen.'); return }
    accept({ password })
  }

  async function handleSwitchAccount() {
    setLoading(true)
    await supabase.auth.signOut()
    setLoggedInEmail(null)
    setLoading(false)
  }

  async function handleForgotPassword() {
    if (!summary?.email) return
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(summary.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) { setError(error.message); return }
    setResetSent(true)
  }

  const inputCls = 'w-full bg-[#f4f4f4] rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#163300]/15 transition-all'
  const ctaCls = 'flex items-center justify-center gap-2 w-full bg-[#9FE870] text-[#163300] font-bold text-base py-4 rounded-full hover:bg-[#8AD45F] transition-colors disabled:opacity-50'

  if (loadingPage) {
    return <Shell><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></Shell>
  }

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

  // Samenvattingskaart — op beide varianten getoond
  const summaryCard = (
    <>
      {summary?.property && (
        <div className="flex items-center gap-3 bg-[#f4f4f4] rounded-2xl px-4 py-3.5 mb-6 text-left">
          <div className="w-8 h-8 rounded-xl bg-[#163300] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-[#9FE870]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
              Uitnodiging van {summary.landlord}
            </p>
            <p className="text-sm font-semibold text-gray-900 truncate">{summary.property}</p>
          </div>
        </div>
      )}
    </>
  )

  const emailMismatch =
    !!loggedInEmail && !!summary?.email && loggedInEmail.toLowerCase() !== summary.email.toLowerCase()

  // ── Ingelogd met een ánder account dan de uitnodiging ──
  if (emailMismatch) {
    return (
      <Shell>
        <div className="w-full max-w-sm">
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight text-center leading-tight mb-3">
            Verkeerd account
          </h1>
          <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
            Deze uitnodiging is gericht aan <strong className="text-gray-700">{summary!.email}</strong>, maar je bent ingelogd als <strong className="text-gray-700">{loggedInEmail}</strong>.
          </p>

          {summaryCard}

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-3 mb-3">{error}</p>}

          <button onClick={handleSwitchAccount} disabled={loading} className={ctaCls}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Uitloggen en doorgaan als {summary!.email}
          </button>
        </div>
      </Shell>
    )
  }

  // ── Al ingelogd met het juiste account: één klik ──
  if (loggedInEmail) {
    return (
      <Shell>
        <div className="w-full max-w-sm">
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight text-center leading-tight mb-3">
            Aanvraag accepteren
          </h1>
          <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
            Je bent ingelogd als <strong className="text-gray-700">{loggedInEmail}</strong>.
          </p>

          {summaryCard}

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-3 mb-3">{error}</p>}

          <button onClick={handleOneClickAccept} disabled={loading} className={ctaCls}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Aanvraag accepteren
          </button>
        </div>
      </Shell>
    )
  }

  // ── Niet ingelogd: samenvatting + wachtwoord (inloggen óf account aanmaken) ──
  return (
    <Shell>
      <div className="w-full max-w-sm">
        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight text-center leading-tight mb-3">
          Bevestig je aanvraag
        </h1>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
          Kies een wachtwoord om je account te activeren. Heb je al een Domio-account? Vul je bestaande wachtwoord in.
        </p>

        {summaryCard}

        {summary?.email && (
          <div className="bg-[#f4f4f4] rounded-2xl px-4 py-3 mb-4 text-center">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Je e-mailadres</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{summary.email}</p>
          </div>
        )}

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

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-3">{error}</p>}

          <div className="pt-2">
            <button type="submit" disabled={loading} className={ctaCls}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Aanvraag accepteren
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          {resetSent ? (
            <p className="text-xs text-[#15803D]">Reset-link verstuurd naar je e-mail.</p>
          ) : (
            <button onClick={handleForgotPassword} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
              Wachtwoord vergeten?
            </button>
          )}
        </div>

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
