'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DialogFieldProps {
  label?: string
  optional?: boolean
  required?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Standaard veldwrapper voor dialoogformulieren.
 * Gebruik: <DialogField label="Naam"><Input className="rounded-xl" /></DialogField>
 */
export function DialogField({ label, optional, required, className, children }: DialogFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
          {required && <span className="text-gray-400 dark:text-gray-500 ml-0.5"> *</span>}
          {optional && <span className="font-normal text-gray-400 dark:text-gray-500 ml-1">(optioneel)</span>}
        </p>
      )}
      {children}
    </div>
  )
}
