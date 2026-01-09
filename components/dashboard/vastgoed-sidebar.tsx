'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { 
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Wrench,
  CreditCard,
  Receipt,
  Calculator,
  TrendingUp,
  FileCheck,
  Eye,
  Settings,
  FolderOpen,
  UserCircle,
  Link2,
  Bell,
  Scan,
  CheckCircle,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  X,
  Home,
  Briefcase,
  MessageSquare,
  Archive,
  ShieldCheck,
  Euro
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarItem {
  label: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: { label: string; href: string; icon?: React.ComponentType<{ className?: string }> }[]
  badge?: string | number
}

interface VastgoedSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function VastgoedSidebar({ isOpen = false, onClose }: VastgoedSidebarProps) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])

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
      href: '/dashboard/employer',
      icon: LayoutDashboard,
    },
    {
      label: 'Portefeuille',
      icon: Building2,
      children: [
        { label: 'Objecten', href: '/dashboard/employer/portfolio/properties', icon: Home },
        { label: 'Eigenaren', href: '/dashboard/employer/portfolio/owners', icon: UserCircle },
        { label: 'Overzicht', href: '/dashboard/employer/portfolio', icon: BarChart3 },
      ],
    },
    {
      label: 'Huurders',
      href: '/dashboard/employer/tenants',
      icon: Users,
    },
    {
      label: 'Contracten',
      icon: FileText,
      children: [
        { label: 'Huurovereenkomsten', href: '/dashboard/employer/contracts/leases', icon: FileText },
        { label: 'Assets', href: '/dashboard/employer/contracts/assets', icon: Briefcase },
        { label: 'Leveranciers', href: '/dashboard/employer/contracts/suppliers', icon: Link2 },
      ],
    },
    {
      label: 'Onderhoud',
      href: '/dashboard/employer/maintenance',
      icon: Wrench,
    },
    {
      label: 'Financieel',
      href: '/dashboard/employer/financial',
      icon: Euro,
    },
    {
      label: 'Documenten',
      href: '/dashboard/employer/documents',
      icon: FolderOpen,
    },
    {
      label: 'Compliance',
      href: '/dashboard/employer/compliance',
      icon: ShieldCheck,
    },
    {
      label: 'Instellingen',
      href: '/dashboard/employer/settings',
      icon: Settings,
    },
  ]

  const isActive = (href?: string) => {
    if (!href) return false
    // Special case: dashboard should only be active on exact match
    if (href === '/dashboard/employer') {
      return pathname === href
    }
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const isParentActive = (children?: SidebarItem['children']) => {
    if (!children) return false
    return children.some(child => isActive(child.href))
  }

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
          "fixed top-0 md:top-[57px] bottom-0 start-0 z-[60] bg-[#f4f4f4] border-e border-gray-200 transition-all duration-300 transform dark:bg-neutral-800 dark:border-neutral-700 w-64 rounded-tr-3xl rounded-br-3xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:fixed lg:z-auto lg:w-64 lg:flex-shrink-0"
        )}
      >
        <div className="relative flex flex-col h-full max-h-full">
          <div className="px-6 h-16 flex items-center justify-between border-b border-gray-200 dark:border-neutral-700">
            <Logo width={100} height={28} />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden flex items-center"
              onClick={onClose}
            >
              <ChevronLeft className="size-4 shrink-0" />
            </Button>
          </div>

          <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <nav className="p-3 w-full flex flex-col flex-wrap">
              <ul className="flex flex-col space-y-1">
                {menuItems.map((item) => {
                  const itemId = item.label.toLowerCase().replace(/\s+/g, '-') + '-accordion'
                  const isOpen = openItems.includes(itemId)
                  const hasActiveChild = isParentActive(item.children)
                  const Icon = item.icon

                  if (item.children) {
                    return (
                      <li key={item.label} id={itemId}>
                        <button
                          type="button"
                          onClick={() => toggleItem(itemId)}
                          className={cn(
                            "w-full text-start flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 dark:text-neutral-200 transition-all duration-150",
                            hasActiveChild && "bg-gray-200 dark:bg-neutral-700"
                          )}
                        >
                          <Icon className="shrink-0 size-4" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-[#002A1F] text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                          <ChevronDown 
                            className={cn(
                              "ms-auto shrink-0 size-4 transition-transform duration-300 ease-in-out",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>
                        <div 
                          className={cn(
                            "w-full overflow-hidden transition-all duration-300 ease-in-out",
                            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                          )}
                        >
                          <ul className="ps-8 pt-1 space-y-1">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon || FileText
                              const active = isActive(child.href)
                              return (
                                <li key={child.label}>
                                  <Link
                                    href={child.href}
                                    className={cn(
                                      "flex items-center gap-x-3.5 py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 transition-all duration-150",
                                      active 
                                        ? "bg-gray-200 text-[#002A1F] font-semibold dark:bg-neutral-700 dark:text-[#9AFF7C]" 
                                        : "text-gray-800 dark:text-neutral-200"
                                    )}
                                  >
                                    <ChildIcon className="shrink-0 size-4" />
                                    {child.label}
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </li>
                    )
                  }

                  const active = isActive(item.href)
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href || '#'}
                        className={cn(
                          "w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 transition-all duration-150",
                          active 
                            ? "bg-gray-200 text-[#002A1F] font-semibold dark:bg-neutral-700 dark:text-[#9AFF7C]" 
                            : "text-gray-800 dark:text-neutral-200"
                        )}
                      >
                        <Icon className="shrink-0 size-4" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-[#002A1F] text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
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

