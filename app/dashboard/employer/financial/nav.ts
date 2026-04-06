import { LayoutDashboard, ArrowLeftRight, Percent, Link2 } from 'lucide-react'

export const getFinancialNav = (basePath: string) => [
  { label: 'Dashboard', href: `${basePath}/financial`, icon: LayoutDashboard },
  { label: 'Geldstromen', href: `${basePath}/financial/geldstromen`, icon: ArrowLeftRight },
  { label: 'Huurbeleid', href: `${basePath}/financial/huurbeleid`, icon: Percent },
  { label: 'Koppelingen', href: `${basePath}/financial/koppelingen`, icon: Link2 },
]
