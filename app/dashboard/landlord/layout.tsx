'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { VastgoedSidebar } from "@/components/dashboard/vastgoed-sidebar"
import { ContentHeader } from "@/components/dashboard/content-header"
import { PageTitleBar } from "@/components/dashboard/page-title-bar"
import { DocumentPreviewPanel } from '@/components/documents/document-preview-panel'
import { DocumentPreviewProvider, useDocumentPreview } from '@/providers/document-preview-provider'
import { cn } from '@/lib/utils'
import { DashboardUserProvider, useDashboardUser } from '@/providers/dashboard-user-provider'
import { usePathname } from 'next/navigation'
import { MobileAppOnlyScreen } from '@/components/auth/mobile-app-only-screen'
import { DASHBOARD_PAGE_GUTTER_CLASS } from '@/app/dashboard/landlord/dashboard-ui'

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
    const mq = window.matchMedia('(max-width: 767px)')
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
  const isChatShell = pathname.includes('/messages') || pathname.includes('/assist')

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsLargeScreen(mq.matches)
    const fn = () => setIsLargeScreen(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  // Auto-collapse sidebar at medium widths (768–1023px), expand at large (≥1024px)
  useEffect(() => {
    const mqMedium = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
    const mqLarge = window.matchMedia('(min-width: 1024px)')
    if (mqMedium.matches) setSidebarCollapsed(true)
    const onMedium = (e: MediaQueryListEvent) => { if (e.matches) setSidebarCollapsed(true) }
    const onLarge = (e: MediaQueryListEvent) => { if (e.matches) setSidebarCollapsed(false) }
    mqMedium.addEventListener('change', onMedium)
    mqLarge.addEventListener('change', onLarge)
    return () => { mqMedium.removeEventListener('change', onMedium); mqLarge.removeEventListener('change', onLarge) }
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
    <DashboardUserProvider>
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
          sidebarCollapsed ? 'md:ml-14' : 'md:ml-60',
          showPreviewPanel && 'lg:mr-[max(400px,50vw)]',
        )}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '300ms',
          transitionTimingFunction: 'ease-in-out',
          willChange: 'margin-left',
        }}
      >
          <Require2FaRedirect />
          <ContentHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 bg-white dark:bg-gray-900 overflow-x-hidden overflow-y-auto">
            <div
              className={cn(
                'mx-auto max-w-7xl px-10 sm:px-14 lg:pl-16 lg:pr-20 flex flex-col h-full min-h-0',
                isChatShell ? 'pb-4 sm:pb-6' : 'pb-16'
              )}
            >
              <PageTitleBar />
              <div className="flex min-h-0 flex-1 flex-col gap-content-blocks">
                {children}
              </div>
            </div>
          </main>
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
    </DashboardUserProvider>
  )
}


