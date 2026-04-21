'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { TocItem } from '@/lib/blog/utils'

export function TableOfContents({ items, className }: { items: TocItem[]; className?: string }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (items.length === 0) return

    const headingIds = items.map((item) => item.id)

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '0px 0px -60% 0px',
        threshold: 0,
      }
    )

    headingIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  const handleClick = (id: string) => {
    setActiveId(id)
  }

  if (items.length === 0) return null

  return (
    <nav className={cn('rounded-xl border border-gray-200 bg-gray-50/50 p-4', className)} aria-label="Inhoudsopgave">
      <h3 className="text-sm font-semibold text-[#163300]">Inhoudsopgave</h3>
      <ul className="mt-3 space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.id
          return (
            <li
              key={item.id}
              className={item.level === 3 ? 'pl-4' : undefined}
            >
              <Link
                href={`#${item.id}`}
                onClick={() => handleClick(item.id)}
                className={cn(
                  'text-sm hover:text-[#163300] hover:underline transition-colors',
                  isActive
                    ? 'font-bold text-[#163300]'
                    : 'font-normal text-gray-600'
                )}
              >
                {item.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
