'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parse, isValid, getYear, getMonth } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const MONTH_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

interface WiseMonthPickerProps {
  /** `yyyy-MM` (eerste dag van de maand wordt intern afgeleid) */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  /** Kleinere trigger (bijv. dashboard-toolbar) */
  compact?: boolean
}

function parseMonthValue(value: string): Date | null {
  if (!value || value.length < 7) return null
  const d = parse(`${value}-01`, 'yyyy-MM-dd', new Date())
  return isValid(d) ? d : null
}

export function WiseMonthPicker({
  value,
  onChange,
  placeholder = 'Kies maand',
  className,
  compact = false,
}: WiseMonthPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseMonthValue(value)
  const [viewYear, setViewYear] = useState(() => (selected ? getYear(selected) : getYear(new Date())))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const d = parseMonthValue(value)
    if (d) setViewYear(getYear(d))
  }, [value])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const displayValue =
    selected && isValid(selected) ? format(selected, 'MMMM yyyy', { locale: nl }) : ''

  const handlePickMonth = (monthIndex: number) => {
    const d = new Date(viewYear, monthIndex, 1)
    onChange(format(d, 'yyyy-MM'))
    setOpen(false)
  }

  const isSelectedMonth = (monthIndex: number) => {
    if (!selected || !isValid(selected)) return false
    return getYear(selected) === viewYear && getMonth(selected) === monthIndex
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center justify-between border border-input bg-background text-left',
          'hover:border-[#163300] focus:outline-none focus:ring-2 focus:ring-[#163300]/30 transition-colors',
          compact
            ? 'rounded-full px-3 py-1.5 text-sm'
            : 'rounded-xl px-3 py-2 text-sm',
          !displayValue && 'text-muted-foreground',
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="truncate min-w-0">{displayValue || placeholder}</span>
        <svg className="h-4 w-4 text-gray-400 shrink-0 ml-2" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 1v3M11 1v3M1 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-[100] mt-1 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 p-4 w-[min(100vw-2rem,18rem)]',
            'left-0',
          )}
          role="dialog"
          aria-label="Kies maand en jaar"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Vorig jaar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-gray-900 dark:text-white text-sm tabular-nums">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Volgend jaar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {MONTH_SHORT.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => handlePickMonth(i)}
                className={cn(
                  'rounded-lg py-2 text-sm font-medium transition-colors',
                  isSelectedMonth(i)
                    ? 'bg-[#163300] text-white dark:bg-[#9FE870] dark:text-[#163300]'
                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
