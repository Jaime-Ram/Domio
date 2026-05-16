'use client'

import { cn } from '@/lib/utils'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogField } from '@/components/ui/dialog-field'

interface DialogDateFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  optional?: boolean
  min?: string
  max?: string
  placeholder?: string
  className?: string
}

export function DialogDateField({
  label,
  value,
  onChange,
  required,
  optional,
  min,
  max,
  placeholder,
  className,
}: DialogDateFieldProps) {
  return (
    <DialogField label={label} required={required} optional={optional} className={className}>
      <DatePicker value={value} onChange={onChange} min={min} max={max} placeholder={placeholder} />
    </DialogField>
  )
}
