'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VastgoedSidebar } from "@/components/dashboard/vastgoed-sidebar"
import { ContentHeader } from "@/components/dashboard/content-header"
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewAs, setViewAs] = useState<'verhuurder' | 'huurder'>('verhuurder')

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-gray-900 flex-col">
      {/* Demo Banner - Bright green bar at top, spanning entire page, fixed position - Hidden on mobile */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 bg-[#9AFF7C] border-b border-[#9AFF7C]/20 py-3 w-full z-50">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          {/* Left side - aligned with sidebar logo (px-6) */}
          <div className="flex items-center justify-start w-full sm:w-auto pl-4 sm:pl-6">
            <span className="text-xs sm:text-sm font-medium text-[#002A1F] leading-tight">
              <span className="hidden sm:inline">Welkom bij de domio demo omgeving.{' '}</span>
              <span className="sm:hidden">Domio demo</span>
              <span className="underline">Meer informatie</span>
            </span>
          </div>
          {/* Right side - aligned with header profile (px-6 sm:px-8 lg:px-12) */}
          <div className="flex items-center gap-2 sm:gap-3 pr-4 sm:pr-6 lg:pr-8 xl:pr-12 w-full sm:w-auto justify-end sm:justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-[#002A1F] border-gray-200 hover:bg-gray-100 rounded-full h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm flex-shrink-0"
                >
                  <span className="hidden sm:inline">Bekijk als {viewAs === 'verhuurder' ? 'verhuurder' : 'huurder'}</span>
                  <span className="sm:hidden">{viewAs === 'verhuurder' ? 'Verhuurder' : 'Huurder'}</span>
                  <ChevronDown className="ml-1 sm:ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewAs('verhuurder')}>
                  Bekijk als verhuurder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewAs('huurder')}>
                  Bekijk als huurder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              asChild
              className="bg-[#002A1F] text-white hover:bg-[#002A1F]/90 rounded-full h-7 sm:h-8 px-3 sm:px-4 text-xs sm:text-sm flex-shrink-0"
            >
              <Link href="/" onClick={(e) => {
                e.preventDefault()
                // Open signup modal or navigate to signup
                window.location.href = '/'
              }}>
                <span className="hidden sm:inline">Open Account</span>
                <span className="sm:hidden">Account</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Spacer for fixed banner - only on desktop */}
      <div className="hidden md:block h-[57px]"></div>
      
      <div className="flex flex-1 min-h-0 w-full">
        <VastgoedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 w-full lg:ml-64">
          <ContentHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 bg-white dark:bg-gray-900 overflow-x-hidden">
            <div className="w-full px-6 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-10">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}


