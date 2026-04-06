import { LayoutDashboard, ArrowLeftRight, Percent, Link2, CreditCard } from 'lucide-react'

export const getFinancialNav = (basePath: string) => [
  { label: 'Dashboard', href: `${basePath}/financial`, icon: LayoutDashboard },
  { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
  { label: 'Huurbeleid', href: `${basePath}/financial/huurbeleid`, icon: Percent },
  { label: 'Koppelingen', href: `${basePath}/financial/koppelingen`, icon: Link2 },
]
