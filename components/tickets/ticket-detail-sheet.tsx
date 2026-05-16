'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DetailShell } from '@/components/ui/detail-shell'
import { TabNav, type TabNavItem } from '@/components/ui/tab-nav'
import { ActivityTimeline, type TimelineEvent } from '@/components/ui/activity-timeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '@/lib/utils'
import {
  Wrench, Clock, CheckCircle2, Ban, MessageCircle, AlertTriangle,
  CalendarDays, MapPin, User, Tag, Zap, ClipboardList,
  Send, Lock, Euro, Building2, Loader2, Plus, Calendar,
  Paperclip, Upload, FileText, X, Download, Image,
} from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { ticketQueries, messageQueries, workOrderQueries } from '@/lib/supabase/queries'
import { mockMaintenanceRequests } from '@/lib/mock-data/vastgoed'

// ─── Types ────────────────────────────────────────────────────────────────────

type DetailTab = 'activiteit' | 'details' | 'notities' | 'werkbon' | 'bijlagen'

const TABS: TabNavItem<DetailTab>[] = [
  { id: 'activiteit', label: 'Activiteit' },
  { id: 'details',    label: 'Details' },
  { id: 'notities',   label: 'Notities' },
  { id: 'werkbon',    label: 'Werkbon' },
  { id: 'bijlagen',   label: 'Bijlagen' },
]

const SLA_HOURS = { urgent: 4, hoog: 24, normaal: 72, laag: 168 } as const

export interface TicketDetailSheetProps {
  ticketId: string | null
  onClose: () => void
  onTicketUpdate?: (ticketId: string, updates: Record<string, unknown>) => void
  isDemo?: boolean
  userId?: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSlaInfo(ticket: any) {
  if (!ticket) return null
  const priorityHours = SLA_HOURS[ticket.priority as keyof typeof SLA_HOURS] ?? 72
  const createdAt = new Date(ticket.created_at)
  const deadline = ticket.sla_deadline
    ? new Date(ticket.sla_deadline)
    : new Date(createdAt.getTime() + priorityHours * 3600000)

  if (ticket.status === 'afgerond' || ticket.status === 'geannuleerd') {
    return { variant: 'done' as const, label: `${priorityHours}u responstijd (SLA)`, color: 'text-gray-400 dark:text-gray-500' }
  }

  const now = new Date()
  const totalMs = deadline.getTime() - createdAt.getTime()
  const remainingMs = deadline.getTime() - now.getTime()

  if (remainingMs <= 0) {
    const h = Math.floor(-remainingMs / 3600000)
    return { variant: 'over' as const, label: `SLA overschreden met ${h}u`, color: 'text-red-500 dark:text-red-400' }
  }
  const pct = remainingMs / totalMs
  if (pct < 0.2) {
    const h = Math.ceil(remainingMs / 3600000)
    return { variant: 'warning' as const, label: `SLA: nog ${h}u`, color: 'text-orange-500 dark:text-orange-400' }
  }
  const h = Math.ceil(remainingMs / 3600000)
  const label = h < 48 ? `SLA: nog ${h}u` : `SLA: nog ${Math.ceil(h / 24)}d`
  return { variant: 'ok' as const, label, color: 'text-green-600 dark:text-green-400' }
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'created':          return Wrench
    case 'status_changed':   return Clock
    case 'priority_changed': return AlertTriangle
    case 'category_changed': return Tag
    case 'assigned':         return User
    case 'work_order_added': return ClipboardList
    case 'deadline_set':     return CalendarDays
    default:                 return Zap
  }
}

