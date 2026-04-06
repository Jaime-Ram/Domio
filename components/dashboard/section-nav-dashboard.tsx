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
  /** Grote groene titel, geen "kies een onderdeel" */
  titleVariant?: 'default' | 'hero'
  /** Optionele actions rechts van de paginatitel */
  widgetMenu?: React.ReactNode
}

export function SectionNavDashboard({
  title,
  items,
  className,
  titleVariant = 'default',
  widgetMenu,
}: SectionNavDashboardProps) {
  const pathname = usePathname()

  // Alleen het meest specifieke (langste) overeenkomende item actief
  const activeHref = items
    .filter((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    <div className={cn('mb-8', className)}>
      {titleVariant === 'hero' ? (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#163300] dark:text-[#9FE870]">
            {title}
          </h1>
          {widgetMenu}
        </div>
      ) : (
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          {title} — kies een onderdeel
        </h2>
      )}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const Icon = item.icon || FileText
          const active = item.href === activeHref
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 px-[1.125rem] py-2 rounded-full text-sm font-medium transition-all',
                active
                  ? 'bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90'
                  : 'bg-[#f4f4f4] dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-[#eaeaea] dark:hover:bg-neutral-600'
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
