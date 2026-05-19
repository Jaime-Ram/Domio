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
  Settings,
  BarChart3,
  ChevronDown,
  PanelLeftClose,
  PanelRightClose,
  ShieldCheck,
  Euro,
  BookOpen,
  AlertTriangle,
  ClipboardCheck,
  HardDrive,
  HelpCircle,
  Ticket,
  Calendar,
  Workflow,
  Sparkles,
  Smartphone,
  Plug,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface SidebarItem {
  label: string
  href?: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  children?: { label: string; href: string; icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> }[]
  badge?: string | number
  comingSoon?: boolean
}

export interface MenuGroup {
  label?: string
  items: SidebarItem[]
}

interface VastgoedSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  basePath?: string
  demoMode?: boolean
  menuGroups?: MenuGroup[]
  showHulp?: boolean
}

export function VastgoedSidebar({ isOpen = false, onClose, collapsed = false, onToggleCollapse, basePath = '/dashboard/landlord', demoMode = false, menuGroups: menuGroupsProp, showHulp = true }: VastgoedSidebarProps) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

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

  const defaultMenuGroups: MenuGroup[] = [
    {
      label: 'Overzicht',
      items: [
        { label: 'Dashboard', href: basePath, icon: LayoutDashboard },
        { label: 'Taken', href: `${basePath}/tasks`, icon: ClipboardCheck },
      ],
    },
    {
      label: 'Vastgoedbeheer',
      items: [
        { label: 'Portefeuille', href: `${basePath}/portfolio`, icon: Building2 },
        { label: 'Huurders', href: `${basePath}/tenants`, icon: Users },
        { label: 'Documenten', href: `${basePath}/documents`, icon: HardDrive },
        {
          label: 'Financieel',
          icon: Euro,
          children: [
            { label: 'Dashboard', href: `${basePath}/financial`, icon: LayoutDashboard },
            { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
            { label: 'Achterstanden', href: `${basePath}/financial/achterstanden`, icon: AlertTriangle },
            { label: 'Huurafrekeningen', href: `${basePath}/financial/huurafrekening`, icon: Receipt },
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
        { label: 'Flows', href: `${basePath}/flows`, icon: Workflow },
      ],
    },
    {
      label: 'Meer',
      items: [
        { label: 'Integraties', href: `${basePath}/integrations`, icon: Plug, comingSoon: true },
        { label: 'Domio Assist', href: `${basePath}/assist`, icon: Sparkles, comingSoon: true },
        { label: 'App', href: `${basePath}/app`, icon: Smartphone, comingSoon: true },
        { label: 'Accountinstellingen', href: `${basePath}/settings`, icon: Settings },
      ],
    },
  ]

  const menuGroups = menuGroupsProp ?? defaultMenuGroups
  const activePath = pendingHref ?? pathname

  const isActive = (href?: string) => {
    if (!href || href === '#') return false
    if (href === basePath) return activePath === href
    return activePath === href || activePath?.startsWith(href + '/')
  }

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

  const itemClass = (active: boolean) => cn(
    "flex items-center w-full py-[5px] px-3 text-[14px] rounded-md transition-colors duration-150 focus:outline-none text-left",
    active
      ? "bg-gray-200 text-[#163300] font-semibold dark:bg-neutral-700 dark:text-[#9FE870]"
      : "text-gray-700 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-700"
  )

  const labelClass = cn(
    "min-w-0 whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin-left] duration-300 ease-in-out",
    collapsed ? "max-w-0 opacity-0 ml-0 flex-none" : "max-w-[200px] opacity-100 ml-3 flex-1"
  )

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-[100] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        data-vastgoed-sidebar
        className={cn(
          "fixed top-0 bottom-0 start-0 z-[110] bg-gray-50 dark:bg-neutral-800 transform rounded-tr-2xl rounded-br-2xl overflow-hidden",
          "transition-[width,transform] duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:fixed md:z-auto md:flex-shrink-0",
          collapsed ? "md:w-14" : "md:w-60"
        )}
        style={{ transitionProperty: 'width, transform', transitionDuration: '300ms', transitionTimingFunction: 'ease-in-out', willChange: 'width' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-4 rounded-tr-2xl rounded-br-2xl bg-gradient-to-l from-black/[0.03] to-transparent dark:from-black/[0.08] z-10"
        />

        <div className="relative flex flex-col h-full max-h-full">
          {/* Header */}
          <div className={cn(
            "h-14 flex items-center transition-all duration-300 flex-shrink-0",
            collapsed ? "justify-center px-0" : "pl-[26px] pr-3 justify-between"
          )}>
            <div className={cn(
              "flex items-center transition-all duration-300 ease-in-out",
              collapsed ? "opacity-0 scale-0 max-w-0 overflow-hidden" : "opacity-100 scale-100 max-w-full"
            )}>
              <Logo width={58} height={16} href={basePath} />
            </div>
            <div className={cn("flex items-center gap-1.5 transition-all duration-300", collapsed ? "" : "ml-auto")}>
              {onToggleCollapse && (
                <button
                  type="button"
                  className="hidden md:flex items-center py-1.5 px-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                  onClick={onToggleCollapse}
                  title={collapsed ? "Uitklappen" : "Inklappen"}
                >
                  {collapsed ? <PanelRightClose className="size-4 shrink-0" /> : <PanelLeftClose className="size-4 shrink-0" />}
                </button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden flex items-center justify-center h-7 w-7 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-neutral-700"
                onClick={onClose}
              >
                <PanelLeftClose className="size-4 shrink-0" />
              </Button>
            </div>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <nav
              className="w-full flex flex-col py-2 px-2"
              onClick={(e) => {
                const link = (e.target as HTMLElement).closest('a[href]')
                if (link && onClose) onClose()
              }}
            >
              <div className="flex flex-col">
                {menuGroups.map((group, groupIndex) => {
                  const items = 'items' in group ? group.items : (group as unknown as SidebarItem[])
                  const groupLabel = 'label' in group ? group.label : undefined
                  const renderItem = (item: SidebarItem) => {
                    const itemId = item.label.toLowerCase().replace(/\s+/g, '-') + '-accordion'
                    const isOpenAccordion = openItems.includes(itemId)
                    const hasActiveChild = isParentActive(item.children)
                    const Icon = item.icon

                    if (item.children) {
                      return (
                        <li key={item.label} id={itemId} className="relative">
                          <button
                            type="button"
                            onClick={() => toggleItem(itemId)}
                            className={itemClass(false)}
                            title={collapsed ? item.label : undefined}
                          >
                            <Icon className="shrink-0 size-[17px]" strokeWidth={hasActiveChild ? 2.5 : 2} />
                            <span className={labelClass}>{item.label}</span>
                            <ChevronDown className={cn(
                              "shrink-0 size-3.5 text-gray-400 transition-[transform,opacity,max-width,margin] duration-300",
                              isOpenAccordion && "rotate-180",
                              collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[1rem] opacity-100 ml-auto"
                            )} />
                          </button>
                          <div
                            className={cn("w-full", collapsed && "hidden")}
                            style={{
                              display: collapsed ? 'none' : 'grid',
                              gridTemplateRows: isOpenAccordion ? '1fr' : '0fr',
                              transition: 'grid-template-rows 350ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }}
                          >
                            <div className="overflow-hidden">
                            <ul className="ps-5 pt-0.5 pb-0.5 space-y-px">
                              {item.children.map((child) => {
                                const ChildIcon = child.icon || FileText
                                const active = getActiveChildHref(item.children) === child.href
                                return (
                                  <li key={child.label}>
                                    <Link
                                      href={child.href}
                                      onClick={() => setPendingHref(child.href)}
                                      className={itemClass(active)}
                                    >
                                      <ChildIcon className="shrink-0 size-[15px]" strokeWidth={active ? 2.5 : 2} />
                                      <span className="ml-3">{child.label}</span>
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                            </div>
                          </div>
                        </li>
                      )
                    }

                    const active = isActive(item.href)
                    return (
                      <li key={item.label} className="relative">
                        <Link
                          href={item.href || '#'}
                          onClick={() => item.href && item.href !== '#' && setPendingHref(item.href)}
                          className={itemClass(active)}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon className="shrink-0 size-[17px]" strokeWidth={active ? 2.5 : 2} />
                          <span className={labelClass}>{item.label}</span>
                          {item.comingSoon && (
                            <span className={cn(
                              "text-[10px] font-medium text-gray-400 dark:text-neutral-500 shrink-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300",
                              collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[80px] opacity-100 ml-auto"
                            )}>Binnenkort</span>
                          )}
                          {item.badge && !item.comingSoon && (
                            <span className={cn(
                              "px-1.5 py-0.5 text-[10px] font-medium bg-[#163300] text-white rounded-full shrink-0 overflow-hidden transition-[max-width,opacity,margin] duration-300",
                              collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[40px] opacity-100 ml-auto"
                            )}>{item.badge}</span>
                          )}
                          {item.badge && (
                            <span className={cn(
                              "absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#163300] rounded-full transition-opacity duration-300",
                              collapsed ? "opacity-100" : "opacity-0"
                            )} />
                          )}
                        </Link>
                      </li>
                    )
                  }

                  return (
                    <div key={groupIndex} className={groupIndex > 0 ? "mt-4" : ""}>
                      {groupLabel && (
                        <p className={cn(
                          "px-3 pt-0.5 pb-1 text-[12px] font-normal text-gray-500 dark:text-neutral-400 select-none transition-opacity duration-300",
                          collapsed ? "opacity-0" : "opacity-100"
                        )}>
                          {groupLabel}
                        </p>
                      )}
                      <ul className="flex flex-col space-y-px">
                        {items.map(renderItem)}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </nav>
          </div>

        </div>
      </div>
    </>
  )
}
