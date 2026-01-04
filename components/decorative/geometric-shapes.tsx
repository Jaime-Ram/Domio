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
        {/* Single thick diagonal line from edge to edge */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-100" y="90" width="400" height="80" fill={color} />
        </g>
      </svg>
    ),
    'diagonal-stripes': (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Single very thick diagonal line from edge to edge */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-100" y="90" width="400" height="96" fill={color} />
        </g>
      </svg>
    ),
    corner: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Single thick diagonal line from edge to edge */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-100" y="90" width="400" height="80" fill={color} />
        </g>
      </svg>
    ),
    trapezoid: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Single very thick diagonal line from edge to edge */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-100" y="90" width="400" height="96" fill={color} />
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

