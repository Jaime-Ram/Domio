'use client'

import { useState, useEffect } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isBefore, isAfter } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value: string        // ISO date string "yyyy-MM-dd"
  onChange: (value: string) => void
  placeholder?: string
  min?: string         // ISO date string "yyyy-MM-dd"
  max?: string         // ISO date string "yyyy-MM-dd"
  /** Override the trigger button's className entirely */
  triggerClassName?: string
  className?: string
}

const WEEKDAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
const WEEKEND_INDICES = [5, 6]

export function DatePicker({ value, onChange, placeholder = 'Kies datum', min, max, triggerClassName, className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (value) {
      const d = parse(value, 'yyyy-MM-dd', new Date())
      if (isValid(d)) return startOfMonth(d)
    }
    return startOfMonth(new Date())
  })

  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : null
  const minDate = min ? parse(min, 'yyyy-MM-dd', new Date()) : null
  const maxDate = max ? parse(max, 'yyyy-MM-dd', new Date()) : null

  useEffect(() => {
    if (value) {
      const d = parse(value, 'yyyy-MM-dd', new Date())
      if (isValid(d)) setViewDate(startOfMonth(d))
    }
  }, [value])

  const firstDay = startOfMonth(viewDate)
  const lastDay = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startOffset = (getDay(firstDay) + 6) % 7

  const isDisabled = (day: Date) => {
    if (minDate && isValid(minDate) && isBefore(day, minDate)) return true
    if (maxDate && isValid(maxDate) && isAfter(day, maxDate)) return true
    return false
  }

  const prevMonth = subMonths(viewDate, 1)
  const canGoPrev = !minDate || !isAfter(startOfMonth(minDate), startOfMonth(prevMonth))
  const nextMonth = addMonths(viewDate, 1)
  const canGoNext = !maxDate || !isBefore(startOfMonth(maxDate), startOfMonth(nextMonth))

  const handleSelect = (day: Date) => {
    if (isDisabled(day)) return
    onChange(format(day, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const displayValue = selected && isValid(selected)
    ? format(selected, 'd MMM yyyy', { locale: nl })
    : ''

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={triggerClassName ?? cn(
            'w-full h-10 flex items-center justify-between rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm text-gray-900 dark:text-white transition-colors',
            !displayValue && 'text-gray-400 dark:text-neutral-500',
            className
          )}
        >
          <span className={cn(!displayValue && 'text-gray-400 dark:text-neutral-500')}>
            {displayValue || placeholder}
          </span>
          <CalendarDays className="h-4 w-4 text-gray-400 dark:text-neutral-500 shrink-0" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={8}
          align="start"
          className="z-[9999] bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 p-4 w-72 outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewDate(d => subMonths(d, 1))}
              disabled={!canGoPrev}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-gray-900 dark:text-white text-sm capitalize">
              {format(viewDate, 'MMMM yyyy', { locale: nl })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(d => addMonths(d, 1))}
              disabled={!canGoNext}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`offset-${i}`} />
            ))}
            {days.map((day) => {
              const dayOfWeek = (getDay(day) + 6) % 7
              const isWeekend = dayOfWeek >= 5
              const isSelected = selected ? isSameDay(day, selected) : false
              const isToday = isSameDay(day, new Date())
              const disabled = isDisabled(day)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  disabled={disabled}
                  className={cn(
                    'relative flex items-center justify-center h-9 w-9 mx-auto rounded-full text-sm transition-colors',
                    disabled
                      ? 'text-gray-300 dark:text-neutral-700 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#163300] text-white font-semibold'
                      : isToday
                      ? 'border border-[#163300] text-[#163300] dark:border-[#9FE870] dark:text-[#9FE870] font-medium hover:bg-gray-100 dark:hover:bg-neutral-800'
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
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
