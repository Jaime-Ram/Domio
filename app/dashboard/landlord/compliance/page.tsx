'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { propertyQueries } from '@/lib/supabase/queries'
import { supabase } from '@/lib/supabase/client'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table-grid'
import { BuildingAvatar } from '@/components/ui/entity-avatar'
import { DetailShell } from '@/components/ui/detail-shell'
import {
  COMPLIANCE_CHECKLIST,
  compliancePct,
  categoryPct,
} from '@/lib/compliance/checklist'

const STORAGE_KEY = 'domio_compliance_v1'

type CheckMap = Record<string, string[]> // propertyId -> afgevinkte item-keys

function pctColor(pct: number) {
  if (pct >= 100) return 'text-[#15803D] dark:text-[#4ADE80]'
  if (pct >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
}
function barColor(pct: number) {
  if (pct >= 100) return 'bg-[#15803D] dark:bg-[#4ADE80]'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function CompliancePage() {
  const { user } = useDashboardUser()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checks, setChecks] = useState<CheckMap>({})
  const [openId, setOpenId] = useState<string | null>(null)
  const [useTable, setUseTable] = useState(false)

  // Panden laden
  useEffect(() => {
    if (!user?.id) return
    propertyQueries.getByOwner(user.id)
      .then((p) => setProperties((p ?? []) as any[]))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [user?.id])

  // Check-state laden: eerst de tabel, anders terugval op localStorage
  useEffect(() => {
    if (!user?.id) return
    const sb = supabase as any
    sb.from('compliance_checks').select('property_id, item_key').eq('owner_id', user.id)
      .then(({ data, error }: any) => {
        if (error) {
          try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setChecks(JSON.parse(raw)) } catch { /* leeg */ }
          return
        }
        setUseTable(true)
        const map: CheckMap = {}
        for (const row of (data ?? [])) (map[row.property_id] ??= []).push(row.item_key)
        setChecks(map)
      })
  }, [user?.id])

  const checkedSet = (propertyId: string) => new Set(checks[propertyId] ?? [])

  const toggleItem = (propertyId: string, itemKey: string) => {
    const set = checkedSet(propertyId)
    const willCheck = !set.has(itemKey)
    if (willCheck) set.add(itemKey)
    else set.delete(itemKey)
    const next = { ...checks, [propertyId]: [...set] }
    setChecks(next)

    if (useTable && user?.id) {
      const sb = supabase as any
      if (willCheck) {
        sb.from('compliance_checks').upsert({ owner_id: user.id, property_id: propertyId, item_key: itemKey }).then(() => {})
      } else {
        sb.from('compliance_checks').delete().eq('property_id', propertyId).eq('item_key', itemKey).then(() => {})
      }
    } else {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* negeer */ }
    }
  }

  // Overzicht-cijfers
  const overall = useMemo(() => {
    if (properties.length === 0) return { pct: 0, perCat: COMPLIANCE_CHECKLIST.map(() => 0) }
    const pcts = properties.map((p) => compliancePct(checkedSet(p.id)))
    const pct = Math.round(pcts.reduce((s, n) => s + n, 0) / properties.length)
    const perCat = COMPLIANCE_CHECKLIST.map((cat) => {
      const catPcts = properties.map((p) => categoryPct(cat, checkedSet(p.id)))
      return Math.round(catPcts.reduce((s, n) => s + n, 0) / properties.length)
    })
    return { pct, perCat }
  }, [properties, checks])

  const openProperty = properties.find((p) => p.id === openId) ?? null

  const columns: DataTableColumn<any>[] = [
    {
      key: 'name', header: 'Pand', sortable: true, width: 'minmax(0,2fr)',
      render: (p) => (
        <div className="flex items-center gap-3 min-w-0">
          <BuildingAvatar />
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-[#1a1c18] dark:text-white truncate leading-tight">{p.name || p.address || 'Pand'}</p>
            {(p.address || p.city) && (
              <p className="text-[12.5px] text-[#97978f] dark:text-[#97978f] truncate leading-tight">{[p.address, p.city].filter(Boolean).join(', ')}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'compliant', header: 'Compliant', width: 'minmax(0,1.4fr)',
      render: (p) => {
        const pct = compliancePct(checkedSet(p.id))
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-1 h-1.5 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 overflow-hidden min-w-[60px]">
              <div className={cn('h-full rounded-full transition-all', barColor(pct))} style={{ width: `${pct}%` }} />
            </div>
            <span className={cn('text-[12.5px] font-semibold tabular-nums w-9 text-right', pctColor(pct))}>{pct}%</span>
          </div>
        )
      },
    },
    {
      key: 'status', header: 'Status', width: 'auto',
      render: (p) => {
        const pct = compliancePct(checkedSet(p.id))
        const label = pct >= 100 ? 'Op orde' : pct === 0 ? 'Niets geregeld' : 'Actie nodig'
        return <span className={cn('text-[12.5px] font-medium whitespace-nowrap', pctColor(pct))}>{label}</span>
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Overzicht */}
      <div className="rounded-2xl border border-[#e3e3de] dark:border-neutral-800 p-5">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-semibold text-[#97978f] dark:text-[#97978f]">Compliance</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className={cn('text-[26px] font-bold leading-none', pctColor(overall.pct))}>{overall.pct}%</p>
              <span className="text-xs text-[#97978f] dark:text-[#97978f]">gemiddeld over {properties.length} pand{properties.length === 1 ? '' : 'en'}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPLIANCE_CHECKLIST.map((cat, i) => (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#97978f] dark:text-[#97978f] truncate">{cat.label}</span>
                <span className={cn('text-xs font-semibold tabular-nums', pctColor(overall.perCat[i]))}>{overall.perCat[i]}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 overflow-hidden">
                <div className={cn('h-full rounded-full', barColor(overall.perCat[i]))} style={{ width: `${overall.perCat[i]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panden */}
      <DataTable
        rows={properties}
        columns={columns}
        getRowId={(p) => p.id}
        onRowClick={(p) => setOpenId(p.id)}
        loading={loading}
        empty="Nog geen panden in je portefeuille."
      />

      {/* Checklist per pand */}
      <DetailShell
        open={!!openProperty}
        onClose={() => setOpenId(null)}
        title={openProperty?.name || openProperty?.address || 'Pand'}
        subtitle={openProperty ? `${compliancePct(checkedSet(openProperty.id))}% compliant` : undefined}
        headerLeft={<BuildingAvatar />}
      >
        {openProperty && (
          <div className="px-6 py-5 space-y-6">
            {COMPLIANCE_CHECKLIST.map((cat) => {
              const set = checkedSet(openProperty.id)
              const cpct = categoryPct(cat, set)
              return (
                <div key={cat.key}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[#1a1c18] dark:text-white">{cat.label}</h3>
                    <span className={cn('text-xs font-semibold tabular-nums', pctColor(cpct))}>{cpct}%</span>
                  </div>
                  <div className="space-y-1">
                    {cat.items.map((item) => {
                      const done = set.has(item.key)
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => toggleItem(openProperty.id, item.key)}
                          className="w-full flex items-start gap-3 py-2 text-left rounded-lg hover:bg-[#f4f4f1] dark:hover:bg-neutral-800/40 -mx-2 px-2 transition-colors"
                        >
                          <span className={cn(
                            'h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                            done ? 'bg-[#15803D] border-[#15803D] dark:bg-[#4ADE80] dark:border-[#4ADE80]' : 'border-gray-300 dark:border-neutral-600',
                          )}>
                            {done && <Check className="h-3 w-3 text-white dark:text-[#1d3014]" />}
                          </span>
                          <span className={cn('text-[13px] leading-snug', done ? 'text-[#97978f] dark:text-[#97978f] line-through' : 'text-[#55554e] dark:text-gray-300')}>
                            {item.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            <p className="text-xs text-[#97978f] dark:text-[#97978f] pt-2 border-t border-[#e3e3de] dark:border-neutral-800">
              Handmatig afvinken voor nu. Binnenkort vullen tools deze status automatisch (energielabel, WWS, keuringen).
            </p>
          </div>
        )}
      </DetailShell>
    </div>
  )
}
