'use client'

import { useRef, useState } from 'react'
import { CheckCircle2, Send, FileText } from 'lucide-react'
import { MetricCard } from '@/components/finance/MetricCard'
import { AddPaymentTile } from '@/components/finance/add-payment-tile'
import { HuurafrekeningPanel, type HuurafrekeningPanelRef } from '@/components/finance/HuurafrekeningPanel'

interface Metrics {
  concept: number
  verzonden: number
  betaald: number
}

export default function HuurafrekeningPage() {
  const panelRef = useRef<HuurafrekeningPanelRef>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  return (
    <>
      {metrics !== null && (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Concept"
            value={String(metrics.concept)}
            icon={<FileText />}
          />
          <MetricCard
            label="Verzonden"
            value={String(metrics.verzonden)}
            icon={<Send />}
          />
          <MetricCard
            label="Betaald"
            value={String(metrics.betaald)}
            icon={<CheckCircle2 />}
          />
          <AddPaymentTile
            title="Afrekening"
            subtitle="Nieuwe aanmaken"
            onClick={() => panelRef.current?.openNew()}
          />
        </div>
      )}

      <HuurafrekeningPanel
        ref={panelRef}
        onMetrics={setMetrics}
      />
    </>
  )
}
