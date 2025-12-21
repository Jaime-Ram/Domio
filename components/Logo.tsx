'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export interface LogoProps {
  width?: number
  height?: number
  className?: string
  imgClassName?: string
  variant?: 'default' | 'white'
}

export function Logo({ width = 140, height = 40, className, imgClassName, variant = 'default' }: LogoProps) {
  // Gebruik altijd DomioLogo.png als primair logo
  const [imgSrc, setImgSrc] = useState('/images/DomioLogo.png')
  const [hasError, setHasError] = useState(false)

  // Fallback chain: DomioLogo.png -> Logo.png -> text logo
  const handleError = () => {
    if (imgSrc === '/images/DomioLogo.png') {
      setImgSrc('/images/Logo.png')
    } else if (imgSrc === '/images/Logo.png') {
      setHasError(true)
    } else {
      setHasError(true)
    }
  }

  if (hasError) {
    // Als logo niet bestaat, toon tekst logo met kleuren die matchen je brand
    return (
      <Link href="/" className={`flex items-center gap-2 ${className || ''}`}>
        <span className="text-2xl font-bold">
          <span className={variant === 'white' ? 'text-white' : 'text-[#002A1F] dark:text-[#9AFF7C]'}>Dom</span>
          <span className={variant === 'white' ? 'text-white/90' : 'text-[#356258] dark:text-[#9AFF7C]'}>io</span>
        </span>
      </Link>
    )
  }

  const imageClass = [
    'h-auto',
    variant === 'white' ? 'brightness-0 invert' : '',
    imgClassName || '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link href="/" className={`flex items-center ${className || ''}`}>
      <Image
        src={`${imgSrc}?v=2`}
        alt="Domio Logo"
        width={width}
        height={height}
        priority
        className={imageClass}
        onError={handleError}
        unoptimized={false}
      />
    </Link>
  )
}

// Default export for compatibility
export default Logo
