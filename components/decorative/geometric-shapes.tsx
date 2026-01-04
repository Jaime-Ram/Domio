'use client'

import { cn } from '@/lib/utils'

interface GeometricShapesProps {
  variant?: 'rhombus' | 'diagonal-stripes' | 'corner' | 'trapezoid'
  className?: string
  color?: string
  opacity?: number
  layers?: number // Number of overlapping layers
}

export function GeometricShapes({ 
  variant = 'rhombus', 
  className,
  color = '#002A1F',
  opacity = 0.1,
  layers = 1
}: GeometricShapesProps) {
  const baseClasses = "absolute pointer-events-none"
  
  // Create multiple layers with different tints and offsets
  const createLayer = (layerIndex: number) => {
    const offset = layerIndex * 160 // Offset each layer (2x the original 80)
    const layerOpacity = opacity * (1 - layerIndex * 0.2) // Slightly lighter for each layer
    
    // Calculate lighter tint (add white to make it lighter)
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }
    
    const rgbToHex = (r: number, g: number, b: number) => {
      return "#" + [r, g, b].map(x => {
        const hex = Math.round(Math.min(255, x)).toString(16)
        return hex.length === 1 ? "0" + hex : hex
      }).join("")
    }
    
    const rgb = hexToRgb(color)
    // Make each layer slightly lighter by blending with white
    const blendFactor = 0.15 * layerIndex // Blend more for each layer
    const layerColor = rgb ? rgbToHex(
      Math.round(rgb.r + (255 - rgb.r) * blendFactor),
      Math.round(rgb.g + (255 - rgb.g) * blendFactor),
      Math.round(rgb.b + (255 - rgb.b) * blendFactor)
    ) : color
    
    // Original shape but 2x larger - extends beyond viewport
    // Original: M-500 1150 L400 90 L1500 340 L1500 650 L-500 650 Z
    // 2x: M-1000 2300 L800 180 L3000 680 L3000 1300 L-1000 1300 Z
    return (
      <path
        key={layerIndex}
        d={`M${-1000 - offset} ${2300 + offset}
           L${800 - offset} ${180 - offset}
           L${3000 + offset} ${680 + offset}
           L${3000 + offset} ${1300 + offset}
           L${-1000 - offset} ${1300 + offset} Z`}
        fill={layerColor}
        style={{ opacity: layerOpacity }}
      />
    )
  }
  
  const variants = {
    rhombus: (
      <svg viewBox="0 0 1000 650" className="w-full h-full" preserveAspectRatio="none">
        {/* Multiple layers of thick diagonal bars with offsets and different tints */}
        {Array.from({ length: layers }).map((_, i) => createLayer(i))}
      </svg>
    ),
    'diagonal-stripes': (
      <svg viewBox="0 0 1000 650" className="w-full h-full" preserveAspectRatio="none">
        {/* Multiple layers of very thick diagonal bars with offsets and different tints */}
        {Array.from({ length: layers }).map((_, i) => createLayer(i))}
      </svg>
    ),
    corner: (
      <svg viewBox="0 0 1000 650" className="w-full h-full" preserveAspectRatio="none">
        {/* Multiple layers of thick diagonal bars with offsets and different tints */}
        {Array.from({ length: layers }).map((_, i) => createLayer(i))}
      </svg>
    ),
    trapezoid: (
      <svg viewBox="0 0 1000 650" className="w-full h-full" preserveAspectRatio="none">
        {/* Multiple layers of very thick diagonal bars with offsets and different tints */}
        {Array.from({ length: layers }).map((_, i) => createLayer(i))}
      </svg>
    )
  }

  return (
    <div className={cn(baseClasses, className)}>
      {variants[variant]}
    </div>
  )
}

