'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthPageShell } from '@/components/auth/auth-page-shell'

const COOKIE_NAME = 'two_fa_verified'
const COOKIE_MAX_AGE = 86400 // 24 uur

function set2FaVerifiedCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export default function Verify2FaPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const sendCode = async () => {
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/2fa/email/send', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Code kon niet worden verstuurd')
        return
      }
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    sendCode()
  }, [])

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
      const res = await fetch('/api/auth/2fa/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Code ongeldig of verlopen')
        return
      }
      set2FaVerifiedCookie()
      router.push('/dashboard/employer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell>
      <div className="w-full max-w-sm mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#163300] dark:text-[#9FE870] text-center">
          Verificatiecode
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          We hebben een 6-cijferige code naar je e-mailadres gestuurd. Voer die hieronder in.
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
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-400"
            onClick={sendCode}
            disabled={sending}
          >
            {sending ? 'Bezig…' : 'Code opnieuw versturen'}
          </Button>
        </div>
      </div>
    </AuthPageShell>
  )
}
