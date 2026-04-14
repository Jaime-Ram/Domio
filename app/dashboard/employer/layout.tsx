'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { VastgoedSidebar } from "@/components/dashboard/vastgoed-sidebar"
import { ContentHeader } from "@/components/dashboard/content-header"
import { DocumentPreviewPanel } from '@/components/documents/document-preview-panel'
import { DocumentPreviewProvider, useDocumentPreview } from '@/providers/document-preview-provider'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { DashboardUserProvider, useDashboardUser } from '@/providers/dashboard-user-provider'
import { usePathname } from 'next/navigation'
import { MobileAppOnlyScreen } from '@/components/auth/mobile-app-only-screen'
import { DASHBOARD_PAGE_GUTTER_CLASS } from '@/app/dashboard/employer/dashboard-ui'

function Require2FaRedirect() {
  const { profile, isDemo, loading } = useDashboardUser()
  const router = useRouter()
  useEffect(() => {
    if (loading || isDemo || !profile?.mfa_email_enabled) return
    const hasCookie = typeof document !== 'undefined' && document.cookie.includes('two_fa_verified=1')
    if (!hasCookie) {
      router.replace('/login')
    }
  }, [loading, isDemo, profile?.mfa_email_enabled, router])
  return null
}

const ENTER_DURATION_MS = 420
const ENTER_EASE = 'cubic-bezier(0.4, 0, 0.08, 1)'

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [enterDone, setEnterDone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Soepele fade-in na laden (demo én normaal inloggen)
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
    <DocumentPreviewProvider>
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
          <EmployerLayoutInner enterDone={enterDone}>
            {children}
          </EmployerLayoutInner>
        </div>
      </div>
    </DocumentPreviewProvider>
  )
}

function EmployerLayoutInner({
  children,
  enterDone,
}: {
  children: React.ReactNode
  enterDone: boolean
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const { previewDocId, closePreview } = useDocumentPreview()
  const pathname = usePathname()

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsLargeScreen(mq.matches)
    const fn = () => setIsLargeScreen(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const prevPreviewIdRef = useRef<string | null>(null)
  const sidebarCollapsedBeforePreviewRef = useRef<boolean>(false)

  useEffect(() => {
    if (previewDocId) {
      if (prevPreviewIdRef.current === null) {
        sidebarCollapsedBeforePreviewRef.current = sidebarCollapsed
      }
      setSidebarCollapsed(true)
      prevPreviewIdRef.current = previewDocId
    } else {
      if (prevPreviewIdRef.current !== null) {
        setSidebarCollapsed(sidebarCollapsedBeforePreviewRef.current)
        prevPreviewIdRef.current = null
      }
    }
  }, [previewDocId, sidebarCollapsed])

  // Als je navigeert buiten Documenten, sluit de preview
  useEffect(() => {
    if (!previewDocId) return
    // geldig binnen documenten, incl. /documents/preview/[id]
    if (pathname.includes('/documents')) return
    closePreview()
  }, [pathname, previewDocId, closePreview])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [sidebarOpen])

  const showPreviewPanel = !!previewDocId && isLargeScreen

  return (
    <div className="flex flex-1 min-h-0 w-full">
      <VastgoedSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 w-full',
          'transition-[margin-left] duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64',
          showPreviewPanel && 'lg:mr-[max(400px,50vw)]',
        )}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '300ms',
          transitionTimingFunction: 'ease-in-out',
          willChange: 'margin-left',
        }}
      >
        <DashboardUserProvider>
          <Require2FaRedirect />
          <ContentHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 bg-white dark:bg-gray-900 overflow-x-hidden overflow-y-auto">
            <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:pl-12 lg:pr-16 py-4 sm:py-6 lg:py-10 pb-16 flex flex-col gap-content-blocks h-full min-h-0">
              <div className={cn('flex min-h-0 flex-1 flex-col gap-content-blocks', DASHBOARD_PAGE_GUTTER_CLASS)}>
                {children}
              </div>
              {!pathname.includes('/messages') && (
                <div className="flex justify-center items-center mt-16 pt-8">
                  <Logo
                    width={80}
                    height={24}
                    href="/dashboard/employer"
                    className="opacity-25 dark:opacity-15 hover:opacity-35 dark:hover:opacity-25 transition-opacity text-gray-400 dark:text-gray-600"
                    imgClassName="grayscale brightness-90 dark:brightness-110"
                  />
                </div>
              )}
            </div>
          </main>
        </DashboardUserProvider>
      </div>
      {showPreviewPanel && previewDocId && (
        <div
          className="hidden lg:flex flex-col fixed right-0 top-0 bottom-0 z-40 w-full max-w-[50vw] min-w-[400px] border-l border-gray-200 dark:border-neutral-700 bg-[#f1f3f0] dark:bg-neutral-800 overflow-hidden"
          aria-label="Document preview"
        >
          <DocumentPreviewPanel docId={previewDocId} onClose={closePreview} />
        </div>
      )}
    </div>
  )
}


