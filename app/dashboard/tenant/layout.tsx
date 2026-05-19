'use client'

import { useState, useEffect } from 'react'
import { VastgoedSidebar } from '@/components/dashboard/vastgoed-sidebar'
import { ContentHeader } from '@/components/dashboard/content-header'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { DashboardUserProvider } from '@/providers/dashboard-user-provider'
import { MobileAppOnlyScreen } from '@/components/auth/mobile-app-only-screen'
import { DASHBOARD_PAGE_GUTTER_CLASS } from '@/app/dashboard/landlord/dashboard-ui'
import {
  LayoutDashboard,
  Ticket,
  Euro,
  HardDrive,
  Settings,
  MessageCircle,
} from 'lucide-react'
import type { MenuGroup } from '@/components/dashboard/vastgoed-sidebar'

const TENANT_BASE_PATH = '/dashboard/tenant'

const TENANT_MENU_GROUPS: MenuGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: TENANT_BASE_PATH, icon: LayoutDashboard },
      { label: 'Tickets', href: `${TENANT_BASE_PATH}/tickets`, icon: Ticket },
      { label: 'Berichten', href: `${TENANT_BASE_PATH}/messages`, icon: MessageCircle },
      { label: 'Betalingen', href: `${TENANT_BASE_PATH}/betalingen`, icon: Euro },
      { label: 'Documenten', href: `${TENANT_BASE_PATH}/documenten`, icon: HardDrive },
    ],
  },
  {
    items: [
      { label: 'Account', href: `${TENANT_BASE_PATH}/account`, icon: Settings },
    ],
  },
]

const ENTER_DURATION_MS = 420
const ENTER_EASE = 'cubic-bezier(0.4, 0, 0.08, 1)'

export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  const [enterDone, setEnterDone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      setTimeout(() => setEnterDone(true), 20)
    })
    return () => cancelAnimationFrame(t)
  }, [])

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
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-gray-900">
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
        <TenantLayoutInner>{children}</TenantLayoutInner>
      </div>
    </div>
  )
}

function TenantLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [sidebarOpen])

  return (
    <div className="flex flex-1 min-h-0 w-full">
      <VastgoedSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        basePath={TENANT_BASE_PATH}
        menuGroups={TENANT_MENU_GROUPS}
        showHulp={false}
      />
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 w-full',
          'transition-[margin-left] duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:ml-14' : 'lg:ml-60',
        )}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '300ms',
          transitionTimingFunction: 'ease-in-out',
          willChange: 'margin-left',
        }}
      >
        <DashboardUserProvider>
          <ContentHeader
            onMenuClick={() => setSidebarOpen(true)}
            basePath={TENANT_BASE_PATH}
          />
          <div className="h-12 shrink-0" aria-hidden="true">
            <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:pl-12 lg:pr-16">
              <div className="h-px bg-gray-100 dark:bg-neutral-800" />
            </div>
          </div>
          <main className="flex-1 bg-white dark:bg-gray-900 overflow-x-hidden overflow-y-auto">
            <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:pl-12 lg:pr-16 pb-16 flex flex-col gap-content-blocks">
              <div className={cn('flex min-h-0 flex-1 flex-col gap-content-blocks', DASHBOARD_PAGE_GUTTER_CLASS)}>
                {children}
              </div>
              <div className="flex justify-center items-center mt-16 pt-8">
                <Logo
                  width={80}
                  height={24}
                  href={TENANT_BASE_PATH}
                  className="opacity-25 dark:opacity-15 hover:opacity-35 dark:hover:opacity-25 transition-opacity text-gray-400 dark:text-gray-600"
                  imgClassName="grayscale brightness-90 dark:brightness-110"
                />
              </div>
            </div>
          </main>
        </DashboardUserProvider>
      </div>
    </div>
  )
}
