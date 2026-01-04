'use client'

import { cn } from '@/lib/utils'

interface GeometricShapesProps {
  variant?: 'rhombus' | 'diagonal-stripes' | 'corner' | 'trapezoid'
  className?: string
  color?: string
  opacity?: number
}

export function GeometricShapes({ 
  variant = 'rhombus', 
  className,
  color = '#002A1F',
  opacity = 0.1
}: GeometricShapesProps) {
  const baseClasses = "absolute pointer-events-none"
  
  // Consistent angle for all shapes (45 degrees diagonal)
  const angle = 45
  
  const variants = {
    rhombus: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Very thick diagonal line - extends extremely far beyond viewport so only middle section is visible */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-5000" y="40" width="10000" height="120" fill={color} />
        </g>
      </svg>
    ),
    'diagonal-stripes': (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Very thick diagonal line - extends extremely far beyond viewport so only middle section is visible */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-5000" y="32" width="10000" height="136" fill={color} />
        </g>
      </svg>
    ),
    corner: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Very thick diagonal line - extends extremely far beyond viewport so only middle section is visible */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-5000" y="40" width="10000" height="120" fill={color} />
        </g>
      </svg>
    ),
    trapezoid: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Very thick diagonal line - extends extremely far beyond viewport so only middle section is visible */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-5000" y="32" width="10000" height="136" fill={color} />
        </g>
      </svg>
    )
  }

  return (
    <div className={cn(baseClasses, className)}>
      {variants[variant]}
    </div>
  )
}

