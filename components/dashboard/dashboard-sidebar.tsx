'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { 
  Home, 
  Users, 
  UserCircle, 
  Briefcase, 
  Calendar, 
  FileText,
  BarChart3,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarItem {
  label: string
  href?: string
  icon: React.ReactNode
  children?: { label: string; href: string }[]
}

interface DashboardSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>(['users-accordion', 'account-accordion', 'projects-accordion'])

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const menuItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard/admin',
      icon: <Home className="shrink-0 size-4" />,
    },
    {
      label: 'Rapporten',
      href: '/dashboard/admin/reports',
      icon: <BarChart3 className="shrink-0 size-4" />,
    },
    {
      label: 'Users',
      icon: <Users className="shrink-0 size-4" />,
      children: [
        { label: 'Sub Menu 1', href: '#' },
        { label: 'Sub Menu 2', href: '#' },
      ],
    },
    {
      label: 'Account',
      icon: <UserCircle className="shrink-0 mt-0.5 size-4" />,
      children: [
        { label: 'Link 1', href: '#' },
        { label: 'Link 2', href: '#' },
        { label: 'Link 3', href: '#' },
      ],
    },
    {
      label: 'Projects',
      icon: <Briefcase className="shrink-0 size-4" />,
      children: [
        { label: 'Link 1', href: '#' },
        { label: 'Link 2', href: '#' },
        { label: 'Link 3', href: '#' },
      ],
    },
    {
      label: 'Calendar',
      href: '#',
      icon: <Calendar className="shrink-0 size-4" />,
    },
    {
      label: 'Documentation',
      href: '#',
      icon: <FileText className="shrink-0 size-4" />,
    },
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 start-0 z-60 bg-white border-e border-gray-200 transition-all duration-300 transform dark:bg-neutral-800 dark:border-neutral-700 w-64 h-full",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        <div className="relative flex flex-col h-full max-h-full">
          <div className="px-6 pt-4 flex items-center justify-between">
            <Logo width={120} height={32} />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>

        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
          <nav className="p-3 w-full flex flex-col flex-wrap">
            <ul className="flex flex-col space-y-1">
              {menuItems.map((item, index) => {
                const itemId = item.label.toLowerCase().replace(/\s+/g, '-') + '-accordion'
                const isOpen = openItems.includes(itemId)

                if (item.children) {
                  return (
                    <li key={item.label} id={itemId}>
                      <button
                        type="button"
                        onClick={() => toggleItem(itemId)}
                        className="w-full text-start flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:text-neutral-200"
                      >
                        {item.icon}
                        {item.label}
                        {isOpen ? (
                          <ChevronUp className="ms-auto shrink-0 size-4" />
                        ) : (
                          <ChevronDown className="ms-auto shrink-0 size-4" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="w-full overflow-hidden">
                          <ul className="ps-8 pt-1 space-y-1">
                            {item.children.map((child) => (
                              <li key={child.label}>
                                <Link
                                  href={child.href}
                                  className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:text-neutral-200"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  )
                }

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href || '#'}
                      className={cn(
                        "w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:text-neutral-200",
                        item.href && pathname === item.href && "bg-gray-100 dark:bg-neutral-700"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
      </div>
    </>
  )
}






