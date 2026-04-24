'use client'

import { cn } from '@/lib/utils'
import { WiseDatePicker } from '@/components/ui/wise-date-picker'

interface DialogDateFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  min?: string
  max?: string
  className?: string
}

export function DialogDateField({
  label,
  value,
  onChange,
  required,
  min,
  max,
  className,
}: DialogDateFieldProps) {
  return (
    <div className={cn('bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3', className)}>
      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">
        {label}{required && ' *'}
      </p>
      <WiseDatePicker
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        triggerClassName="w-full flex items-center justify-between bg-transparent p-0 text-sm font-medium text-gray-900 dark:text-white"
      />
    </div>
  )
}
