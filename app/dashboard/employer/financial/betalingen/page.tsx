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
    <div className="space-y-6">
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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Betalingen</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Betalingen en transacties.</p>
      </div>

      {/* Betaal met bank (Tink) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Betaal met bank
          </CardTitle>
          <CardDescription>
            Start een betaling via Tink – de huurder kiest zijn bank en autoriseert de betaling. Geschikt voor eenmalige incasso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDemo && (
            <p className="text-sm text-amber-600 dark:text-amber-500">
              In de demo is Tink uitgeschakeld. Configureer TINK_CLIENT_ID en TINK_CLIENT_SECRET in .env.local en log in om dit te gebruiken.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tink-amount">Bedrag (€)</Label>
              <Input
                id="tink-amount"
                type="text"
                inputMode="decimal"
                placeholder="bijv. 1200"
                value={tinkForm.amount}
                onChange={(e) => setTinkForm((f) => ({ ...f, amount: e.target.value }))}
                disabled={isDemo}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tink-recipient">Naam ontvanger</Label>
              <Input
                id="tink-recipient"
                placeholder="bijv. Verhuurder B.V."
                value={tinkForm.recipientName}
                onChange={(e) => setTinkForm((f) => ({ ...f, recipientName: e.target.value }))}
                disabled={isDemo}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tink-iban">IBAN ontvanger</Label>
            <Input
              id="tink-iban"
              placeholder="NL00 BANK 0000 0000 00"
              value={tinkForm.recipientIban}
              onChange={(e) => setTinkForm((f) => ({ ...f, recipientIban: e.target.value.toUpperCase() }))}
              disabled={isDemo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tink-desc">Omschrijving (optioneel)</Label>
            <Input
              id="tink-desc"
              placeholder="Huur, servicekosten, etc."
              value={tinkForm.description}
              onChange={(e) => setTinkForm((f) => ({ ...f, description: e.target.value }))}
              disabled={isDemo}
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button
            onClick={startTinkPayment}
            disabled={isDemo || loading}
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
            {loading ? 'Bezig…' : 'Betaal met bank starten'}
          </Button>
        </CardContent>
      </Card>

      <Card className={dashboardCardClass(undefined, isDemo)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Betalingen overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Betalingen worden getoond in het financiële dashboard.
          </p>
          <Button asChild variant="default">
            <Link href={`${basePath}/financial`}>Naar Financieel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
