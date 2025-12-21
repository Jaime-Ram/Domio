'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Search, 
  Bell, 
  Activity, 
  Menu,
  BellRing,
  ShoppingBag,
  Download,
  Users as UsersIcon,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function DashboardHeader() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    }
    fetchUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-48 w-full bg-white text-sm py-2.5 dark:bg-neutral-800">
      <nav className="px-4 sm:px-6 flex basis-full items-center w-full mx-auto">
        <div className="me-5 lg:me-0 lg:hidden flex items-center">
          <Logo width={120} height={32} />
        </div>

        <div className="w-full flex items-center justify-end ms-auto md:justify-between gap-x-1 md:gap-x-3">
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5">
                <Search className="shrink-0 size-4 text-gray-400 dark:text-white/60" />
              </div>
              <input
                type="text"
                className="py-2 ps-10 pe-16 block w-full bg-white border-0 rounded-lg text-sm focus:outline-none focus:border focus:border-[#002A1F] focus:ring-2 focus:ring-[#002A1F] disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:text-neutral-400 dark:placeholder:text-neutral-400"
                placeholder="Search"
              />
              <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none z-20 pe-3 text-gray-400">
                <span className="text-xs">⌘K</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden size-9.5"
            >
              <Search className="shrink-0 size-4" />
              <span className="sr-only">Search</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9.5 relative"
            >
              <Bell className="shrink-0 size-4" />
              <span className="absolute -top-0.5 -end-0.5">
                <span className="relative flex">
                  <span className="animate-ping absolute inline-flex size-full rounded-full bg-red-400 dark:bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex size-2 bg-red-500 rounded-full"></span>
                </span>
              </span>
              <span className="sr-only">Notifications</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9.5"
            >
              <Activity className="shrink-0 size-4" />
              <span className="sr-only">Activity</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9.5 rounded-full"
                >
                  <Avatar className="size-9.5">
                    <AvatarImage src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80" alt="Avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="py-3 px-5 bg-gray-100 rounded-t-lg dark:bg-neutral-700">
                  <p className="text-sm text-gray-500 dark:text-neutral-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-neutral-200">
                    {user?.email || 'james@site.com'}
                  </p>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <DropdownMenuItem asChild>
                    <Link href="#" className="flex items-center gap-x-3.5">
                      <BellRing className="shrink-0 size-4" />
                      Newsletter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="flex items-center gap-x-3.5">
                      <ShoppingBag className="shrink-0 size-4" />
                      Purchases
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="flex items-center gap-x-3.5">
                      <Download className="shrink-0 size-4" />
                      Downloads
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="flex items-center gap-x-3.5">
                      <UsersIcon className="shrink-0 size-4" />
                      Team Account
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="shrink-0 size-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  )
}

