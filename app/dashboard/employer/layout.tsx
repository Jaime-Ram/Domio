'use client'

import { useState, useEffect } from 'react'
import { VastgoedSidebar } from "@/components/dashboard/vastgoed-sidebar"
import { ContentHeader } from "@/components/dashboard/content-header"
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Op mobiel: body scroll vergrendelen wanneer sidebar open is
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [sidebarOpen])

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-gray-900 flex-col">
      <div className="flex flex-1 min-h-0 w-full">
        <VastgoedSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div 
          className={cn(
            "flex-1 flex flex-col min-w-0 w-full",
            "transition-[margin-left] duration-300 ease-in-out",
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          )}
          style={{
            transitionProperty: 'margin-left',
            transitionDuration: '300ms',
            transitionTimingFunction: 'ease-in-out',
            willChange: 'margin-left'
          }}
        >
          <ContentHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 bg-white dark:bg-gray-900 overflow-x-hidden overflow-y-auto">
            <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-10 pb-16">
          {children}
              {/* Subtle Domio logo at bottom center - light gray, small, subtle */}
              <div className="flex justify-center items-center mt-16 pt-8">
                <Logo 
                  width={80} 
                  height={24} 
                  href="/dashboard/employer"
                  className="opacity-25 dark:opacity-15 hover:opacity-35 dark:hover:opacity-25 transition-opacity text-gray-400 dark:text-gray-600"
                  imgClassName="grayscale brightness-90 dark:brightness-110"
                />
              </div>
            </div>
        </main>
        </div>
      </div>
    </div>
  )
}


