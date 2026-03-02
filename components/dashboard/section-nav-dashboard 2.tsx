'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SectionNavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface SectionNavDashboardProps {
  title: string
  items: SectionNavItem[]
  className?: string
}

export function SectionNavDashboard({ title, items, className }: SectionNavDashboardProps) {
  const pathname = usePathname()

  // Alleen het meest specifieke (langste) overeenkomende item actief
  const activeHref = items
    .filter((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    <div className={cn('mb-8', className)}>
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
        {title} — kies een onderdeel
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const Icon = item.icon || FileText
          const active = item.href === activeHref
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                active
                  ? 'bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 shadow-sm'
                  : 'bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:border-gray-300 dark:hover:border-neutral-500'
              )}
            >
              <Icon className="size-4 shrink-0 text-current" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
