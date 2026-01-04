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
    const offset = layerIndex * 120 // Offset each layer
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
    
    // Much larger path - extends far beyond viewport
    return (
      <path
        key={layerIndex}
        d={`M${-1500 - offset} ${2150 + offset}
           L${-200 - offset} ${-310 - offset}
           L${2500 + offset} ${940 + offset}
           L${2500 + offset} ${1650 + offset}
           L${-1500 - offset} ${1650 + offset} Z`}
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

