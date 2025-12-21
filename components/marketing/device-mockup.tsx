'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface DeviceMockupProps {
  type: 'iphone' | 'tablet'
  screenshot: string
  alt: string
  className?: string
}

export function DeviceMockup({ type, screenshot, alt, className }: DeviceMockupProps) {
  if (type === 'iphone') {
    return (
      <div className={cn('relative w-[280px]', className)}>
        {/* iPhone Frame */}
        <div className="relative overflow-hidden rounded-[3rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl dark:border-gray-800">
          {/* iPhone Notch */}
          <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-gray-900 dark:bg-gray-800"></div>
          
          {/* Screenshot */}
          <div className="relative bg-white dark:bg-gray-800">
            <div className="pt-8">
              <Image
                src={screenshot}
                alt={alt}
                width={280}
                height={600}
                className="w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* iPhone Home Indicator */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center border-t border-gray-200 bg-white py-2 dark:border-gray-700 dark:bg-gray-800">
            <div className="h-1 w-32 rounded-full bg-gray-400 dark:bg-gray-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'tablet') {
    return (
      <div className={cn('relative', className)}>
        {/* Tablet Frame */}
        <div className="relative overflow-hidden rounded-xl border-8 border-gray-200 bg-gray-200 shadow-2xl dark:border-gray-800 dark:bg-gray-800">
          {/* Screenshot */}
          <div className="relative bg-white dark:bg-gray-900">
            <Image
              src={screenshot}
              alt={alt}
              width={800}
              height={600}
              className="w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}




