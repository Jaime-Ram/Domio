'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VastgoedSidebar } from "@/components/dashboard/vastgoed-sidebar"
import { ContentHeader } from "@/components/dashboard/content-header"
import { HelpButton } from "@/components/dashboard/help-button"
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
      {/* Demo Banner - Bright green bar at top, spanning entire page */}
      <div className="bg-[#9AFF7C] border-b border-[#9AFF7C]/20 px-4 py-3 w-full z-50">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <span className="text-sm font-medium text-[#002A1F]">
              Je bekijkt de Domio demo
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 text-[#002A1F] border-[#002A1F]/20 hover:bg-white rounded-lg h-8 px-3 text-sm"
                >
                  Bekijk als {viewAs === 'verhuurder' ? 'verhuurder' : 'huurder'}
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setViewAs('verhuurder')}>
                  Bekijk als verhuurder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewAs('huurder')}>
                  Bekijk als huurder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            asChild
            className="bg-[#002A1F] text-white hover:bg-[#002A1F]/90 rounded-lg h-8 px-4 text-sm"
          >
            <Link href="/" onClick={(e) => {
              e.preventDefault()
              // Open signup modal or navigate to signup
              window.location.href = '/'
            }}>
              Open Account
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 min-h-0 w-full">
        <VastgoedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 w-full lg:ml-64">
          <ContentHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6 lg:pt-10 bg-white dark:bg-gray-900 overflow-x-hidden">
            {children}
          </main>
          <HelpButton />
        </div>
      </div>
    </div>
  )
}


