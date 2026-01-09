'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, FileText, AlertCircle, TrendingUp, DollarSign, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EmployerDashboardPage() {
  // Demo data
  const userName = 'Demo Gebruiker'
  
  return (
    <>
      {/* Page Header - Same spacing as sidebar menu items */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welkom, {userName}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Overzicht van je vastgoedportefeuille
        </p>
      </div>
                
      {/* Stats Grid - Compact cards with same spacing as sidebar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Totaal Panden
            </CardTitle>
            <Building2 className="h-4 w-4 text-[#002A1F]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">12</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              +2 deze maand
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Actieve Huurders
            </CardTitle>
            <Users className="h-4 w-4 text-[#002A1F]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">28</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              95% bezettingsgraad
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Openstaande Taken
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">7</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              3 urgent
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Maandelijkse Huur
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">€24,500</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +5.2% vs vorige maand
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Same spacing as sidebar menu items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#002A1F] flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              Panden Beheren
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Bekijk en beheer al je panden
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/employer/portfolio/properties" className="flex items-center justify-center gap-2">
                Ga naar Panden
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#002A1F] flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              Huurders
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Beheer huurders en contracten
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/employer/tenants" className="flex items-center justify-center gap-2">
                Ga naar Huurders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#002A1F] flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              Onderhoud
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Beheer onderhoudstaken en meldingen
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/employer/maintenance" className="flex items-center justify-center gap-2">
                Ga naar Onderhoud
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Same spacing as sidebar */}
      <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-gray-900">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
            Laatste Activiteit
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 py-2 border-b border-gray-200 dark:border-neutral-700 last:border-0">
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Nieuwe huurder toegevoegd
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Jan Jansen - Appartement 4B
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  2 uur geleden
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2 border-b border-gray-200 dark:border-neutral-700 last:border-0">
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-orange-500"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Onderhoudsmelding ontvangen
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Lekkage badkamer - Pand Kerkstraat 12
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  5 uur geleden
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Huurcontract verlengd
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Maria de Vries - Appartement 2A
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  1 dag geleden
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
