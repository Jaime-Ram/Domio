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
      <svg viewBox="0 0 1000 650" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Thick diagonal bar from edge to edge - path-based for smooth edges */}
        <path
          d="M-2000 1650
             L-600 290
             L2000 -340
             L2000 -650
             L-2000 -650 Z"
          fill={color}
        />
      </svg>
    ),
    'diagonal-stripes': (
      <svg viewBox="0 0 1000 650" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Very thick diagonal bar from edge to edge - path-based for smooth edges */}
        <path
          d="M-2000 1650
             L-600 290
             L2000 -340
             L2000 -650
             L-2000 -650 Z"
          fill={color}
        />
      </svg>
    ),
    corner: (
      <svg viewBox="0 0 1000 650" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Thick diagonal bar from edge to edge - path-based for smooth edges */}
        <path
          d="M-2000 1650
             L-600 290
             L2000 -340
             L2000 -650
             L-2000 -650 Z"
          fill={color}
        />
      </svg>
    ),
    trapezoid: (
      <svg viewBox="0 0 1000 650" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Very thick diagonal bar from edge to edge - path-based for smooth edges */}
        <path
          d="M-2000 1650
             L-600 290
             L2000 -340
             L2000 -650
             L-2000 -650 Z"
          fill={color}
        />
      </svg>
    )
  }

  return (
    <div className={cn(baseClasses, className)}>
      {variants[variant]}
    </div>
  )
}

