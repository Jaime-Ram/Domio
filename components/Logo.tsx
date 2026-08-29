'use client'

import Link from 'next/link'

export interface LogoProps {
  width?: number
  height?: number
  className?: string
  imgClassName?: string
  variant?: 'default' | 'white'
  href?: string
}

export function Logo({ height = 40, className, variant = 'default', href = '/' }: LogoProps) {
  const color = variant === 'white' ? '#ffffff' : '#1d3014'
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 overflow-visible ${className || ''}`}
      aria-label="Domio"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{ height, width: height }}
      >
        <path d="M5 18.7L5 10.8Q5 9.5 6.01 8.68L10.99 4.62Q12 3.8 13.01 4.62L17.99 8.68Q19 9.5 19 10.8L19 18.7Q19 20 17.7 20L6.3 20Q5 20 5 18.7Z" />
      </svg>
      <span className="font-semibold tracking-tight" style={{ color, fontSize: Math.round(height * 0.5) }}>
        Domio
      </span>
    </Link>
  )
}

export default Logo
