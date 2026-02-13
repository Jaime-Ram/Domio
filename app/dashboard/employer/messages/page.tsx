'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MessageSquare, Search, Send } from 'lucide-react'
import { conversations } from '@/lib/mock-data/domio-dashboard'
import { cn } from '@/lib/utils'

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null)
  const [search, setSearch] = useState('')

  const filtered = conversations.filter(
    (c) =>
      c.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  )
  const selected = conversations.find((c) => c.id === selectedId)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px]">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Berichten</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Communicatie met huurders en partijen.</p>
      </div>

      <div className="flex flex-1 min-h-0 border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden">
        {/* Conversation list */}
        <div className="w-80 sm:w-96 border-e border-gray-200 dark:border-neutral-700 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-200 dark:border-neutral-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek conversaties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-gray-50 dark:bg-neutral-800"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  'w-full text-left p-4 border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors',
                  selectedId === c.id && 'bg-[#002A1F]/5 dark:bg-[#9AFF7C]/5 border-l-2 border-l-[#002A1F] dark:border-l-[#9AFF7C]'
                )}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-gray-900 dark:text-white truncate">{c.tenantName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{c.lastTime}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{c.address}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">{c.lastMessage}</p>
                {c.unread > 0 && (
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-[#002A1F] text-white rounded-full">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/30">
                <h2 className="font-semibold text-gray-900 dark:text-white">{selected.tenantName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selected.address}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selected.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'flex',
                      m.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2',
                        m.sender === 'user'
                          ? 'bg-[#002A1F] text-white dark:bg-[#9AFF7C] dark:text-[#002A1F]'
                          : 'bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white'
                      )}
                    >
                      <p className="text-sm">{m.text}</p>
                      <p className="text-xs opacity-80 mt-1">{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
                <div className="flex gap-2">
                  <Input placeholder="Typ een bericht..." className="flex-1" />
                  <Button size="icon" className="bg-[#002A1F] hover:bg-[#002A1F]/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecteer een conversatie</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
