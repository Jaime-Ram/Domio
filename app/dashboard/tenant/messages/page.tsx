'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, MessageCircleMore, Ticket as TicketIcon, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@supabase/ssr'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

type TicketSummary = {
  id: string
  title: string
  status: string
  ticket_number: number | null
  created_at: string
  lastMessage?: string
  lastMessageAt?: string
}

type ChatMessage = {
  id: string
  content: string
  sender_id: string | null
  created_at: string
  profiles: { full_name: string | null } | null
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
  geannuleerd: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-500',
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return format(d, 'HH:mm')
  if (diffDays === 1) return 'gisteren'
  if (diffDays < 7) return format(d, 'EEEE', { locale: nl })
  return format(d, 'd MMM', { locale: nl })
}

export default function TenantMessagesPage() {
  const { user } = useDashboardUser()
  const [tickets, setTickets] = useState<TicketSummary[]>([])
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendAnimKey, setSendAnimKey] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const realtimeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<any>(null)

  const activeTicket = tickets.find(t => t.id === activeTicketId) ?? null

  // Load ticket list
  useEffect(() => {
    if (!user?.id) return
    setLoadingTickets(true)
    fetch('/api/tickets/tenant')
      .then(r => r.json())
      .then(({ tickets: rows }) => {
        setTickets((rows ?? []).map((t: any) => ({
          id: t.id,
          title: t.title || 'Ticket',
          status: t.status || 'open',
          ticket_number: t.ticket_number ?? null,
          created_at: t.created_at,
        })))
      })
      .catch(() => setTickets([]))
      .finally(() => setLoadingTickets(false))
  }, [user?.id])

  // Load messages for selected ticket
  const loadMessages = useCallback(async (ticketId: string) => {
    setLoadingMessages(true)
    try {
      const r = await fetch(`/api/tickets/tenant/${ticketId}`)
      const { ticket } = await r.json()
      const msgs: ChatMessage[] = (ticket?.messages ?? [])
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      setMessages(msgs)
    } catch {
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  // Select ticket
  const selectTicket = useCallback((ticketId: string) => {
    setActiveTicketId(ticketId)
    setMessages([])
    loadMessages(ticketId)
  }, [loadMessages])

  // Real-time subscription
  useEffect(() => {
    if (!activeTicketId || !user?.id) return

    // Unsubscribe previous
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    channelRef.current = supabase
      .channel(`ticket-messages-${activeTicketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${activeTicketId}`,
        },
        (payload: any) => {
          const newMsg = payload.new as ChatMessage
          // Avoid duplicate if we just sent it
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [activeTicketId, user?.id])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-select first ticket
  useEffect(() => {
    if (tickets.length > 0 && !activeTicketId) {
      selectTicket(tickets[0].id)
    }
  }, [tickets, activeTicketId, selectTicket])

  const sendMessage = async () => {
    const text = message.trim()
    if (!text || sending || !activeTicketId) return

    setSending(true)
    setSendAnimKey(k => k + 1)

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: `opt-${Date.now()}`,
      content: text,
      sender_id: user?.id ?? null,
      created_at: new Date().toISOString(),
      profiles: null,
    }
    setMessages(prev => [...prev, optimisticMsg])
    setMessage('')
    if (inputRef.current) inputRef.current.style.height = 'auto'

    try {
      const res = await fetch(`/api/tickets/tenant/${activeTicketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const { message: saved } = await res.json()
      if (saved) {
        // Replace optimistic with real message
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? saved : m))
      }
    } catch {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      setMessage(text)
    } finally {
      setSending(false)
    }
  }

  // Group by date
  const grouped: { date: string; msgs: ChatMessage[] }[] = []
  for (const m of messages) {
    const d = format(new Date(m.created_at), 'd MMMM', { locale: nl })
    const last = grouped[grouped.length - 1]
    if (last?.date === d) last.msgs.push(m)
    else grouped.push({ date: d, msgs: [m] })
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>

      {/* Left: ticket list */}
      <aside className="w-[300px] shrink-0 flex flex-col min-h-0 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-neutral-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Berichten</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Via uw tickets</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingTickets ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-2xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center py-12">
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <TicketIcon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Nog geen tickets</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Dien eerst een ticket in via de Tickets pagina.</p>
            </div>
          ) : (
            <div className="py-2">
              {tickets.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTicket(t.id)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                    activeTicketId === t.id
                      ? 'bg-gray-100 dark:bg-neutral-800'
                      : 'hover:bg-gray-50 dark:hover:bg-neutral-800/60',
                  )}
                >
                  <div className="h-9 w-9 rounded-full bg-[#163300]/8 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <TicketIcon className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                      <span className="text-[10px] text-gray-400 shrink-0">{formatRelative(t.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {t.ticket_number && (
                        <span className="text-[10px] font-mono text-gray-400">#{t.ticket_number}</span>
                      )}
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', STATUS_CLS[t.status] ?? STATUS_CLS.open)}>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Right: message thread */}
      <section className="flex-1 min-w-0 flex flex-col min-h-0 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-sm overflow-hidden">

        {/* Header */}
        {activeTicket ? (
          <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-neutral-800 shrink-0 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activeTicket.title}</p>
                {activeTicket.ticket_number && (
                  <span className="text-xs font-mono text-gray-400 shrink-0">#{activeTicket.ticket_number}</span>
                )}
              </div>
              <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block', STATUS_CLS[activeTicket.status] ?? STATUS_CLS.open)}>
                {STATUS_LABEL[activeTicket.status] ?? activeTicket.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-neutral-800 shrink-0">
            <div className="h-5 w-48 rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {!activeTicket && !loadingTickets ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                  <MessageCircleMore className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Selecteer een ticket</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Kies links een ticket om de berichten te bekijken.</p>
              </div>
            </div>
          ) : loadingMessages ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                  <div className={cn('h-10 rounded-2xl bg-gray-100 dark:bg-neutral-800 animate-pulse', i % 2 === 0 ? 'w-48' : 'w-32')} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                  <MessageCircleMore className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-[#163300] dark:text-[#9FE870]">Nog geen berichten</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Stel een vraag aan uw verhuurder over dit ticket.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(({ date, msgs }) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-100 dark:bg-neutral-800" />
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 shrink-0">{date}</span>
                    <div className="flex-1 h-px bg-gray-100 dark:bg-neutral-800" />
                  </div>
                  <div className="space-y-2.5">
                    {msgs.map(m => {
                      const isMe = m.sender_id === user?.id
                      return (
                        <div key={m.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                          {!isMe && (
                            <div className="h-7 w-7 rounded-full bg-[#163300] dark:bg-[#9FE870] flex items-center justify-center text-[10px] font-semibold text-white dark:text-[#163300] mr-2 mt-0.5 shrink-0">
                              {(m.profiles?.full_name ?? 'V').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className={cn(
                            'max-w-[72%] rounded-2xl px-3.5 py-2.5',
                            isMe
                              ? 'bg-[#163300] dark:bg-[#9FE870] text-white dark:text-[#163300] rounded-br-sm'
                              : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-bl-sm',
                          )}>
                            {!isMe && m.profiles?.full_name && (
                              <p className="text-[10px] font-semibold mb-1 opacity-70">{m.profiles.full_name}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{m.content}</p>
                            <p className={cn(
                              'text-[10px] mt-1',
                              isMe ? 'text-white/60 dark:text-[#163300]/60 text-right' : 'text-gray-400 dark:text-gray-500',
                            )}>
                              {format(new Date(m.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-2.5">
              <Textarea
                ref={inputRef}
                placeholder={activeTicket ? 'Stuur een bericht aan uw verhuurder…' : 'Selecteer een ticket…'}
                rows={1}
                disabled={!activeTicket || sending}
                value={message}
                className="min-h-[24px] max-h-32 w-full resize-none border-0 bg-transparent text-sm leading-relaxed p-0 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                onChange={e => {
                  setMessage(e.target.value)
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 128)}px`
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
            </div>
            <Button
              size="icon"
              disabled={!activeTicket || !message.trim() || sending}
              onClick={sendMessage}
              className="size-10 min-w-10 shrink-0 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] disabled:opacity-40"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={sendAnimKey}
                  initial={{ x: -6, y: 6, opacity: 0, scale: 0.85 }}
                  animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  exit={{ x: 8, y: -8, opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="inline-flex"
                >
                  <Send className="h-4 w-4" />
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
