'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface WiseDatePickerProps {
  value: string        // ISO date string "yyyy-MM-dd"
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const WEEKDAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
const WEEKEND_INDICES = [5, 6] // Za, Zo

export function WiseDatePicker({ value, onChange, placeholder = 'Kies datum', className }: WiseDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (value) {
      const d = parse(value, 'yyyy-MM-dd', new Date())
      if (isValid(d)) return startOfMonth(d)
    }
    return startOfMonth(new Date())
  })
  const ref = useRef<HTMLDivElement>(null)

  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : null

  // Sync viewDate when value changes externally
  useEffect(() => {
    if (value) {
      const d = parse(value, 'yyyy-MM-dd', new Date())
      if (isValid(d)) setViewDate(startOfMonth(d))
    }
  }, [value])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Build calendar grid (Mon-start)
  const firstDay = startOfMonth(viewDate)
  const lastDay = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })

  // getDay returns 0=Sun,1=Mon,...,6=Sat → shift so Mon=0
  const startOffset = (getDay(firstDay) + 6) % 7

  const handleSelect = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const displayValue = selected && isValid(selected)
    ? format(selected, 'd MMM yyyy', { locale: nl })
    : ''

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border border-input bg-background',
          'hover:border-[#163300] focus:outline-none focus:ring-2 focus:ring-[#163300]/30 transition-colors',
          !displayValue && 'text-muted-foreground'
        )}
      >
        <span>{displayValue || placeholder}</span>
        <svg className="h-4 w-4 text-gray-400 shrink-0" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 1v3M11 1v3M1 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 p-4 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewDate(d => subMonths(d, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {format(viewDate, 'MMMM yyyy', { locale: nl })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(d => addMonths(d, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((wd, i) => (
              <div
                key={wd}
                className={cn(
                  'text-center text-xs font-semibold py-1',
                  WEEKEND_INDICES.includes(i)
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-700 dark:text-gray-200'
                )}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {/* Empty offset cells */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`offset-${i}`} />
            ))}

            {days.map((day) => {
              const dayOfWeek = (getDay(day) + 6) % 7 // Mon=0
              const isWeekend = dayOfWeek >= 5
              const isSelected = selected ? isSameDay(day, selected) : false
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    'relative flex items-center justify-center h-9 w-9 mx-auto rounded-full text-sm transition-colors',
                    isSelected
                      ? 'bg-[#163300] text-white font-semibold'
                      : isToday
                      ? 'border border-[#163300] text-[#163300] dark:text-[#8bc34a] font-medium hover:bg-gray-100 dark:hover:bg-neutral-800'
                      : isWeekend
                      ? 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  )}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
