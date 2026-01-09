'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Menu, Bell, Settings, User, Search, Zap, Building2, Users, FileText, Wrench, LogOut, Shield, ExternalLink, Moon, Sun, Monitor, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface ContentHeaderProps {
  onMenuClick?: () => void
}

export function ContentHeader({ onMenuClick }: ContentHeaderProps) {
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('system')

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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Zoek voor alles..."
                className="pl-10 pr-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-neutral-700 rounded-full"
              />
            </div>
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

          {/* Quick Actions Dropdown - Mobile */}
          <div className="flex md:hidden">
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
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="h-8 w-8 rounded-full bg-[#002A1F] flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
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
                          Admin
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        Demo Gebruiker
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        demo@domiovastgoedbeheer.nl
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
                  <DropdownMenuItem>
                    Perks
                    <ExternalLink className="ml-auto h-3 w-3" />
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                {/* Appearance Settings */}
                <div className="py-1">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center">
                      <Monitor className="mr-2 h-4 w-4" />
                      Weergave
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setAppearance('light')}>
                        <Sun className="mr-2 h-4 w-4" />
                        Licht
                        {appearance === 'light' && <span className="ml-auto">✓</span>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAppearance('dark')}>
                        <Moon className="mr-2 h-4 w-4" />
                        Donker
                        {appearance === 'dark' && <span className="ml-auto">✓</span>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAppearance('system')}>
                        <Monitor className="mr-2 h-4 w-4" />
                        Systeem standaard
                        {appearance === 'system' && <span className="ml-auto">✓</span>}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
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


