'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Search, 
  Bell, 
  Eye,
  EyeOff,
  MoreVertical,
  User,
  Settings,
  LogOut,
  Send,
  Plus,
  FileText,
  CreditCard,
  Users,
  Calendar,
  ChevronDown,
  MessageCircle,
  Menu
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getAvatarUrl } from '@/lib/avatar-utils'

interface ContentHeaderProps {
  user?: {
    id: string
    email?: string
    avatar?: string
    name?: string
  }
  userProfile?: {
    role?: string
    employment_type?: string
    [key: string]: any
  }
  onBlurToggle?: (blurred: boolean) => void
  onMenuClick?: () => void
}

export function ContentHeader({ user, userProfile, onBlurToggle, onMenuClick }: ContentHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isBlurred, setIsBlurred] = useState(false)
  const [userData, setUserData] = useState<any>(user)
  const router = useRouter()
  const supabase = createClient()
  
  // Determine role badge
  const getRoleBadge = () => {
    const role = userProfile?.role || 'employee'
    if (role === 'employer') {
      return { label: 'Werkgever', variant: 'default' as const }
    } else if (role === 'owner') {
      return { label: 'Eigenaar', variant: 'default' as const }
    } else if (role === 'employee') {
      const employmentType = userProfile?.employment_type || 'vast'
      const typeLabel = employmentType === 'freelance' ? 'freelance' : 'vast'
      return { label: `Werknemer ${typeLabel}`, variant: 'secondary' as const }
    }
    return { label: 'Werknemer', variant: 'secondary' as const }
  }
  
  const roleBadge = getRoleBadge()

  useEffect(() => {
    if (!userData) {
      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserData(user)
        }
      }
      fetchUser()
    }
  }, [supabase, userData])

  const handleBlurToggle = useCallback(() => {
    setIsBlurred((prev) => {
      const newBlurred = !prev
      onBlurToggle?.(newBlurred)
      // Add blur class to body or specific elements
      if (newBlurred) {
        document.body.classList.add('blur-amounts')
      } else {
        document.body.classList.remove('blur-amounts')
      }
      return newBlurred
    })
  }, [onBlurToggle])

  // Keyboard shortcut: 'h' key toggles hide/show amounts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input, textarea, or contenteditable element
      if (e.key === 'h' || e.key === 'H') {
        const target = e.target as HTMLElement
        const isInput = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.isContentEditable
        
        if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          e.preventDefault()
          handleBlurToggle()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleBlurToggle])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const quickActions = [
    { label: 'Nieuwe betaling', icon: Send, href: '/dashboard/employer' },
    { label: 'Medewerker toevoegen', icon: Plus, href: '/dashboard/employer' },
    { label: 'Rapport genereren', icon: FileText, href: '/dashboard/employer/reports' },
    { label: 'Betalingen', icon: CreditCard, href: '/dashboard/employer' },
    { label: 'Team beheren', icon: Users, href: '/dashboard/team' },
    { label: 'Rooster', icon: Calendar, href: '/dashboard/employer/schedule' },
  ]

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-2 sm:gap-4 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu openen</span>
            </Button>

            {/* Search Bar and Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Search Bar */}
              <div className="flex-1 max-w-lg hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search for anything"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9 pr-3 text-sm border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#002A1F] dark:bg-gray-800 dark:focus:bg-gray-800"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
                    <span className="text-xs text-gray-400">⌘K</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Button - Shows first option - Hidden on mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 gap-2 hidden sm:flex"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden md:inline">{quickActions[0].label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <DropdownMenuItem key={action.label} asChild>
                        <Link href={action.href} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{action.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Hide/Show Amounts Toggle Button - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-[#002A1F]/30 hover:border-[#002A1F]/50 hidden sm:flex"
            onClick={handleBlurToggle}
            title={isBlurred ? 'Bedragen tonen' : 'Bedragen verbergen'}
          >
            {isBlurred ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">{isBlurred ? 'Bedragen tonen' : 'Bedragen verbergen'}</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-[#002A1F]/30 hover:border-[#002A1F]/50 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5">
              <span className="relative flex">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 dark:bg-red-600 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 bg-red-500 rounded-full"></span>
              </span>
            </span>
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage 
                    src={getAvatarUrl(userData?.user_metadata?.avatar_url || userData?.avatar, undefined, undefined, userData?.email || userData?.user_metadata?.email)} 
                    alt={userData?.email || userData?.user_metadata?.email || 'User'} 
                  />
                  <AvatarFallback>
                    {(userData?.email || userData?.user_metadata?.email || 'U')?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="py-3 px-4 bg-gray-50 rounded-t-lg dark:bg-gray-800">
                <div className="mb-3">
                  <span className="inline-block px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md">
                    {roleBadge.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ingelogd als</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userData?.email || userData?.user_metadata?.email || 'user@example.com'}
                </p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Account bekijken</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Instellingen</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/employer#support" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Support</span>
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Uitloggen</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
            </div>
          </div>
        </div>
    </header>
  )
}

