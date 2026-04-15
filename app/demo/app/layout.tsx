'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { VastgoedSidebar } from '@/components/dashboard/vastgoed-sidebar'
import { ContentHeader } from '@/components/dashboard/content-header'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { DemoUserProvider } from '@/providers/demo-user-provider'
import { MobileAppOnlyScreen } from '@/components/auth/mobile-app-only-screen'

const ENTER_DURATION_MS = 420
const ENTER_EASE = 'cubic-bezier(0.4, 0, 0.08, 1)'
const DEMO_BASE_PATH = '/demo/app'

export default function DemoAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [enterDone, setEnterDone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const isChatShell = pathname.includes('/messages') || pathname.includes('/assist')

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      setTimeout(() => setEnterDone(true), 20)
    })
    return () => cancelAnimationFrame(t)
  }, [])

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

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    setIsMobile(mq.matches)
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  if (isMobile) {
    return <MobileAppOnlyScreen />
  }

  return (
    <DemoUserProvider>
      <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-gray-900">
        {/* Groene overlay */}
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
              basePath={DEMO_BASE_PATH}
              demoMode
            />
            <div
              className={cn(
                'flex-1 flex flex-col min-w-0 w-full',
                'transition-[margin-left] duration-300 ease-in-out',
                sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
              )}
              style={{
                transitionProperty: 'margin-left',
                transitionDuration: '300ms',
                transitionTimingFunction: 'ease-in-out',
                willChange: 'margin-left',
              }}
            >
              <ContentHeader onMenuClick={() => setSidebarOpen(true)} basePath={DEMO_BASE_PATH} />
              <main className="flex-1 bg-white dark:bg-gray-900 overflow-x-hidden overflow-y-auto">
                <div
                  className={cn(
                    'mx-auto max-w-7xl px-8 sm:px-12 lg:pl-20 lg:pr-16 py-4 sm:py-6 lg:py-10 flex flex-col gap-content-blocks h-full min-h-0',
                    isChatShell ? 'pb-4 sm:pb-6' : 'pb-16'
                  )}
                >
                  <div className="flex min-h-0 flex-1 flex-col gap-content-blocks">{children}</div>
                  {!isChatShell && (
                    <div className="flex justify-center items-center mt-16 pt-8">
                      <Logo
                        width={80}
                        height={24}
                        href="/demo/app"
                        className="opacity-25 dark:opacity-15 hover:opacity-35 dark:hover:opacity-25 transition-opacity text-gray-400 dark:text-gray-600"
                        imgClassName="grayscale brightness-90 dark:brightness-110"
                      />
                    </div>
                  )}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </DemoUserProvider>
  )
}