function formatEventTitle(eventType: string, from: string | null, to: string | null) {
  const STATUS_NL: Record<string, string> = {
    open: 'Open', in_behandeling: 'In behandeling', gepland: 'Gepland',
    afgerond: 'Afgerond', geannuleerd: 'Geannuleerd',
  }
  const PRIO_NL: Record<string, string> = { laag: 'Laag', normaal: 'Normaal', hoog: 'Hoog', urgent: 'Spoed' }
  switch (eventType) {
    case 'created':          return 'Ticket aangemaakt'
    case 'status_changed':   return `Status gewijzigd: ${STATUS_NL[from ?? ''] ?? from} → ${STATUS_NL[to ?? ''] ?? to}`
    case 'priority_changed': return `Prioriteit gewijzigd: ${PRIO_NL[from ?? ''] ?? from} → ${PRIO_NL[to ?? ''] ?? to}`
    case 'category_changed': return `Categorie gewijzigd naar ${to}`
    case 'deadline_set':     return to ? `Deadline ingesteld op ${format(new Date(to), 'd MMM yyyy', { locale: nl })}` : 'Deadline verwijderd'
    case 'assigned':         return `Toegewezen aan ${to ?? 'niemand'}`
    case 'work_order_added': return `Werkbon aangemaakt voor ${to ?? 'leverancier'}`
    default:                 return eventType.replace(/_/g, ' ')
  }
}

