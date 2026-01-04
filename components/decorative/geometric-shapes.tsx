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
  
  const variants = {
    rhombus: (
      <svg viewBox="0 0 200 200" className="w-full h-full" style={{ opacity }}>
        {/* Large diagonal rhombus */}
        <path 
          d="M-20,100 L50,30 L120,100 L50,170 Z" 
          fill={color}
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        {/* Smaller rhombus on the right */}
        <path 
          d="M150,20 L180,50 L150,80 L120,50 Z" 
          fill={color}
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.3"
        />
      </svg>
    ),
    'diagonal-stripes': (
      <svg viewBox="0 0 200 200" className="w-full h-full" style={{ opacity }}>
        <g transform="rotate(-45 100 100)">
          <rect x="-50" y="60" width="300" height="25" fill={color} />
          <rect x="-50" y="100" width="300" height="25" fill={color} />
        </g>
      </svg>
    ),
    corner: (
      <svg viewBox="0 0 200 200" className="w-full h-full" style={{ opacity }}>
        {/* L-shaped corner form */}
        <path 
          d="M0,150 L0,120 L30,120 L80,70 L130,70 L130,40 L200,40 L200,150 Z" 
          fill={color}
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.2"
        />
      </svg>
    ),
    trapezoid: (
      <svg viewBox="0 0 200 200" className="w-full h-full" style={{ opacity }}>
        {/* Trapezoid shape */}
        <path 
          d="M0,180 L40,60 L160,60 L200,180 Z" 
          fill={color}
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.2"
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

