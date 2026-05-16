'use client'

import { useState, useEffect, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { getPageDef, getActiveTabPath } from './page-def'
import { TabNav } from '@/components/ui/tab-nav'

interface PageTitleBarProps {
  basePath?: string
}

export function PageTitleBar({ basePath = '/dashboard/landlord' }: PageTitleBarProps) {
  const { profile, user } = useDashboardUser()
  const pathname = usePathname()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const firstName = (profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '').trim()

  const rel = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname
  const pageDef = getPageDef(rel, firstName)
  const activeTabPath = pageDef.tabs ? (getActiveTabPath(rel, pageDef.tabs) ?? pageDef.tabs[0].path) : null

  const [optimisticTab, setOptimisticTab] = useState<string | null>(null)

  // Zodra de URL daadwerkelijk verandert, reset optimistic state
  useEffect(() => {
    setOptimisticTab(null)
  }, [rel])

  if (!pageDef.title) return null

  const displayTab = optimisticTab ?? activeTabPath ?? pageDef.tabs?.[0].path ?? ''

  return (
    <div className={pageDef.noDivider ? '' : 'pb-8'}>
      <h1 className="pt-7 pb-3 text-[30px] font-bold text-[#163300] dark:text-[#9FE870] leading-none">
        {pageDef.title}
      </h1>

      {pageDef.tabs ? (
        <TabNav
          tabs={pageDef.tabs.map((t) => ({ id: t.path, label: t.label }))}
          activeTab={displayTab}
          onChange={(path) => {
            setOptimisticTab(path)
            startTransition(() => router.push(basePath + path))
          }}
          className="w-full"
        />
      ) : !pageDef.noDivider ? (
        <div className="border-b border-gray-100 dark:border-neutral-800" />
      ) : null}
    </div>
  )
}
