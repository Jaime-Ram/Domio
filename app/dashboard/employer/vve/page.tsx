'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { vveData, vveMjop } from '@/lib/mock-data/domio-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { Home, Users, Euro, Calendar, ClipboardList } from 'lucide-react'

export default function VvEPage() {
  const { isDemo } = useDashboardUser()
  const data = isDemo ? vveData : { name: 'Geen VvE', address: '—', units: 0, reserveFund: 0, targetReserve: 0, monthlyContributionPerUnit: 0 }
  const mjop = isDemo ? vveMjop : []
  const reservePercent = data.targetReserve > 0 ? Math.min(100, (data.reserveFund / data.targetReserve) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{data.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{data.address}</p>
      </div>

      <Tabs defaultValue="overzicht" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="overzicht" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Overzicht
          </TabsTrigger>
          <TabsTrigger value="leden">
            <Users className="h-4 w-4 mr-2" />
            Leden
          </TabsTrigger>
          <TabsTrigger value="financieel">
            <Euro className="h-4 w-4 mr-2" />
            Financieel
          </TabsTrigger>
          <TabsTrigger value="vergaderingen">
            <Calendar className="h-4 w-4 mr-2" />
            Vergaderingen
          </TabsTrigger>
          <TabsTrigger value="mjop">
            <ClipboardList className="h-4 w-4 mr-2" />
            MJOP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overzicht" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gebouwinfo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-gray-500 dark:text-gray-400">Adres:</span> {data.address}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Aantal eenheden:</span> {data.units}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Maandelijkse bijdrage per appartement:</span> €{data.monthlyContributionPerUnit}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reservefonds</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  €{data.reserveFund.toLocaleString('nl-NL')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Streefbedrag €{data.targetReserve.toLocaleString('nl-NL')}
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden">
                  <div className="h-full rounded-full bg-[#163300] dark:bg-[#9FE870]" style={{ width: `${reservePercent}%` }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{Math.round(reservePercent)}% van streefbedrag</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bestuur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">Voorzitter: T. van Dijk — Secretaris: M. Jansen</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leden">
          <Card>
            <CardHeader>
              <CardTitle>Leden ({data.units} appartementen)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lijst van VvE-leden en eigenaren. (Mock: 6 leden)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financieel">
          <Card>
            <CardHeader>
              <CardTitle>Financieel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contributies en uitgaven. (Mock)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vergaderingen">
          <Card>
            <CardHeader>
              <CardTitle>Vergaderingen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">Geplande en notulen. (Mock)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mjop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meerjarenonderhoudsplan</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">Geplande onderhoudskosten vs beschikbaar fonds</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mjop.map((item: typeof vveMjop[0]) => (
                  <li key={item.year} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                    <span className="font-medium">{item.year}: {item.description}</span>
                    <span className="text-[#163300] dark:text-[#9FE870] font-medium">€{item.amount.toLocaleString('nl-NL')}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Grafiek kosten vs beschikbaar fonds kan hier worden toegevoegd.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
