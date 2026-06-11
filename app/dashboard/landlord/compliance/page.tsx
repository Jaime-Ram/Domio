'use client'

import { Button } from '@/components/ui/button'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'
import { ShieldCheck } from 'lucide-react'

export default function CompliancePage() {
  return (
    <div className="rounded-2xl bg-[#163300] px-8 py-8 relative overflow-hidden">
      <GeometricShapes variant="diagonal-stripes" className="right-0 bottom-0 w-40 h-40" color="#9FE870" opacity={0.15} layers={2} />
      <div className="relative z-10 flex flex-col gap-3 max-w-xl">
        <h2 className="text-[26px] font-bold text-white leading-tight">
          Compliance
        </h2>
        <p className="text-sm text-white/80 leading-relaxed">
          WWS-puntentelling, huurprijscheck en compliance-signalen komen eraan. Hier zie je straks per woning of je voldoet aan de wettelijke eisen, met automatische alerts bij overschrijdingen.
        </p>
        <div className="mt-1 flex items-center gap-3">
          <Button
            disabled
            className="rounded-full bg-[#9FE870] text-[#163300] font-semibold text-sm px-4 h-9 gap-1.5 hover:bg-[#9FE870]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="h-4 w-4" />
            Compliance starten
          </Button>
          <span className="text-xs text-white/50">Binnenkort beschikbaar</span>
        </div>
      </div>
    </div>
  )
}
