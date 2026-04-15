'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { LayoutDashboard, Euro, Wrench, FileText, MessageSquare, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_TENANT } from '@/lib/mock-data/portal'

const navItems = [
  { label: 'Overzicht', href: '/portal', icon: LayoutDashboard, exact: true },
  { label: 'Betalingen', href: '/portal/betalingen', icon: Euro },
  { label: 'Onderhoud', href: '/portal/onderhoud', icon: Wrench },
  { label: 'Documenten', href: '/portal/documenten', icon: FileText },
  { label: 'Berichten', href: '/portal/berichten', icon: MessageSquare },
  { label: 'Instellingen', href: '/portal/instellingen', icon: Settings },
]

export function PortalNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-52 bg-white border-r border-gray-100 z-10">
        <div className="h-16 flex items-center px-5 border-b border-gray-50">
          <Logo width={88} height={24} href="/portal" />
          <span className="ml-2 text-[10px] text-gray-400 font-medium tracking-wide uppercase leading-none mt-0.5">Huurder</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-gray-100 text-[#163300] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#163300] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{MOCK_TENANT.name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{MOCK_TENANT.name}</p>
              <p className="text-xs text-gray-400 truncate">{MOCK_TENANT.unit}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-10 flex items-center px-4 gap-3">
        <Logo width={80} height={22} href="/portal" />
        <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Huurder</span>
      </header>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10">
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                  active ? 'text-[#163300]' : 'text-gray-400'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                <span className="leading-none">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
