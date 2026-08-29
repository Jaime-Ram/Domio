'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MapPin, CheckCircle2, Loader2 } from 'lucide-react'

interface PendingInvite {
  id: string
  landlord: string
  property: string | null
}

/**
 * Toont een popup wanneer er voor de ingelogde gebruiker een openstaande
 * uitnodiging klaarstaat. Eén klik accepteert de aanvraag (geen wachtwoord
 * nodig — de gebruiker is al ingelogd).
 */
export function PendingInvitationPopup() {
  const router = useRouter()
  const [invite, setInvite] = useState<PendingInvite | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/invitations/pending')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const first = data.invitations?.[0]
        if (first) {
          setInvite(first)
          setOpen(true)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  async function accept() {
    if (!invite) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: invite.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Onbekende fout')
      setDone(true)
      setTimeout(() => {
        setOpen(false)
        router.refresh()
      }, 1600)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!invite) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm p-8" closeButtonClassName="rounded-full bg-gray-100 p-1.5 text-gray-400 hover:text-gray-600 dark:bg-neutral-800">
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#c8e957]/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-[#15803D]" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-gray-900 mb-2">Aanvraag geaccepteerd!</DialogTitle>
            <DialogDescription className="text-sm text-gray-400">Je portaal wordt bijgewerkt…</DialogDescription>
          </div>
        ) : (
          <div className="text-center">
            <DialogTitle className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
              Er staat een aanvraag voor je klaar
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 leading-relaxed mb-6">
              <strong className="text-gray-700">{invite.landlord}</strong> heeft je uitgenodigd om toegang te krijgen tot je huurportaal.
            </DialogDescription>

            {invite.property && (
              <div className="flex items-center gap-3 bg-[#f4f4f4] dark:bg-neutral-800 rounded-2xl px-4 py-3.5 mb-6 text-left">
                <div className="w-8 h-8 rounded-xl bg-[#1d3014] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#c8e957]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Jouw woning</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{invite.property}</p>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-3 mb-3 text-left">{error}</p>
            )}

            <button
              onClick={accept}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-[#c8e957] text-[#1d3014] font-bold text-base py-3.5 rounded-full hover:bg-[#8AD45F] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Aanvraag accepteren
            </button>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              Later
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
