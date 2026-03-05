'use client'

import Link from 'next/link'
import { ArrowUpRight, Euro, Building2, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FunctieFeatureBlockProps {
  title: string
  description: string
  demoHref: string
  /** Visual: React node (widget, image, etc.) */
  visual: React.ReactNode
  /** Layout: visual left (default) or right */
  visualLeft?: boolean
}

export function FunctieFeatureBlock({
  title,
  description,
  demoHref,
  visual,
  visualLeft = true,
}: FunctieFeatureBlockProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-12 lg:gap-16 items-center',
        'lg:grid-cols-2',
        !visualLeft && 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1'
      )}
    >
      <div>
        {visual}
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-[#163300] tracking-tight">
          {title}
        </h3>
        <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
        <Link
          href={demoHref}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9FE870] text-[#163300] font-semibold text-base hover:bg-[#9FE870]/90 transition-colors w-fit"
        >
          Bekijk in demo
          <ArrowUpRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </div>
  )
}

/** Mini-widget: inkomsten kaart met staafdiagram */
const CHART_BARS = [
  { label: 'Ma', value: 65 },
  { label: 'Di', value: 80 },
  { label: 'Wo', value: 45 },
  { label: 'Do', value: 90 },
  { label: 'Vr', value: 70 },
  { label: 'Za', value: 55 },
  { label: 'Zo', value: 85 },
]

export function InkomstenWidget() {
  return (
    <div className="rounded-[1.75rem] bg-[#163300] p-6 sm:p-8 shadow-xl border border-[#163300]/20">
      <p className="text-white/80 text-sm font-medium mb-1">Maandelijkse inkomsten</p>
      <p className="text-3xl font-bold text-white mb-5">€12.840</p>
      <div className="flex items-end gap-1.5 h-14 mb-4">
        {CHART_BARS.map((bar, i) => (
          <div key={bar.label} className="flex-1 min-w-0 h-full flex flex-col justify-end">
            <div
              className="w-full rounded-t-xl transition-all"
              style={{
                height: `${bar.value}%`,
                backgroundColor: i === 3 ? '#9FE870' : 'rgba(255,255,255,0.2)',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-white/60">
        {CHART_BARS.map((bar) => (
          <span key={bar.label} className="flex-1 text-center min-w-0">{bar.label}</span>
        ))}
      </div>
    </div>
  )
}

/** Mini-widget: portefeuille-overzicht */
export function PortefeuilleWidget() {
  return (
    <div className="rounded-[1.75rem] bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xl border border-gray-200/80 dark:border-neutral-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-full bg-[#163300] flex items-center justify-center">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Portefeuille-overzicht</h4>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-neutral-800">
          <span className="text-gray-600 dark:text-gray-400">Objecten</span>
          <span className="font-semibold text-gray-900 dark:text-white">12</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-neutral-800">
          <span className="text-gray-600 dark:text-gray-400">Huurders</span>
          <span className="font-semibold text-gray-900 dark:text-white">10</span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-gray-600 dark:text-gray-400">Bezetting</span>
          <span className="font-semibold text-[#163300]">83%</span>
        </div>
      </div>
    </div>
  )
}

/** Mini-widget: compliance / WWS score */
export function ComplianceWidget() {
  return (
    <div className="rounded-[1.75rem] bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xl border border-gray-200/80 dark:border-neutral-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-full bg-[#163300] flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">WWS-score</h4>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 rounded-2xl bg-gray-100 dark:bg-neutral-800 p-4">
          <p className="text-3xl font-bold text-[#163300]">142</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Punten</p>
        </div>
        <div className="flex-1 rounded-2xl bg-[#9FE870]/20 dark:bg-[#9FE870]/10 p-4">
          <p className="text-lg font-semibold text-[#163300]">Label B</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Energielabel</p>
        </div>
      </div>
    </div>
  )
}

/** Placeholder voor screenshot/mockup */
export function FeatureImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-[1.75rem] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-900 aspect-[4/3] sm:aspect-video flex items-center justify-center border border-gray-200/80 dark:border-neutral-700 shadow-xl overflow-hidden">
      <div className="text-center p-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/80 dark:bg-neutral-800 flex items-center justify-center">
          <Building2 className="h-12 w-12 text-[#163300]" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}
