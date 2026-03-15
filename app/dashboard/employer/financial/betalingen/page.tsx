'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CreditCard, Receipt, TrendingUp, Scan, Building2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'

const getFinancialNav = (basePath: string) => [
  { label: 'Facturatie', href: `${basePath}/financial`, icon: Receipt },
  { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
  { label: 'Rendement', href: `${basePath}/financial/rendement`, icon: TrendingUp },
  { label: 'Bankimport', href: `${basePath}/financial/bankimport`, icon: Scan },
]

export default function BetalingenPage() {
  const { basePath, isDemo } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tinkForm, setTinkForm] = useState({
    amount: '',
    recipientIban: '',
    recipientName: '',
    description: 'Huur',
  })

  const startTinkPayment = async () => {
    setError(null)
    const amount = parseFloat(tinkForm.amount.replace(',', '.'))
    if (!amount || amount <= 0 || !tinkForm.recipientIban.trim() || !tinkForm.recipientName.trim()) {
      setError('Vul bedrag, IBAN en ontvanger in.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/payments/tink/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          recipientIban: tinkForm.recipientIban.trim(),
          recipientName: tinkForm.recipientName.trim(),
          description: tinkForm.description || 'Huur',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Aanmaken mislukt')
      if (data.redirectUrl) window.location.href = data.redirectUrl
      else setError('Geen redirect-URL ontvangen.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Betaling kon niet worden gestart.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-content-blocks">
      <SectionNavDashboard
        title="Financieel"
        items={FINANCIAL_NAV}
        titleVariant="hero"
        widgetMenu={
          <SectionWidgetMenu>
            <SectionWidgetMenuPlaceholder />
          </SectionWidgetMenu>
        }
      />
    </div>
  )
}
