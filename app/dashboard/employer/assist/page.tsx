'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import {
  Sparkles, Send, User, RotateCcw, Copy, Check,
  Building2, AlertTriangle, CreditCard, Wrench, FileText, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_PROMPTS = [
  { icon: Building2, label: 'Portfolio overzicht', prompt: 'Geef me een overzicht van mijn portefeuille.' },
  { icon: AlertTriangle, label: 'Compliance status', prompt: 'Wat is de huidige compliance status van mijn objecten?' },
  { icon: Wrench, label: 'Open tickets', prompt: 'Hoeveel open onderhoudsticktes heb ik op dit moment?' },
  { icon: CreditCard, label: 'Betalingsoverzicht', prompt: 'Wat zijn de betalingen van deze maand?' },
  { icon: Users, label: 'Huurder opzoeken', prompt: 'Zoek de huurder op van Keizersgracht 12.' },
  { icon: FileText, label: 'Rapportage', prompt: 'Maak een samenvatting van mijn portefeuille voor deze maand.' },
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

function MarkdownText({ content }: { content: string }) {
  const parts = content.split('\n')
  return (
    <div className="space-y-1.5">
      {parts.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        // Bold markers
        const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Bullet
        if (line.startsWith('•')) {
          return (
            <p key={i} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#163300] dark:bg-[#9FE870] shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: rendered.slice(1).trim() }} />
            </p>
          )
        }
        return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: rendered }} />
      })}
    </div>
  )
}

export default function AssistPage() {
  const { profile, isDemo } = useDashboardUser()
  const firstName = profile?.full_name?.split(' ')[0] || 'daar'
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600))

    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: isDemo ? getResponse(trimmed) : 'Domio Assist is beschikbaar in demo-modus. Activeer je account om AI-acties in te schakelen.',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])
    setIsTyping(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full min-h-0" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="h-10 w-10 rounded-2xl bg-[#163300] dark:bg-[#9FE870]/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-[#9FE870] dark:text-[#9FE870]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#163300] dark:text-[#9FE870] leading-tight">Domio Assist</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">AI-assistent voor je portefeuille</p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages([])}
            className="ml-auto rounded-full text-gray-400 hover:text-gray-600 h-8 px-3 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Nieuw gesprek
          </Button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto min-h-0 rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800/60">
        {isEmpty ? (
          /* Welcome state */
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <div className="h-16 w-16 rounded-3xl bg-[#163300] dark:bg-[#9FE870]/20 flex items-center justify-center mb-5">
              <Sparkles className="h-8 w-8 text-[#9FE870]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Hoi {firstName}, hoe kan ik helpen?
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 max-w-sm">
              Stel me een vraag over je portefeuille, huurders, compliance of financiën.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((s) => {
                const Icon = s.icon
                return (
                  <button
                    key={s.label}
                    onClick={() => sendMessage(s.prompt)}
                    className="flex items-center gap-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 px-3 py-2.5 text-left hover:border-[#163300]/20 dark:hover:border-[#9FE870]/20 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-gray-400 group-hover:text-[#163300] dark:group-hover:text-[#9FE870] shrink-0 transition-colors" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Message thread */
          <div className="px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-xl bg-[#163300] dark:bg-[#9FE870]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4 text-[#9FE870]" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[78%] rounded-2xl px-4 py-3 relative group',
                  msg.role === 'user'
                    ? 'bg-[#163300] dark:bg-[#163300] text-white rounded-tr-sm'
                    : 'bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 text-gray-900 dark:text-white rounded-tl-sm'
                )}>
                  {msg.role === 'assistant' ? (
                    <MarkdownText content={msg.content} />
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700"
                    >
                      {copiedId === msg.id
                        ? <Check className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
                        : <Copy className="h-3.5 w-3.5 text-gray-400" />
                      }
                    </button>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-xl bg-gray-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-xl bg-[#163300] dark:bg-[#9FE870]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4 text-[#9FE870]" />
                </div>
                <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 mt-3">
        <div className="flex items-end gap-3 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 focus-within:border-[#163300]/40 dark:focus-within:border-[#9FE870]/30 transition-colors">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Stel een vraag over je portefeuille…"
            rows={1}
            className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 text-sm bg-transparent p-0 min-h-[24px] max-h-[120px] overflow-y-auto"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            size="sm"
            className="rounded-xl h-8 w-8 p-0 bg-[#163300] hover:bg-[#356258] text-white disabled:opacity-30 shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-gray-300 dark:text-neutral-600 mt-2">
          Domio Assist kan fouten maken. Controleer belangrijke informatie altijd zelf.
        </p>
      </div>
    </div>
  )
}