function buildTimeline(events: any[], messages: any[]): TimelineEvent[] {
  const items: TimelineEvent[] = []

  for (const ev of (events ?? [])) {
    items.push({
      id: ev.id,
      icon: getEventIcon(ev.event_type),
      title: formatEventTitle(ev.event_type, ev.from_value, ev.to_value),
      actor: ev.profiles?.full_name ?? 'Systeem',
      timestamp: ev.created_at,
    })
  }

  for (const msg of (messages ?? []).filter((m: any) => m.visibility !== 'internal')) {
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

// Demo data builder
function buildDemoDetail(mock: (typeof mockMaintenanceRequests)[number]) {
  const num = parseInt(mock.id.replace('m-', '')) + 1040
  return {
    id: mock.id,
    ticket_number: num,
    title: mock.title,
    description: mock.description,
    status: mock.status,
    priority: mock.priority === 'spoed' ? 'urgent' : mock.priority,
    category: 'onderhoud',
    source: 'tenant',
    scope: 'persoon',
    created_at: mock.createdAt + 'T09:00:00Z',
    updated_at: mock.createdAt + 'T09:00:00Z',
    due_date: null,
    sla_deadline: null,
    resolved_at: mock.status === 'afgerond' ? mock.createdAt + 'T16:00:00Z' : null,
    properties: { name: mock.property?.name ?? null, address: mock.property?.address ?? null },
    leases: {
      tenants: { id: 't-demo', full_name: mock.tenant?.name ?? null },
      units: { unit_number: null, properties: { name: mock.property?.name ?? null } },
    },
    ticket_events: [
      { id: `${mock.id}-e1`, event_type: 'created', profiles: { full_name: mock.tenant?.name ?? 'Huurder' }, from_value: null, to_value: 'open', created_at: mock.createdAt + 'T09:00:00Z' },
      ...(mock.status !== 'open' ? [{ id: `${mock.id}-e2`, event_type: 'status_changed', profiles: { full_name: 'Verhuurder' }, from_value: 'open', to_value: mock.status, created_at: mock.createdAt + 'T14:00:00Z' }] : []),
    ],
    messages: [
      { id: `${mock.id}-m1`, content: 'Bedankt voor de melding, we pakken dit zo snel mogelijk op.', visibility: 'public', profiles: { full_name: 'Verhuurder' }, created_at: mock.createdAt + 'T10:30:00Z' },
      { id: `${mock.id}-m2`, content: 'Niet vergeten om de afspraakkosten in rekening te brengen.', visibility: 'internal', profiles: { full_name: 'Verhuurder' }, created_at: mock.createdAt + 'T11:00:00Z' },
    ],
    work_orders: mock.assignedTo ? [{
      id: `${mock.id}-wo1`,
      vendor_name: mock.assignedTo.split(' — ')[0],
      description: `Reparatie — ${mock.title}`,
      scheduled_at: null,
      cost_estimate: null,
      cost_actual: null,
      status: mock.status === 'afgerond' ? 'uitgevoerd' : 'ingepland',
      created_at: mock.createdAt + 'T09:00:00Z',
    }] : [],
  }
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'open':           return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400"><Clock className="h-3 w-3 mr-1" />Open</Badge>
    case 'in_behandeling': return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400"><Wrench className="h-3 w-3 mr-1" />In behandeling</Badge>
    case 'gepland':        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400"><Calendar className="h-3 w-3 mr-1" />Gepland</Badge>
    case 'afgerond':       return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Afgerond</Badge>
    case 'geannuleerd':    return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"><Ban className="h-3 w-3 mr-1" />Geannuleerd</Badge>
    default: return <Badge>{status}</Badge>
  }
}

function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case 'urgent': return <Badge variant="destructive">Spoed</Badge>
    case 'hoog':   return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400">Hoog</Badge>
    case 'normaal':return <Badge variant="outline">Normaal</Badge>
    case 'laag':   return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400">Laag</Badge>
    default: return <Badge>{priority}</Badge>
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  onderhoud: 'Onderhoud', inspectie: 'Inspectie', klacht: 'Klacht',
  compliance: 'Compliance', huurgebeurtenis: 'Huurgebeurtenis',
}
const SOURCE_LABELS: Record<string, string> = {
  landlord: 'Verhuurder', tenant: 'Huurder', system: 'Systeem', flow: 'Automatisch',
}
const WORKORDER_STATUS_LABELS: Record<string, string> = {
  concept: 'Concept', ingepland: 'Ingepland', uitgevoerd: 'Uitgevoerd', gefactureerd: 'Gefactureerd',
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TicketDetailSheet({ ticketId, onClose, onTicketUpdate, isDemo, userId }: TicketDetailSheetProps) {
  const [tab, setTab] = useState<DetailTab>('activiteit')
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Activiteit tab
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  // Notities tab
  const [noteText, setNoteText] = useState('')
  const [sendingNote, setSendingNote] = useState(false)

  // Details tab — inline editing
  const [savingField, setSavingField] = useState<string | null>(null)

  // Werkbon tab
  const [showNewWorkOrder, setShowNewWorkOrder] = useState(false)
  const [woVendor, setWoVendor] = useState('')
  const [woDesc, setWoDesc] = useState('')
  const [woDate, setWoDate] = useState('')
  const [woCost, setWoCost] = useState('')
  const [creatingWo, setCreatingWo] = useState(false)

  // Bijlagen tab
  const [attachments, setAttachments] = useState<any[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const replyInputRef = useRef<HTMLTextAreaElement>(null)
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  // Load detail data
  useEffect(() => {
    if (!ticketId) { setDetail(null); setAttachments([]); return }
    setTab('activiteit')
    setAttachments([])
    setUploadError(null)

    if (isDemo) {
      const mock = mockMaintenanceRequests.find(r => r.id === ticketId)
      setDetail(mock ? buildDemoDetail(mock) : null)
      setLoading(false)
      return
    }
    if (!userId) return
    setLoading(true)
    ticketQueries.getDetail(ticketId)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [ticketId, isDemo, userId])

  // Load attachments when Bijlagen tab is opened
  useEffect(() => {
    if (tab !== 'bijlagen' || !ticketId || isDemo) return
    setLoadingAttachments(true)
    fetch(`/api/tickets/${ticketId}/attachments`)
      .then(r => r.json())
      .then(d => setAttachments(d.attachments ?? []))
      .catch(console.error)
      .finally(() => setLoadingAttachments(false))
  }, [tab, ticketId, isDemo])

  // ─── Field update ──────────────────────────────────────────────────────────

  const updateField = async (field: string, value: string | null, oldValue?: string | null) => {
    if (!detail) return
    setSavingField(field)
    try {
      if (!isDemo && userId) {
        // Route through API for fields that need event logging or email notifications
        if (['status', 'priority', 'category', 'assignee_id'].includes(field)) {
          const resolvedAt = field === 'status' && value === 'afgerond' ? new Date().toISOString() : undefined
          await fetch(`/api/tickets/${detail.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value, ...(resolvedAt ? { resolved_at: resolvedAt } : {}) }),
          })
          if (resolvedAt !== undefined) setDetail((prev: any) => ({ ...prev, resolved_at: resolvedAt }))
        } else {
          await ticketQueries.update(detail.id, { [field]: value } as any)
        }
      }
      setDetail((prev: any) => ({ ...prev, [field]: value }))
      onTicketUpdate?.(detail.id, { [field]: value })
    } finally {
      setSavingField(null)
    }
  }

  // ─── Send reply ────────────────────────────────────────────────────────────

  const sendReply = async () => {
    const text = replyText.trim()
    if (!text || !detail) return
    setSendingReply(true)
    try {
      if (isDemo) {
        const demoMsg = { id: `demo-${Date.now()}`, content: text, visibility: 'public', profiles: { full_name: 'Verhuurder' }, created_at: new Date().toISOString() }
        setDetail((prev: any) => ({ ...prev, messages: [...(prev.messages ?? []), demoMsg] }))
      } else if (userId) {
        // Route via API to trigger email notification to tenant
        const res = await fetch(`/api/tickets/${detail.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text, visibility: 'public' }),
        })
        const data = await res.json()
        if (data.message) setDetail((prev: any) => ({ ...prev, messages: [...(prev.messages ?? []), data.message] }))
      }
      setReplyText('')
    } finally {
      setSendingReply(false)
    }
  }

  // ─── Send internal note ────────────────────────────────────────────────────

  const sendNote = async () => {
    const text = noteText.trim()
    if (!text || !detail) return
    setSendingNote(true)
    try {
      if (isDemo) {
        const demoNote = { id: `demo-note-${Date.now()}`, content: text, visibility: 'internal', profiles: { full_name: 'Verhuurder' }, created_at: new Date().toISOString() }
        setDetail((prev: any) => ({ ...prev, messages: [...(prev.messages ?? []), demoNote] }))
      } else if (userId) {
        const note = await messageQueries.create({ ticket_id: detail.id, sender_id: userId, content: text, visibility: 'internal' })
        setDetail((prev: any) => ({ ...prev, messages: [...(prev.messages ?? []), note] }))
      }
      setNoteText('')
    } finally {
      setSendingNote(false)
    }
  }

  // ─── Create work order ─────────────────────────────────────────────────────

  const createWorkOrder = async () => {
    if (!detail || !userId) return
    setCreatingWo(true)
    try {
      if (isDemo) {
        const demoWo = {
          id: `demo-wo-${Date.now()}`,
          vendor_name: woVendor || null,
          description: woDesc || null,
          scheduled_at: woDate || null,
          cost_estimate: woCost ? parseFloat(woCost) : null,
          cost_actual: null,
          status: 'concept',
          created_at: new Date().toISOString(),
        }
        setDetail((prev: any) => ({ ...prev, work_orders: [demoWo, ...(prev.work_orders ?? [])] }))
      } else {
        const wo = await workOrderQueries.create({
          ticket_id: detail.id,
          owner_id: userId,
          vendor_name: woVendor || null,
          description: woDesc || null,
          scheduled_at: woDate ? new Date(woDate).toISOString() : null,
          cost_estimate: woCost ? parseFloat(woCost) : null,
        })
        await ticketQueries.addEvent(detail.id, 'work_order_added', null, woVendor || null, null, userId)
        setDetail((prev: any) => ({ ...prev, work_orders: [wo, ...(prev.work_orders ?? [])] }))
      }
      setWoVendor(''); setWoDesc(''); setWoDate(''); setWoCost('')
      setShowNewWorkOrder(false)
    } finally {
      setCreatingWo(false)
    }
  }

  // ─── Realtime subscription ────────────────────────────────────────────────

  useEffect(() => {
    if (!ticketId || isDemo) return

    const channel = supabase
      .channel(`ticket-detail-${ticketId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `ticket_id=eq.${ticketId}`,
      }, async (payload) => {
        // Fetch with profile join
        const { data: msg } = await (supabase as any)
          .from('messages')
          .select('*, profiles:sender_id(full_name, email)')
          .eq('id', (payload.new as any).id)
          .single()
        if (!msg) return
        setDetail((prev: any) => {
          if (!prev) return prev
          const exists = (prev.messages ?? []).some((m: any) => m.id === msg.id)
          if (exists) return prev
          return { ...prev, messages: [...(prev.messages ?? []), msg] }
        })
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_events',
        filter: `ticket_id=eq.${ticketId}`,
      }, async (payload) => {
        const { data: ev } = await (supabase as any)
          .from('ticket_events')
          .select('*, profiles:actor_id(full_name, email)')
          .eq('id', (payload.new as any).id)
          .single()
        if (!ev) return
        setDetail((prev: any) => {
          if (!prev) return prev
          const exists = (prev.ticket_events ?? []).some((e: any) => e.id === ev.id)
          if (exists) return prev
          return { ...prev, ticket_events: [...(prev.ticket_events ?? []), ev] }
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [ticketId, isDemo])

  // ─── Update werkbon status ────────────────────────────────────────────────

  const updateWorkOrderStatus = useCallback(async (woId: string, newStatus: string) => {
    if (isDemo) {
      setDetail((prev: any) => ({
        ...prev,
        work_orders: (prev.work_orders ?? []).map((wo: any) =>
          wo.id === woId ? { ...wo, status: newStatus } : wo
        ),
      }))
      return
    }
    try {
      await workOrderQueries.update(woId, { status: newStatus as any })
      setDetail((prev: any) => ({
        ...prev,
        work_orders: (prev.work_orders ?? []).map((wo: any) =>
          wo.id === woId ? { ...wo, status: newStatus } : wo
        ),
      }))
    } catch (e) { console.error(e) }
  }, [isDemo])

  // ─── Upload attachment ─────────────────────────────────────────────────────

  const uploadFile = async (file: File) => {
    if (!detail) return
    setUploadError(null)
    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/tickets/${detail.id}/attachments`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setUploadError(data.error ?? 'Upload mislukt'); return }
      setAttachments(prev => [data.attachment, ...prev])
    } catch {
      setUploadError('Upload mislukt. Controleer je verbinding.')
    } finally {
      setUploadingFile(false)
    }
  }

  const deleteAttachment = async (attachmentId: string) => {
    if (!detail || isDemo) return
    const res = await fetch(`/api/tickets/${detail.id}/attachments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attachmentId }),
    })
    if (res.ok) setAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  // ─── Derived state ─────────────────────────────────────────────────────────

  const timeline = detail ? buildTimeline(detail.ticket_events ?? [], detail.messages ?? []) : []
  const internalNotes = (detail?.messages ?? []).filter((m: any) => m.visibility === 'internal')
  const slaInfo = getSlaInfo(detail)

  const tenantName = detail?.leases?.tenants?.full_name ?? null
  const propertyName = detail?.properties?.name ?? detail?.leases?.units?.properties?.name ?? detail?.units?.properties?.name ?? null
  const unitNumber = detail?.leases?.units?.unit_number ?? detail?.units?.unit_number ?? null
  const locationLabel = [propertyName, unitNumber ? `eenheid ${unitNumber}` : null].filter(Boolean).join(' — ')

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DetailShell
      open={!!ticketId}
      onClose={onClose}
      title={detail?.title ?? 'Ticket laden…'}
      subtitle={locationLabel || undefined}
      headerLeft={
        detail?.ticket_number ? (
          <span className="text-xs font-mono bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg shrink-0">
            #{detail.ticket_number}
          </span>
        ) : undefined
      }
      footer={null}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : !detail ? (
        <div className="py-20 text-center text-sm text-gray-400">Ticket niet gevonden.</div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Status + Priority badges row */}
          <div className="px-6 pt-4 pb-3 flex items-center gap-2 flex-wrap border-b border-gray-100 dark:border-neutral-800">
            <StatusBadge status={detail.status} />
            <PriorityBadge priority={detail.priority} />
            {detail.category && (
              <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[detail.category] ?? detail.category}</Badge>
            )}
            {slaInfo && (
              <span className={cn('text-xs font-medium', slaInfo.color)}>{slaInfo.label}</span>
            )}
          </div>

          {/* Tab nav */}
          <div className="px-6 pt-4 pb-0">
            <TabNav tabs={TABS} activeTab={tab} onChange={setTab} className="w-full" />
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto min-h-0">

            {/* ── Activiteit ─────────────────────────────────────────────── */}
            {tab === 'activiteit' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 px-6 py-4 overflow-y-auto">
                  <ActivityTimeline events={timeline} />
                </div>
                {/* Quick reply */}
                <div className="border-t border-gray-100 dark:border-neutral-800 px-6 py-4 shrink-0">
                  <Textarea
                    ref={replyInputRef}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Reageer op dit ticket…"
                    rows={2}
                    className="rounded-xl resize-none text-sm"
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply() }}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={!replyText.trim() || sendingReply}
                      onClick={sendReply}
                      className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-xs font-semibold px-4"
                    >
                      {sendingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Send className="h-3.5 w-3.5 mr-1.5" />Versturen</>}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Details ────────────────────────────────────────────────── */}
            {tab === 'details' && (
              <div className="px-6 py-5 space-y-5">
                {/* Status */}
                <DetailField label="Status">
                  <Select
                    value={detail.status}
                    onValueChange={v => updateField('status', v, detail.status)}
                    disabled={!!savingField}
                  >
                    <SelectTrigger className="rounded-xl h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_behandeling">In behandeling</SelectItem>
                      <SelectItem value="gepland">Gepland</SelectItem>
                      <SelectItem value="afgerond">Afgerond</SelectItem>
                      <SelectItem value="geannuleerd">Geannuleerd</SelectItem>
                    </SelectContent>
                  </Select>
                </DetailField>

                {/* Prioriteit */}
                <DetailField label="Prioriteit">
                  <Select
                    value={detail.priority}
                    onValueChange={v => updateField('priority', v, detail.priority)}
                    disabled={!!savingField}
                  >
                    <SelectTrigger className="rounded-xl h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="laag">Laag</SelectItem>
                      <SelectItem value="normaal">Normaal</SelectItem>
                      <SelectItem value="hoog">Hoog</SelectItem>
                      <SelectItem value="urgent">Spoed</SelectItem>
                    </SelectContent>
                  </Select>
                </DetailField>

                {/* Categorie */}
                <DetailField label="Categorie">
                  <Select
                    value={detail.category ?? ''}
                    onValueChange={v => updateField('category', v || null, detail.category)}
                    disabled={!!savingField}
                  >
                    <SelectTrigger className="rounded-xl h-9 text-sm">
                      <SelectValue placeholder="Geen categorie" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="onderhoud">Onderhoud</SelectItem>
                      <SelectItem value="inspectie">Inspectie</SelectItem>
                      <SelectItem value="klacht">Klacht</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="huurgebeurtenis">Huurgebeurtenis</SelectItem>
                    </SelectContent>
                  </Select>
                </DetailField>

                {/* Behandelaar */}
                <DetailField label="Behandelaar">
                  <div className="flex items-center gap-2">
                    {detail.assignee ? (
                      <>
                        <div className="flex-1 flex items-center gap-2 h-9 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3">
                          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{detail.assignee.full_name}</span>
                        </div>
                        <button
                          type="button"
                          disabled={!!savingField}
                          onClick={() => updateField('assignee_id', null, detail.assignee_id)}
                          className="h-9 px-3 text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 border border-gray-200 dark:border-neutral-700 rounded-xl transition-colors shrink-0"
                        >
                          Verwijderen
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={!!savingField || !userId}
                        onClick={() => {
                          updateField('assignee_id', userId ?? null, null)
                          setDetail((prev: any) => ({ ...prev, assignee: { id: userId, full_name: 'Jij' } }))
                        }}
                        className="flex items-center gap-2 h-9 px-3 text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-neutral-700 rounded-xl hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200 transition-colors w-full"
                      >
                        <User className="h-3.5 w-3.5" />
                        Aan mij toewijzen
                      </button>
                    )}
                    {savingField === 'assignee_id' && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400 shrink-0" />}
                  </div>
                </DetailField>

                {/* Deadline */}
                <DetailField label="Deadline">
                  <DatePicker
                    value={detail.due_date ?? ''}
                    onChange={v => updateField('due_date', v || null, detail.due_date)}
                  />
                </DetailField>

                {/* Divider */}
                <hr className="border-gray-100 dark:border-neutral-800" />

                {/* Locatie */}
                {locationLabel && (
                  <InfoRow icon={MapPin} label="Locatie">{locationLabel}</InfoRow>
                )}

                {/* Huurder */}
                {tenantName && (
                  <InfoRow icon={User} label="Huurder">{tenantName}</InfoRow>
                )}

                {/* Bron */}
                {detail.source && (
                  <InfoRow icon={Tag} label="Bron">{SOURCE_LABELS[detail.source] ?? detail.source}</InfoRow>
                )}

                {/* Aangemaakt */}
                <InfoRow icon={CalendarDays} label="Aangemaakt">
                  {format(new Date(detail.created_at), 'd MMMM yyyy \'om\' HH:mm', { locale: nl })}
                </InfoRow>

                {/* Opgelost */}
                {detail.resolved_at && (
                  <InfoRow icon={CheckCircle2} label="Opgelost">
                    {format(new Date(detail.resolved_at), 'd MMMM yyyy \'om\' HH:mm', { locale: nl })}
                  </InfoRow>
                )}

                {/* Omschrijving */}
                {detail.description && (
                  <div className="rounded-xl bg-gray-50 dark:bg-neutral-900 p-4">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">Omschrijving</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{detail.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Notities ───────────────────────────────────────────────── */}
            {tab === 'notities' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
                  {internalNotes.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
                      Geen interne notities. Gebruik dit voor informatie die alleen jij ziet.
                    </p>
                  ) : (
                    internalNotes.map((msg: any) => (
                      <div key={msg.id} className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Intern</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                            {format(new Date(msg.created_at), 'd MMM HH:mm', { locale: nl })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{msg.content}</p>
                        {msg.profiles?.full_name && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{msg.profiles.full_name}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-gray-100 dark:border-neutral-800 px-6 py-4 shrink-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Interne notitie (alleen voor jou zichtbaar)</span>
                  </div>
                  <Textarea
                    ref={noteInputRef}
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Noteer iets voor jezelf…"
                    rows={2}
                    className="rounded-xl resize-none text-sm border-amber-200 dark:border-amber-500/30"
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendNote() }}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={!noteText.trim() || sendingNote}
                      onClick={sendNote}
                      className="rounded-full bg-amber-500 text-white hover:bg-amber-600 text-xs font-semibold px-4"
                    >
                      {sendingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Lock className="h-3.5 w-3.5 mr-1.5" />Opslaan</>}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Werkbon ────────────────────────────────────────────────── */}
            {tab === 'werkbon' && (
              <div className="px-6 py-5 space-y-4">
                {/* Work orders list */}
                {(detail.work_orders ?? []).length === 0 && !showNewWorkOrder && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                    Nog geen werkbonnen voor dit ticket.
                  </p>
                )}
                {(detail.work_orders ?? []).map((wo: any) => (
                  <div key={wo.id} className="border border-gray-200 dark:border-neutral-700 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{wo.vendor_name ?? 'Onbekende leverancier'}</p>
                        {wo.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{wo.description}</p>}
                      </div>
                      <Select
                        value={wo.status}
                        onValueChange={v => updateWorkOrderStatus(wo.id, v)}
                      >
                        <SelectTrigger className="h-7 rounded-lg text-xs w-auto min-w-[110px] shrink-0 border-gray-200 dark:border-neutral-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="concept">Concept</SelectItem>
                          <SelectItem value="ingepland">Ingepland</SelectItem>
                          <SelectItem value="uitgevoerd">Uitgevoerd</SelectItem>
                          <SelectItem value="gefactureerd">Gefactureerd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {wo.scheduled_at && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {format(new Date(wo.scheduled_at), 'd MMM yyyy', { locale: nl })}
                        </span>
                      )}
                      {wo.cost_estimate && (
                        <span className="flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          Schatting: €{wo.cost_estimate.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      {wo.cost_actual && (
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                          <Euro className="h-3 w-3" />
                          Werkelijk: €{wo.cost_actual.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* New work order form */}
                {showNewWorkOrder ? (
                  <div className="border border-gray-200 dark:border-neutral-700 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-neutral-900/50">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Nieuwe werkbon</p>
                    <div className="space-y-2">
                      <Label>Leverancier</Label>
                      <Input value={woVendor} onChange={e => setWoVendor(e.target.value)} placeholder="Naam aannemer of bedrijf" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Omschrijving werkzaamheden</Label>
                      <Textarea value={woDesc} onChange={e => setWoDesc(e.target.value)} placeholder="Wat wordt er gedaan?" rows={2} className="rounded-xl resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Datum gepland</Label>
                        <DatePicker value={woDate} onChange={setWoDate} />
                      </div>
                      <div className="space-y-2">
                        <Label>Kostenscatting (€)</Label>
                        <Input value={woCost} onChange={e => setWoCost(e.target.value)} placeholder="0,00" type="number" min="0" step="0.01" className="rounded-xl" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button type="button" onClick={() => setShowNewWorkOrder(false)} className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 px-2 py-1">Annuleren</button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={creatingWo}
                        onClick={createWorkOrder}
                        className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-xs font-semibold px-4"
                      >
                        {creatingWo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Werkbon aanmaken'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewWorkOrder(true)}
                    className="w-full rounded-xl border-dashed text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Werkbon toevoegen
                  </Button>
                )}
              </div>
            )}

            {/* ── Bijlagen ───────────────────────────────────────────────── */}
            {tab === 'bijlagen' && (
              <div className="px-6 py-5 space-y-4">
                {/* Upload zone */}
                <div
                  className="border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-[#9FE870] hover:bg-green-50/30 dark:hover:bg-green-900/5 transition-colors"
                  onClick={() => !isDemo && fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    if (isDemo) return
                    const file = e.dataTransfer.files[0]
                    if (file) uploadFile(file)
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = '' }}
                  />
                  {uploadingFile ? (
                    <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Loader2 className="h-6 w-6 animate-spin text-[#9FE870]" />
                      <span className="text-sm">Uploaden…</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {isDemo ? 'Upload niet beschikbaar in demo' : 'Klik of sleep om te uploaden'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">JPG, PNG, WEBP, HEIC of PDF · max 10 MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-sm text-red-500 dark:text-red-400">{uploadError}</p>
                )}

                {/* Attachment list */}
                {loadingAttachments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : isDemo ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    Bijlagen zijn niet beschikbaar in demo-modus.
                  </p>
                ) : attachments.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    Nog geen bijlagen bij dit ticket.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {attachments.map((att: any) => {
                      const isImageFile = att.mime_type?.startsWith('image/')
                      return (
                        <div key={att.id} className="relative group border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-neutral-900">
                          {isImageFile && att.url ? (
                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={att.url} alt={att.file_name} className="w-full h-28 object-cover" />
                            </a>
                          ) : (
                            <a
                              href={att.url ?? '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col items-center justify-center h-28 gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                              <FileText className="h-8 w-8" />
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <div className="px-2.5 py-2 border-t border-gray-200 dark:border-neutral-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{att.file_name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteAttachment(att.id)}
                            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </DetailShell>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</Label>
      {children}
    </div>
  )
}

function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{children}</p>
      </div>
    </div>
  )
}
