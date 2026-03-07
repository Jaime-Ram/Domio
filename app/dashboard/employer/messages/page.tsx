'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MessageSquare, Search, Send } from 'lucide-react'
import { conversations } from '@/lib/mock-data/domio-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'
import { SectionWidgetMenu } from '@/components/dashboard/section-widget-menu'
import { DropdownMenuWidgetCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu'

export default function MessagesPage() {
  const { isDemo } = useDashboardUser()
  const convos = isDemo ? conversations : []
  const [selectedId, setSelectedId] = useState<string | null>(convos[0]?.id ?? null)
  const [search, setSearch] = useState('')
  const [showMessages, setShowMessages] = useState(false)

  const filtered = convos.filter(
    (c) =>
      c.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  )
  const selected = convos.find((c) => c.id === selectedId)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px]">
      <SectionHeroHeader
        title="Berichten"
        description="Communicatie met huurders en partijen."
        widgetMenu={
          <SectionWidgetMenu>
            <DropdownMenuLabel>Widget selectie</DropdownMenuLabel>
            <DropdownMenuWidgetCheckboxItem checked={showMessages} onCheckedChange={() => setShowMessages((v) => !v)}>
              Berichtenoverzicht
            </DropdownMenuWidgetCheckboxItem>
          </SectionWidgetMenu>
        }
      />

      {showMessages && (
      <div className={cn('flex flex-1 min-h-0 overflow-hidden', dashboardCardClass(undefined, isDemo))}>
        {/* Conversation list */}
        <div className="w-80 sm:w-96 border-e border-gray-200 dark:border-neutral-700 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek conversaties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-full bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-600"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  'w-full text-left p-4 rounded-2xl transition-all mx-1 mb-1',
                  selectedId === c.id
                    ? 'bg-[#9FE870] text-[#163300]'
                    : 'hover:bg-gray-100 dark:hover:bg-neutral-800/80 text-gray-900 dark:text-white'
                )}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium truncate">{c.tenantName}</span>
                  <span className={cn('text-xs flex-shrink-0', selectedId === c.id ? 'text-[#163300]/80' : 'text-gray-500 dark:text-gray-400')}>{c.lastTime}</span>
                </div>
                <p className={cn('text-xs truncate mt-0.5', selectedId === c.id ? 'text-[#163300]/70' : 'text-gray-500 dark:text-gray-400')}>{c.address}</p>
                <p className={cn('text-sm truncate mt-1', selectedId === c.id ? 'text-[#163300]/90' : 'text-gray-600 dark:text-gray-300')}>{c.lastMessage}</p>
                {c.unread > 0 && (
                  <span className={cn(
                    'inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full',
                    selectedId === c.id ? 'bg-[#163300]/20 text-[#163300]' : 'bg-[#163300] text-white'
                  )}>
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
              <div className="p-4 border-b border-gray-200 dark:border-neutral-700 rounded-tr-[1.75rem] bg-gray-100 dark:bg-neutral-800">
                <h2 className="font-semibold text-gray-900 dark:text-white">{selected.tenantName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selected.address}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                        'max-w-[80%] rounded-2xl px-4 py-2.5',
                        m.sender === 'user'
                          ? 'bg-[#9FE870] text-[#163300]'
                          : 'rounded-2xl bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white border border-gray-200/80 dark:border-neutral-700'
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
                  <Input
                    placeholder="Typ een bericht..."
                    className="flex-1 rounded-full h-12 px-5 border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800"
                  />
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 border-0 shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-[#9FE870]/20 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-[#163300] dark:text-[#9FE870]" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Selecteer een conversatie</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Of start een nieuw gesprek met een huurder</p>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
