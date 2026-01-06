'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Menu, Bell, Settings, User, Search, Zap, Building2, Users, FileText, Wrench } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ContentHeaderProps {
  onMenuClick?: () => void
}

export function ContentHeader({ onMenuClick }: ContentHeaderProps) {

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
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
          <div className="hidden md:flex flex-1 max-w-2xl mx-4 items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Zoek voor alles..."
                className="pl-10 pr-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-neutral-700 rounded-full"
              />
            </div>
            {/* Quick Actions Dropdown - Desktop */}
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

          {/* Quick Actions Dropdown - Mobile */}
          <div className="flex md:hidden">
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

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Instellingen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profiel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>
    </header>
  )
}


