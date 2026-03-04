'use client'

import { useState, useEffect } from 'react'
import { VastgoedSidebar } from "@/components/dashboard/vastgoed-sidebar"
import { ContentHeader } from "@/components/dashboard/content-header"
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { DashboardUserProvider } from '@/providers/dashboard-user-provider'

const ENTER_DURATION_MS = 420
const ENTER_EASE = 'cubic-bezier(0.4, 0, 0.08, 1)'

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [enterDone, setEnterDone] = useState(false)

  // Soepele fade-in na laden (demo én normaal inloggen)
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      setTimeout(() => setEnterDone(true), 20)
    })
    return () => cancelAnimationFrame(t)
  }, [])

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
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-gray-900">
      {/* Groene overlay: fixed = altijd vol scherm, ook bij inloggen */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] bg-[#9FE870] transition-opacity"
        style={{
          opacity: enterDone ? 0 : 1,
          transitionDuration: `${ENTER_DURATION_MS}ms`,
          transitionTimingFunction: ENTER_EASE,
        }}
        aria-hidden
      />
      <div
        className="relative z-20 flex flex-1 min-h-0 w-full transition-opacity"
        style={{
          opacity: enterDone ? 1 : 0,
          transitionDuration: `${ENTER_DURATION_MS}ms`,
          transitionTimingFunction: ENTER_EASE,
        }}
      >
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
          <DashboardUserProvider>
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
          </DashboardUserProvider>
        </div>
      </div>
      </div>
    </div>
  )
}


