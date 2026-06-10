'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { MapPin, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'
import { supabase } from '@/lib/supabase/client'

interface Summary {
  email: string
  status: string
  landlord: string
  property: string | null
  monthlyRent: number | null
}

const transition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }
const slideIn = { initial: { opacity: 0, x: 32 }, animate: { opacity: 1, x: 0 }, transition }

const INPUT_CLS = 'h-12 text-base rounded-xl border-gray-300 focus-visible:ring-[#163300] focus-visible:border-[#163300]'
const PRIMARY_BTN = 'w-full h-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0 shadow-sm'

export default function AcceptInvitationPage() {
  return (
    <AuthPageShell>
      <AcceptInvitationInner />
    </AuthPageShell>
  )
}

function AcceptInvitationInner() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [summary, setSummary] = useState<Summary | null>(null)
  const [loadingPage, setLoadingPage] = useState(true)
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [done, setDone] = useState(false)

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
      setTimeout(() => router.push('/dashboard/tenant'), 1500)
    } catch (err: any) {
      setError(err.message)
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

  if (done) return <AuthLoadingScreen />

  if (loadingPage) {
    return <div className="h-12" />
  }

  // Samenvattingskaart — op elke variant getoond
  const summaryCard = summary?.property ? (
    <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#163300]">
        <MapPin className="h-5 w-5 text-[#9FE870]" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Uitnodiging van {summary.landlord}</div>
        <div className="truncate text-sm font-semibold text-gray-900">{summary.property}</div>
      </div>
    </div>
  ) : null

  const emailMismatch =
    !!loggedInEmail && !!summary?.email && loggedInEmail.toLowerCase() !== summary.email.toLowerCase()

  // ── Ingelogd met een ánder account dan de uitnodiging ──
  if (emailMismatch) {
    return (
      <motion.div {...slideIn}>
        <h1 className="text-4xl font-bold text-[#163300]">Verkeerd account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Deze uitnodiging is gericht aan <strong className="text-gray-800">{summary!.email}</strong>, maar je bent ingelogd als <strong className="text-gray-800">{loggedInEmail}</strong>.
        </p>
        {summaryCard}
        {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
        <Button onClick={handleSwitchAccount} disabled={loading} className={`${PRIMARY_BTN} mt-8`}>
          {loading ? 'Bezig…' : 'Uitloggen'}
        </Button>
      </motion.div>
    )
  }

  // ── Al ingelogd met het juiste account: één klik ──
  if (loggedInEmail) {
    return (
      <motion.div {...slideIn}>
        <h1 className="text-4xl font-bold text-[#163300]">Aanvraag accepteren</h1>
        <p className="mt-2 text-sm text-gray-600">
          Je bent ingelogd als <strong className="text-gray-800">{loggedInEmail}</strong>.
        </p>
        {summaryCard}
        {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
        <Button onClick={handleOneClickAccept} disabled={loading} className={`${PRIMARY_BTN} mt-8`}>
          {loading ? 'Bezig…' : 'Aanvraag accepteren'}
        </Button>
      </motion.div>
    )
  }

  // ── Niet ingelogd: inloggen óf account aanmaken ──
  return (
    <motion.div {...slideIn}>
      <h1 className="text-4xl font-bold text-[#163300]">Bevestig je aanvraag</h1>
      <p className="mt-2 text-sm text-gray-600">
        Kies een wachtwoord om je account te activeren. Heb je al een Domio-account? Vul je bestaande wachtwoord in.
      </p>

      {summaryCard}

      {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}

      <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
        {summary?.email && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">E{'‑'}mailadres</label>
            <Input value={summary.email} disabled className={`${INPUT_CLS} bg-gray-50 text-gray-500`} />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Wachtwoord</label>
            {resetSent ? (
              <span className="text-sm text-[#15803D]">Reset-link verstuurd</span>
            ) : (
              <button type="button" onClick={handleForgotPassword} className="text-sm text-[#163300] underline underline-offset-2 hover:no-underline">
                Vergeten?
              </button>
            )}
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT_CLS}
            required
            minLength={8}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirm" className="text-sm font-medium text-gray-700">Bevestig wachtwoord</label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={INPUT_CLS}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className={PRIMARY_BTN}>
          {loading ? 'Bezig…' : 'Aanvraag accepteren'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        Door verder te gaan ga je akkoord met ons{' '}
        <a href="https://domiovastgoedbeheer.nl/privacy" className="underline underline-offset-2">privacybeleid</a>.
      </p>
    </motion.div>
  )
}
