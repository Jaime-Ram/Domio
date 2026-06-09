'use client'

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
   * 'underline' — tekst-tabs met groene onderstreep (navigatie onder titels).
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
  if (variant === 'underline') {
    return (
      <div className={cn('flex items-center border-b border-gray-100 dark:border-neutral-800', className)}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'mr-6 pb-2.5 -mb-px border-b-2 text-[13px] font-medium transition-colors whitespace-nowrap',
                active
                  ? 'border-[#163300] text-[#163300] dark:border-[#9FE870] dark:text-[#9FE870]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  'ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full text-[10px] font-medium px-1',
                  active
                    ? 'bg-[#163300]/10 text-[#163300] dark:bg-[#9FE870]/15 dark:text-[#9FE870]'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400',
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
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
              ? 'bg-[#9FE870] text-[#163300] dark:bg-[#9FE870] dark:text-[#163300]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800/50',
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full text-[10px] font-medium px-1',
              activeTab === tab.id
                ? 'bg-[#163300]/15 text-[#163300]'
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
