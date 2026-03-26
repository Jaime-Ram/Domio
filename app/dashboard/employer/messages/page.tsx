'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search, Send, ChevronRight, MessageSquareDashed, Plus, TicketPlus, UserPlus, Ticket, FileText, Users, X, UsersRound, Paperclip, MessageCircle, MoreHorizontal, BellOff, Archive, Trash2, MessageCircleMore } from 'lucide-react'
import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import { documentQueries, leaseQueries, ticketQueries } from '@/lib/supabase/queries'

type MentionItem = {
  id: string
  kind: 'ticket' | 'document' | 'contact'
  label: string
  search: string
  sourceId?: string
}

type ComposerAttachment = {
  id: string
  source: 'upload' | 'mention-document'
  name: string
  sizeKb?: number
  previewUrl?: string
  file?: File
  documentId?: string
}

type ChatMessage = {
  id: string
  from: 'me' | 'them'
  text: string
  createdAt: string
  attachments: ComposerAttachment[]
}

function renderMessageWithDocumentMentions(text: string, attachments: ComposerAttachment[]) {
  const docMentions = attachments
    .filter((a) => a.source === 'mention-document')
    .map((a) => `@${a.name}`)
    .filter(Boolean)

  if (!text || docMentions.length === 0) return <>{text}</>

  let cursor = 0
  const out: React.ReactNode[] = []

  while (cursor < text.length) {
    let matchToken: string | null = null
    let matchIndex = -1
    for (const token of docMentions) {
      const idx = text.indexOf(token, cursor)
      if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
        matchIndex = idx
        matchToken = token
      }
    }

    if (!matchToken || matchIndex === -1) {
      out.push(text.slice(cursor))
      break
    }

    if (matchIndex > cursor) out.push(text.slice(cursor, matchIndex))
    out.push(
      <span key={`${matchToken}-${matchIndex}`} className="font-semibold text-[#163300] dark:text-[#9FE870]">
        {matchToken}
      </span>
    )
    cursor = matchIndex + matchToken.length
  }

  return <>{out}</>
}

function renderComposerWithDocumentMentions(text: string, attachments: ComposerAttachment[]) {
  if (!text) return <span className="text-gray-500 dark:text-gray-400">Typ een bericht…</span>

  const docMentions = attachments
    .filter((a) => a.source === 'mention-document')
    .map((a) => `@${a.name}`)
    .filter(Boolean)

  if (docMentions.length === 0) return <span className="text-gray-900 dark:text-gray-100">{text}</span>

  let cursor = 0
  const out: React.ReactNode[] = []

  while (cursor < text.length) {
    let matchToken: string | null = null
    let matchIndex = -1
    for (const token of docMentions) {
      const idx = text.indexOf(token, cursor)
      if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
        matchIndex = idx
        matchToken = token
      }
    }

    if (!matchToken || matchIndex === -1) {
      out.push(<span key={`plain-${cursor}`} className="text-gray-900 dark:text-gray-100">{text.slice(cursor)}</span>)
      break
    }

    if (matchIndex > cursor) {
      out.push(
        <span key={`plain-${cursor}`} className="text-gray-900 dark:text-gray-100">
          {text.slice(cursor, matchIndex)}
        </span>
      )
    }
    out.push(
      <span key={`${matchToken}-${matchIndex}`} className="font-semibold text-[#163300] dark:text-[#9FE870]">
        {matchToken}
      </span>
    )
    cursor = matchIndex + matchToken.length
  }

  return <>{out}</>
}

