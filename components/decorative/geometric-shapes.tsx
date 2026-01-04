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
  
  // Building silhouette shapes - thick mirrored lines creating abstract building shapes
  const variants = {
    rhombus: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Mirrored thick lines creating building silhouette */}
        <defs>
          <pattern id="building-rhombus" x="0" y="0" width="100" height="200" patternUnits="userSpaceOnUse">
            {/* Left diagonal line */}
            <rect x="0" y="0" width="80" height="200" transform="skewX(-20)" fill={color} />
            {/* Mirrored right diagonal line */}
            <rect x="20" y="0" width="80" height="200" transform="skewX(20)" fill={color} />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#building-rhombus)" />
      </svg>
    ),
    'diagonal-stripes': (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Mirrored thick lines creating building silhouette */}
        <defs>
          <pattern id="building-stripes" x="0" y="0" width="120" height="200" patternUnits="userSpaceOnUse">
            {/* Left diagonal line */}
            <rect x="0" y="0" width="96" height="200" transform="skewX(-25)" fill={color} />
            {/* Mirrored right diagonal line */}
            <rect x="24" y="0" width="96" height="200" transform="skewX(25)" fill={color} />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#building-stripes)" />
      </svg>
    ),
    corner: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Mirrored thick lines creating building silhouette from corner */}
        <defs>
          <pattern id="building-corner" x="0" y="0" width="110" height="200" patternUnits="userSpaceOnUse">
            {/* Left diagonal line */}
            <rect x="0" y="0" width="80" height="200" transform="skewX(-22)" fill={color} />
            {/* Mirrored right diagonal line */}
            <rect x="30" y="0" width="80" height="200" transform="skewX(22)" fill={color} />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#building-corner)" />
      </svg>
    ),
    trapezoid: (
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none" style={{ opacity }}>
        {/* Mirrored thick lines creating building silhouette */}
        <defs>
          <pattern id="building-trapezoid" x="0" y="0" width="130" height="200" patternUnits="userSpaceOnUse">
            {/* Left diagonal line */}
            <rect x="0" y="0" width="96" height="200" transform="skewX(-28)" fill={color} />
            {/* Mirrored right diagonal line */}
            <rect x="34" y="0" width="96" height="200" transform="skewX(28)" fill={color} />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#building-trapezoid)" />
      </svg>
    )
  }

  return (
    <div className={cn(baseClasses, className)}>
      {variants[variant]}
    </div>
  )
}

