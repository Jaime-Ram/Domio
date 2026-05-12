'use client'

import { useState } from 'react'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { MetricCard } from '@/components/finance/MetricCard'
import { AchterstandenPanel } from '@/components/finance/AchterstandenPanel'

interface Metrics {
  betaald: number
  aandacht: number
  achterstand: number
}

export default function AchterstandenPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  return (
    <>
      {metrics !== null && (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Betaald"
            value={String(metrics.betaald)}
            icon={<CheckCircle2 />}
          />
          <MetricCard
            label="Aandacht"
            value={String(metrics.aandacht)}
            icon={<Clock />}
          />
          <MetricCard
            label="Achterstand"
            value={String(metrics.achterstand)}
            icon={<AlertCircle />}
          />
        </div>
      )}

      <AchterstandenPanel onMetrics={setMetrics} />
    </>
  )
}
