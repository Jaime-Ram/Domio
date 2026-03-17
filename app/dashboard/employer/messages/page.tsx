'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Users, Search, Send, ChevronRight } from 'lucide-react'
import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ChatType = 'individueel' | 'groepen'

export default function MessagesPage() {
  const [activeType, setActiveType] = useState<ChatType>('individueel')
  const [search, setSearch] = useState('')
  const tabsContainerRef = useRef<HTMLDivElement | null>(null)
  const individueelRef = useRef<HTMLButtonElement | null>(null)
  const groepenRef = useRef<HTMLButtonElement | null>(null)
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 })

  const contacts = [
    { id: '1', name: 'Yeong-Ja Pachamama', handle: '@yeongjap92' },
    { id: '2', name: 'Levana Hedvig', handle: '@levanah019' },
    { id: '3', name: 'Nikolas Lourdes', handle: '@nikolasl928' },
  ]

  const filteredContacts = contacts.filter((c) =>
    (c.name + ' ' + c.handle).toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  useEffect(() => {
    const container = tabsContainerRef.current
    if (!container) return
    const btn = activeType === 'individueel' ? individueelRef.current : groepenRef.current
    if (!btn) return
    const containerRect = container.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setTabIndicator({ left: btnRect.left - containerRect.left, width: btnRect.width })
  }, [activeType])

  return (
    <div className="flex flex-col h-full min-h-[500px] overflow-hidden">
      <SectionHeroHeader
        title="Communicatie"
        widgetMenu={
          <SectionWidgetMenu>
            <SectionWidgetMenuPlaceholder />
          </SectionWidgetMenu>
        }
      />

      <div className="flex-1 mt-4 flex gap-4 min-h-0 overflow-hidden">
        {/* Linkerblok: type + lijst in één witte kaart */}
        <aside className="w-full max-w-[260px] md:max-w-[300px] lg:max-w-[340px] flex flex-col">
          <div className="flex-1 h-full rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-sm flex flex-col min-h-0 pt-4 pb-3">
            {/* Segment-tabs: Individueel | Groepen (zelfde formaat als Objecten/Rechtspersonen) */}
          <div
            ref={tabsContainerRef}
            className="relative flex w-full text-sm border-b border-transparent dark:border-transparent mb-3 px-4"
          >
            <button
              type="button"
              ref={individueelRef}
              onClick={() => setActiveType('individueel')}
              className={cn(
                'pb-2 mr-6 text-left font-semibold transition-colors duration-200 whitespace-nowrap inline-flex items-center',
                activeType === 'individueel'
                  ? 'text-[#163300] dark:text-[#9FE870]'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <span>Individueel</span>
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/25 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]">
                0
              </span>
            </button>
            <button
              type="button"
              ref={groepenRef}
              onClick={() => setActiveType('groepen')}
              className={cn(
                'pb-2 text-left font-semibold transition-colors duration-200 whitespace-nowrap inline-flex items-center',
                activeType === 'groepen'
                  ? 'text-[#163300] dark:text-[#9FE870]'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <span>Groepen</span>
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/25 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]">
                0
              </span>
            </button>
            <div
              className="absolute bottom-0 h-[2px] rounded-full bg-[#163300] dark:bg-[#9FE870] transition-all duration-200"
              style={{ left: tabIndicator.left, width: tabIndicator.width }}
            />
          </div>

            {/* Zoekbalk (segmenten “chillen” erboven in dezelfde card) */}
            <div className="mb-3 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    activeType === 'individueel'
                      ? 'Zoek huurders of gesprekken...'
                      : 'Zoek groepen of gesprekken...'
                  }
                  className="pl-9 h-10 rounded-full bg-transparent border border-gray-200 dark:border-neutral-700 text-sm shadow-none"
                />
              </div>
            </div>

            {/* Chats-lijst (voor nu lege state / placeholder) */}
            <div className="flex-1 overflow-y-auto pb-3">
              {filteredContacts.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-[#f4f4f4] dark:bg-neutral-800 flex items-center justify-center text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {getInitials(c.name)}
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
                  <ChevronRight className="h-4 w-4 text-[#163300]" />
                </button>
              ))}
              {filteredContacts.length === 0 && (
                <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 px-3">
                  Geen gesprekken gevonden voor deze zoekopdracht.
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Rechterblok: chat interface */}
        <section className="flex-1 h-full flex flex-col min-w-0 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-sm overflow-hidden">
          {/* Chat header */}
          <div className="h-14 px-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-[#163300] text-white flex items-center justify-center text-sm font-semibold">
                <MessageSquare className="h-4 w-4" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex rounded-full text-xs px-3 py-1 h-8"
            >
              Nieuw gesprek
            </Button>
          </div>

          {/* Chat body */}
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <p className="text-gray-900 dark:text-white font-semibold mb-1">
                Nog geen gesprek geselecteerd
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gebruik de linkerkolom om een bestaand gesprek te openen, of start later een nieuw
                gesprek vanuit deze interface.
              </p>
            </div>
          </div>

          {/* Chat input (disabled placeholder) */}
          <div className="h-16 px-4 py-3 border-t border-gray-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 opacity-60 pointer-events-none">
              <Input
                disabled
                placeholder="Typ een bericht… (nog niet actief)"
                className="h-9 rounded-full bg-white dark:bg-neutral-900 border-0 text-sm"
              />
              <Button
                disabled
                size="icon"
                className="h-9 w-9 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

