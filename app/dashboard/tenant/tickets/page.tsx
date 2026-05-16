'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { DetailShell } from '@/components/ui/detail-shell'
import { ActivityTimeline, type TimelineEvent } from '@/components/ui/activity-timeline'
import { cn } from '@/lib/utils'
import {
  Plus, Ticket, Home, Building2, Loader2, Clock,
  Wrench, CheckCircle2, Ban, Calendar, MessageCircle,
  Zap, AlertTriangle, Tag, ChevronRight, Paperclip, X, Send, FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

type TicketContext = {
  leaseId: string
  unitId: string | null
  unitLabel: string
  propertyId: string | null
  propertyLabel: string | null
  ownerId: string
}

type TicketRow = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  scope: string
  category: string | null
  created_at: string
  due_date: string | null
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_behandeling: 'In behandeling',
  gepland: 'Gepland',
  afgerond: 'Afgerond',
  geannuleerd: 'Geannuleerd',
}

const STATUS_CLS: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_behandeling: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  gepland: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  afgerond: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  geannuleerd: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400',
}

// Status stappen voor de voortgangsindicator
const STATUS_STEPS = ['open', 'in_behandeling', 'gepland', 'afgerond'] as const

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'created':          return Wrench
    case 'status_changed':   return Clock
    case 'priority_changed': return AlertTriangle
    case 'assigned':         return Tag
    default:                 return Zap
  }
}

function formatEventTitle(eventType: string, from: string | null, to: string | null) {
  const STATUS_NL: Record<string, string> = {
    open: 'Open', in_behandeling: 'In behandeling', gepland: 'Gepland',
    afgerond: 'Afgerond', geannuleerd: 'Geannuleerd',
  }
  switch (eventType) {
    case 'created':        return 'Melding aangemaakt'
    case 'status_changed': return `Status: ${STATUS_NL[to ?? ''] ?? to}`
    default:               return eventType.replace(/_/g, ' ')
  }
}

function buildTimeline(events: any[], messages: any[]): TimelineEvent[] {
  const items: TimelineEvent[] = []
  for (const ev of (events ?? [])) {
    items.push({
      id: ev.id,
      icon: getEventIcon(ev.event_type),
      title: formatEventTitle(ev.event_type, ev.from_value, ev.to_value),
      actor: ev.profiles?.full_name ?? 'Verhuurder',
      timestamp: ev.created_at,
    })
  }
  for (const msg of (messages ?? [])) {
    items.push({
      id: msg.id,
      icon: MessageCircle,
      title: msg.content,
      actor: msg.profiles?.full_name ?? 'Onbekend',
      timestamp: msg.created_at,
    })
  }
  return items.sort((a, b) =>
    new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime()
  )
}

// ─── Tenant Detail Panel ──────────────────────────────────────────────────────

