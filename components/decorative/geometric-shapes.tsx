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
  
  // Building silhouette shapes - abstract chevron/arrow patterns
  const variants = {
    rhombus: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Building silhouette - chevron pattern */}
        <defs>
          <pattern id="building-pattern-rhombus" x="0" y="0" width="80" height="200" patternUnits="userSpaceOnUse">
            <path d="M0,200 L40,120 L80,200 Z" fill={color} />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#building-pattern-rhombus)" />
      </svg>
    ),
    'diagonal-stripes': (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Building silhouette - continuous chevron pattern */}
        <defs>
          <pattern id="building-pattern-stripes" x="0" y="0" width="100" height="200" patternUnits="userSpaceOnUse">
            <path d="M0,200 L50,100 L100,200 Z" fill={color} />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#building-pattern-stripes)" />
      </svg>
    ),
    corner: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Building silhouette - large chevron from corner */}
        <defs>
          <pattern id="building-pattern-corner" x="0" y="0" width="120" height="200" patternUnits="userSpaceOnUse">
            <path d="M0,200 L60,80 L120,200 Z" fill={color} />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#building-pattern-corner)" />
      </svg>
    ),
    trapezoid: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Building silhouette - wide chevron pattern */}
        <defs>
          <pattern id="building-pattern-trapezoid" x="0" y="0" width="90" height="200" patternUnits="userSpaceOnUse">
            <path d="M0,200 L45,110 L90,200 Z" fill={color} />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#building-pattern-trapezoid)" />
      </svg>
    )
  }

  return (
    <div className={cn(baseClasses, className)}>
      {variants[variant]}
    </div>
  )
}

