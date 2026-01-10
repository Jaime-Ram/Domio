'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, Bell, Settings, User, Zap, Building2, Users, FileText, Wrench, LogOut, Shield, ExternalLink, Calendar } from 'lucide-react'
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

          {/* Notifications Dropdown */}
            <div suppressHydrationWarning>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {/* Notification badge - optional, can be shown when there are unread notifications */}
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-800">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <DropdownMenuLabel className="px-0 font-semibold text-gray-900 dark:text-white">
                        Notificaties
                      </DropdownMenuLabel>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#002A1F] dark:text-[#9AFF7C]">
                        Alles markeren als gelezen
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Sample notifications */}
                    <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Nieuwe huurder toegevoegd
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Jan Jansen is toegevoegd als nieuwe huurder
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            5 minuten geleden
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Betaling ontvangen
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            €1.200 huur ontvangen voor Appartement 101
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            1 uur geleden
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                          <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Onderhoudsmelding
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Nieuwe melding voor Appartement 102
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            2 uur geleden
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-3 hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Contract verlopen
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Contract voor Kantoorruimte A verloopt binnenkort
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            3 uur geleden
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" size="sm" className="w-full justify-center text-sm text-[#002A1F] dark:text-[#9AFF7C]">
                      Alle notificaties bekijken
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Profile Dropdown */}
            <div suppressHydrationWarning>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-3 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
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