function getMentionContext(value: string, cursor: number) {
  const prefix = value.slice(0, cursor)
  const at = prefix.lastIndexOf('@')
  if (at < 0) return null
  const prev = at === 0 ? ' ' : prefix[at - 1]
  if (!/\s|[(\[{]/.test(prev)) return null
  const query = prefix.slice(at + 1)
  if (query.includes(' ') || query.includes('\n')) return null
  return { at, query: query.toLowerCase() }
}

export default function MessagesPage() {
  const { user, isDemo } = useDashboardUser()
  const [search, setSearch] = useState('')
  const [chatContacts, setChatContacts] = useState<{ id: string; name: string; handle: string }[]>([])
  const [allTenants, setAllTenants] = useState<{ id: string; name: string; handle: string }[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionStart, setMentionStart] = useState<number | null>(null)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [createChatOpen, setCreateChatOpen] = useState(false)
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [plusMenuOpen, setPlusMenuOpen] = useState(false)
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([])
  const [tenantSearch, setTenantSearch] = useState('')
  const [activeContactId, setActiveContactId] = useState<string | null>(null)
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({})
  const [sendAnimKey, setSendAnimKey] = useState(0)
  const [mutedChatIds, setMutedChatIds] = useState<string[]>([])

  useEffect(() => {
    if (isDemo) {
      // Demo: toon alleen contacten zodra er echte chat/ticketdata is.
      setChatContacts([])
      setAllTenants([])
      setTickets([])
      setDocuments([])
      return
    }
    if (!user?.id) {
      setChatContacts([])
      setAllTenants([])
      setTickets([])
      setDocuments([])
      return
    }

    Promise.all([leaseQueries.getByOwner(user.id), ticketQueries.getByOwner(user.id), documentQueries.getByOwner(user.id)])
      .then(([leases, ticketRows, docRows]) => {
        setTickets(ticketRows || [])
        setDocuments(docRows || [])
        const ticketUnitIds = new Set<string>(
          (ticketRows || [])
            .map((t: any) => t.unit_id as string | null)
            .filter((id): id is string => Boolean(id))
        )

        const unique = new Map<string, { id: string; name: string; handle: string }>()
        const allUnique = new Map<string, { id: string; name: string; handle: string }>()
        for (const l of leases || []) {
          const tenant = (l as any).tenants
          const unitId = (l as any).unit_id ?? (l as any).units?.id ?? null
          if (!tenant?.id || !tenant?.full_name) continue
          const tenantItem = {
            id: tenant.id,
            name: tenant.full_name,
            handle: tenant.email ? `@${String(tenant.email).split('@')[0]}` : '@huurder',
          }
          if (!allUnique.has(tenant.id)) {
            allUnique.set(tenant.id, tenantItem)
          }
          if (!unitId || !ticketUnitIds.has(unitId)) continue
          if (!unique.has(tenant.id)) {
            unique.set(tenant.id, tenantItem)
          }
        }
        setChatContacts(Array.from(unique.values()))
        setAllTenants(Array.from(allUnique.values()))
      })
      .catch(() => {
        setChatContacts([])
        setAllTenants([])
        setTickets([])
        setDocuments([])
      })
  }, [user?.id, isDemo])

  const filteredContacts = chatContacts.filter((c) =>
    (c.name + ' ' + c.handle).toLowerCase().includes(search.toLowerCase())
  )
  const activeContact = filteredContacts.find((c) => c.id === activeContactId) ?? chatContacts.find((c) => c.id === activeContactId) ?? null
  const activeMessages = activeContactId ? threads[activeContactId] ?? [] : []
  const topSuggestedPeople = allTenants.slice(0, 3)
  const tenantPickerList = allTenants.filter((t) =>
    (t.name + ' ' + t.handle).toLowerCase().includes(tenantSearch.toLowerCase())
  )

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
    for (const c of chatContacts.slice(0, 100)) {
      items.push({ id: `contact-${c.id}`, kind: 'contact', label: c.name, search: `${c.name} ${c.handle}`.toLowerCase() })
    }
    return items
  }, [tickets, documents, chatContacts])

  const mentionResults = useMemo(() => {
    const q = mentionQuery.trim()
    const filtered = q ? mentionItems.filter((i) => i.search.includes(q)) : mentionItems
    return filtered.slice(0, 8)
  }, [mentionItems, mentionQuery])

  useEffect(() => {
    if (!mentionOpen) return
    if (mentionIndex >= mentionResults.length) setMentionIndex(0)
  }, [mentionOpen, mentionIndex, mentionResults.length])

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

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

  const applyMention = (item: MentionItem) => {
    if (mentionStart == null) return
    const cursor = messageInputRef.current?.selectionStart ?? message.length
    const insert = `@${item.label} `
    const next = message.slice(0, mentionStart) + insert + message.slice(cursor)
    setMessage(next)
    setMentionOpen(false)
    setMentionStart(null)
    setMentionQuery('')
    setMentionIndex(0)
    requestAnimationFrame(() => {
      if (!messageInputRef.current) return
      const pos = mentionStart + insert.length
      messageInputRef.current.focus()
      messageInputRef.current.setSelectionRange(pos, pos)
    })

    if (item.kind === 'document' && item.sourceId) {
      setAttachments((prev) => {
        const already = prev.some((a) => a.source === 'mention-document' && a.documentId === item.sourceId)
        if (already) return prev
        return [
          ...prev,
          {
            id: `mention-doc-${item.sourceId}`,
            source: 'mention-document',
            name: item.label,
            documentId: item.sourceId,
          },
        ]
      })
    }
  }

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

  const toggleTenant = (id: string) => {
    setSelectedTenantIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    // Na selecteren direct leegmaken, zodat je meteen de volgende naam kunt typen.
    setTenantSearch('')
  }

  const handleChatDialogOpenChange = (open: boolean) => {
    setCreateChatOpen(open)
    if (!open) {
      setSelectedTenantIds([])
      setTenantSearch('')
    }
  }

  const handleGroupDialogOpenChange = (open: boolean) => {
    setCreateGroupOpen(open)
    if (!open) {
      setSelectedTenantIds([])
      setTenantSearch('')
    }
  }

  const sendMessage = () => {
    if (!activeContactId) return
    const text = message.trim()
    if (!text && attachments.length === 0) return
    setSendAnimKey((k) => k + 1)

    const outMsg: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      from: 'me',
      text,
      createdAt: new Date().toISOString(),
      attachments: attachments.map((a) => ({ ...a })),
    }
    setThreads((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] ?? []), outMsg],
    }))
    setMessage('')
    setMentionOpen(false)
    setMentionStart(null)
    setMentionQuery('')
    setMentionIndex(0)
    setAttachments([])

    // Kleine lokale echo zodat flow zichtbaar werkt vóór IM-koppeling.
    const replyTo = activeContactId
    setTimeout(() => {
      setThreads((prev) => {
        const hasThread = prev[replyTo]
        if (!hasThread) return prev
        const reply: ChatMessage = {
          id: `r-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          from: 'them',
          text: 'Top, ontvangen. We koppelen dit later aan het IM-systeem.',
          createdAt: new Date().toISOString(),
          attachments: [],
        }
        return {
          ...prev,
          [replyTo]: [...(prev[replyTo] ?? []), reply],
        }
      })
    }, 900)
  }

  const openOrCreateChatWithPerson = (person: { id: string; name: string; handle: string }) => {
    setChatContacts((prev) => {
      if (prev.some((c) => c.id === person.id)) return prev
      return [person, ...prev]
    })
    setThreads((prev) => ({ ...prev, [person.id]: prev[person.id] ?? [] }))
    setActiveContactId(person.id)
  }

  const startDirectChat = () => {
    if (selectedTenantIds.length === 0) return
    const tenantId = selectedTenantIds[0]
    const tenant = allTenants.find((t) => t.id === tenantId)
    if (!tenant) return

    setChatContacts((prev) => {
      if (prev.some((c) => c.id === tenant.id)) return prev
      return [tenant, ...prev]
    })
    setThreads((prev) => ({ ...prev, [tenant.id]: prev[tenant.id] ?? [] }))
    setActiveContactId(tenant.id)
    setCreateChatOpen(false)
    setSelectedTenantIds([])
    setTenantSearch('')
  }

  const startGroupChat = () => {
    if (selectedTenantIds.length < 2) return
    const members = allTenants.filter((t) => selectedTenantIds.includes(t.id))
    if (members.length < 2) return

    const groupId = `group-${Date.now()}`
    const groupName =
      members.length <= 3
        ? members.map((m) => m.name.split(' ')[0]).join(', ')
        : `${members[0].name.split(' ')[0]}, ${members[1].name.split(' ')[0]} +${members.length - 2}`
    const groupContact = { id: groupId, name: `Groep: ${groupName}`, handle: '@groep' }

    setChatContacts((prev) => [groupContact, ...prev])
    setThreads((prev) => ({ ...prev, [groupId]: prev[groupId] ?? [] }))
    setActiveContactId(groupId)
    setCreateGroupOpen(false)
    setSelectedTenantIds([])
    setTenantSearch('')
  }

  const removeActiveChat = () => {
    if (!activeContactId) return
    const removingId = activeContactId
    setThreads((prev) => {
      const next = { ...prev }
      delete next[removingId]
      return next
    })
    setChatContacts((prev) => prev.filter((c) => c.id !== removingId))
    setMutedChatIds((prev) => prev.filter((id) => id !== removingId))
    setActiveContactId(null)
  }

  const toggleMuteActiveChat = () => {
    if (!activeContactId) return
    setMutedChatIds((prev) =>
      prev.includes(activeContactId) ? prev.filter((id) => id !== activeContactId) : [...prev, activeContactId]
    )
  }

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 overflow-hidden">
      <SectionHeroHeader title="Communicatie" className="mb-0" />

      <div className="mt-4 flex min-h-0 flex-1 gap-4 overflow-hidden">
        {/* Linkerblok: type + lijst in één witte kaart */}
        <aside className="w-full max-w-[260px] md:max-w-[300px] lg:max-w-[340px] flex flex-col min-h-0 h-full">
          <div className="flex-1 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-sm flex flex-col min-h-0 pt-4 pb-3">
            {/* Zoekbalk */}
            <div className="mb-3 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Zoek huurders of gesprekken..."
                  className="pl-9 h-10 rounded-full bg-transparent border border-gray-200 dark:border-neutral-700 text-sm shadow-none"
                />
              </div>
            </div>

            {/* Chats-lijst (voor nu lege state / placeholder) */}
            <div className="flex-1 min-h-0 overflow-y-auto pb-16">
              {filteredContacts.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveContactId(c.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-left ${
                    activeContactId === c.id
                      ? 'bg-[#f4f4f4] dark:bg-neutral-800'
                      : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                        activeContactId === c.id
                          ? 'bg-[#163300] text-white dark:bg-[#9FE870] dark:text-[#163300]'
                          : 'bg-[#f4f4f4] dark:bg-neutral-800 text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {c.handle === '@groep' ? <UsersRound className="h-4 w-4" /> : getInitials(c.name)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#9FE870] border-2 border-white dark:border-neutral-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {c.handle}
                    </p>
                  </div>
                  {mutedChatIds.includes(c.id) && (
                    <BellOff className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                  )}
                  <ChevronRight className="h-4 w-4 text-[#163300]" />
                </button>
              ))}
              {filteredContacts.length === 0 && (
                <div className="h-full min-h-[220px] px-4 flex items-center justify-center">
                  <div className="text-center max-w-[220px]">
                    <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Geen gesprekken gevonden
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Pas je zoekopdracht aan of start een nieuw gesprek.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 pt-2 pb-1 flex justify-end">
              <DropdownMenu open={plusMenuOpen} onOpenChange={setPlusMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300]"
                    aria-label="Acties openen"
                  >
                    <Plus className={`h-4 w-4 transition-transform duration-200 ${plusMenuOpen ? 'rotate-90' : 'rotate-0'}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  sideOffset={10}
                  className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 min-w-[230px] p-1.5"
                >
                  <DropdownMenuItem className="rounded-lg">
                    <TicketPlus className="h-4 w-4 mr-2 text-[#163300]" />
                    Ticket aanmaken
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg" onSelect={() => setCreateChatOpen(true)}>
                    <Plus className="h-4 w-4 mr-2 text-[#163300]" />
                    Chat aanmaken
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg" onSelect={() => setCreateGroupOpen(true)}>
                    <UsersRound className="h-4 w-4 mr-2 text-[#163300]" />
                    Groep aanmaken
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Suggesties
                  </DropdownMenuLabel>
                  {topSuggestedPeople.length > 0 ? (
                    topSuggestedPeople.map((person) => (
                      <DropdownMenuItem
                        key={person.id}
                        className="rounded-lg"
                        onSelect={() => openOrCreateChatWithPerson(person)}
                      >
                        <UserPlus className="h-4 w-4 mr-2 text-[#163300]" />
                        {person.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled className="rounded-lg text-gray-400">
                      Geen suggesties beschikbaar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Rechterblok: chat interface */}
        <section
          className={`relative flex-1 h-full flex flex-col min-w-0 min-h-0 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-sm overflow-hidden ${
            dragActive ? 'ring-2 ring-[#9FE870] ring-offset-2 ring-offset-white dark:ring-offset-neutral-900' : ''
          }`}
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
          {activeContact && (
            <div className="px-4 pt-3 pb-2">
              <div className="px-1 py-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-[#f1f1f1] dark:bg-neutral-800 flex items-center justify-center text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {activeContact.handle === '@groep' ? <UsersRound className="h-4 w-4" /> : getInitials(activeContact.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activeContact.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activeContact.handle}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full bg-[#f1f1f1] hover:bg-[#e8e8e8] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#163300] dark:text-[#9FE870]"
                      aria-label="Chat opties"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 min-w-[220px] p-1.5"
                  >
                    <DropdownMenuItem className="rounded-lg" onSelect={toggleMuteActiveChat}>
                      <BellOff className="h-4 w-4 mr-2 text-[#163300]" />
                      {activeContactId && mutedChatIds.includes(activeContactId)
                        ? 'Notificaties inschakelen'
                        : 'Notificaties dempen'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">
                      <Archive className="h-4 w-4 mr-2 text-[#163300]" />
                      Chat archiveren
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="rounded-lg text-red-600 dark:text-red-400"
                      onSelect={removeActiveChat}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Chat verwijderen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
          {/* Chat body */}
          <div className="flex-1 min-h-0 px-6 py-4 overflow-y-auto">
            {!activeContact ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <MessageCircleMore className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <p className="text-gray-900 dark:text-white font-semibold mb-1">
                    Nog geen gesprek geselecteerd
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kies links een contact om een chat te starten en berichten te versturen.
                  </p>
                </div>
              </div>
            ) : activeMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <p className="text-[#163300] dark:text-[#9FE870] text-base font-semibold mb-1">
                    Start het gesprek met {activeContact.name}
                  </p>
                  <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                    Typ hieronder je eerste bericht.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2 border ${
                        m.from === 'me'
                          ? 'bg-[#163300] border-[#163300] text-white'
                          : 'bg-[#f4f4f4] dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      {m.text && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {renderMessageWithDocumentMentions(m.text, m.attachments)}
                        </p>
                      )}
                      {m.attachments.length > 0 && (
                        <div className={`mt-2 flex flex-wrap gap-1.5 ${m.text ? '' : 'mt-0'}`}>
                          {m.attachments.map((a) => (
                            <span
                              key={a.id}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700"
                            >
                              <FileText className="h-3 w-3" />
                              <span className="truncate max-w-[140px]">{a.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="px-4 py-3 relative">
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
            {attachments.length > 0 && (
              <div className="mb-2 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-[#f8f8f8] dark:bg-neutral-800 p-2 overflow-x-auto">
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
            {mentionOpen && mentionResults.length > 0 && (
              <div className="absolute left-4 right-16 bottom-16 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg p-1.5 z-20">
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
                      className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm ${
                        idx === mentionIndex
                          ? 'bg-[#f4f4f4] dark:bg-neutral-800 text-[#163300] dark:text-[#9FE870]'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-10 min-w-10 min-h-10 p-0 shrink-0 rounded-full border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Document toevoegen"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="relative flex-1 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700">
                <div className="absolute inset-0 px-4 py-2.5 text-sm whitespace-pre-wrap break-words pointer-events-none">
                  {renderComposerWithDocumentMentions(message, attachments)}
                </div>
                <Textarea
                  ref={messageInputRef}
                  placeholder=""
                  rows={1}
                  className="min-h-[40px] max-h-32 w-full resize-none rounded-2xl border-0 bg-transparent text-transparent caret-[#163300] dark:caret-[#9FE870] text-sm leading-5 px-4 py-2.5 relative z-10 overflow-y-auto"
                  value={message}
                  disabled={!activeContact}
                  onChange={(e) => {
                    const val = e.target.value
                    setMessage(val)
                    updateMentionState(val, e.target.selectionStart ?? val.length)
                    // Auto-grow textarea until max-h.
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
                    if (!activeContact) return
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
                      sendMessage()
                    }
                  }}
                />
              </div>
              <Button
                size="icon"
                className="size-10 min-w-10 min-h-10 p-0 shrink-0 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300]"
                disabled={!activeContact || (!message.trim() && attachments.length === 0)}
                onClick={sendMessage}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={sendAnimKey}
                    initial={{ x: -8, y: 8, opacity: 0, scale: 0.85 }}
                    animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 10, y: -10, opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
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

      <Dialog open={createChatOpen} onOpenChange={handleChatDialogOpenChange}>
        <DialogContent className="border-gray-200 dark:border-neutral-700 sm:max-w-xl max-h-[80vh] overflow-hidden flex flex-col [&>button]:inline-flex [&>button]:items-center [&>button]:justify-center [&>button]:p-0 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-full [&>button]:bg-gray-100 [&>button]:text-gray-600 [&>button]:opacity-100 [&>button:hover]:bg-gray-200 [&>button:hover]:text-gray-900 dark:[&>button]:bg-neutral-800 dark:[&>button]:text-gray-300 dark:[&>button:hover]:bg-neutral-700 dark:[&>button:hover]:text-white">
          <DialogHeader>
            <DialogTitle>Chat aanmaken</DialogTitle>
            <DialogDescription>Kies een of meerdere contacten uit je volledige huurderslijst.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 min-h-0 flex-1 flex flex-col">
            <Input
              value={tenantSearch}
              onChange={(e) => setTenantSearch(e.target.value)}
              placeholder="Zoek in huurders..."
              className="h-10 rounded-full"
            />
            <div className="h-64 overflow-y-auto rounded-2xl border border-gray-200 dark:border-neutral-700 p-2 space-y-1">
              {tenantPickerList.map((t) => (
                <label key={t.id} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 cursor-pointer">
                  <Checkbox
                    checked={selectedTenantIds.includes(t.id)}
                    onCheckedChange={() => toggleTenant(t.id)}
                  />
                  <span className="text-sm text-gray-900 dark:text-white">{t.name}</span>
                </label>
              ))}
              {tenantPickerList.length === 0 && (
                <p className="text-xs text-gray-500 px-2 py-2">Geen huurders gevonden.</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setCreateChatOpen(false)}
              className="h-9 rounded-full px-4 w-auto"
            >
              Annuleer
            </Button>
            <Button
              className="h-9 rounded-full px-4 w-auto bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F]"
              disabled={selectedTenantIds.length === 0}
              onClick={startDirectChat}
            >
              {selectedTenantIds.length > 1 ? 'Start groepschat' : 'Start chat'}
              {selectedTenantIds.length > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300] px-1 text-[11px] font-semibold text-white">
                  {selectedTenantIds.length}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createGroupOpen} onOpenChange={handleGroupDialogOpenChange}>
        <DialogContent className="border-gray-200 dark:border-neutral-700 sm:max-w-xl max-h-[80vh] overflow-hidden flex flex-col [&>button]:inline-flex [&>button]:items-center [&>button]:justify-center [&>button]:p-0 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-full [&>button]:bg-gray-100 [&>button]:text-gray-600 [&>button]:opacity-100 [&>button:hover]:bg-gray-200 [&>button:hover]:text-gray-900 dark:[&>button]:bg-neutral-800 dark:[&>button]:text-gray-300 dark:[&>button:hover]:bg-neutral-700 dark:[&>button:hover]:text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#163300] dark:text-[#9FE870]">Groep aanmaken</DialogTitle>
            <DialogDescription>Kies deelnemers uit je volledige contactenlijst.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 min-h-0 flex-1 flex flex-col">
            <Input
              value={tenantSearch}
              onChange={(e) => setTenantSearch(e.target.value)}
              placeholder="Zoek in huurders..."
              className="h-10 rounded-full"
            />
            <div className="h-64 overflow-y-auto rounded-2xl border border-gray-200 dark:border-neutral-700 p-2 space-y-1">
              {tenantPickerList.map((t) => (
                <label key={t.id} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 cursor-pointer">
                  <Checkbox
                    checked={selectedTenantIds.includes(t.id)}
                    onCheckedChange={() => toggleTenant(t.id)}
                  />
                  <span className="text-sm text-gray-900 dark:text-white">{t.name}</span>
                </label>
              ))}
              {tenantPickerList.length === 0 && (
                <p className="text-xs text-gray-500 px-2 py-2">Geen huurders gevonden.</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setCreateGroupOpen(false)}
              className="h-9 rounded-full px-4 w-auto text-sm"
            >
              Annuleer
            </Button>
            <Button
              className="h-9 rounded-full px-4 w-auto text-sm font-semibold bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F]"
              disabled={selectedTenantIds.length < 2}
              onClick={startGroupChat}
            >
              Start groepschat
              {selectedTenantIds.length > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300] px-1 text-[11px] font-semibold text-white">
                  {selectedTenantIds.length}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

