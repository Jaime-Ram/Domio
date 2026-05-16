'use client'

import { Search, Paperclip, Store, Folder, Layers, FileStack } from 'lucide-react'

const QUICK_ACTIONS = [
  { icon: Store, label: 'Portfolio' },
  { icon: Folder, label: 'Compliance' },
  { icon: Layers, label: 'Tickets' },
  { icon: FileStack, label: 'Betalingen' },
]

export default function AssistPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4">
      <div className="w-full max-w-3xl flex flex-col items-center">

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl text-[#163300] dark:text-[#9FE870] leading-tight tracking-tight flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0">
            <span className="font-bold">Domio</span>
            <span className="font-normal">Assist</span>
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5">
            Binnenkort beschikbaar
          </p>
        </div>

        {/* Disabled bar */}
        <div className="w-full">
          <div className="flex items-center gap-2 opacity-50 cursor-not-allowed pointer-events-none select-none">
            {/* Clip / attachment button */}
            <div className="size-10 shrink-0 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <Paperclip className="h-4 w-4 text-gray-400" />
            </div>

            {/* Input field */}
            <div className="relative flex-1 min-h-[40px] rounded-3xl bg-white/85 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200/90 dark:border-neutral-600 shadow-sm">
              <Search className="absolute left-3.5 top-[13px] h-4 w-4 text-gray-400" />
              <div className="pl-10 pr-4 py-2.5 text-sm text-gray-400 dark:text-gray-500">
                Typ hier je bericht…
              </div>
            </div>

            {/* Quick action circles */}
            {QUICK_ACTIONS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="size-10 shrink-0 rounded-full flex items-center justify-center bg-[#9FE870] text-[#163300] shadow-sm"
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
            ))}
          </div>

          <p className="text-center text-[10px] text-gray-300 dark:text-neutral-600 mt-2 max-w-3xl">
            Domio Assist kan fouten maken. Controleer belangrijke informatie altijd zelf.
          </p>
        </div>

      </div>
    </div>
  )
}
