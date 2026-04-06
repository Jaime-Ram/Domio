'use client'

import { cn } from '@/lib/utils'

export function SectionWidgetMenu({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('ml-auto flex items-center gap-2', className)}>
      {children}
    </div>
  )
}

export function SectionWidgetMenuPlaceholder({
  className,
}: {
  className?: string
}) {
  return <div className={cn('hidden h-9 w-9 rounded-full md:block', className)} aria-hidden />
}
