import { cn } from '@/lib/utils'

export function GrayBlock({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#f4f4f4] dark:bg-neutral-800 rounded-2xl', className)}>
      {children}
    </div>
  )
}
