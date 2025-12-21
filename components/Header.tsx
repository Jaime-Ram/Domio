'use client'

import { Logo } from '@/components/Logo'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, ChevronDown, Home, User, Briefcase, BookOpen, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (typeof window === 'undefined') return
    
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.warn('Auth error:', authError.message)
          return
        }
        
        if (user) {
          setUser(user)
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', user.id)
              .single()
            
            if (profileError) {
              console.warn('Could not fetch user profile:', profileError.message)
              return
            }
            
            if (profile) {
              setUserRole(profile.role)
            }
          } catch (profileError: any) {
            console.warn('Error fetching profile:', profileError?.message || profileError)
          }
        }
      } catch (error: any) {
        console.error('Error fetching user:', error?.message || error)
      }
    }
    
    fetchUser()
  }, [])

  // Don't show header on auth pages
  if (!mounted || pathname?.startsWith('/login') || 
      pathname?.startsWith('/register') || 
      pathname?.startsWith('/forgot-password') ||
      pathname?.startsWith('/reset-password')) {
    return null
  }

  // Dashboard pages get a different header
  if (pathname?.startsWith('/dashboard')) {
    return (
      <nav className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="py-2">
            <Logo width={120} height={32} />
          </div>
          <div className="flex items-center gap-4">
            {userRole && (
              <span className="text-sm text-muted-foreground capitalize">{userRole}</span>
            )}
            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  window.location.href = '/login'
                } catch (error) {
                  console.error('Logout error:', error)
                  window.location.href = '/login'
                }
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <header className="sticky top-4 z-50 w-full">
      <div className="relative mx-auto max-w-5xl px-2 lg:px-0">
        {/* Background with border and rounded corners */}
        <div className="absolute inset-0 rounded-4xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 -z-10" />
        
        <nav className="relative flex flex-wrap items-center justify-between gap-3 px-5 py-2 md:flex-nowrap">
          {/* Logo with Mobile Menu Button */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="py-2">
              <Logo width={120} height={32} />
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative size-9 flex justify-center items-center text-sm font-semibold rounded-full border border-gray-200 text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </button>
          </div>

          {/* Navigation Menu */}
          <div
            className={cn(
              "w-full md:flex md:items-center md:justify-end gap-0.5 md:gap-1 overflow-hidden transition-all duration-300",
              mobileMenuOpen ? "block" : "hidden"
            )}
          >
            <div className="py-2 md:py-0 flex flex-col md:flex-row md:items-center md:justify-end gap-0.5 md:gap-1 max-h-[75vh] overflow-y-auto md:overflow-visible">
              {/* Landing */}
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "w-full md:w-auto justify-start md:justify-center p-2 text-sm",
                  pathname === '/' 
                    ? "text-primary-600 dark:text-primary-400" 
                    : "text-gray-800 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-500"
                )}
              >
                <Link href="/">
                  <Home className="md:hidden shrink-0 size-4 mr-3" />
                  Landing
                </Link>
              </Button>

              {/* Account */}
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "w-full md:w-auto justify-start md:justify-center p-2 text-sm text-gray-800 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-500"
                )}
              >
                <Link href="/account">
                  <User className="md:hidden shrink-0 size-4 mr-3" />
                  Account
                </Link>
              </Button>

              {/* Work */}
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "w-full md:w-auto justify-start md:justify-center p-2 text-sm text-gray-800 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-500"
                )}
              >
                <Link href="/work">
                  <Briefcase className="md:hidden shrink-0 size-4 mr-3" />
                  Work
                </Link>
              </Button>

              {/* Blog */}
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "w-full md:w-auto justify-start md:justify-center p-2 text-sm text-gray-800 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-500"
                )}
              >
                <Link href="/blog">
                  <BookOpen className="md:hidden shrink-0 size-4 mr-3" />
                  Blog
                </Link>
              </Button>

              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full md:w-auto justify-start md:justify-center p-2 text-sm text-gray-800 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-500"
                  >
                    <List className="md:hidden shrink-0 size-4 mr-3" />
                    Dropdown
                    <ChevronDown className="ml-auto md:ml-1 size-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-full md:w-52">
                  <DropdownMenuItem asChild>
                    <Link href="/about">About</Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem asChild>
                        <Link href="/about">About</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/downloads">Downloads</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/team-account">Team Account</Link>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/downloads">Downloads</Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/team-account">Team Account</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Button Group - Login/Sign Up */}
              <div className="relative flex flex-wrap items-center gap-x-1.5 md:ps-2.5 md:ms-1.5 md:border-l md:border-gray-300 dark:md:border-gray-700">
                {user ? (
                  <>
                    <Button asChild variant="ghost" className="w-full md:w-auto p-2">
                      <Link href={`/dashboard/${userRole || 'employee'}`}>
                        <User className="md:hidden shrink-0 size-4 mr-3" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full md:w-auto p-2"
                      onClick={async () => {
                        try {
                          const supabase = createClient()
                          await supabase.auth.signOut()
                          window.location.href = '/'
                        } catch (error) {
                          console.error('Logout error:', error)
                          window.location.href = '/'
                        }
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="w-full md:w-auto p-2">
                      <Link href="/login">
                        <User className="md:hidden shrink-0 size-4 mr-3" />
                        Log in
                      </Link>
                    </Button>
                    <Button asChild className="w-full md:w-auto p-2">
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

// HeaderDropdownSimple component - matches the structure you provided
export const HeaderDropdownSimple = () => (
  <Header />
)
