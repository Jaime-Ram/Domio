'use client'

import { cn } from '@/lib/utils'

interface SectionHeroHeaderProps {
  title: string
  description?: string
  className?: string
}

/**
 * Grote groene sectietitel + optionele beschrijving.
 * Zelfde stijl als SectionNavDashboard titleVariant="hero" voor pagina's zonder nav-pills.
 */
export function SectionHeroHeader({ title, description, className }: SectionHeroHeaderProps) {
  return (
    <div
      className={cn(
        // Lijn uit met tekst in Card/CardHeader (p-6); overschrijf met pl-0 o.a. bij Communicatie (twee kolommen).
        'mb-6 pl-6',
        className
      )}
    >
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#163300] dark:text-[#9FE870]">
          {title}
        </h1>
      </div>
      {description != null && description !== '' && (
        <p className="mt-1.5 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}
