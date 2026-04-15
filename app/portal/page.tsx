'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertTriangle, Home, Euro, Wrench, FileText, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'
import { MOCK_TENANT, MOCK_PAYMENTS, MOCK_TICKETS, MOCK_DOCUMENTS } from '@/lib/mock-data/portal'

export default function PortalOverzichtPage() {
  const tenant = MOCK_TENANT
  const openTickets = MOCK_TICKETS.filter(t => t.status !== 'afgerond')
  const latestPayment = MOCK_PAYMENTS[0]

  return (
    <div className="space-y-4">
      <div className="pt-2 pb-2">
        <p className="text-sm text-gray-500 mb-0.5">Huurderportal</p>
        <h1 className="text-2xl font-bold text-gray-900">Hallo, {tenant.name.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
          <Home className="h-3.5 w-3.5" />
          {tenant.address}
        </p>
      </div>

      {/* Saldo banner */}
      <div className={cn(
        'rounded-2xl p-5 flex items-center justify-between',
        tenant.balance === 0 ? 'bg-[#163300] text-white' : 'bg-red-600 text-white'
      )}>
        <div>
          <p className="text-xs opacity-70 font-medium uppercase tracking-wide">Saldo</p>
          <p className="text-2xl font-bold mt-0.5">
            {tenant.balance === 0 ? 'Op peil' : `−€${Math.abs(tenant.balance).toLocaleString('nl-NL')}`}
          </p>
          <p className="text-xs opacity-70 mt-1">
            Volgende betaling: {format(new Date(tenant.nextPaymentDate), 'd MMMM yyyy', { locale: nl })} · €{tenant.monthlyRent.toLocaleString('nl-NL')}
          </p>
        </div>
        {tenant.balance === 0
          ? <CheckCircle2 className="h-8 w-8 opacity-40 shrink-0" />
          : <AlertTriangle className="h-8 w-8 opacity-60 shrink-0" />
        }
      </div>

      {/* Snelle stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open meldingen', value: openTickets.length, icon: Wrench, href: '/portal/onderhoud' },
          { label: 'Documenten', value: MOCK_DOCUMENTS.length, icon: FileText, href: '/portal/documenten' },
          { label: 'Huurprijs', value: `€${tenant.monthlyRent.toLocaleString('nl-NL')}`, icon: Euro, href: '/portal/betalingen' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="rounded-2xl border border-gray-100 shadow-none bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <CardContent className="px-4 py-4">
                  <Icon className="h-4 w-4 text-gray-400 mb-2" />
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Huurovereenkomst samenvatting */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-gray-900">Huurovereenkomst</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-2 gap-y-4">
            {[
              { label: 'Huurprijs', value: `€${tenant.monthlyRent.toLocaleString('nl-NL')}/mnd` },
              { label: 'Borgsom', value: `€${tenant.deposit.toLocaleString('nl-NL')}` },
              { label: 'Ingangsdatum', value: format(new Date(tenant.startDate), 'd MMM yyyy', { locale: nl }) },
              { label: 'Type', value: 'Onbepaalde tijd' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Borgstatus</p>
              <Badge className="bg-[#163300]/8 text-[#163300] border-0 text-xs font-medium">
                <CheckCircle2 className="h-3 w-3 mr-1" />Gestort
              </Badge>
            </div>
            <Link href="/portal/documenten">
              <Button variant="outline" size="sm" className="rounded-full h-8 text-xs gap-1.5 border-gray-200">
                Bekijk contract <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Laatste betaling */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">Laatste betaling</CardTitle>
          <Link href="/portal/betalingen" className="text-xs text-[#163300] font-medium hover:underline flex items-center gap-0.5">
            Alles <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{latestPayment.period}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {format(new Date(latestPayment.paidOn), 'd MMMM yyyy', { locale: nl })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-900">€{latestPayment.amount.toLocaleString('nl-NL')}</span>
              <Badge className="bg-[#163300]/8 text-[#163300] border-0 gap-1 text-xs font-medium">
                <CheckCircle2 className="h-3 w-3" />Betaald
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open meldingen */}
      {openTickets.length > 0 && (
        <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
          <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">Open meldingen</CardTitle>
            <Link href="/portal/onderhoud" className="text-xs text-[#163300] font-medium hover:underline flex items-center gap-0.5">
              Alles <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {openTickets.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Wrench className="h-4 w-4 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.category}</p>
                </div>
                <Badge className={cn(
                  'ml-auto shrink-0 border-0 text-xs',
                  t.status === 'in_behandeling' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                )}>
                  {t.status === 'in_behandeling' ? 'In behandeling' : 'Open'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-gray-400 pt-2 pb-4">
        Beheerd door <span className="font-semibold text-[#163300]">Domio</span>
      </p>
    </div>
  )
}