function TenantTicketDetail({
  ticket,
  onClose,
}: {
  ticket: TicketRow | null
  onClose: () => void
}) {
  const [detail, setDetail] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Reply
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const replyRef = useRef<HTMLTextAreaElement>(null)

  // Bijlagen
  const [attachments, setAttachments] = useState<any[]>([])
  const [loadingAtt, setLoadingAtt] = useState(false)
  const [uploadingAtt, setUploadingAtt] = useState(false)
  const attachInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!ticket) { setDetail(null); setAttachments([]); return }
    setLoadingDetail(true)
    setReplyText('')
    fetch(`/api/tickets/tenant/${ticket.id}`)
      .then(r => r.json())
      .then(({ ticket: d }) => setDetail(d ?? null))
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false))

    // Load attachments
    setLoadingAtt(true)
    fetch(`/api/tickets/${ticket.id}/attachments`)
      .then(r => r.json())
      .then(d => setAttachments(d.attachments ?? []))
      .catch(() => {})
      .finally(() => setLoadingAtt(false))
  }, [ticket?.id])

  const sendReply = async () => {
    const text = replyText.trim()
    if (!text || !ticket) return
    setSendingReply(true)
    try {
      const res = await fetch(`/api/tickets/tenant/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const data = await res.json()
      if (!res.ok) return
      if (data.message) {
        setDetail((prev: any) => prev ? { ...prev, messages: [...(prev.messages ?? []), data.message] } : prev)
      }
      setReplyText('')
    } finally {
      setSendingReply(false)
    }
  }

  const uploadAttachment = async (file: File) => {
    if (!ticket) return
    setUploadingAtt(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/tickets/${ticket.id}/attachments`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.attachment) setAttachments(prev => [data.attachment, ...prev])
    } finally {
      setUploadingAtt(false)
    }
  }

  const timeline = detail ? buildTimeline(detail.ticket_events ?? [], detail.messages ?? []) : []
  const currentStepIdx = STATUS_STEPS.indexOf(ticket?.status as typeof STATUS_STEPS[number])
  const isClosed = ticket?.status === 'afgerond' || ticket?.status === 'geannuleerd'

  return (
    <DetailShell
      open={!!ticket}
      onClose={onClose}
      title={ticket?.title ?? 'Melding'}
      subtitle={ticket ? format(new Date(ticket.created_at), 'd MMMM yyyy', { locale: nl }) : undefined}
      headerLeft={
        ticket?.status ? (
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full shrink-0', STATUS_CLS[ticket.status] ?? STATUS_CLS.open)}>
            {STATUS_LABEL[ticket.status] ?? ticket.status}
          </span>
        ) : undefined
      }
      footer={null}
    >
      <div className="flex flex-col h-full">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-6">

          {/* Voortgang indicator */}
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-3">Voortgang</p>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStepIdx && ticket?.status !== 'geannuleerd'
                const active = i === currentStepIdx && ticket?.status !== 'geannuleerd'
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={cn(
                      'h-2 w-2 rounded-full shrink-0 transition-colors',
                      done ? 'bg-[#163300] dark:bg-[#9FE870]' : 'bg-gray-200 dark:bg-neutral-700',
                      active && 'ring-2 ring-offset-1 ring-[#163300] dark:ring-[#9FE870]',
                    )} />
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={cn(
                        'h-0.5 flex-1 transition-colors',
                        i < currentStepIdx && ticket?.status !== 'geannuleerd'
                          ? 'bg-[#163300] dark:bg-[#9FE870]'
                          : 'bg-gray-200 dark:bg-neutral-700',
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1.5">
              {STATUS_STEPS.map((step) => (
                <span key={step} className="text-[10px] text-gray-400 dark:text-gray-500 text-center flex-1">
                  {STATUS_LABEL[step]}
                </span>
              ))}
            </div>
            {ticket?.status === 'geannuleerd' && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                <Ban className="h-3 w-3" /> Melding is geannuleerd
              </p>
            )}
          </div>

          {/* Omschrijving */}
          {ticket?.description && (
            <div className="rounded-xl bg-gray-50 dark:bg-neutral-900 p-4">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">Jouw omschrijving</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{ticket.description}</p>
            </div>
          )}

          {/* Activiteit timeline */}
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-3">Activiteit</p>
            {loadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : (
              <ActivityTimeline events={timeline} />
            )}
          </div>

          {/* Bijlagen */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Bijlagen</p>
              <button
                type="button"
                onClick={() => attachInputRef.current?.click()}
                disabled={uploadingAtt || isClosed}
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40 transition-colors"
              >
                {uploadingAtt
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <Paperclip className="h-3 w-3" />}
                Toevoegen
              </button>
              <input
                ref={attachInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadAttachment(f); e.target.value = '' }}
              />
            </div>
            {loadingAtt ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-gray-300" />
              </div>
            ) : attachments.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">Nog geen bijlagen.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {attachments.map((att: any) => {
                  const isImg = att.mime_type?.startsWith('image/')
                  return (
                    <a
                      key={att.id}
                      href={att.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden block hover:opacity-80 transition-opacity"
                    >
                      {isImg && att.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={att.url} alt={att.file_name} className="w-full h-20 object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-20 gap-1 bg-gray-50 dark:bg-neutral-900">
                          <FileText className="h-5 w-5 text-gray-300" />
                          <span className="text-[10px] text-gray-400 truncate px-1 max-w-full">{att.file_name}</span>
                        </div>
                      )}
                    </a>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Sticky reply input (verborgen bij afgesloten ticket) */}
        {!isClosed && (
          <div className="border-t border-gray-100 dark:border-neutral-800 px-6 py-4 shrink-0">
            <textarea
              ref={replyRef}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply() }}
              placeholder="Stuur een bericht aan je verhuurder…"
              rows={2}
              className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#9FE870]/50 dark:text-gray-200 placeholder:text-gray-400"
            />
            <div className="flex justify-end mt-2">
              <Button
                type="button"
                size="sm"
                disabled={!replyText.trim() || sendingReply}
                onClick={sendReply}
                className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-xs font-semibold px-4"
              >
                {sendingReply
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <><Send className="h-3.5 w-3.5 mr-1.5" />Versturen</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DetailShell>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TenantTicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [context, setContext] = useState<TicketContext | null>(null)
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [scope, setScope] = useState<'unit' | 'property'>('unit')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('onderhoud')
  const [priority, setPriority] = useState<'normaal' | 'hoog' | 'urgent'>('normaal')
  const [dueDate, setDueDate] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null)

  useEffect(() => {
    fetch('/api/tickets/tenant')
      .then((r) => r.json())
      .then(({ tickets, context }) => {
        setTickets(tickets ?? [])
        setContext(context)
        if (context?.unitId) setScope('unit')
        else if (context?.propertyId) setScope('property')
      })
      .finally(() => setLoading(false))
  }, [])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('onderhoud')
    setPriority('normaal')
    setDueDate('')
    setPhotos([])
    setScope(context?.unitId ? 'unit' : 'property')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !context) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/tickets/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          scope,
          category,
          priority,
          due_date: dueDate || null,
          unitId: context.unitId,
          propertyId: context.propertyId,
          ownerId: context.ownerId,
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)

      // Upload photos if any
      if (photos.length > 0 && body.ticketId) {
        await Promise.allSettled(photos.map(async (photo) => {
          const formData = new FormData()
          formData.append('file', photo)
          await fetch(`/api/tickets/${body.ticketId}/attachments`, { method: 'POST', body: formData })
        }))
      }

      setTickets((prev) => [{
        id: body.ticketId,
        title: title.trim(),
        description: description.trim() || null,
        status: 'open',
        priority,
        scope,
        category,
        created_at: new Date().toISOString(),
        due_date: dueDate || null,
      }, ...prev])
      setCreateOpen(false)
      resetForm()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const hasBothScopes = !!(context?.unitId && context?.propertyId)

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meldingen</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Stuur een melding naar je verhuurder</p>
        </div>
        {context && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] font-semibold"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nieuwe melding
          </Button>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <Ticket className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Geen meldingen</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {context ? 'Klik op "Nieuwe melding" om er een te sturen.' : 'Je hebt nog geen actief huurcontract.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTicket(t)}
              className="w-full flex items-center gap-4 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl px-4 py-3.5 hover:border-gray-200 dark:hover:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                {t.scope === 'unit'
                  ? <Home className="h-4 w-4 text-gray-400" />
                  : <Building2 className="h-4 w-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                  {t.priority === 'urgent' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 shrink-0">Spoed</span>
                  )}
                  {t.priority === 'hoog' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 shrink-0">Hoog</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {t.category && (
                    <span className="text-[10px] font-medium text-[#163300] dark:text-[#9FE870] bg-[#9FE870]/20 dark:bg-[#9FE870]/10 rounded px-1.5 py-0.5 capitalize">
                      {{ onderhoud: 'Onderhoud', klacht: 'Klacht', inspectie: 'Inspectie', overig: 'Overig', compliance: 'Compliance' }[t.category] ?? t.category}
                    </span>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {format(new Date(t.created_at), 'd MMM yyyy', { locale: nl })}
                    {t.scope === 'unit' ? ` · ${context?.unitLabel ?? 'Object'}` : ` · ${context?.propertyLabel ?? 'Pand'}`}
                  </p>
                </div>
              </div>
              {t.due_date && (
                <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <Clock className="h-3 w-3" />
                  {format(new Date(t.due_date), 'd MMM', { locale: nl })}
                </div>
              )}
              <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0', STATUS_CLS[t.status] ?? STATUS_CLS.open)}>
                {STATUS_LABEL[t.status] ?? t.status}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-300 dark:text-neutral-600 shrink-0 group-hover:text-gray-400 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Detail panel */}
      <TenantTicketDetail
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />

      {/* Aanmaak dialog */}
      <Dialog open={createOpen} onOpenChange={(v) => { if (!v) resetForm(); setCreateOpen(v) }}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-bold">Nieuwe melding</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Stuur een bericht naar je verhuurder.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {hasBothScopes && (
              <div className="space-y-2">
                <Label>Gaat over</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScope('unit')}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors text-left',
                      scope === 'unit'
                        ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                        : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    )}
                  >
                    <Home className="h-4 w-4 shrink-0" />
                    <span>{context?.unitLabel ?? 'Mijn object'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope('property')}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors text-left',
                      scope === 'property'
                        ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                        : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    )}
                  >
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>Het pand</span>
                  </button>
                </div>
              </div>
            )}

            {/* Categorie */}
            <div className="space-y-2">
              <Label>Soort melding</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'onderhoud', label: 'Onderhoud' },
                  { id: 'klacht',    label: 'Klacht' },
                  { id: 'overig',    label: 'Overig' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-xs font-medium transition-colors text-center',
                      category === cat.id
                        ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                        : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300',
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgentie */}
            <div className="space-y-2">
              <Label>Urgentie</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normaal', label: 'Normaal' },
                  { id: 'hoog',    label: 'Hoog' },
                  { id: 'urgent',  label: 'Spoed' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as typeof priority)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-xs font-medium transition-colors text-center',
                      priority === p.id
                        ? p.id === 'urgent'
                          ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-950/30 dark:text-red-400'
                          : p.id === 'hoog'
                            ? 'border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-400 dark:bg-orange-950/30 dark:text-orange-400'
                            : 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                        : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-title">Onderwerp</Label>
              <Input
                id="t-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bijv. Lekkende kraan badkamer"
                className="rounded-xl"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-desc">Toelichting <span className="text-gray-400 font-normal">(optioneel)</span></Label>
              <Textarea
                id="t-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Geef wat meer context…"
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>

            {/* Gewenste datum */}
            <div className="space-y-2">
              <Label htmlFor="t-due">Gewenste datum <span className="text-gray-400 font-normal">(optioneel)</span></Label>
              <input
                id="t-due"
                type="date"
                value={dueDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/50"
              />
            </div>

            {/* Foto's */}
            <div className="space-y-2">
              <Label>Foto&apos;s <span className="text-gray-400 font-normal">(optioneel)</span></Label>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                multiple
                className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files ?? [])
                  setPhotos(prev => [...prev, ...files].slice(0, 5))
                  e.target.value = ''
                }}
              />
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {photos.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-neutral-800 rounded-lg px-2.5 py-1.5">
                      <Paperclip className="h-3 w-3 text-gray-400" />
                      <span className="max-w-[100px] truncate text-gray-700 dark:text-gray-300">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                        className="text-gray-400 hover:text-red-500 ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-dashed border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2 w-full transition-colors hover:border-gray-300"
              >
                <Paperclip className="h-4 w-4" />
                {photos.length === 0 ? 'Foto of document bijvoegen' : `${photos.length} bestand${photos.length > 1 ? 'en' : ''} geselecteerd`}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{error}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => { resetForm(); setCreateOpen(false) }}
              className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1"
            >
              Annuleren
            </button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || submitting}
              className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] font-semibold"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Versturen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
