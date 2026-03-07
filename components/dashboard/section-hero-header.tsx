'use client'

import { cn } from '@/lib/utils'

interface SectionHeroHeaderProps {
  title: string
  description?: string
  widgetMenu?: React.ReactNode
  className?: string
}

/**
 * Grote groene sectietitel + optionele beschrijving en widget-menu (drie puntjes).
 * Zelfde stijl als SectionNavDashboard titleVariant="hero" voor pagina's zonder nav-pills.
 */
export function SectionHeroHeader({ title, description, widgetMenu, className }: SectionHeroHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 mb-6', className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#163300] dark:text-[#9FE870]">
          {title}
        </h1>
        {description != null && description !== '' && (
          <p className="mt-1.5 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {description}
          </p>
        )}
      </div>
      {widgetMenu}
    </div>
  )
}
