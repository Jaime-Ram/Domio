'use client'

import { useState, useEffect } from 'react'
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
  ChevronRight,
  PanelLeftClose,
  PanelRightClose,
  X,
  Home,
  Briefcase,
  MessageSquare,
  Archive,
  ShieldCheck,
  Euro,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'
import { useRouter } from 'next/navigation'

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
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function VastgoedSidebar({ isOpen = false, onClose, collapsed = false, onToggleCollapse }: VastgoedSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [showTrialBlock, setShowTrialBlock] = useState(!collapsed)

  // Only show trial block after sidebar animation completes (300ms)
  useEffect(() => {
    if (collapsed) {
      // Hide immediately when collapsing
      setShowTrialBlock(false)
    } else {
      // If already expanded on mount, show immediately
      // Otherwise show after animation completes when expanding
      const timer = setTimeout(() => {
        setShowTrialBlock(true)
      }, 350) // Slightly longer than sidebar transition (300ms) to ensure animation is complete
      
      return () => clearTimeout(timer)
    }
  }, [collapsed])

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
      href: '/dashboard/employer/portfolio',
      icon: Building2,
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
      label: 'Boekhouden',
      href: '/dashboard/employer/accounting',
      icon: BookOpen,
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
          className="fixed inset-0 bg-gray-900/50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          "fixed top-0 md:top-[57px] bottom-0 start-0 z-[60] bg-[#f4f4f4] border-e border-gray-200 transform dark:bg-neutral-800 dark:border-neutral-700 rounded-tr-3xl rounded-br-3xl",
          "transition-[width,transform] duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:fixed lg:z-auto lg:flex-shrink-0",
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
        style={{
          transitionProperty: 'width, transform',
          transitionDuration: '300ms',
          transitionTimingFunction: 'ease-in-out',
          willChange: 'width'
        }}
      >
        <div className="relative flex flex-col h-full max-h-full">
          <div className={cn(
            "h-16 flex items-center border-b border-gray-200 dark:border-neutral-700 transition-all duration-300",
            collapsed ? "px-2.5 justify-start" : "px-6 justify-between"
          )}>
            {/* Logo - Disappears when collapsed */}
            <div className={cn(
              "flex items-center transition-all duration-300 ease-in-out",
              collapsed ? "opacity-0 scale-0 max-w-0 overflow-hidden" : "opacity-100 scale-100 max-w-full"
            )}>
              <Logo width={100} height={28} href="/dashboard/employer" />
            </div>
            {/* Toggle button and mobile close - Same position as icons when collapsed */}
            <div className={cn(
              "flex items-center gap-2 transition-all duration-300",
              collapsed ? "" : "ml-auto"
            )}>
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex items-center justify-center h-8 w-8"
                  onClick={onToggleCollapse}
                  title={collapsed ? "Uitklappen" : "Inklappen"}
                >
                  {collapsed ? <PanelRightClose className="size-4 shrink-0" /> : <PanelLeftClose className="size-4 shrink-0" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex items-center justify-center h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-neutral-700"
                onClick={onClose}
                title="Sluiten"
              >
                <PanelLeftClose className="size-4 shrink-0" />
              </Button>
            </div>
          </div>

          <div className={cn(
            "flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500",
            collapsed && "overflow-x-hidden"
          )}>
            <nav className={cn("w-full flex flex-col flex-wrap transition-[padding] duration-300 ease-in-out", collapsed ? "p-2" : "p-3")}>
              <ul className="flex flex-col space-y-1">
                {menuItems.map((item) => {
                  const itemId = item.label.toLowerCase().replace(/\s+/g, '-') + '-accordion'
                  const isOpen = openItems.includes(itemId)
                  const hasActiveChild = isParentActive(item.children)
                  const Icon = item.icon

                  if (item.children) {
                    if (collapsed) {
                      // Collapsed mode: show only icon with tooltip
                      return (
                        <li key={item.label} id={itemId} className="relative group">
                          <button
                            type="button"
                            onClick={() => toggleItem(itemId)}
                            className={cn(
                              "w-full flex items-center justify-start py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 dark:text-neutral-200 transition-all duration-150",
                              hasActiveChild && "bg-gray-200 dark:bg-neutral-700"
                            )}
                            title={item.label}
                          >
                            <Icon className="shrink-0 size-5 w-5 h-5" />
                          </button>
                          {/* Tooltip */}
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        </li>
                      )
                    }
                    
                    return (
                      <li key={item.label} id={itemId}>
                        <button
                          type="button"
                          onClick={() => toggleItem(itemId)}
                          className={cn(
                            "w-full text-start flex items-center py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 dark:text-neutral-200 transition-all duration-150",
                            hasActiveChild && "bg-gray-200 dark:bg-neutral-700"
                          )}
                        >
                          <Icon className="shrink-0 size-5 w-5 h-5" />
                          <span className={cn(
                            "flex-1 ml-3.5 transition-all duration-300 ease-in-out",
                            collapsed ? "opacity-0 max-w-0 overflow-hidden ml-0" : "opacity-100 max-w-full"
                          )}>{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              "px-2 py-0.5 text-xs font-medium bg-[#002A1F] text-white rounded-full transition-all duration-300 ease-in-out",
                              collapsed && "opacity-0 max-w-0 overflow-hidden"
                            )}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronDown 
                            className={cn(
                              "ms-auto shrink-0 size-5 w-5 h-5 transition-all duration-300 ease-in-out",
                              isOpen && "rotate-180",
                              collapsed && "opacity-0 max-w-0 overflow-hidden"
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
                                      "flex items-center py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 transition-all duration-150",
                                      active 
                                        ? "bg-gray-200 text-[#002A1F] font-semibold dark:bg-neutral-700 dark:text-[#9AFF7C]" 
                                        : "text-gray-800 dark:text-neutral-200"
                                    )}
                                  >
                                    <ChildIcon className="shrink-0 size-5 w-5 h-5" />
                                    <span className="ml-3.5">{child.label}</span>
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
                  
                  if (collapsed) {
                    // Collapsed mode: show only icon with tooltip
                    return (
                      <li key={item.label} className="relative group">
                        <Link
                          href={item.href || '#'}
                          className={cn(
                            "w-full flex items-center justify-start py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 transition-all duration-150",
                            active 
                              ? "bg-gray-200 text-[#002A1F] font-semibold dark:bg-neutral-700 dark:text-[#9AFF7C]" 
                              : "text-gray-800 dark:text-neutral-200"
                          )}
                          title={item.label}
                        >
                          <Icon className="shrink-0 size-5 w-5 h-5" />
                          {item.badge && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-[#002A1F] rounded-full" />
                          )}
                        </Link>
                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      </li>
                    )
                  }
                  
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href || '#'}
                        className={cn(
                          "w-full flex items-center py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002A1F] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 transition-all duration-150",
                          active 
                            ? "bg-gray-200 text-[#002A1F] font-semibold dark:bg-neutral-700 dark:text-[#9AFF7C]" 
                            : "text-gray-800 dark:text-neutral-200"
                        )}
                      >
                        <Icon className="shrink-0 size-5 w-5 h-5" />
                        <span className={cn(
                          "flex-1 ml-3.5 transition-all duration-300 ease-in-out",
                          collapsed ? "opacity-0 max-w-0 overflow-hidden ml-0" : "opacity-100 max-w-full"
                        )}>{item.label}</span>
                        {item.badge && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium bg-[#002A1F] text-white rounded-full transition-all duration-300 ease-in-out",
                            collapsed && "opacity-0 max-w-0 overflow-hidden"
                          )}>
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
          
          {/* 30 dagen gratis blokje - Only visible after sidebar animation completes */}
          <div className={cn(
            "border-t border-gray-200 dark:border-neutral-700 p-3 flex-shrink-0 transition-opacity duration-200",
            showTrialBlock ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {showTrialBlock && (
              <div className="bg-[#002A1F] rounded-xl p-4 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Het zelf ervaren?
                  </h3>
                  <p className="text-xs font-medium text-white mb-3">
                    Proberen 30 dagen gratis
                  </p>
                  <Button
                    className="bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 rounded-lg w-full text-xs h-8"
                    onClick={() => router.push('/')}
                  >
                    Registreren
                  </Button>
                </div>
                {/* Geometric decorative element - subtle in quiet corner */}
                <GeometricShapes 
                  variant="trapezoid" 
                  className="right-0 bottom-0 w-32 h-32"
                  color="#9AFF7C"
                  opacity={0.12}
                  layers={2}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

