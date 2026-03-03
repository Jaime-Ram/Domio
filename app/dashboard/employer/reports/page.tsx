'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  ShieldCheck,
  Euro,
  TrendingUp,
  Users,
  Wrench,
  Building2,
  BarChart3,
} from 'lucide-react'
const reportTemplates = [
  { id: 'portfolio', title: 'Portefeuille Overzicht', description: 'Overzicht van alle objecten en bezetting', icon: Building2 },
  { id: 'compliance', title: 'Compliance Rapport', description: 'WWS-status en puntentellingen', icon: ShieldCheck },
  { id: 'financial', title: 'Financieel Kwartaaloverzicht', description: 'Inkomsten, kosten en cashflow', icon: Euro },
  { id: 'rendement', title: 'Rendement Analyse', description: 'BAR en NAR per object', icon: TrendingUp },
  { id: 'huurder', title: 'Huurderhistorie', description: 'Historie en mutaties per huurder', icon: Users },
  { id: 'onderhoud', title: 'Onderhoud Jaaroverzicht', description: 'Tickets en kosten per object', icon: Wrench },
  { id: 'vve', title: 'VvE Jaarrekening', description: 'Jaarrekening en reservefonds', icon: FileText },
  { id: 'verhuur', title: 'Verhuurafrekening', description: 'Afrekening per huurder/object', icon: BarChart3 },
]

export default function ReportsPage() {
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleGenerate = (id: string, title: string) => {
    setGeneratingId(id)
    setToastMessage(null)
    setTimeout(() => {
      setGeneratingId(null)
      setToastMessage(`Rapport "${title}" wordt gegenereerd. Binnenkort beschikbaar.`)
      setTimeout(() => setToastMessage(null), 3000)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Rapportages</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Genereer rapporten en exporteer naar PDF.</p>
      </div>

      {toastMessage && (
        <div className="rounded-block bg-brand-primary dark:bg-brand-accent/30 text-white dark:text-brand-primary px-4 py-3 text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 flex-shrink-0" />
          {toastMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reportTemplates.map((r) => {
          const Icon = r.icon
          return (
            <Card key={r.id} className="flex flex-col rounded-card border border-gray-200/80 dark:border-neutral-700 shadow-lg">
              <CardHeader className="p-wise-md pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 mb-wise-xs">
                  <Icon className="h-5 w-5 text-brand-primary dark:text-brand-accent" />
                </div>
                <CardTitle className="text-base font-semibold">{r.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">{r.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-wise-sm p-wise-md">
                <Button
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white dark:bg-brand-accent dark:text-brand-primary dark:hover:bg-brand-accent/90 focus-visible:ring-brand-primary"
                  onClick={() => handleGenerate(r.id, r.title)}
                  disabled={generatingId !== null}
                >
                  {generatingId === r.id ? 'Bezig...' : 'Genereer rapport'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
