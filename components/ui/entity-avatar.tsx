import { User, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Vaste regel voor tabellen/lijsten:
 *  - PersonAvatar   → rond (rounded-full) met persoon-icoon
 *  - BuildingAvatar → afgerond vierkant (rounded-xl) met gebouw-icoon
 *
 * Gebruik deze overal i.p.v. losse avatar-divs zodat het consistent blijft.
 */

const BASE = 'flex items-center justify-center shrink-0 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300'
const SIZE = { sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-10 w-10' } as const
const ICON = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' } as const

type Size = keyof typeof SIZE

export function PersonAvatar({ size = 'md', className }: { size?: Size; className?: string }) {
  return (
    <div className={cn(BASE, SIZE[size], 'rounded-full', className)}>
      <User className={ICON[size]} />
    </div>
  )
}

export function BuildingAvatar({ size = 'md', className }: { size?: Size; className?: string }) {
  return (
    <div className={cn(BASE, SIZE[size], 'rounded-xl', className)}>
      <Building2 className={ICON[size]} />
    </div>
  )
}
