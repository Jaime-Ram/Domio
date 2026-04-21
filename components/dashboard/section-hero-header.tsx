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
  if (!description) return null
  return (
    <div className={cn('mb-6', className)}>
      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
        {description}
      </p>
    </div>
  )
}
