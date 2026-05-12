'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { listMfaFactors, verifyMfa } from '@/lib/supabase/auth'

const COOKIE_NAME = 'two_fa_verified'
const COOKIE_MAX_AGE = 86400 // 24 uur

function set2FaVerifiedCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

function Verify2FaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const method = searchParams.get('method') === 'totp' ? 'totp' : 'email'

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totpFactorId, setTotpFactorId] = useState('')

  // Email flow: send code on mount
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

  // TOTP flow: load factor ID on mount
  const loadTotpFactor = async () => {
    const { data } = await listMfaFactors()
    const first = data?.totp?.[0]
    if (first) setTotpFactorId(first.id)
    else setError('Geen authenticator-app gevonden. Gebruik e-mailverificatie of neem contact op.')
  }

  useEffect(() => {
    if (method === 'email') sendEmailCode()
    else loadTotpFactor()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.replace(/\s/g, '')
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setError('Voer een geldige 6-cijferige code in')
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (method === 'totp') {
        if (!totpFactorId) { setError('Geen authenticator-app gevonden'); return }
        const { error: verifyError } = await verifyMfa(totpFactorId, trimmed)
        if (verifyError) { setError(verifyError.message); return }
        set2FaVerifiedCookie()
        router.push('/dashboard/landlord')
      } else {
        const res = await fetch('/api/auth/2fa/email/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: trimmed }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) { setError(data.error || 'Code ongeldig of verlopen'); return }
        set2FaVerifiedCookie()
        router.push('/dashboard/landlord')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#163300] dark:text-[#9FE870] text-center">
        Verificatiecode
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {method === 'totp'
          ? 'Voer de 6-cijferige code uit je authenticator-app in.'
          : 'We hebben een 6-cijferige code naar je e-mailadres gestuurd. Voer die hieronder in.'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center text-lg tracking-[0.4em] font-mono"
          autoFocus
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        )}
        <Button
          type="submit"
          className="w-full bg-[#163300] hover:bg-[#1e4000] text-white"
          disabled={loading || code.length !== 6}
        >
          {loading ? 'Controleren…' : 'Verifiëren'}
        </Button>
      </form>
      {method === 'email' && (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-400"
            onClick={sendEmailCode}
            disabled={sending}
          >
            {sending ? 'Bezig…' : 'Code opnieuw versturen'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function Verify2FaPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <Verify2FaContent />
      </Suspense>
    </AuthPageShell>
  )
}
