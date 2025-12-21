import React from 'react'
import { cn } from '@/lib/utils'

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number
    dataKey?: string
    color?: string
    payload?: any
  }>
  label?: string | Date | number
  formatter?: (value: number, name?: string) => string | [string, string]
  labelFormatter?: (label: string | Date | number) => string
  className?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const formattedLabel = labelFormatter && label
    ? labelFormatter(label)
    : label instanceof Date
    ? label.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })
    : String(label)

  return (
    <div
      className={cn(
        'rounded-lg border bg-white dark:bg-gray-900 px-3 py-2 shadow-lg',
        className
      )}
    >
      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {formattedLabel}
      </div>
      {payload.map((entry, index) => {
        const value = entry.value ?? 0
        let formattedValue: string
        let displayName: string = entry.name || entry.dataKey || 'Value'
        
        if (formatter) {
          const formatted = formatter(value, displayName)
          if (Array.isArray(formatted)) {
            formattedValue = formatted[0]
            displayName = formatted[1] || displayName
          } else {
            formattedValue = formatted
          }
        } else {
          formattedValue = value.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
        
        return (
          <div
            key={index}
            className="text-xs text-gray-600 dark:text-gray-400"
            style={{ color: entry.color }}
          >
            <span className="font-medium">{displayName}:</span>{' '}
            <span className="amount" data-amount>{formattedValue}</span>
          </div>
        )
      })}
    </div>
  )
}

interface ChartLegendContentProps {
  payload?: Array<{
    value?: string
    color?: string
  }>
  className?: string
}

export function ChartLegendContent({ payload, className }: ChartLegendContentProps) {
  if (!payload || payload.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

