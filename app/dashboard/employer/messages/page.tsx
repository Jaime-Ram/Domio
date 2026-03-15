'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react'
import { conversations, portfolioObjects } from '@/lib/mock-data/domio-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'

type ComposeState = {
  recipientId: string | null
  subject: string
  body: string
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function MessagesPage() {
  const { isDemo } = useDashboardUser()
  const convos = isDemo ? conversations : []
  const [selectedId, setSelectedId] = useState<string | null>(convos[0]?.id ?? null)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')
  const [composing, setComposing] = useState(false)
  const [compose, setCompose] = useState<ComposeState>({ recipientId: null, subject: '', body: '' })
  const [recipientSearch, setRecipientSearch] = useState('')
  const [recipientDropdownOpen, setRecipientDropdownOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const contacts = useMemo(() => {
    return portfolioObjects
      .filter((o) => o.tenantName)
      .map((o) => ({ id: o.id, name: o.tenantName!, address: o.address }))
  }, [])

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      c.address.toLowerCase().includes(recipientSearch.toLowerCase())
  )

  const selectedRecipient = contacts.find((c) => c.id === compose.recipientId)

  const filtered = convos.filter(
    (c) =>
      c.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  )
  const selected = composing ? null : convos.find((c) => c.id === selectedId)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedId])

  const totalUnread = convos.reduce((sum, c) => sum + c.unread, 0)

  function startCompose() {
    setComposing(true)
    setSelectedId(null)
    setCompose({ recipientId: null, subject: '', body: '' })
    setRecipientSearch('')
  }

  function cancelCompose() {
    setComposing(false)
    if (convos.length > 0) setSelectedId(convos[0].id)
  }

  function selectConversation(id: string) {
    setComposing(false)
    setSelectedId(id)
  }

  const canSendCompose = compose.recipientId && compose.subject.trim() && compose.body.trim()

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px]">
      <SectionHeroHeader
        title="Berichten"
        description={
          totalUnread > 0
            ? `${totalUnread} ongelezen ${totalUnread === 1 ? 'bericht' : 'berichten'}`
            : 'Communicatie met huurders en partijen.'
        }
      />

      {convos.length === 0 && !composing ? (
        <div className="flex-1 flex items-center justify-center rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800">
          <div className="text-center px-6">
            <div className="h-16 w-16 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-brand-primary dark:text-brand-accent" />
            </div>
            <p className="text-gray-900 dark:text-white font-semibold text-lg">Nog geen berichten</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto mb-5">
              Start je eerste conversatie met een huurder.
            </p>
            <Button
              onClick={startCompose}
              className="rounded-full bg-[#163300] text-white hover:bg-[#163300]/90 px-6 h-10 text-sm font-medium gap-2"
            >
              <Plus className="h-4 w-4" />
              Nieuw bericht
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 gap-3">
          {/* Conversation list panel */}
          <div className={cn(
            'flex flex-col rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 overflow-hidden',
            'w-full md:w-[340px] lg:w-[380px] flex-shrink-0',
            (selected || composing) ? 'hidden md:flex' : 'flex'
          )}>
            {/* Search + New button */}
            <div className="p-3 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoek conversaties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border-0 shadow-none text-sm"
                />
              </div>
              <Button
                onClick={startCompose}
                size="icon"
                className="h-10 w-10 rounded-xl bg-[#163300] text-white hover:bg-[#163300]/90 flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Conversation items */}
            <div className="flex-1 overflow-y-auto px-1.5 pb-1.5">
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Geen conversaties gevonden
                </div>
              )}
              {filtered.map((c) => {
                const isActive = selectedId === c.id && !composing
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectConversation(c.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-colors mb-0.5',
                      isActive
                        ? 'bg-white dark:bg-neutral-900'
                        : 'hover:bg-gray-200 dark:hover:bg-neutral-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold',
                        isActive
                          ? 'bg-[#163300] text-white'
                          : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300'
                      )}>
                        {getInitials(c.tenantName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {c.tenantName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {c.lastTime}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {c.address}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {c.lastMessage}
                          </p>
                          {c.unread > 0 && (
                            <span className="flex-shrink-0 h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[11px] font-semibold rounded-full bg-[#163300] text-white dark:bg-[#9FE870] dark:text-[#163300]">
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right panel: chat or compose */}
          <div className={cn(
            'flex-1 flex flex-col min-w-0 rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 overflow-hidden',
            !selected && !composing ? 'hidden md:flex' : 'flex'
          )}>
            {composing ? (
              /* ── Compose new message ── */
              <div className="flex flex-col h-full">
                {/* Compose header */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 flex-shrink-0"
                    onClick={cancelCompose}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-9 w-9 rounded-full bg-[#163300] text-white flex items-center justify-center flex-shrink-0">
                    <Plus className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Nieuw bericht
                  </p>
                </div>

                {/* Compose form */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="max-w-xl mx-auto space-y-4">
                    {/* Recipient selector */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                        Aan
                      </label>
                      <div className="relative">
                        {selectedRecipient ? (
                          <div className="flex items-center gap-2 h-10 rounded-xl bg-white dark:bg-neutral-900 px-3">
                            <div className="h-7 w-7 rounded-full bg-[#163300] text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                              {getInitials(selectedRecipient.name)}
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white flex-1 truncate">
                              {selectedRecipient.name}
                              <span className="text-gray-500 dark:text-gray-400 ml-1.5">
                                {selectedRecipient.address}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setCompose((s) => ({ ...s, recipientId: null }))
                                setRecipientSearch('')
                              }}
                              className="h-6 w-6 rounded-full hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 flex items-center justify-center flex-shrink-0"
                            >
                              <X className="h-3.5 w-3.5 text-gray-400" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Zoek huurder op naam of adres..."
                              value={recipientSearch}
                              onChange={(e) => {
                                setRecipientSearch(e.target.value)
                                setRecipientDropdownOpen(true)
                              }}
                              onFocus={() => setRecipientDropdownOpen(true)}
                              className="pl-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border-0 shadow-none text-sm"
                            />
                          </>
                        )}
                        {recipientDropdownOpen && !selectedRecipient && (
                          <div className="absolute z-20 top-full mt-1.5 left-0 right-0 rounded-xl bg-white dark:bg-neutral-900 shadow-lg max-h-52 overflow-y-auto">
                            {filteredContacts.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                Geen huurders gevonden
                              </div>
                            ) : (
                              filteredContacts.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                  onClick={() => {
                                    setCompose((s) => ({ ...s, recipientId: c.id }))
                                    setRecipientDropdownOpen(false)
                                    setRecipientSearch('')
                                  }}
                                >
                                  <div className="h-8 w-8 rounded-full bg-[#f4f4f4] dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                                    {getInitials(c.name)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.address}</p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                        Onderwerp
                      </label>
                      <Input
                        placeholder="Bijv. Onderhoud badkamer, Huurvraag..."
                        value={compose.subject}
                        onChange={(e) => setCompose((s) => ({ ...s, subject: e.target.value }))}
                        className="h-10 rounded-xl bg-white dark:bg-neutral-900 border-0 shadow-none text-sm"
                      />
                    </div>

                    {/* Message body */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                        Bericht
                      </label>
                      <textarea
                        placeholder="Schrijf je bericht..."
                        value={compose.body}
                        onChange={(e) => setCompose((s) => ({ ...s, body: e.target.value }))}
                        rows={6}
                        className="w-full rounded-xl bg-white dark:bg-neutral-900 border-0 shadow-none text-sm px-4 py-3 resize-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Compose footer */}
                <div className="px-3 pb-3">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-neutral-900 px-3 py-2.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-gray-400 hover:text-gray-600 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 flex-shrink-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={cancelCompose}
                        className="h-9 px-4 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800"
                      >
                        Annuleren
                      </Button>
                      <Button
                        disabled={!canSendCompose}
                        className={cn(
                          'h-9 px-5 rounded-full text-sm font-medium gap-2 transition-colors',
                          canSendCompose
                            ? 'bg-[#163300] text-white hover:bg-[#163300]/90'
                            : 'bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-gray-500'
                        )}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Versturen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : selected ? (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-9 w-9 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 flex-shrink-0"
                    onClick={() => setSelectedId(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-9 w-9 rounded-full bg-[#163300] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {getInitials(selected.tenantName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {selected.tenantName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {selected.address}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="max-w-2xl mx-auto space-y-3">
                    {selected.messages.map((m, i) => {
                      const isUser = m.sender === 'user'
                      const isLast = i === selected.messages.length - 1
                      return (
                        <div
                          key={m.id}
                          className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[75%] rounded-2xl px-4 py-2.5',
                              isUser
                                ? 'bg-[#163300] text-white'
                                : 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white'
                            )}
                          >
                            <p className="text-sm leading-relaxed">{m.text}</p>
                            <div className={cn(
                              'flex items-center gap-1 mt-1',
                              isUser ? 'justify-end' : 'justify-start'
                            )}>
                              <span className={cn(
                                'text-[11px]',
                                isUser ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'
                              )}>
                                {m.time}
                              </span>
                              {isUser && (
                                isLast
                                  ? <CheckCheck className="h-3 w-3 text-[#9FE870]" />
                                  : <Check className="h-3 w-3 text-white/50" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {/* Message input */}
                <div className="px-3 pb-3">
                  <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-neutral-900 px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-gray-400 hover:text-gray-600 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 flex-shrink-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Typ een bericht..."
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      className="flex-1 h-9 border-0 shadow-none bg-transparent focus-visible:ring-0 text-sm px-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          setMsg('')
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-gray-400 hover:text-gray-600 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 flex-shrink-0"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className={cn(
                        'h-9 w-9 rounded-full flex-shrink-0 transition-colors',
                        msg.trim()
                          ? 'bg-[#163300] text-white hover:bg-[#163300]/90'
                          : 'bg-[#f4f4f4] dark:bg-neutral-800 text-gray-400'
                      )}
                      disabled={!msg.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="h-14 w-14 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-7 w-7 text-brand-primary dark:text-brand-accent" />
                  </div>
                  <p className="text-gray-900 dark:text-white font-semibold">Selecteer een conversatie</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                    Of start een nieuw gesprek
                  </p>
                  <Button
                    onClick={startCompose}
                    className="rounded-full bg-[#163300] text-white hover:bg-[#163300]/90 px-5 h-9 text-sm font-medium gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nieuw bericht
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
