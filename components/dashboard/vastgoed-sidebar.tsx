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
  Briefcase,
  MessageSquare,
  Archive,
  ShieldCheck,
  Euro,
  BookOpen,
  AlertTriangle,
  ClipboardCheck,
  HardDrive,
  HelpCircle
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
  /** Base path voor links (default: /dashboard/employer). Voor demo: /demo/app */
  basePath?: string
  /** Demo-modus: cleaner look, nav grijs zonder rand */
  demoMode?: boolean
}

export function VastgoedSidebar({ isOpen = false, onClose, collapsed = false, onToggleCollapse, basePath = '/dashboard/employer', demoMode = false }: VastgoedSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [showTrialBlock, setShowTrialBlock] = useState(!collapsed)

  // Auto-expand alleen de sectie van de actieve route; maximaal één accordion open
  useEffect(() => {
    const menuItemsWithChildren = [
      { id: 'portefeuille-accordion', paths: [`${basePath}/portfolio`, `${basePath}/tenants`] },
      { id: 'compliance-accordion', paths: [`${basePath}/compliance`] },
      { id: 'financieel-accordion', paths: [`${basePath}/financial`] },
      { id: 'onderhoud-accordion', paths: [`${basePath}/maintenance`] },
    ]
    const toOpen = menuItemsWithChildren
      .filter(({ paths }) => paths.some((p) => pathname === p || pathname.startsWith(p + '/')))
      .map(({ id }) => id)
    setOpenItems(toOpen)
  }, [pathname, basePath])

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
        : [id]
    )
  }

  const menuItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: basePath,
      icon: LayoutDashboard,
    },
    {
      label: 'Portefeuille',
      icon: Building2,
      children: [
        { label: 'Objecten', href: `${basePath}/portfolio`, icon: Building2 },
        { label: 'Huurders', href: `${basePath}/tenants`, icon: Users },
      ],
    },
    {
      label: 'Compliance',
      icon: ShieldCheck,
      children: [
        { label: 'WWS Overzicht', href: `${basePath}/compliance`, icon: BarChart3 },
        { label: 'Puntentelling', href: `${basePath}/compliance/puntentelling`, icon: Calculator },
        { label: 'Alerts', href: `${basePath}/compliance/alerts`, icon: AlertTriangle },
      ],
    },
    {
      label: 'Financieel',
      icon: Euro,
      children: [
        { label: 'Facturatie', href: `${basePath}/financial`, icon: Receipt },
        { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
        { label: 'Rendement', href: `${basePath}/financial/rendement`, icon: TrendingUp },
        { label: 'Bankimport', href: `${basePath}/financial/bankimport`, icon: Scan },
      ],
    },
    {
      label: 'Onderhoud',
      icon: Wrench,
      children: [
        { label: 'Tickets', href: `${basePath}/maintenance`, icon: Wrench },
        { label: 'Inspecties', href: `${basePath}/maintenance/inspecties`, icon: ClipboardCheck },
        { label: 'Planning', href: `${basePath}/maintenance/planning`, icon: Calendar },
      ],
    },
    {
      label: 'Communicatie',
      href: `${basePath}/messages`,
      icon: MessageSquare,
    },
    {
      label: 'Drive',
      href: `${basePath}/documents`,
      icon: HardDrive,
    },
    {
      label: 'Rapportages',
      href: `${basePath}/reports`,
      icon: FileCheck,
    },
    {
      label: 'Instellingen',
      href: `${basePath}/settings`,
      icon: Settings,
    },
  ]

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === basePath) return pathname === href
    return pathname === href || pathname?.startsWith(href + '/')
  }

  /** Binnen een accordion alleen het meest specifieke (langste) pad als actief; voorkomt dat Facturatie én Rendement beide geselecteerd zijn. */
  const getActiveChildHref = (children: SidebarItem['children']): string | null => {
    if (!children?.length) return null
    const matching = children.filter((c) => pathname === c.href || pathname.startsWith(c.href + '/'))
    if (matching.length === 0) return null
    return matching.sort((a, b) => b.href.length - a.href.length)[0].href
  }

  const isParentActive = (children?: SidebarItem['children']) => {
    if (!children) return false
    return getActiveChildHref(children) !== null
  }

  return (
    <>
      {/* Overlay for mobile - hoge z-index zodat boven header en dropdowns */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-[100] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        data-vastgoed-sidebar
        className={cn(
          "fixed top-0 bottom-0 start-0 z-[110] bg-[#f4f4f4] dark:bg-neutral-800 transform rounded-tr-3xl rounded-br-3xl",
          !demoMode && "border-e border-gray-200 dark:border-neutral-700",
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
            collapsed ? "px-3 justify-end" : "px-6 justify-between"
          )}>
            {/* Logo - Disappears when collapsed */}
            <div className={cn(
              "flex items-center transition-all duration-300 ease-in-out",
              collapsed ? "opacity-0 scale-0 max-w-0 overflow-hidden" : "opacity-100 scale-100 max-w-full"
            )}>
              <Logo width={100} height={28} href={basePath} />
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
            <nav
              className={cn("w-full flex flex-col flex-wrap transition-[padding] duration-300 ease-in-out", collapsed ? "pl-3 pr-2 py-2" : "p-3")}
              onClick={(e) => {
                const link = (e.target as HTMLElement).closest('a[href]')
                if (link && onClose) onClose()
              }}
            >
              <ul className="flex flex-col space-y-1">
                {menuItems.map((item) => {
                  const itemId = item.label.toLowerCase().replace(/\s+/g, '-') + '-accordion'
                  const isOpen = openItems.includes(itemId)
                  const hasActiveChild = isParentActive(item.children)
                  const Icon = item.icon

                  if (item.children) {
                    return (
                      <li key={item.label} id={itemId} className={cn("relative group", collapsed && "flex")}>
                        <button
                          type="button"
                          onClick={() => {
                            if (isOpen) {
                              toggleItem(itemId)
                            } else {
                              router.push(item.children![0].href)
                            }
                          }}
                          className={cn(
                            "text-start flex items-center py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#163300] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 dark:text-neutral-200 transition-all duration-150",
                            collapsed ? "w-10 h-10 min-w-0 shrink-0 p-2.5" : "w-full",
                            hasActiveChild && "bg-gray-200 dark:bg-neutral-700"
                          )}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon className="shrink-0 size-5 w-5 h-5" />
                          <span className={cn(
                            "flex-1 ml-3.5 min-w-0 transition-all duration-300 ease-in-out",
                            collapsed ? "opacity-0 max-w-0 overflow-hidden ml-0" : "opacity-100 max-w-full"
                          )}>{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              "px-2 py-0.5 text-xs font-medium bg-[#163300] text-white rounded-full shrink-0 transition-all duration-300 ease-in-out",
                              collapsed && "opacity-0 max-w-0 overflow-hidden"
                            )}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronDown 
                            className={cn(
                              "ms-auto shrink-0 size-5 w-5 h-5 transition-all duration-300 ease-in-out",
                              isOpen && "rotate-180",
                              collapsed && "opacity-0 max-w-0 overflow-hidden w-0 ms-0"
                            )}
                          />
                        </button>
                        {/* Tooltip wanneer ingeklapt */}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                        <div 
                          className={cn(
                            "w-full overflow-hidden transition-all duration-300 ease-in-out",
                            isOpen && !collapsed ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                          )}
                        >
                          <ul className="ps-8 pt-1 space-y-1">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon || FileText
                              const active = getActiveChildHref(item.children) === child.href
                              return (
                                <li key={child.label}>
                                  <Link
                                    href={child.href}
                                    className={cn(
                                      "flex items-center py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#163300] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 transition-all duration-150",
                                      active 
                                        ? "bg-gray-200 text-[#163300] font-semibold dark:bg-neutral-700 dark:text-[#9FE870]" 
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
                  return (
                    <li key={item.label} className={cn("relative group", collapsed && "flex")}>
                      <Link
                        href={item.href || '#'}
                        className={cn(
                          "flex items-center py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#163300] focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700 transition-all duration-150",
                          collapsed ? "w-10 h-10 min-w-0 shrink-0 p-2.5" : "w-full",
                          active 
                            ? "bg-gray-200 text-[#163300] font-semibold dark:bg-neutral-700 dark:text-[#9FE870]" 
                            : "text-gray-800 dark:text-neutral-200"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="shrink-0 size-5 w-5 h-5" />
                        <span className={cn(
                          "flex-1 ml-3.5 min-w-0 transition-all duration-300 ease-in-out",
                          collapsed ? "opacity-0 max-w-0 overflow-hidden ml-0" : "opacity-100 max-w-full"
                        )}>{item.label}</span>
                        {item.badge && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium bg-[#163300] text-white rounded-full shrink-0 transition-all duration-300 ease-in-out",
                            collapsed && "opacity-0 max-w-0 overflow-hidden"
                          )}>
                            {item.badge}
                          </span>
                        )}
                        {item.badge && collapsed && (
                          <span className="absolute top-0 right-0 w-2 h-2 bg-[#163300] rounded-full" />
                        )}
                      </Link>
                      {/* Tooltip wanneer ingeklapt */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>

          {/* Hulp - subtiel onderaan, geen apart blok */}
          <div className={cn(
            "flex-shrink-0 transition-all duration-300",
            collapsed ? "p-2" : "px-3 py-2"
          )}>
            <Link
              href={`${basePath}/hulp`}
              className={cn(
                "flex items-center gap-2 py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors text-gray-800 dark:text-neutral-200",
                collapsed && "w-10 h-10 min-w-0 justify-center p-2.5"
              )}
              title={collapsed ? "Hulp nodig?" : undefined}
            >
              <HelpCircle className="shrink-0 size-5 w-5 h-5" />
              {!collapsed && <span className="text-sm flex-1">Hulp nodig?</span>}
              {!collapsed && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal shrink-0">Live</span>
              )}
              <span className="relative shrink-0">
                <span className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping opacity-60" aria-hidden />
                <span className="relative block w-1.5 h-1.5 rounded-full bg-brand-accent" />
              </span>
            </Link>
          </div>
          
          {/* 30 dagen gratis blokje - Only visible after sidebar animation completes */}
          <div className={cn(
            "border-t border-gray-200 dark:border-neutral-700 p-3 flex-shrink-0 transition-opacity duration-200",
            showTrialBlock ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {showTrialBlock && (
              <div className="bg-[#163300] rounded-xl p-4 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Domio zelf ervaren?
                  </h3>
                  <p className="text-xs font-medium text-white mb-3">
                    Proberen 30 dagen gratis
                  </p>
                  <Button
                    className="bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 rounded-lg w-full text-xs h-8"
                    onClick={() => router.push('/')}
                  >
                    Registreren
                  </Button>
                </div>
                {/* Geometric decorative element - subtle in quiet corner */}
                <GeometricShapes 
                  variant="trapezoid" 
                  className="right-0 bottom-0 w-32 h-32"
                  color="#9FE870"
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

