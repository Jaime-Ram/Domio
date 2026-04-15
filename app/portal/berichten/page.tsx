'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { MOCK_MESSAGES, MOCK_TENANT } from '@/lib/mock-data/portal'

export default function BerichtenPage() {
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, {
      id: `${Date.now()}`,
      from: 'tenant',
      name: MOCK_TENANT.name,
      text,
      date: new Date().toISOString(),
    }])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-5rem)]">
      <div className="pt-2 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Berichten</h1>
        <p className="text-sm text-gray-500 mt-0.5">Communiceer met {MOCK_TENANT.landlordName}</p>
      </div>

      {/* Berichtenlijst */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.map((msg) => {
          const isMe = msg.from === 'tenant'
          return (
            <div key={msg.id} className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3',
                isMe
                  ? 'bg-[#163300] text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm'
              )}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 mx-1">
                {format(new Date(msg.date), 'd MMM · HH:mm', { locale: nl })}
              </p>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-gray-100 flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Stuur een bericht..."
          rows={2}
          className="resize-none rounded-2xl border-gray-200 flex-1 text-sm"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim()}
          className="rounded-2xl h-[4.5rem] w-11 p-0 bg-[#163300] hover:bg-[#163300]/90 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
