'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, Bell, Settings, User, Zap, Building2, Users, FileText, Wrench, LogOut, Shield, ExternalLink } from 'lucide-react'
import { GlobalSearch } from './global-search'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface ContentHeaderProps {
  onMenuClick?: () => void
}

export function ContentHeader({ onMenuClick }: ContentHeaderProps) {
  // Demo gebruiker gegevens
  const userName = 'Demo Gebruiker'
  const userEmail = 'demo@domiovastgoedbeheer.nl'
  const userRole = 'Admin'
  
  // Genereer initialen van de gebruikersnaam
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  
  const initials = getInitials(userName)

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 h-16 flex items-center justify-between gap-4">
          {/* Hamburger menu for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Search Bar and Quick Actions - Center */}
          <div className="hidden md:flex flex-1 max-w-2xl items-center gap-3">
            <GlobalSearch />
            {/* Quick Actions Dropdown - Desktop */}
            <div suppressHydrationWarning>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="default" 
                    size="default"
                    className="items-center gap-2 rounded-full bg-white text-[#002A1F] hover:bg-gray-100 border border-gray-200 px-4 h-10"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Snelle acties</span>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[#002A1F] flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">Nieuw pand</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[#002A1F] flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">Huurder</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[#002A1F] flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">Factuur</span>
                    </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[#002A1F] flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-white" />
                  </div>
                    <span className="text-xs font-medium text-gray-700 text-center">Onderhoud</span>
                  </button>
                </div>
              </DropdownMenuContent>
              </DropdownMenu>
                </div>
              </div>

          {/* Search and Quick Actions - Mobile */}
          <div className="flex md:hidden items-center gap-2 flex-1">
            <GlobalSearch />
            <div suppressHydrationWarning>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default" 
                    size="default"
                    className="items-center gap-2 rounded-full bg-white text-[#002A1F] hover:bg-gray-100 border border-gray-200 px-3 h-9"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Snelle acties</span>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[#002A1F] flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">Nieuw pand</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[#002A1F] flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">Huurder</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[#002A1F] flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">Factuur</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[#002A1F] flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">Onderhoud</span>
                  </button>
                </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            </div>

        {/* Right Side Actions */}
          <div className="flex items-center gap-2 ml-auto">

          {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
          </Button>

            {/* Profile Dropdown */}
            <div suppressHydrationWarning>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-3 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-[#002A1F] dark:bg-[#9AFF7C] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-white dark:text-[#002A1F]">
                          {initials}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline">
                        {userName}
                      </span>
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400 sm:hidden" />
                    </div>
              </Button>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800">
                {/* User Info Section */}
                <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#002A1F] flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {userRole}
                  </span>
                </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userEmail}
                </p>
              </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="py-1">
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/employer/settings" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profiel
                  </Link>
                </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    Notificaties
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    Beveiliging
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                {/* External Links */}
                <div className="py-1">
                <DropdownMenuItem asChild>
                    <Link href="/privacy" className="flex items-center">
                      Privacy
                      <ExternalLink className="ml-auto h-3 w-3" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/terms" className="flex items-center">
                      Algemene voorwaarden
                      <ExternalLink className="ml-auto h-3 w-3" />
                  </Link>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator />

                {/* Logout */}
                <div className="py-1">
                  <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Uitloggen
              </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
          </DropdownMenu>
            </div>
          </div>
        </div>
    </header>
  )
}


