'use client'

import { useState } from 'react'
import type { ElementType } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TimelineMeta = {
  label: string
  value: string
  /** Highlight the value (e.g. for amounts or statuses) */
  highlight?: boolean
}

export type TimelineAttachment = {
  label: string
  href: string
}

export type TimelineEvent = {
  id: string
  icon: ElementType
  title: string
  actor?: string
  timestamp: Date | string
  variant?: 'default' | 'warning' | 'danger' | 'neutral'
  /** Structured key-value details */
  meta?: TimelineMeta[]
  /** Downloadable files / attachments */
  attachments?: TimelineAttachment[]
  /** Link naar relevant onderdeel van de software */
  href?: string
  /** Label voor de link — default "Bekijken" */
  hrefLabel?: string
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
  const [openId, setOpenId] = useState<string | null>(null)

  if (!events.length) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
        Nog geen activiteit
      </p>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className="absolute left-[19px] top-10 bottom-10 w-px bg-gray-100 dark:bg-neutral-800"
        aria-hidden
      />

      <ul className="space-y-0">
        {events.map((event, i) => {
          const Icon = event.icon
          const isLast = i === events.length - 1
          const isOpen = openId === event.id
          const hasExpand = !!(event.meta?.length || event.attachments?.length || event.href)

          return (
            <li key={event.id} className={cn('relative', !isLast && 'pb-6')}>
              <button
                type="button"
                onClick={() => hasExpand && setOpenId(isOpen ? null : event.id)}
                className={cn(
                  'w-full flex items-center gap-4 text-left group rounded-xl transition-colors',
                  hasExpand ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50 -mx-2 px-2 py-2' : 'cursor-default',
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'h-10 w-10 shrink-0 rounded-full flex items-center justify-center z-10 transition-colors',
                  'bg-gray-100 dark:bg-neutral-800',
                  hasExpand && 'group-hover:bg-[#163300] dark:group-hover:bg-[#163300]',
                )}>
                  <Icon className={cn(
                    'h-4 w-4 text-gray-500 dark:text-gray-400 transition-colors',
                    hasExpand && 'group-hover:text-white',
                  )} />
                </div>

                {/* Content row */}
                <div className="flex-1 flex justify-between gap-4 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                      {event.title}
                    </p>
                    {event.actor && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{event.actor}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {formatRelative(event.timestamp)}
                    </p>
                    {hasExpand && (
                      <ChevronDown className={cn(
                        'h-3.5 w-3.5 text-gray-300 dark:text-gray-600 transition-transform mt-px',
                        isOpen && 'rotate-180',
                      )} />
                    )}
                  </div>
                </div>
              </button>

              {/* Uitklap detail */}
              {hasExpand && isOpen && (
                <div className="ml-14 mt-2 mb-2 space-y-3">
                  {/* Meta rows */}
                  {event.meta && event.meta.length > 0 && (
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {event.meta.map((m) => (
                        <div key={m.label}>
                          <dt className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">
                            {m.label}
                          </dt>
                          <dd className={cn(
                            'text-sm font-semibold',
                            m.highlight
                              ? 'text-[#163300] dark:text-[#9FE870]'
                              : 'text-gray-800 dark:text-gray-200',
                          )}>
                            {m.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {/* Attachments */}
                  {event.attachments && event.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {event.attachments.map((a) => (
                        <a
                          key={a.href}
                          href={a.href}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          {a.label}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Nav link */}
                  {event.href && (
                    <Link
                      href={event.href}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#163300] dark:text-[#9FE870] hover:underline underline-offset-2"
                    >
                      {event.hrefLabel ?? 'Bekijken'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
