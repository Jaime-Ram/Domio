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
  href?: string
}

export function Logo({ width = 140, height = 40, className, imgClassName, variant = 'default', href = '/' }: LogoProps) {
  const [imgSrc, setImgSrc] = useState('/images/DomioLogo.png')
  const [hasError, setHasError] = useState(false)

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
    return (
      <Link href={href} className={`flex items-center gap-2 ${className || ''}`}>
        <span className="text-2xl font-bold">
          <span className={variant === 'white' ? 'text-white' : 'text-[#163300] dark:text-[#9FE870]'}>Dom</span>
          <span className={variant === 'white' ? 'text-white/90' : 'text-[#356258] dark:text-[#9FE870]'}>io</span>
        </span>
      </Link>
    )
  }

  const darkGreenFilter =
    'brightness(0) saturate(100%) invert(12%) sepia(45%) saturate(2000%) hue-rotate(128deg)'

  return (
    <Link href={href} className={`flex items-center overflow-visible ${className || ''}`}>
      <Image
        src={`${imgSrc}?v=2`}
        alt="Domio Logo"
        width={341}
        height={70}
        priority
        className={imgClassName || ''}
        style={{
          height: height,
          width: 'auto',
          maxWidth: '100%',
          ...(variant === 'white' ? { filter: 'brightness(0) invert(1)' } : {}),
          ...(variant === 'default' ? { filter: darkGreenFilter } : {}),
        }}
        onError={handleError}
        unoptimized={false}
      />
    </Link>
  )
}

export default Logo
