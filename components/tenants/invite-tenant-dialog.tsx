'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Send, CheckCircle2 } from 'lucide-react'
import { getUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

interface InviteTenantDialogProps {
  open: boolean
  onClose: () => void
  onInvited?: (tenantId: string, name: string, email: string) => void
}

const input = 'w-full bg-[#f4f4f4] dark:bg-neutral-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none'
const lbl = 'block text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-1.5'

export function InviteTenantDialog({ open, onClose, onInvited }: InviteTenantDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setName('')
    setEmail('')
    setLoading(false)
    setDone(false)
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user } = await getUser()
      if (!user) throw new Error('Niet ingelogd')

      // Create minimal tenant record (no lease required)
      const { data: tenant, error: insertErr } = await (supabase as any)
        .from('tenants')
        .insert({ full_name: name, email, owner_id: user.id })
        .select('id')
        .single()

      if (insertErr) throw insertErr

      // Send invitation
      const res = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: (tenant as any).id }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Versturen mislukt')

      setDone(true)
      onInvited?.((tenant as any).id, name, email)
      setTimeout(handleClose, 2500)
    } catch (err: any) {
      setError(err.message || 'Er is iets misgegaan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Huurder uitnodigen</DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#15803D]" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Uitnodiging verstuurd!</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label className={lbl}>Naam</label>
              <input
                className={input}
                placeholder="Jan de Vries"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className={lbl}>E-mailadres</label>
              <input
                type="email"
                className={input}
                placeholder="jan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
            )}

            <p className="text-xs text-gray-400 leading-relaxed">
              De huurder ontvangt een e-mail met een uitnodigingslink. Je kunt later een huurcontract koppelen.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-[#f4f4f4] dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#163300] hover:bg-[#1e4a00] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Uitnodigen
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
