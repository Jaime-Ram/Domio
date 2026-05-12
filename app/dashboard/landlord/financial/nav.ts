import { LayoutDashboard, ArrowLeftRight, Percent, CreditCard, Workflow, SplitSquareHorizontal } from 'lucide-react'

export const getFinancialNav = (basePath: string) => [
  { label: 'Dashboard', href: `${basePath}/financial`, icon: LayoutDashboard },
  { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
  { label: 'Huurbeleid', href: `${basePath}/financial/huurbeleid`, icon: Percent },
  { label: 'Betaalflow', href: `${basePath}/financial/betaalflow`, icon: Workflow },
  { label: 'Verdeelsleutel', href: `${basePath}/financial/verdeelsleutel`, icon: SplitSquareHorizontal },
]
