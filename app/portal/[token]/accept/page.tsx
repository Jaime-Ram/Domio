'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Wachtwoord moet minimaal 8 tekens zijn.'); return }
    if (password !== confirmPassword) { setError('Wachtwoorden komen niet overeen.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Onbekende fout')
      setDone(true)
      setTimeout(() => router.push('/dashboard/tenant'), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#f4f4f4] rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#163300]/15 transition-all'

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-12">
        <div className="mb-10"><Logo width={120} height={32} href="#" /></div>
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[#9FE870]/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-[#15803D]" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Account aangemaakt!</h1>
          <p className="text-sm text-gray-400">Je wordt doorgestuurd naar je portaal…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-12 pb-16">

      <div className="mb-10"><Logo width={120} height={32} href="#" /></div>

      <div className="w-full max-w-sm">
        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight text-center leading-tight mb-3">
          Kies een wachtwoord
        </h1>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-8">
          Stel je wachtwoord in om je account aan te maken.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
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
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-[#9FE870] text-[#163300] font-bold text-base py-4 rounded-full hover:bg-[#8AD45F] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Account aanmaken
            </button>
          </div>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Door te registreren ga je akkoord met ons{' '}
          <a href="https://domiovastgoedbeheer.nl/privacy" className="underline underline-offset-2">
            privacybeleid
          </a>.
        </p>
      </div>
    </div>
  )
}
