'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
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
}

export function TabNav<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className,
}: TabNavProps<T>) {
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const labelRefs = useRef<Map<string, HTMLSpanElement>>(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const setBtnRef = useCallback((id: string) => (el: HTMLButtonElement | null) => {
    if (el) btnRefs.current.set(id, el)
    else btnRefs.current.delete(id)
  }, [])

  const setLabelRef = useCallback((id: string) => (el: HTMLSpanElement | null) => {
    if (el) labelRefs.current.set(id, el)
    else labelRefs.current.delete(id)
  }, [])

  useEffect(() => {
    const btn = btnRefs.current.get(activeTab)
    const label = labelRefs.current.get(activeTab)
    if (!btn || !label) return
    // offsetLeft: integer px position of button relative to the container (position:relative)
    // offsetWidth: integer px width of the label text span only
    setIndicator({ left: btn.offsetLeft, width: label.offsetWidth })
  }, [activeTab, tabs])

  return (
    <div
      className={cn(
        'relative inline-flex text-sm border-b border-gray-200 dark:border-neutral-700',
        className,
      )}
    >
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={setBtnRef(tab.id)}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'pb-2 font-semibold transition-colors duration-200 whitespace-nowrap',
            i < tabs.length - 1 && 'mr-6',
            activeTab === tab.id
              ? 'text-[#15803D] dark:text-[#4ADE80]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          )}
        >
          <span ref={setLabelRef(tab.id)} className="inline-block">{tab.label}</span>
          {tab.count !== undefined && (
            <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#15803D]/15 text-[11px] font-medium text-[#15803D] dark:bg-[#4ADE80]/20 dark:text-[#4ADE80] px-1">
              {tab.count}
            </span>
          )}
        </button>
      ))}

      {/* Animated underline indicator */}
      <div
        className="absolute bottom-0 h-[2px] rounded-full bg-[#15803D] dark:bg-[#4ADE80] transition-all duration-200"
        style={{ left: indicator.left, width: indicator.width }}
      />
    </div>
  )
}
