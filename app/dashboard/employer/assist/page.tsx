'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import {
  RotateCcw, Copy, Check,
  FileText,
  X, Search, Store, Folder, Layers, FileStack, Ticket, Users, ArrowUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AttachmentSourceDropdown } from '@/components/dashboard/attachment-source-dropdown'
import { DomioDocumentPickerDialog } from '@/components/dashboard/domio-document-picker-dialog'
import { GoogleDriveComingSoonDialog } from '@/components/dashboard/google-drive-coming-soon-dialog'
import { renderComposerWithDocumentMentions, renderMessageWithDocumentMentions } from '@/components/dashboard/composer-mention-render'
import type { ComposerAttachment, MentionItem } from '@/lib/dashboard/chat-composer'
import { getMentionContext } from '@/lib/dashboard/chat-composer'
import { documentQueries, leaseQueries, ticketQueries } from '@/lib/supabase/queries'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: ComposerAttachment[]
}

/** Snelknoppen naast de invoerbalk. */
const QUICK_BAR_ACTIONS: { icon: typeof Store; label: string; prompt: string }[] = [
  { icon: Store, label: 'Portfolio', prompt: 'Geef me een overzicht van mijn portefeuille.' },
  { icon: Folder, label: 'Compliance', prompt: 'Wat is de huidige compliance status van mijn objecten?' },
  { icon: Layers, label: 'Tickets', prompt: 'Hoeveel open onderhoudsticktes heb ik op dit moment?' },
  { icon: FileStack, label: 'Betalingen', prompt: 'Wat zijn de betalingen van deze maand?' },
]

const MOCK_RESPONSES: Record<string, string> = {
  default: 'Ik begrijp je vraag. Op basis van je portefeuille kan ik je helpen met inzichten over huurders, compliance, financiën en onderhoud. Stel je vraag gerust specifieker en ik geef je een concreet antwoord.',
  portfolio: 'Je portefeuille bestaat momenteel uit **7 objecten** in Amsterdam en Rotterdam. Hiervan zijn **5 objecten verhuurd** (71% bezettingsgraad) en **2 beschikbaar**. De totale maandelijkse huurinkomsten bedragen **€8.925**.',
  compliance: 'Van je **7 objecten** zijn er **5 compliant** (71%). Er zijn **2 acties vereist**:\n\n• **Herengracht 45** — WWS-berekening verlopen\n• **Prinsengracht 8-1** — Huurprijs te hoog t.o.v. puntentelling\n\nWil je dat ik een actieplan maak?',
  ticket: 'Er staan momenteel **3 open tickets** in je portefeuille:\n\n1. **Lekkage badkamer** — Keizersgracht 12 *(hoog, 3 dagen open)*\n2. **CV-ketel storing** — Prinsengracht 8-1 *(middel, 1 dag open)*\n3. **Kapot slot** — Westerstraat 67 *(laag, 5 dagen open)*\n\nWil je een van deze tickets oppakken?',
  betaling: 'Deze maand zijn er **6 betalingen ontvangen** voor een totaal van **€7.250**. Er is **1 betaling uitstaand**: Vondelstraat 22 (€950, 4 dagen te laat). Wil je een herinnering sturen?',
  huurder: 'De huurder op **Keizersgracht 12** is **Jan Jansen**. Het contract loopt tot **31 december 2025** tegen **€1.200/maand**. Er is momenteel 1 open ticket op dit adres. Wil je zijn profiel openen?',
  rapportage: 'Hier is een samenvatting van je portefeuille voor **april 2026**:\n\n**Financieel**\n• Ontvangen: €7.250 van €8.925 verwacht\n• Incassoratio: 81%\n\n**Compliance**\n• 5/7 objecten compliant (71%)\n• 2 acties vereist\n\n**Onderhoud**\n• 3 open tickets\n• 1 inspectie gepland\n\nWil je dit als PDF exporteren?',
}

function getResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('portfolio') || lower.includes('portefeuille') || lower.includes('overzicht')) return MOCK_RESPONSES.portfolio
  if (lower.includes('compliance') || lower.includes('wws') || lower.includes('compliant')) return MOCK_RESPONSES.compliance
  if (lower.includes('ticket') || lower.includes('onderhoud') || lower.includes('storing')) return MOCK_RESPONSES.ticket
  if (lower.includes('betaling') || lower.includes('huur') && lower.includes('maand')) return MOCK_RESPONSES.betaling
  if (lower.includes('huurder') || lower.includes('keizersgracht')) return MOCK_RESPONSES.huurder
  if (lower.includes('rapportage') || lower.includes('samenvatting') || lower.includes('rapport')) return MOCK_RESPONSES.rapportage
  return MOCK_RESPONSES.default
}

