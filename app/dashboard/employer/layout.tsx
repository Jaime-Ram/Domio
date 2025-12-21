'use client'

import { useState } from 'react'
import { VastgoedSidebar } from "@/components/dashboard/vastgoed-sidebar"
import { ContentHeader } from "@/components/dashboard/content-header"
import { HelpButton } from "@/components/dashboard/help-button"

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
      <VastgoedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 w-full lg:ml-64">
        <ContentHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6 lg:pt-10 bg-white dark:bg-gray-900 overflow-x-hidden">
          {children}
        </main>
        <HelpButton />
      </div>
    </div>
  )
}


