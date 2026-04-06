'use client'

import { useEffect, useState } from 'react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { type TransactionRow, type PropertyHierarchy } from '@/components/finance/TransactionsInbox'
import { GeldstromenPanel } from '@/components/finance/GeldstromenPanel'
import { getFinancialNav } from '../nav'

export default function GeldstromenPage() {
  const { basePath } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [properties, setProperties] = useState<PropertyHierarchy[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const [txRes, propRes] = await Promise.all([
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
    ])

    const txRows: TransactionRow[] = (txRes.data ?? []).map((tx: any) => ({
      id: tx.id,
      value_date: tx.value_date,
      amount: tx.amount,
      currency: tx.currency,
      sender_name: tx.sender_name,
      sender_iban: tx.sender_iban,
      description: tx.description,
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

    setTransactions(txRows)
    setProperties(propHierarchy)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const achterstandenUrl = `${basePath}/financial/geldstromen/achterstanden`

  return (
    <div className="space-y-content-blocks">
      <SectionNavDashboard
        title="Financieel"
        items={FINANCIAL_NAV}
        titleVariant="hero"
        widgetMenu={
          <SectionWidgetMenu>
            <SectionWidgetMenuPlaceholder />
          </SectionWidgetMenu>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : (
        <GeldstromenPanel
          transactions={transactions}
          properties={properties}
          onRefresh={fetchData}
          achterstandenUrl={achterstandenUrl}
        />
      )}
    </div>
  )
}
