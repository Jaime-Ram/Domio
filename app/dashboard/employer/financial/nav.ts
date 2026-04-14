import { LayoutDashboard, ArrowLeftRight, Percent, CreditCard } from 'lucide-react'

export const getFinancialNav = (basePath: string) => [
  { label: 'Dashboard', href: `${basePath}/financial`, icon: LayoutDashboard },
  { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
  { label: 'Huurbeleid', href: `${basePath}/financial/huurbeleid`, icon: Percent },
]
