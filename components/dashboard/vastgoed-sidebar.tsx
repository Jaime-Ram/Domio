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
  Eye,
  Settings,
  FolderOpen,
  UserCircle,
  Bell,
  Scan,
  CheckCircle,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelRightClose,
  Briefcase,
  MessageSquare,
  Archive,
  ShieldCheck,
  Euro,
  BookOpen,
  AlertTriangle,
  ClipboardCheck,
  HardDrive,
  HelpCircle,
  Ticket,
  CalendarClock,
  Percent,
  Workflow,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export interface SidebarItem {
  label: string
  href?: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  children?: { label: string; href: string; icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> }[]
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
  /** Overschrijf de standaard menugroepen (bijv. voor huurderportal) */
  menuGroups?: SidebarItem[][]
  /** Toon de hulp-link onderaan (default: true) */
  showHulp?: boolean
}

export function VastgoedSidebar({ isOpen = false, onClose, collapsed = false, onToggleCollapse, basePath = '/dashboard/employer', demoMode = false, menuGroups: menuGroupsProp, showHulp = true }: VastgoedSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  // Zodra de echte pathname bijgewerkt is, wis de pending state
  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  // Auto-expand alleen de sectie van de actieve route; maximaal één accordion open
  useEffect(() => {
    const menuItemsWithChildren = [
      { id: 'financieel-accordion', paths: [`${basePath}/financial`] },
      { id: 'compliance-accordion', paths: [`${basePath}/compliance`] },
      { id: 'onderhoud-accordion', paths: [`${basePath}/maintenance`] },
    ]
    const toOpen = menuItemsWithChildren
      .filter(({ paths }) => paths.some((p) => pathname === p || pathname.startsWith(p + '/')))
      .map(({ id }) => id)
    setOpenItems(toOpen)
  }, [pathname, basePath])


  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [id]
    )
  }

  const defaultMenuGroups: SidebarItem[][] = [
    [
      { label: 'Dashboard', href: basePath, icon: LayoutDashboard },
      { label: 'Taken', href: `${basePath}/tasks`, icon: ClipboardCheck },
      { label: 'Portefeuille', href: `${basePath}/portfolio`, icon: Building2 },
      { label: 'Huurders', href: `${basePath}/tenants`, icon: Users },
      { label: 'Communicatie', href: `${basePath}/messages`, icon: MessageSquare },
      { label: 'Documenten', href: `${basePath}/documents`, icon: HardDrive },
      {
        label: 'Financieel',
        icon: Euro,
        children: [
          { label: 'Dashboard', href: `${basePath}/financial`, icon: LayoutDashboard },
          { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
          { label: 'Achterstanden', href: `${basePath}/financial/achterstanden`, icon: AlertTriangle },
          { label: 'Huurafrekeningen', href: `${basePath}/financial/huurafrekening`, icon: Receipt },
          { label: 'Betaalflow', href: `${basePath}/financial/betaalflow`, icon: Workflow },
          { label: 'Verdeelsleutel', href: `${basePath}/financial/verdeelsleutel`, icon: BookOpen },
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
        label: 'Onderhoud',
        icon: Wrench,
        children: [
          { label: 'Tickets', href: `${basePath}/maintenance`, icon: Ticket },
          { label: 'Inspecties', href: `${basePath}/maintenance/inspecties`, icon: ClipboardCheck },
          { label: 'Planning', href: `${basePath}/maintenance/planning`, icon: Calendar },
        ],
      },
    ],
    [
      { label: 'Flow', href: `${basePath}/flow`, icon: Workflow },
      { label: 'Domio Assist', href: `${basePath}/assist`, icon: Sparkles },
    ],
    [
      { label: 'Accountinstellingen', href: `${basePath}/settings`, icon: Settings },
    ],
  ]

  const menuGroups = menuGroupsProp ?? defaultMenuGroups

  const activePath = pendingHref ?? pathname

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === basePath) return activePath === href
    return activePath === href || activePath?.startsWith(href + '/')
  }

  /** Binnen een accordion alleen het meest specifieke (langste) pad als actief. */
  const getActiveChildHref = (children: SidebarItem['children']): string | null => {
    if (!children?.length) return null
    const matching = children.filter((c) => activePath === c.href || activePath.startsWith(c.href + '/'))
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
        {/* Depth gradient — simuleert dat de sidebar achter de content ligt */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-5 rounded-tr-3xl rounded-br-3xl bg-gradient-to-l from-black/[0.035] to-transparent dark:from-black/[0.10] z-10"
        />
        <div className="relative flex flex-col h-full max-h-full">
          <div className={cn(
            "h-[5.25rem] flex items-center transition-all duration-300",
            collapsed ? "pl-3 pr-2 justify-start" : "px-6 justify-between"
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
                <button
                  type="button"
                  className="hidden lg:flex items-center py-2 px-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                  onClick={onToggleCollapse}
                  title={collapsed ? "Uitklappen" : "Inklappen"}
                >
                  {collapsed ? <PanelRightClose className="size-5 shrink-0" /> : <PanelLeftClose className="size-5 shrink-0" />}
                </button>
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

          <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <nav
              className={cn("w-full flex flex-col transition-[padding] duration-300 ease-in-out", collapsed ? "px-3 py-2" : "p-3")}
              onClick={(e) => {
                const link = (e.target as HTMLElement).closest('a[href]')
                if (link && onClose) onClose()
              }}
            >
              <div className="flex flex-col">
                {menuGroups.map((group, groupIndex) => {
                  const renderItem = (item: SidebarItem) => {
                    const itemId = item.label.toLowerCase().replace(/\s+/g, '-') + '-accordion'
                    const isOpen = openItems.includes(itemId)
                    const hasActiveChild = isParentActive(item.children)
                    const Icon = item.icon

                    if (item.children) {
                      return (
                        <li key={item.label} id={itemId} className="relative group">
                          <button
                            type="button"
                            onClick={() => {
                              const firstHref = item.children![0].href
                              toggleItem(itemId)
                              if (!isOpen) {
                                setPendingHref(firstHref)
                                router.push(firstHref)
                              }
                            }}
                            className={cn(
                              "text-start flex items-center w-full py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:text-neutral-200 transition-colors duration-150 focus:outline-none",
                              hasActiveChild && "bg-gray-200 dark:bg-neutral-700"
                            )}
                            title={collapsed ? item.label : undefined}
                          >
                            <Icon className="shrink-0 size-5 w-5 h-5" strokeWidth={hasActiveChild ? 2.5 : 2} />
                            <span className={cn(
                              "flex-1 ml-3.5 min-w-0 whitespace-nowrap transition-all duration-300 ease-in-out",
                              collapsed ? "opacity-0 max-w-0 h-0 overflow-hidden ml-0" : "opacity-100 max-w-full"
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
                          <div
                            className={cn(
                              "w-full overflow-hidden transition-all duration-300 ease-in-out",
                              collapsed ? "hidden" : isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                                      onClick={() => setPendingHref(child.href)}
                                      className={cn(
                                        "flex items-center py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-600 transition-all duration-150 focus:outline-none",
                                        active
                                          ? "bg-gray-200 text-[#163300] font-medium dark:bg-neutral-700 dark:text-[#9FE870]"
                                          : "text-gray-800 dark:text-neutral-200"
                                      )}
                                    >
                                      <ChildIcon className="shrink-0 size-5 w-5 h-5" strokeWidth={active ? 2.5 : 2} />
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
                      <li key={item.label} className="relative group">
                        <Link
                          href={item.href || '#'}
                          onClick={() => item.href && setPendingHref(item.href)}
                          className={cn(
                            "flex items-center w-full py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-600 transition-colors duration-150 focus:outline-none",
                            active
                              ? "bg-gray-200 text-[#163300] font-medium dark:bg-neutral-700 dark:text-[#9FE870]"
                              : "text-gray-800 dark:text-neutral-200"
                          )}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon className="shrink-0 size-5 w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                          <span className={cn(
                            "flex-1 ml-3.5 min-w-0 whitespace-nowrap transition-all duration-300 ease-in-out",
                            collapsed ? "opacity-0 max-w-0 h-0 overflow-hidden ml-0" : "opacity-100 max-w-full"
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
                      </li>
                    )
                  }

                  return (
                    <div key={groupIndex}>
                      {groupIndex > 0 && (
                        <hr className={cn(
                          "my-2 border-gray-200 dark:border-neutral-700",
                          collapsed && "mx-1"
                        )} />
                      )}
                      <ul className="flex flex-col space-y-1">
                        {group.map(renderItem)}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </nav>
          </div>

          {/* Hulp - subtiel onderaan, geen apart blok */}
          {showHulp && <div className="flex-shrink-0 px-3 py-2">
            <Link
              href={`${basePath}/hulp`}
              className="flex items-center w-full py-2 px-2.5 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors text-gray-800 dark:text-neutral-200"
              title={collapsed ? "Hulp nodig?" : undefined}
            >
              <HelpCircle className="shrink-0 size-5 w-5 h-5" />
              <span className={cn(
                "flex-1 ml-3.5 min-w-0 whitespace-nowrap transition-all duration-300 ease-in-out",
                collapsed ? "opacity-0 max-w-0 h-0 overflow-hidden ml-0" : "opacity-100 max-w-full"
              )}>Hulp nodig?</span>
              <span className={cn(
                "text-xs text-gray-500 dark:text-gray-400 font-normal shrink-0 transition-all duration-300 ease-in-out",
                collapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-full"
              )}>Live</span>
              {!collapsed && (
                <span className="relative shrink-0 ml-1.5">
                  <span className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping opacity-60" aria-hidden />
                  <span className="relative block w-1.5 h-1.5 rounded-full bg-brand-accent" />
                </span>
              )}
            </Link>
          </div>}

        </div>
      </div>
    </>
  )
}

