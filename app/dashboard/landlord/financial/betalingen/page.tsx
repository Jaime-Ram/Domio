'use client'

import { useEffect, useRef, useState } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { type TransactionRow, type PropertyHierarchy } from '@/components/finance/TransactionsInbox'
import { GeldstromenPanel, type GeldstromenPanelRef } from '@/components/finance/GeldstromenPanel'
import { AddPaymentTile } from '@/components/finance/add-payment-tile'
import { MetricCard } from '@/components/finance/MetricCard'
import { CoinsStacked01, BarChart01, CalendarCheck01 } from '@untitledui/icons'

interface KpiData {
  totalReceived: number
  receivedThisMonth: number
  expectedThisMonth: number
}

const formatEur = (amount: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)


export default function GeldstromenPage() {
  const panelRef = useRef<GeldstromenPanelRef>(null)
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [properties, setProperties] = useState<PropertyHierarchy[]>([])
  const [kpis, setKpis] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [reauthRequired, setReauthRequired] = useState(false)
  const [noConnection, setNoConnection] = useState(false)

  const fetchData = async () => {
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

    const [txRes, propRes, expRes] = await Promise.all([
      supabase
        .from('raw_transactions')
        .select(`
          id,
          value_date,
          amount,
          currency,
          counterparty_name,
          counterparty_iban,
          description,
          source,
          payment_assignments (
            id,
            amount_assigned,
            match_method,
            confidence_score,
            rent_expectation_id,
            category,
            property_id,
            unit_id,
            cost_allocation_key_id,
            rent_expectations (
              lease_id,
              due_period,
              leases ( id, tenant_id, unit_id )
            )
          )
        `)
        .order('value_date', { ascending: false }),
      supabase
        .from('properties')
        .select(`
          id,
          name,
          address,
          city,
          units (
            id,
            unit_number,
            leases (
              id,
              tenant_id,
              monthly_rent,
              status,
              tenants (
                full_name
              )
            )
          )
        `)
        .order('name'),
      supabase
        .from('rent_expectations')
        .select('amount_expected')
        .eq('due_period', monthStart),
    ])

    if (txRes.error) console.error('[betalingen] raw_transactions query error:', txRes.error)
    if (propRes.error) console.error('[betalingen] properties query error:', propRes.error)
    if (expRes.error) console.error('[betalingen] rent_expectations query error:', expRes.error)

    // Build lookup maps from properties data for resolving names
    const propById = new Map<string, { name: string; address: string }>()
    const unitToPropertyId = new Map<string, string>()
    const unitById = new Map<string, string>()
    const tenantById = new Map<string, string>()
    for (const p of (propRes.data ?? []) as any[]) {
      propById.set(p.id, { name: p.name, address: p.address })
      for (const u of p.units ?? []) {
        unitToPropertyId.set(u.id, p.id)
        unitById.set(u.id, u.unit_number)
        for (const l of u.leases ?? []) {
          if (l.tenant_id && l.tenants?.full_name) {
            tenantById.set(l.tenant_id, l.tenants.full_name)
          }
        }
      }
    }

    const txRows: TransactionRow[] = (txRes.data ?? []).map((tx: any) => {
      // payment_assignments returns an array (no unique constraint on raw_transaction_id)
      const rawArr: any[] = Array.isArray(tx.payment_assignments)
        ? tx.payment_assignments
        : tx.payment_assignments ? [tx.payment_assignments] : []
      const raw = rawArr[0] ?? null

      let assignment: TransactionRow['assignment'] = null
      if (raw) {
        const lease = raw.rent_expectations?.leases ?? null
        const lease_id = raw.rent_expectations?.lease_id ?? null
        const tenant_id = lease?.tenant_id ?? null
        // unit_id: directly on assignment (non-huur eenheid) or from lease (huur)
        const unit_id = raw.unit_id ?? (lease?.unit_id ?? null)
        // property_id: from the assignment directly or derived from unit
        const property_id = raw.property_id ?? (unit_id ? (unitToPropertyId.get(unit_id) ?? null) : null)
        const propInfo = property_id ? propById.get(property_id) : null
        assignment = {
          id: raw.id,
          amount_assigned: raw.amount_assigned,
          match_method: raw.match_method,
          confidence_score: raw.confidence_score ?? null,
          rent_expectation_id: raw.rent_expectation_id,
          lease_id,
          tenant_id,
          unit_id,
          unit_name: unit_id ? (unitById.get(unit_id) ?? null) : null,
          property_id,
          tenant_name: tenant_id ? (tenantById.get(tenant_id) ?? null) : null,
          property_name: propInfo?.name ?? null,
          property_address: propInfo?.address ?? null,
          is_manual: raw.match_method === 'manual',
          category: raw.category ?? null,
          cost_allocation_key_id: raw.cost_allocation_key_id ?? null,
        }
      }

      return {
        id: tx.id,
        value_date: tx.value_date ?? tx.booking_date,
        amount: tx.amount,
        currency: tx.currency,
        counterparty_name: tx.counterparty_name,
        counterparty_iban: tx.counterparty_iban,
        description: tx.description,
        is_manual_transaction: tx.source === 'manual',
        assignment,
      }
    })

    const propHierarchy: PropertyHierarchy[] = (propRes.data ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      city: p.city,
      units: (p.units ?? []).map((u: any) => ({
        id: u.id,
        unit_number: u.unit_number,
        leases: (u.leases ?? []).map((l: any) => ({
          id: l.id,
          tenant_id: l.tenant_id,
          tenant_name: l.tenants?.full_name ?? null,
          monthly_rent: l.monthly_rent,
          status: l.status,
        })),
      })),
    }))

    const totalReceived = txRows.reduce((s, tx) => s + Number(tx.amount), 0)
    const receivedThisMonth = txRows
      .filter(tx => tx.value_date && tx.value_date >= monthStart && tx.value_date < monthEnd)
      .reduce((s, tx) => s + Number(tx.amount), 0)
    const expectedThisMonth = (expRes.data ?? []).reduce(
      (s, e: any) => s + Number(e.amount_expected), 0
    )

    setKpis({ totalReceived, receivedThisMonth, expectedThisMonth })
    setTransactions(txRows)
    setProperties(propHierarchy)
    setLoading(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    setReauthRequired(false)
    try {
      const res = await fetch('/api/yapily/sync')
      if (res.status === 401) {
        setReauthRequired(true)
      } else if (res.status === 404) {
        setNoConnection(true)
      } else if (res.ok) {
        setNoConnection(false)
        const data = await res.json()
        setSyncResult({ imported: data.imported ?? 0, skipped: data.skipped ?? 0 })
        if ((data.imported ?? 0) > 0) await fetchData()
      }
    } catch {
      // ignore
    }
    setSyncing(false)
  }

  useEffect(() => {
    fetchData()
    supabase
      .from('bank_connections')
      .select('id')
      .eq('provider', 'yapily')
      .maybeSingle()
      .then(({ data }) => setNoConnection(!data))
  }, [])

  const syncButton = noConnection ? (
    <a
      href="/dashboard/landlord/settings?tab=koppelingen"
      className="inline-flex items-center gap-1.5 h-9 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors shrink-0"
    >
      <span className="hidden sm:inline">Bankrekening koppelen</span>
    </a>
  ) : reauthRequired ? (
    <a
      href="/dashboard/landlord/settings?tab=koppelingen"
      className="inline-flex items-center gap-1.5 h-9 rounded-full border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-3 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shrink-0"
    >
      <RefreshCw className="h-4 w-4" />
      <span className="hidden sm:inline">Opnieuw koppelen</span>
    </a>
  ) : (
    <button
      type="button"
      onClick={handleSync}
      disabled={syncing}
      title={
        syncResult
          ? `${syncResult.imported} nieuw, ${syncResult.skipped} overgeslagen`
          : 'Synchroniseer transacties'
      }
      className="inline-flex items-center gap-1.5 h-9 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors shrink-0"
    >
      {syncing
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <RefreshCw className="h-4 w-4" />
      }
      <span className="hidden sm:inline">
        {syncing ? 'Synchroniseren...' : syncResult ? `${syncResult.imported} nieuw` : 'Sync'}
      </span>
    </button>
  )

  return (
    <>
      {kpis && (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Totaal ontvangen"
            value={formatEur(kpis.totalReceived)}
            icon={<CoinsStacked01 />}
          />
          <MetricCard
            label="Ontvangen deze maand"
            value={formatEur(kpis.receivedThisMonth)}
            icon={<BarChart01 />}
          />
          <MetricCard
            label="Verwacht deze maand"
            value={formatEur(kpis.expectedThisMonth)}
            icon={<CalendarCheck01 />}
          />
          <AddPaymentTile onClick={() => panelRef.current?.openPaymentForm()} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : (
        <GeldstromenPanel
          ref={panelRef}
          transactions={transactions}
          properties={properties}
          onRefresh={fetchData}
          headerActions={syncButton}
        />
      )}
    </>
  )
}
