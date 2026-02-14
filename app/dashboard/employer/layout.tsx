'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { VastgoedSidebar } from "@/components/dashboard/vastgoed-sidebar"
import { ContentHeader } from "@/components/dashboard/content-header"
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [viewAs, setViewAs] = useState<'verhuurder' | 'huurder'>('verhuurder')

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
      {/* Demo bar: volle breedte (ook boven sidebar), groen; inhoud uitgelijnd met contentkolom */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-12 bg-brand-accent">
        <div
          className={cn(
            "flex-1 flex items-center min-w-0 h-full transition-[margin-left] duration-300 ease-in-out",
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          )}
          style={{
            transitionProperty: 'margin-left',
            transitionDuration: '300ms',
            transitionTimingFunction: 'ease-in-out',
            willChange: 'margin-left'
          }}
        >
          <div className="w-full max-w-7xl px-6 sm:px-8 lg:px-12 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-brand-primary truncate">
              Dit is een demo.
              <Link
                href="/"
                className="ml-1.5 text-brand-primary hover:underline underline-offset-2"
                onClick={(e) => { e.preventDefault(); window.location.href = '/' }}
              >
                Meer informatie
              </Link>
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3.5 rounded-2xl border-gray-200/80 bg-white text-brand-primary hover:bg-gray-50 font-medium text-sm"
                  >
                    {viewAs === 'verhuurder' ? 'Verhuurder' : 'Huurder'}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-card border border-gray-200/80 bg-white shadow-lg">
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
                size="sm"
                className="h-9 px-4 rounded-2xl bg-brand-primary text-white hover:bg-brand-primary-hover font-medium text-sm"
              >
                <Link href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/' }}>
                  Open account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer zodat sidebar + content onder de bar beginnen */}
      <div className="hidden md:block h-12 flex-shrink-0" />

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
          <ContentHeader onMenuClick={() => setSidebarOpen(true)} stickyOffsetClassName="md:top-12" />
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


