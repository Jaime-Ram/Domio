import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ACTION_LIST_ROW_HOVER =
  'hover:bg-gray-50 dark:hover:bg-neutral-800/40 rounded-xl -mx-2 px-2'

export const ACTION_LIST_ROW_HOVER_DANGER =
  'hover:bg-red-50/50 dark:hover:bg-red-900/10 rounded-xl -mx-2 px-2'

export function ActionListSection({
  title,
  children,
  className,
  danger = false,
}: {
  title: string
  children: React.ReactNode
  className?: string
  danger?: boolean
}) {
  return (
    <div className={className}>
      <p className={cn(
        'text-sm font-medium mb-3',
        danger ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
      )}>
        {title}
      </p>
      <div className={cn(
        'border-b mb-0',
        danger ? 'border-red-100 dark:border-red-900/40' : 'border-gray-100 dark:border-neutral-800'
      )} />
      <div>{children}</div>
    </div>
  )
}

export function ActionListRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
  chevronRotated = false,
  danger = false,
  slim = false,
  right,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  onClick?: () => void
  chevronRotated?: boolean
  danger?: boolean
  slim?: boolean
  right?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('w-full', className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full flex items-center transition-colors text-left',
          slim ? 'gap-3 py-2.5' : 'gap-4 py-4',
          danger ? ACTION_LIST_ROW_HOVER_DANGER : ACTION_LIST_ROW_HOVER,
        )}
      >
        <div className={cn(
          'rounded-full flex items-center justify-center shrink-0',
          slim ? 'h-8 w-8' : 'h-10 w-10',
          danger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-neutral-800'
        )}>
          <Icon className={cn(
            slim ? 'h-3.5 w-3.5' : 'h-5 w-5',
            danger ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium truncate',
            slim ? 'text-sm' : 'text-sm font-semibold',
            danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
          )}>
            {title}
          </p>
          {subtitle && (
            <p className={cn(
              'text-gray-500 dark:text-gray-400 truncate',
              slim ? 'text-xs' : 'text-sm'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {right ?? (
          <ChevronRight className={cn(
            'shrink-0 transition-transform',
            slim ? 'h-3.5 w-3.5' : 'h-4 w-4',
            danger ? 'text-red-400' : 'text-gray-400 dark:text-gray-500',
            chevronRotated && 'rotate-90'
          )} />
        )}
      </button>
      {children}
    </div>
  )
}