function MarkdownText({ content, plain }: { content: string; plain?: boolean }) {
  const parts = content.split('\n')
  const bulletClass = plain
    ? 'bg-gray-400 dark:bg-gray-500'
    : 'bg-[#163300] dark:bg-[#9FE870]'
  return (
    <div className={cn('space-y-1.5', plain && 'text-[15px] leading-7 text-gray-900 dark:text-gray-100')}>
      {parts.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        if (line.startsWith('•')) {
          return (
            <p key={i} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className={cn('mt-1.5 h-1.5 w-1.5 rounded-full shrink-0', bulletClass)} />
              <span dangerouslySetInnerHTML={{ __html: rendered.slice(1).trim() }} />
            </p>
          )
        }
        return (
          <p
            key={i}
            className={cn('text-sm leading-relaxed', plain && 'text-[15px] leading-7')}
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        )
      })}
    </div>
  )
}

export default function AssistPage() {
  const { user, isDemo } = useDashboardUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionStart, setMentionStart] = useState<number | null>(null)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const [tickets, setTickets] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [assistContacts, setAssistContacts] = useState<{ id: string; name: string; handle: string }[]>([])
  const [googleDriveDialogOpen, setGoogleDriveDialogOpen] = useState(false)
  const [domioDocPickerOpen, setDomioDocPickerOpen] = useState(false)
  const [hoveredQuickPrompt, setHoveredQuickPrompt] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const domioDocumentsForPicker = useMemo(
    () =>
      documents.map((d: any) => ({
        id: String(d.id),
        name: String(d?.name || d?.file_name || 'Document'),
      })),
    [documents]
  )

  useEffect(() => {
    if (isDemo) {
      setTickets([
        { id: 'demo-t1', title: 'Lekkage badkamer' },
        { id: 'demo-t2', title: 'CV-ketel storing' },
      ])
      setDocuments([
        { id: 'demo-doc-1', name: 'Huurcontract Keizersgracht 12.pdf' },
        { id: 'demo-doc-2', name: 'Inspectierapport 2025.pdf' },
      ])
      setAssistContacts([
        { id: 'demo-1', name: 'Jan Jansen', handle: '@jan.jansen' },
        { id: 'demo-2', name: 'Lisa de Vries', handle: '@lisa.devries' },
      ])
      return
    }
    if (!user?.id) {
      setTickets([])
      setDocuments([])
      setAssistContacts([])
      return
    }
    Promise.all([leaseQueries.getByOwner(user.id), ticketQueries.getByOwner(user.id), documentQueries.getByOwner(user.id)])
      .then(([leases, ticketRows, docRows]) => {
        setTickets(ticketRows || [])
        setDocuments(docRows || [])
        const contactMap = new Map<string, { id: string; name: string; handle: string }>()
        for (const l of leases || []) {
          const tenant = (l as any).tenants
          if (!tenant?.id || !tenant?.full_name) continue
          const email = tenant.email ? String(tenant.email) : ''
          contactMap.set(tenant.id, {
            id: tenant.id,
            name: tenant.full_name,
            handle: email ? `@${email.split('@')[0]}` : '@huurder',
          })
        }
        setAssistContacts(Array.from(contactMap.values()))
      })
      .catch(() => {
        setTickets([])
        setDocuments([])
        setAssistContacts([])
      })
  }, [user?.id, isDemo])

  const mentionItems = useMemo<MentionItem[]>(() => {
    const items: MentionItem[] = []
    for (const t of tickets.slice(0, 50)) {
      const title = String(t?.title || 'Ticket')
      const idShort = String(t?.id || '').slice(0, 8)
      const label = `${title}${idShort ? ` #${idShort}` : ''}`
      items.push({ id: `ticket-${t.id}`, kind: 'ticket', label, search: `${title} ${idShort}`.toLowerCase() })
    }
    for (const d of documents.slice(0, 50)) {
      const name = String(d?.name || d?.file_name || 'Document')
      items.push({ id: `document-${d.id}`, kind: 'document', label: name, search: name.toLowerCase(), sourceId: d.id })
    }
    for (const c of assistContacts.slice(0, 100)) {
      items.push({ id: `contact-${c.id}`, kind: 'contact', label: c.name, search: `${c.name} ${c.handle}`.toLowerCase() })
    }
    return items
  }, [tickets, documents, assistContacts])

  const mentionResults = useMemo(() => {
    const q = mentionQuery.trim()
    const filtered = q ? mentionItems.filter((i) => i.search.includes(q)) : mentionItems
    return filtered.slice(0, 8)
  }, [mentionItems, mentionQuery])

  useEffect(() => {
    if (!mentionOpen) return
    if (mentionIndex >= mentionResults.length) setMentionIndex(0)
  }, [mentionOpen, mentionIndex, mentionResults.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files)
    if (arr.length === 0) return
    const next = arr.map((file) => {
      const isImage = file.type.startsWith('image/')
      return {
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        source: 'upload' as const,
        name: file.name,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      }
    })
    setAttachments((prev) => [...prev, ...next])
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const item = prev.find((a) => a.id === id)
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((a) => a.id !== id)
    })
  }

  const updateMentionState = (value: string, cursor: number) => {
    const ctx = getMentionContext(value, cursor)
    if (!ctx) {
      setMentionOpen(false)
      setMentionStart(null)
      setMentionQuery('')
      setMentionIndex(0)
      return
    }
    setMentionOpen(true)
    setMentionStart(ctx.at)
    setMentionQuery(ctx.query)
  }

  const addDocumentMentionAttachment = (label: string, sourceId: string) => {
    setAttachments((prev) => {
      const already = prev.some((a) => a.source === 'mention-document' && a.documentId === sourceId)
      if (already) return prev
      return [
        ...prev,
        {
          id: `mention-doc-${sourceId}`,
          source: 'mention-document' as const,
          name: label,
          documentId: sourceId,
        },
      ]
    })
  }

  const appendDomioDocumentFromPicker = (doc: { id: string; name: string }) => {
    addDocumentMentionAttachment(doc.name, doc.id)
    setInput((prev) => {
      const needSpace = prev.length > 0 && !/\s$/.test(prev)
      return prev + (needSpace ? ' ' : '') + `@${doc.name} `
    })
    setMentionOpen(false)
    setMentionStart(null)
    setMentionQuery('')
    setMentionIndex(0)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      const pos = el.value.length
      el.setSelectionRange(pos, pos)
    })
  }

  const applyMention = (item: MentionItem) => {
    if (mentionStart == null) return
    const cursor = textareaRef.current?.selectionStart ?? input.length
    const insert = `@${item.label} `
    const next = input.slice(0, mentionStart) + insert + input.slice(cursor)
    setInput(next)
    setMentionOpen(false)
    setMentionStart(null)
    setMentionQuery('')
    setMentionIndex(0)
    requestAnimationFrame(() => {
      if (!textareaRef.current) return
      const pos = mentionStart + insert.length
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(pos, pos)
    })

    if (item.kind === 'document' && item.sourceId) {
      addDocumentMentionAttachment(item.label, item.sourceId)
    }
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if ((!trimmed && attachments.length === 0) || isTyping) return

    const attachmentSnapshot = attachments.map((a) => ({ ...a, file: undefined }))

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
      attachments: attachmentSnapshot.length > 0 ? attachmentSnapshot : undefined,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setMentionOpen(false)
    setMentionStart(null)
    setMentionQuery('')
    setMentionIndex(0)
    attachments.forEach((a) => {
      if (a.previewUrl) URL.revokeObjectURL(a.previewUrl)
    })
    setAttachments([])
    setIsTyping(true)

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600))

    let reply = isDemo
      ? getResponse(trimmed || 'help')
      : 'Domio Assist is beschikbaar in demo-modus. Activeer je account om AI-acties in te schakelen.'
    if (isDemo && attachmentSnapshot.length > 0) {
      reply = `Ik heb je ${attachmentSnapshot.length} bestand(en) ontvangen (demo). ${reply}`
    }

    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])
    setIsTyping(false)
  }

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const hasTranscript = messages.length > 0
  const isCenteredLayout = !hasTranscript
  const showQuickBar = input.length === 0
  const canSendFromComposer =
    !isTyping && (input.trim().length > 0 || attachments.length > 0)

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-1 flex-col w-full overflow-hidden',
        dragActive && 'ring-2 ring-[#9FE870] ring-inset rounded-lg'
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragActive(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragActive(false)
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
      }}
    >
      {hasTranscript && (
        <div className="flex-1 overflow-y-auto min-h-0 w-full bg-white dark:bg-neutral-950">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[min(85%,520px)] rounded-3xl bg-gray-100 dark:bg-neutral-800 px-4 py-2.5 text-gray-900 dark:text-gray-100">
                    {msg.content ? (
                      <p className="text-[15px] leading-7 whitespace-pre-wrap break-words">
                        {renderMessageWithDocumentMentions(msg.content, msg.attachments ?? [])}
                      </p>
                    ) : null}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className={cn('flex flex-wrap gap-1.5', msg.content ? 'mt-2' : '')}>
                        {msg.attachments.map((a) => (
                          <span
                            key={a.id}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] bg-white/70 dark:bg-neutral-900/60 border border-gray-200/80 dark:border-neutral-600"
                          >
                            <FileText className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                            <span className="truncate max-w-[140px]">{a.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="space-y-2">
                  <MarkdownText content={msg.content} plain />
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="inline-flex items-center rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Antwoord kopiëren"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )
            )}

            {isTyping && (
              <div className="flex items-center gap-1 py-1" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      <div
        className={cn(
          'w-full flex flex-col items-center px-4 relative min-h-0',
          isCenteredLayout
            ? 'flex-1 justify-center py-6 sm:py-8'
            : 'mt-auto shrink-0 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 pt-2 pb-3 sm:pb-4'
        )}
      >
        {hasTranscript && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMessages([])
              setMentionOpen(false)
              setMentionStart(null)
              setMentionQuery('')
              setMentionIndex(0)
            }}
            className="absolute right-2 top-1 rounded-full text-gray-400 hover:text-gray-600 h-8 px-2 sm:px-3 text-xs z-10"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Nieuw gesprek
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.currentTarget.value = ''
          }}
        />
        <div className="w-full max-w-3xl flex flex-col items-center">
          {isCenteredLayout && (
            <div className="text-center mb-5 px-2 w-full">
              <h1 className="text-2xl md:text-3xl font-bold text-[#163300] dark:text-[#9FE870] leading-tight tracking-tight flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0">
                <span>Domio</span>
                <span className="inline-block font-normal select-none" aria-label="Assist">
                  A<span className="lowercase">ssist</span>
                </span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">AI-assistent voor je portefeuille</p>
            </div>
          )}
          {attachments.length > 0 && (
            <div className="mb-2 w-full rounded-2xl border border-gray-200 dark:border-neutral-700 bg-[#f8f8f8] dark:bg-neutral-800 p-2 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                {attachments.map((a) => (
                  <div
                    key={a.id}
                    className="group relative flex items-center gap-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 px-2.5 py-1.5"
                  >
                    {a.previewUrl ? (
                      <img src={a.previewUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
                    ) : (
                      <FileText className="h-4 w-4 text-[#163300]" />
                    )}
                    <div className="max-w-[170px]">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{a.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {a.source === 'mention-document' ? 'Getagd document' : `${a.sizeKb ?? 1} KB`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(a.id)}
                      className="h-5 w-5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 hover:text-gray-900 inline-flex items-center justify-center"
                      aria-label="Bijlage verwijderen"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <LayoutGroup>
            <div className="flex w-full min-w-0 justify-center">
              <div className="flex w-full min-w-0 items-center gap-2 flex-nowrap relative min-h-[44px]">
              {mentionOpen && mentionResults.length > 0 && (
                <div className="absolute left-0 right-0 bottom-full mb-2 z-30 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg p-1.5 max-h-48 overflow-y-auto">
                  {mentionResults.map((item, idx) => {
                    const Icon = item.kind === 'ticket' ? Ticket : item.kind === 'document' ? FileText : Users
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          applyMention(item)
                        }}
                        className={cn(
                          'w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm',
                          idx === mentionIndex
                            ? 'bg-[#f4f4f4] dark:bg-neutral-800 text-[#163300] dark:text-[#9FE870]'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              <AttachmentSourceDropdown
                disabled={isTyping}
                onPickComputer={() => fileInputRef.current?.click()}
                onPickDomioDocuments={() => setDomioDocPickerOpen(true)}
                onPickGoogleDrive={() => setGoogleDriveDialogOpen(true)}
              />
              <motion.div
                className="relative min-h-[40px] min-w-0 flex-1 basis-0 rounded-3xl bg-white/85 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200/90 dark:border-neutral-600 shadow-sm"
              >
                <Search className="pointer-events-none absolute left-3.5 top-[13px] z-20 h-4 w-4 text-gray-400" />
                <div className="absolute inset-0 z-0 pl-10 pr-4 py-2.5 text-sm whitespace-pre-wrap break-words pointer-events-none rounded-3xl">
                  {input.length > 0 ? (
                    renderComposerWithDocumentMentions(input, attachments)
                  ) : hoveredQuickPrompt ? (
                    <span className="text-gray-500 dark:text-gray-400">{hoveredQuickPrompt}</span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Typ hier je bericht…</span>
                  )}
                </div>
                <Textarea
                  ref={textareaRef}
                  placeholder=""
                  rows={1}
                  className="min-h-[40px] max-h-32 w-full resize-none rounded-3xl border-0 bg-transparent text-transparent caret-[#163300] dark:caret-[#9FE870] text-sm leading-5 pl-10 pr-4 py-2.5 relative z-10 overflow-y-auto shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={input}
                  disabled={isTyping}
                  onChange={(e) => {
                    const val = e.target.value
                    setInput(val)
                    updateMentionState(val, e.target.selectionStart ?? val.length)
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
                  }}
                  onClick={(e) => {
                    const el = e.currentTarget
                    updateMentionState(el.value, el.selectionStart ?? el.value.length)
                  }}
                  onKeyUp={(e) => {
                    const el = e.currentTarget
                    updateMentionState(el.value, el.selectionStart ?? el.value.length)
                  }}
                  onKeyDown={(e) => {
                    if (mentionOpen && mentionResults.length > 0 && e.key === 'ArrowDown') {
                      e.preventDefault()
                      setMentionIndex((i) => (i + 1) % mentionResults.length)
                    } else if (mentionOpen && mentionResults.length > 0 && e.key === 'ArrowUp') {
                      e.preventDefault()
                      setMentionIndex((i) => (i - 1 + mentionResults.length) % mentionResults.length)
                    } else if (mentionOpen && mentionResults.length > 0 && e.key === 'Enter') {
                      e.preventDefault()
                      const picked = mentionResults[mentionIndex]
                      if (picked) applyMention(picked)
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setMentionOpen(false)
                    } else if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage(input)
                    }
                  }}
                />
              </motion.div>
              <AnimatePresence initial={false} mode="popLayout">
                {showQuickBar ? (
                  <motion.div
                    layout
                    key="assist-quick-bar"
                    initial={{ opacity: 0, x: 16, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 14, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                    className="flex shrink-0 items-center gap-1.5"
                  >
                    {QUICK_BAR_ACTIONS.map((action) => {
                      const Icon = action.icon
                      return (
                        <button
                          key={action.label}
                          type="button"
                          title={action.label}
                          disabled={isTyping}
                          onClick={() => sendMessage(action.prompt)}
                          onMouseEnter={() => setHoveredQuickPrompt(action.prompt)}
                          onMouseLeave={() => setHoveredQuickPrompt(null)}
                          onFocus={() => setHoveredQuickPrompt(action.prompt)}
                          onBlur={() => setHoveredQuickPrompt(null)}
                          className={cn(
                            'size-10 shrink-0 rounded-full flex items-center justify-center transition-colors',
                            'bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] shadow-sm',
                            'disabled:opacity-40 disabled:pointer-events-none'
                          )}
                          aria-label={action.label}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </button>
                      )
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    key="assist-send"
                    initial={{ opacity: 0, x: 16, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 14, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                    className="flex shrink-0 items-center"
                  >
                    <button
                      type="button"
                      title="Bericht verzenden"
                      disabled={!canSendFromComposer}
                      onClick={() => sendMessage(input)}
                      className={cn(
                        'size-10 shrink-0 rounded-full flex items-center justify-center transition-colors',
                        'bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] shadow-sm',
                        'disabled:opacity-40 disabled:pointer-events-none'
                      )}
                      aria-label="Bericht verzenden"
                    >
                      <ArrowUp className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </LayoutGroup>
        </div>
        <p className="text-center text-[10px] text-gray-300 dark:text-neutral-600 mt-2 max-w-3xl px-2">
          Domio Assist kan fouten maken. Controleer belangrijke informatie altijd zelf.
        </p>
      </div>

      <GoogleDriveComingSoonDialog open={googleDriveDialogOpen} onOpenChange={setGoogleDriveDialogOpen} />
      <DomioDocumentPickerDialog
        open={domioDocPickerOpen}
        onOpenChange={setDomioDocPickerOpen}
        documents={domioDocumentsForPicker}
        onPick={appendDomioDocumentFromPicker}
      />
    </div>
  )
}
