'use client'

import { useEffect, useRef, useState } from 'react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { type TransactionRow, type PropertyHierarchy } from '@/components/finance/TransactionsInbox'
import { GeldstromenPanel, type GeldstromenPanelRef } from '@/components/finance/GeldstromenPanel'
import { AddPaymentTile } from '@/components/finance/add-payment-tile'
import { MetricCard } from '@/components/finance/MetricCard'
import { CoinsStacked01, BarChart01, CalendarCheck01 } from '@untitledui/icons'
import { getFinancialNav } from '../nav'

interface KpiData {
  totalReceived: number
  receivedThisMonth: number
  expectedThisMonth: number
}

const formatEur = (amount: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)

function leaseOverlapsCalendarMonth(
  status: string,
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  monthStart: string,
  monthEndExclusive: string
): boolean {
  if (status !== 'actief') return false
  if (!startDate) return false
  if (startDate >= monthEndExclusive) return false
  if (endDate != null && endDate !== '' && endDate < monthStart) return false
  return true
}

export default function GeldstromenPage() {
  const { basePath } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)
  const panelRef = useRef<GeldstromenPanelRef>(null)
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [properties, setProperties] = useState<PropertyHierarchy[]>([])
  const [kpis, setKpis] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

    const [txRes, propRes, leasesRes] = await Promise.all([
      supabase
        .from('raw_transactions')
        .select(`
          id,
          value_date,
          amount,
          currency,
          sender_name,
          sender_iban,
          description,
          bank_connections ( provider ),
          payment_assignments (
            id,
            confidence_score,
            match_method,
            is_manual,
            property_id,
            unit_id,
            tenant_id,
            lease_id,
            category,
            tenants (full_name),
            properties (name, address)
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
        .from('leases')
        .select('monthly_rent, status, start_date, end_date'),
    ])

    const txRows: TransactionRow[] = (txRes.data ?? []).map((tx: any) => ({
      id: tx.id,
      value_date: tx.value_date,
      amount: tx.amount,
      currency: tx.currency,
      sender_name: tx.sender_name,
      sender_iban: tx.sender_iban,
      description: tx.description,
      is_manual_transaction: tx.bank_connections?.provider === 'manual',
      assignment: tx.payment_assignments ? {
        ...tx.payment_assignments,
        tenant_name: tx.payment_assignments.tenants?.full_name ?? null,
        property_name: tx.payment_assignments.properties?.name ?? null,
        property_address: tx.payment_assignments.properties?.address ?? null,
      } : null,
    }))

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

    // Compute KPIs
    const totalReceived = txRows.reduce((s, tx) => s + Number(tx.amount), 0)
    const receivedThisMonth = txRows
      .filter(tx => tx.value_date && tx.value_date >= monthStart && tx.value_date < monthEnd)
      .reduce((s, tx) => s + Number(tx.amount), 0)
    let expectedThisMonth = 0
    for (const lease of (leasesRes.data ?? []) as any[]) {
      if (leaseOverlapsCalendarMonth(lease.status, lease.start_date, lease.end_date, monthStart, monthEnd)) {
        expectedThisMonth += Number(lease.monthly_rent) || 0
      }
    }

    setKpis({ totalReceived, receivedThisMonth, expectedThisMonth })
    setTransactions(txRows)
    setProperties(propHierarchy)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

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
        />
      )}
    </>
  )
}