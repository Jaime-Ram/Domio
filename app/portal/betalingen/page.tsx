'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { MOCK_PAYMENTS, MOCK_TENANT } from '@/lib/mock-data/portal'

function StatusBadge({ status }: { status: string }) {
  if (status === 'Betaald') return (
    <Badge className="bg-[#163300]/8 text-[#163300] border-0 gap-1 text-xs font-medium">
      <CheckCircle2 className="h-3 w-3" />Betaald
    </Badge>
  )
  if (status === 'Te laat') return (
    <Badge className="bg-amber-50 text-amber-700 border-0 gap-1 text-xs">
      <Clock className="h-3 w-3" />Te laat
    </Badge>
  )
  return (
    <Badge className="bg-red-50 text-red-600 border-0 gap-1 text-xs">
      <XCircle className="h-3 w-3" />Openstaand
    </Badge>
  )
}

export default function BetalingenPage() {
  const tenant = MOCK_TENANT
  const betaald = MOCK_PAYMENTS.filter(p => p.status === 'Betaald').length
  const telaat = MOCK_PAYMENTS.filter(p => p.status === 'Te laat').length

  return (
    <div className="space-y-4">
      <div className="pt-2 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Betalingen</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overzicht van jouw huurbetalingen</p>
      </div>

      {/* Samenvatting */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
          <CardContent className="px-5 py-4">
            <p className="text-xs text-gray-400 mb-1">Huurprijs/mnd</p>
            <p className="text-xl font-bold text-gray-900">€{tenant.monthlyRent.toLocaleString('nl-NL')}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
          <CardContent className="px-5 py-4">
            <p className="text-xs text-gray-400 mb-1">Op tijd betaald</p>
            <p className="text-xl font-bold text-gray-900">{betaald}<span className="text-sm font-medium text-gray-400">/{MOCK_PAYMENTS.length}</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Betaalhistorie */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-gray-900">Betaalhistorie</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <div className="divide-y divide-gray-50">
            {MOCK_PAYMENTS.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.period}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {p.paidOn
                      ? `Betaald op ${format(new Date(p.paidOn), 'd MMMM', { locale: nl })}`
                      : 'Niet betaald'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">€{p.amount.toLocaleString('nl-NL')}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
