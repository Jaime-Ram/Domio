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
        {/* Diagonal bars from edge to edge with consistent 45-degree angle */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-50" y="70" width="300" height="30" fill={color} />
          <rect x="-50" y="110" width="300" height="30" fill={color} />
        </g>
      </svg>
    ),
    'diagonal-stripes': (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Thick diagonal bars from edge to edge */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-100" y="50" width="400" height="40" fill={color} />
          <rect x="-100" y="110" width="400" height="40" fill={color} />
        </g>
      </svg>
    ),
    corner: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* L-shaped bars with 45-degree angles, filling from edges */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-50" y="80" width="300" height="35" fill={color} />
          <rect x="-50" y="125" width="300" height="35" fill={color} />
        </g>
        {/* Additional perpendicular bar for corner effect */}
        <g transform={`rotate(${-angle} 100 100)`}>
          <rect x="60" y="-50" width="40" height="300" fill={color} />
        </g>
      </svg>
    ),
    trapezoid: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Diagonal bars from edge to edge */}
        <g transform={`rotate(${angle} 100 100)`}>
          <rect x="-100" y="60" width="400" height="45" fill={color} />
          <rect x="-100" y="120" width="400" height="45" fill={color} />
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

