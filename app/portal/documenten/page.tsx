'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { MOCK_DOCUMENTS } from '@/lib/mock-data/portal'

const CATEGORY_COLORS: Record<string, string> = {
  Contract: 'bg-[#163300]/8 text-[#163300]',
  Borg: 'bg-blue-50 text-blue-600',
  Inspectie: 'bg-amber-50 text-amber-600',
  Financieel: 'bg-purple-50 text-purple-600',
  Informatie: 'bg-gray-100 text-gray-500',
}

export default function DocumentenPage() {
  const grouped = MOCK_DOCUMENTS.reduce<Record<string, typeof MOCK_DOCUMENTS>>((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="pt-2 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Documenten</h1>
        <p className="text-sm text-gray-500 mt-0.5">{MOCK_DOCUMENTS.length} documenten beschikbaar</p>
      </div>

      {Object.entries(grouped).map(([category, docs]) => (
        <Card key={category} className="rounded-2xl border border-gray-100 shadow-none bg-white">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{category}</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <div className="divide-y divide-gray-50">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(doc.date), 'd MMM yyyy', { locale: nl })} · {doc.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-gray-700 shrink-0 ml-2">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
