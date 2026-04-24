'use client'

import type { ElementType } from 'react'
import { cn } from '@/lib/utils'

export type TimelineEvent = {
  id: string
  icon: ElementType
  title: string
  actor?: string
  timestamp: Date | string
  /** Optional color override for the icon circle — defaults to brand green */
  variant?: 'default' | 'warning' | 'danger' | 'neutral'
}

const variantCls: Record<NonNullable<TimelineEvent['variant']>, { circle: string; icon: string }> = {
  default: { circle: 'bg-[#9FE870]/15 dark:bg-[#9FE870]/10', icon: 'text-[#163300] dark:text-[#9FE870]' },
  warning: { circle: 'bg-amber-50 dark:bg-amber-500/10',     icon: 'text-amber-600 dark:text-amber-400' },
  danger:  { circle: 'bg-red-50 dark:bg-red-500/10',         icon: 'text-red-600 dark:text-red-400' },
  neutral: { circle: 'bg-gray-100 dark:bg-neutral-800',      icon: 'text-gray-500 dark:text-gray-400' },
}

function formatRelative(ts: Date | string): string {
  const now = Date.now()
  const then = new Date(ts).getTime()
  const diff = Math.max(0, Math.floor((now - then) / 1000))

  if (diff < 60)        return `${diff} sec. geleden`
  if (diff < 3600)      return `${Math.floor(diff / 60)} min. geleden`
  if (diff < 86400)     return `${Math.floor(diff / 3600)} uur geleden`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} dagen geleden`

  return new Date(ts).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface ActivityTimelineProps {
  events: TimelineEvent[]
  className?: string
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  if (!events.length) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
        Nog geen activiteit
      </p>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Vertical connector line — runs from top of second icon to bottom of last */}
      <div
        className="absolute left-[19px] top-10 bottom-10 w-px bg-gray-100 dark:bg-neutral-800"
        aria-hidden
      />

      <ul className="space-y-0">
        {events.map((event, i) => {
          const Icon = event.icon
          const v = variantCls[event.variant ?? 'default']
          const isLast = i === events.length - 1

          return (
            <li key={event.id} className={cn('flex gap-4 relative', !isLast && 'pb-6')}>
              {/* Icon circle */}
              <div
                className={cn(
                  'h-10 w-10 shrink-0 rounded-full flex items-center justify-center z-10',
                  v.circle,
                )}
              >
                <Icon className={cn('h-4 w-4', v.icon)} />
              </div>

              {/* Content */}
              <div className="flex-1 flex justify-between gap-4 min-w-0 pt-1">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                    {event.title}
                  </p>
                  {event.actor && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{event.actor}</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0 pt-0.5 whitespace-nowrap">
                  {formatRelative(event.timestamp)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
