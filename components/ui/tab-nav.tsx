'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type TabNavItem<T extends string = string> = {
  id: T
  label: string
  count?: number
}

interface TabNavProps<T extends string = string> {
  tabs: TabNavItem<T>[]
  activeTab: T
  onChange: (id: T) => void
  className?: string
  /**
   * 'pill'      — groen blok per actieve tab (uitschuif-menus).
   * 'underline' — tekst-tabs met meeschuivende groene onderstreep
   *               (navigatie onder titels — zelfde stijl als Taken).
   */
  variant?: 'pill' | 'underline'
}

export function TabNav<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'pill',
}: TabNavProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (variant !== 'underline') return
    const container = containerRef.current
    const btn = btnRefs.current[activeTab]
    if (!container || !btn) return
    const c = container.getBoundingClientRect()
    const b = btn.getBoundingClientRect()
    setIndicator({ left: b.left - c.left, width: b.width })
  }, [variant, activeTab, tabs])

  if (variant === 'underline') {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative flex items-center overflow-x-auto border-b border-gray-200 dark:border-neutral-700 text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className,
        )}
      >
        {tabs.map((tab, index) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              ref={(el) => { btnRefs.current[tab.id] = el }}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'shrink-0 pb-2 whitespace-nowrap font-semibold transition-colors duration-200',
                index < tabs.length - 1 ? 'mr-6' : '',
                active
                  ? 'text-[#15803D] dark:text-[#4ADE80]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  'ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-[11px] font-medium px-1',
                  active
                    ? 'bg-[#15803D]/15 text-[#15803D] dark:bg-[#4ADE80]/20 dark:text-[#4ADE80]'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400',
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
        <div
          className="absolute bottom-0 h-[2px] rounded-full bg-[#15803D] dark:bg-[#4ADE80] transition-all duration-200"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-[#94f477] text-[#161f13] dark:bg-[#94f477] dark:text-[#161f13]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800/50',
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full text-[10px] font-medium px-1',
              activeTab === tab.id
                ? 'bg-[#161f13]/15 text-[#161f13]'
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
