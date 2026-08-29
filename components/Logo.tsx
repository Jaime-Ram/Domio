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

/**
 * Domio-logo: het vastgestelde logo-beeld (huisje + "Domio"), zonder achtergrond.
 * Donkergroen op licht, wit op donker (variant="white").
 */
export function Logo({ height = 28, className, imgClassName, variant = 'default', href = '/' }: LogoProps) {
  const src = variant === 'white' ? '/images/domio-logo-white.png' : '/images/domio-logo.png'
  return (
    <Link href={href} className={`inline-flex items-center ${className || ''}`} aria-label="Domio">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Domio" className={imgClassName} style={{ height, width: 'auto' }} />
    </Link>
  )
}

export default Logo
