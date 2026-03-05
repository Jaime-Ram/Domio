'use client'

import Link from 'next/link'
import { ChevronDown, ArrowUpRight } from 'lucide-react'

export interface FunctieItem {
  title: string
  description: string
  demoHref: string
}

interface FunctiesShowMoreProps {
  title: string
  subtitle: string
  items: FunctieItem[]
}

export function FunctiesShowMore({ title, subtitle, items }: FunctiesShowMoreProps) {
  return (
    <div>
      <h3 className="text-4xl font-bold tracking-tight text-[#163300] sm:text-5xl md:text-6xl">
        {title}
      </h3>
      <p className="mt-2 text-lg font-medium text-pretty text-gray-600 sm:text-xl leading-8">
        {subtitle}
      </p>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <details
            key={item.title}
            className="group border border-gray-200 dark:border-neutral-700 rounded-xl p-6 hover:border-[#163300]/50 transition-colors bg-white dark:bg-neutral-900"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                {item.title}
              </h4>
              <ChevronDown className="shrink-0 size-5 text-gray-500 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {item.description}
              </p>
              <Link
                href={item.demoHref}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#163300] hover:underline underline-offset-2"
              >
                Bekijk in demo
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
