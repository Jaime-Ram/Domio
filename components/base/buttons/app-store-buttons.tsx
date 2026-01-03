'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AppStoreButtonProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

export function AppStoreButton({ size = 'md', href = '#', className }: AppStoreButtonProps) {
  const sizeClasses = {
    sm: 'h-10 gap-2.5 px-3 py-2',
    md: 'h-12 gap-2.5 px-4 py-2.5 min-w-fit',
    lg: 'h-14 gap-3.5 px-5 py-3',
  }

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  }

  const textSizes = {
    sm: { top: 'text-[9px]', bottom: 'text-xs' },
    md: { top: 'text-[10px]', bottom: 'text-sm' },
    lg: { top: 'text-[11px]', bottom: 'text-base' },
  }

  const content = (
    <>
      <svg
        className={cn('flex-shrink-0', iconSizes[size])}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      <div className="flex flex-col items-start justify-center min-w-0 flex-shrink">
        <span className={cn('leading-tight whitespace-nowrap', textSizes[size].top)}>Download on the</span>
        <span className={cn('font-semibold leading-tight whitespace-nowrap', textSizes[size].bottom)}>App Store</span>
      </div>
    </>
  )

  const buttonClassName = cn(
    'inline-flex items-center rounded-xl border border-gray-900 bg-gray-900 px-4 py-2.5 text-white transition-colors hover:bg-gray-800 overflow-hidden',
    sizeClasses[size]
  )

  if (href !== '#') {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" className={cn(buttonClassName, className)}>
        {content}
      </Link>
    )
  }

  return <div className={cn(buttonClassName, className)}>{content}</div>
}

export function GooglePlayButton({ size = 'md', href = '#', className }: AppStoreButtonProps) {
  const sizeClasses = {
    sm: 'h-10 gap-2.5 px-3 py-2',
    md: 'h-12 gap-2.5 px-4 py-2.5 min-w-fit',
    lg: 'h-14 gap-3.5 px-5 py-3',
  }

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  }

  const textSizes = {
    sm: { top: 'text-[9px]', bottom: 'text-xs' },
    md: { top: 'text-[10px]', bottom: 'text-sm' },
    lg: { top: 'text-[11px]', bottom: 'text-base' },
  }

  const content = (
    <>
      <svg
        className={cn('flex-shrink-0', iconSizes[size])}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
          fill="currentColor"
        />
      </svg>
      <div className="flex flex-col items-start justify-center min-w-0 flex-shrink">
        <span className={cn('leading-tight whitespace-nowrap', textSizes[size].top)}>GET IT ON</span>
        <span className={cn('font-semibold leading-tight whitespace-nowrap', textSizes[size].bottom)}>Google Play</span>
      </div>
    </>
  )

  const buttonClassName = cn(
    'inline-flex items-center rounded-xl border border-gray-900 bg-gray-900 px-4 py-2.5 text-white transition-colors hover:bg-gray-800 overflow-hidden',
    sizeClasses[size]
  )

  if (href !== '#') {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" className={cn(buttonClassName, className)}>
        {content}
      </Link>
    )
  }

  return <div className={cn(buttonClassName, className)}>{content}</div>
}

export function GalaxyStoreButton({ size = 'md', href = '#', className }: AppStoreButtonProps) {
  const sizeClasses = {
    sm: 'h-10 gap-2.5 px-3 py-2',
    md: 'h-12 gap-3 px-4 py-2.5',
    lg: 'h-14 gap-3.5 px-5 py-3',
  }

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  }

  const textSizes = {
    sm: { top: 'text-[9px]', bottom: 'text-xs' },
    md: { top: 'text-[10px]', bottom: 'text-sm' },
    lg: { top: 'text-[11px]', bottom: 'text-base' },
  }

  const content = (
    <>
      <svg
        className={cn('flex-shrink-0', iconSizes[size])}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          fill="#1428A0"
        />
      </svg>
      <div className="flex flex-col items-start">
        <span className={cn('leading-tight', textSizes[size].top)}>GET IT ON</span>
        <span className={cn('font-semibold leading-tight', textSizes[size].bottom)}>Galaxy Store</span>
      </div>
    </>
  )

  const buttonClassName = cn(
    'inline-flex items-center rounded-xl border border-gray-900 bg-gray-900 px-4 py-2.5 text-white transition-colors hover:bg-gray-800',
    sizeClasses[size],
    className
  )

  if (href !== '#') {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" className={buttonClassName}>
        {content}
      </Link>
    )
  }

  return <div className={buttonClassName}>{content}</div>
}

