'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { TocItem } from '@/lib/blog/utils'

export function TableOfContents({ items, className }: { items: TocItem[]; className?: string }) {
  if (items.length === 0) return null
  return (
    <nav className={cn('rounded-xl border border-gray-200 bg-gray-50/50 p-4', className)} aria-label="Inhoudsopgave">
      <h3 className="text-sm font-semibold text-[#163300]">Inhoudsopgave</h3>
      <ul className="mt-3 space-y-1">
        {items.map((item) => (
          <li
            key={item.id}
            className={item.level === 3 ? 'pl-4' : undefined}
          >
            <Link
              href={`#${item.id}`}
              className="text-sm text-gray-600 hover:text-[#163300] hover:underline"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
