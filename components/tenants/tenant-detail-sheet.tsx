'use client'

import { useState, useEffect } from 'react'
import { DetailShell } from '@/components/ui/detail-shell'
import { ActivityTimeline, type TimelineEvent } from '@/components/ui/activity-timeline'
import { TabNav } from '@/components/ui/tab-nav'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import {
  User,
  Users,
  Phone,
  Mail,
  Calendar,
  Home,
  Euro,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Download,
  Wrench,
  TrendingUp,
  CreditCard,
  History,
  Send,
  Upload,
  UserPlus,
  AlertCircle,
} from 'lucide-react'
import { tenantQueries, leaseQueries } from '@/lib/supabase/queries'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { getUser } from '@/lib/supabase/auth'
import { mockTenants, mockLeases, mockPayments } from '@/lib/mock-data/vastgoed'

interface TenantDetailSheetProps {
  tenantId: string | null
  open: boolean
  onClose: () => void
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; dot: string; badge: string }> = {
  Betaald:    { label: 'Betaald',    icon: CheckCircle2, dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
  Openstaand: { label: 'Openstaand', icon: XCircle,      dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
  'Te laat':  { label: 'Te laat',    icon: Clock,        dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
}

const TICKET_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  open:           { label: 'Open',           cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  in_behandeling: { label: 'In behandeling', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  afgerond:       { label: 'Afgerond',       cls: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-500' },
}

// ─── Tab nav ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'tijdlijn', label: 'Activiteit' },
  { id: 'info',     label: 'Info' },
  { id: 'betalingen', label: 'Betalingen' },
  { id: 'documenten', label: 'Documenten' },
] as const

type TabId = typeof TABS[number]['id']

// ─── Mock timeline events ─────────────────────────────────────────────────────

function buildDemoTimeline(tenantName: string, monthlyRent: number): TimelineEvent[] {
  const now = Date.now()
  const days = (n: number) => new Date(now - n * 86400_000)
  const hours = (n: number) => new Date(now - n * 3_600_000)

  const fmt = (d: Date) => d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  return [
    {
      id: '1',
      icon: Send,
      title: 'Huurovereenkomst verstuurd via DocuSign',
      actor: 'Domio',
      timestamp: hours(1),
      variant: 'default',
      meta: [
        { label: 'Ontvanger', value: tenantName },
        { label: 'Status ondertekening', value: 'In afwachting', highlight: true },
        { label: 'Verstuurd op', value: fmt(hours(1)) },
        { label: 'Verloopdatum link', value: fmt(days(-6)) },
      ],
      attachments: [
        { label: 'Huurovereenkomst.pdf', href: '#' },
      ],
      href: '/dashboard/landlord/tenants',
      hrefLabel: 'Bekijk huurder',
    },
    {
      id: '2',
      icon: UserPlus,
      title: `${tenantName} toegevoegd als huurder`,
      actor: 'Domio',
      timestamp: hours(2),
      variant: 'default',
      meta: [
        { label: 'Naam', value: tenantName },
        { label: 'Aangemaakt op', value: fmt(hours(2)) },
        { label: 'Identiteitsverificatie', value: 'Goedgekeurd' },
        { label: 'Gekoppeld object', value: 'Keizersgracht 142, Amsterdam' },
      ],
      href: '/dashboard/landlord/tenants',
      hrefLabel: 'Bekijk huurdersdossier',
    },
    {
      id: '3',
      icon: CheckCircle2,
      title: `Huur ontvangen — € ${monthlyRent.toLocaleString('nl-NL')}`,
      actor: tenantName,
      timestamp: days(5),
      variant: 'default',
      meta: [
        { label: 'Bedrag', value: `€ ${monthlyRent.toLocaleString('nl-NL')}`, highlight: true },
        { label: 'Ontvangen op', value: fmt(days(5)) },
        { label: 'Van rekening', value: 'NL91 ABNA 0417 1643 00' },
        { label: 'Omschrijving', value: `Huur april 2026 — ${tenantName}` },
        { label: 'Matched factuur', value: 'FAC-2026-004' },
        { label: 'Status', value: 'Verwerkt', highlight: true },
      ],
      attachments: [
        { label: 'Betaalbewijs april 2026.pdf', href: '#' },
      ],
      href: '/dashboard/landlord/financial',
      hrefLabel: 'Bekijk in financieel overzicht',
    },
    {
      id: '4',
      icon: Euro,
      title: 'Factuur verstuurd — april 2026',
      actor: 'Domio',
      timestamp: days(6),
      variant: 'default',
      meta: [
        { label: 'Factuurnummer', value: 'FAC-2026-004' },
        { label: 'Bedrag', value: `€ ${monthlyRent.toLocaleString('nl-NL')}`, highlight: true },
        { label: 'Verstuurd op', value: fmt(days(6)) },
        { label: 'Vervaldatum', value: fmt(days(-9)) },
        { label: 'Periode', value: 'April 2026' },
        { label: 'Status', value: 'Betaald', highlight: true },
      ],
      attachments: [
        { label: 'Factuur FAC-2026-004.pdf', href: '#' },
      ],
      href: '/dashboard/landlord/financial',
      hrefLabel: 'Bekijk factuur',
    },
    {
      id: '5',
      icon: AlertCircle,
      title: 'Betalingsherinnering verstuurd',
      actor: 'Domio',
      timestamp: days(8),
      variant: 'warning',
      meta: [
        { label: 'Openstaand bedrag', value: `€ ${monthlyRent.toLocaleString('nl-NL')}`, highlight: true },
        { label: 'Dagen te laat', value: '3 dagen' },
        { label: 'Herinneringsnummer', value: '1e herinnering' },
        { label: 'Verstuurd op', value: fmt(days(8)) },
        { label: 'Betaald op', value: fmt(days(5)) },
      ],
      href: '/dashboard/landlord/financial',
      hrefLabel: 'Bekijk betalingshistorie',
    },
    {
      id: '6',
      icon: Wrench,
      title: 'Onderhoudsverzoek ingediend — Lekkage badkamer',
      actor: tenantName,
      timestamp: days(22),
      variant: 'neutral',
      meta: [
        { label: 'Categorie', value: 'Loodgieterij' },
        { label: 'Prioriteit', value: 'Normaal' },
        { label: 'Status', value: 'In behandeling', highlight: true },
        { label: 'Ingediend op', value: fmt(days(22)) },
        { label: 'Monteur gepland', value: fmt(days(-7)) },
        { label: 'Referentie', value: 'OND-2026-018' },
      ],
      href: '/dashboard/landlord/maintenance',
      hrefLabel: 'Bekijk onderhoudsticket',
    },
    {
      id: '7',
      icon: TrendingUp,
      title: 'Jaarlijkse huurindexatie verwerkt (+3,1%)',
      actor: 'Domio',
      timestamp: days(45),
      variant: 'default',
      meta: [
        { label: 'Index', value: 'CPI — CBS 2026' },
        { label: 'Percentage', value: '+3,1%', highlight: true },
        { label: 'Oude huurprijs', value: `€ ${monthlyRent.toLocaleString('nl-NL')}` },
        { label: 'Nieuwe huurprijs', value: `€ ${Math.round(monthlyRent * 1.031).toLocaleString('nl-NL')}`, highlight: true },
        { label: 'Ingangsdatum', value: '1 januari 2026' },
        { label: 'Huurder geïnformeerd', value: 'Ja — per brief' },
      ],
      attachments: [
        { label: 'Indexatiebrief 2026.pdf', href: '#' },
      ],
      href: '/dashboard/landlord/tenants',
      hrefLabel: 'Bekijk contractdetails',
    },
    {
      id: '8',
      icon: Upload,
      title: 'Document geüpload — Salarisstrook',
      actor: tenantName,
      timestamp: days(90),
      variant: 'neutral',
      meta: [
        { label: 'Documenttype', value: 'Salarisstrook' },
        { label: 'Geüpload op', value: fmt(days(90)) },
        { label: 'Periode', value: 'Oktober 2025' },
        { label: 'Status verificatie', value: 'Goedgekeurd', highlight: true },
      ],
      attachments: [
        { label: 'Salarisstrook_okt2025.pdf', href: '#' },
      ],
      href: '/dashboard/landlord/tenants',
      hrefLabel: 'Bekijk documenten',
    },
    {
      id: '9',
      icon: FileText,
      title: 'Contract geactiveerd',
      actor: 'Domio',
      timestamp: days(120),
      variant: 'default',
      meta: [
        { label: 'Contractnummer', value: 'HK-2025-0042' },
        { label: 'Startdatum', value: fmt(days(120)) },
        { label: 'Einddatum', value: 'Onbepaalde tijd' },
        { label: 'Huurprijs', value: `€ ${monthlyRent.toLocaleString('nl-NL')} / mnd`, highlight: true },
        { label: 'Borg', value: `€ ${(monthlyRent * 2).toLocaleString('nl-NL')}` },
        { label: 'Ondertekend door', value: `${tenantName} + verhuurder` },
      ],
      attachments: [
        { label: 'Getekend huurcontract.pdf', href: '#' },
      ],
      href: '/dashboard/landlord/tenants',
      hrefLabel: 'Bekijk contract',
    },
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TenantDetailSheet({ tenantId, open, onClose }: TenantDetailSheetProps) {
  const { isDemo } = useDashboardUser()

  const [tenant, setTenant] = useState<any>(null)
  const [leases, setLeases] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('tijdlijn')

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '', email: '', phone: '', date_of_birth: '',
  })

  const initEditForm = (t: any) => setEditForm({
    full_name: t.full_name || '',
    email: t.email || '',
    phone: t.phone || '',
    date_of_birth: t.date_of_birth || '',
  })

  useEffect(() => {
    if (!tenantId || !open) return
    setLoading(true)
    setTenant(null)
    setLeases([])
    setIsEditing(false)
    setActiveTab('tijdlijn')
    setEditError(null)

    if (isDemo) {
      const mockT = mockTenants.find(t => t.id === tenantId)
      if (mockT) {
        const mockL = mockLeases.find(l => l.tenant.id === tenantId)
        const tenantData = {
          full_name: mockT.name,
          email: mockT.email,
          phone: mockT.phone,
          date_of_birth: null,
        }
        setTenant(tenantData)
        initEditForm(tenantData)
        if (mockL) {
          setLeases([{
            status: mockL.status,
            monthly_rent: mockL.monthlyRent,
            start_date: mockL.startDate,
            deposit: mockL.deposit,
            unit: { property: { name: mockL.property?.name ?? '—' } },
          }])
        }
      }
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const { user } = await getUser()
        if (!user) return
        const [tenantData, allLeases] = await Promise.all([
          tenantQueries.getById(tenantId),
          leaseQueries.getByOwner(user.id),
        ])
        setTenant(tenantData)
        initEditForm(tenantData)
        setLeases((allLeases || []).filter((l: any) => l.tenant_id === tenantId))
      } catch (err) {
        const e = err as { code?: string }
        if (e?.code !== 'PGRST116') console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tenantId, open, isDemo])

  const handleSave = async () => {
    setSaving(true); setEditError(null)
    try {
      const updated = await tenantQueries.update(tenantId!, {
        full_name: editForm.full_name,
        email: editForm.email || null,
        phone: editForm.phone || null,
        date_of_birth: editForm.date_of_birth || null,
      } as never)
      setTenant((t: any) => ({ ...t, ...updated }))
      setIsEditing(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally { setSaving(false) }
  }

  const activeLease = leases.find((l: any) => l.status === 'actief')
  const monthlyRent = activeLease?.monthly_rent ?? 1250

  const STATUS_MAP: Record<string, string> = { betaald: 'Betaald', openstaand: 'Openstaand', achterstallig: 'Te laat' }
  const paymentHistory = isDemo && tenantId
    ? mockPayments
        .filter(p => p.tenantId === tenantId && p.type === 'huur')
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          month: new Date(p.dueDate).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }),
          amount: p.amount,
          status: STATUS_MAP[p.status] ?? p.status,
        }))
    : []

  const activeLeaseMock = isDemo ? mockLeases.find(l => l.tenant.id === tenantId) : null
  const leaseStart = activeLeaseMock?.startDate ?? '2025-01-01'
  const mockDocuments = isDemo ? [
    { id: '1', name: 'Huurovereenkomst', category: 'Contract', date: leaseStart },
    { id: '2', name: 'Borgovereenkomst', category: 'Borg', date: leaseStart },
    { id: '3', name: 'Kopie ID-bewijs', category: 'Identificatie', date: new Date(new Date(leaseStart).getTime() + 2 * 86400_000).toISOString().slice(0, 10) },
    { id: '4', name: 'Plaatsbeschrijving intrede', category: 'Inspectie', date: new Date(new Date(leaseStart).getTime() + 4 * 86400_000).toISOString().slice(0, 10) },
  ] : []

  const timelineEvents = isDemo
    ? buildDemoTimeline(tenant?.full_name ?? 'Huurder', monthlyRent)
    : []

  return (
    <DetailShell
      open={open}
      onClose={onClose}
      title={loading ? '…' : (tenant?.full_name ?? 'Huurder')}
      subtitle={tenant?.email ?? undefined}
      headerLeft={
        <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </div>
      }
    >
      {/* Tab navigation */}
      <div className="px-6 pt-4 shrink-0">
        <TabNav
          tabs={TABS as unknown as { id: TabId; label: string }[]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6">

        {/* ── Tijdlijn ───────────────────────────────────────────────────── */}
        {activeTab === 'tijdlijn' && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-5">
              Recente activiteit
            </p>
            {loading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3.5 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse w-2/3" />
                      <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ActivityTimeline events={timelineEvents} />
            )}
          </div>
        )}

        {/* ── Info ──────────────────────────────────────────────────────── */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-gray-400">Laden…</p>
            ) : !tenant ? (
              <p className="text-sm text-gray-400">Geen gegevens gevonden.</p>
            ) : (
              <>
                <InfoRow icon={User}     label="Naam"           value={tenant.full_name} />
                <InfoRow icon={Mail}     label="E-mail"         value={tenant.email} />
                <InfoRow icon={Phone}    label="Telefoon"       value={tenant.phone} />
                <InfoRow icon={Calendar} label="Geboortedatum"  value={tenant.date_of_birth} />
                {activeLease && (
                  <>
                    <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 mt-4">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3">Huurcontract</p>
                    </div>
                    <InfoRow icon={Home}       label="Object"       value={activeLease.unit?.property?.name ?? '—'} />
                    <InfoRow icon={Euro}       label="Huurprijs"    value={activeLease.monthly_rent ? `€ ${Number(activeLease.monthly_rent).toLocaleString('nl-NL')} / mnd` : '—'} />
                    <InfoRow icon={Calendar}   label="Startdatum"   value={activeLease.start_date} />
                    <InfoRow icon={CreditCard} label="Waarborgsom"  value={activeLease.deposit ? `€ ${Number(activeLease.deposit).toLocaleString('nl-NL')}` : '—'} />
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Betalingen ────────────────────────────────────────────────── */}
        {activeTab === 'betalingen' && (
          <div className="space-y-2">
            {paymentHistory.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">Geen betalingen gevonden</p>
            ) : paymentHistory.map((p) => {
              const cfg = PAYMENT_STATUS_CONFIG[p.status]
              const Icon = cfg?.icon ?? Clock
              return (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{p.month}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500">€ {p.amount.toLocaleString('nl-NL')}</p>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg?.badge)}>
                      {p.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Documenten ────────────────────────────────────────────────── */}
        {activeTab === 'documenten' && (
          <div className="space-y-2">
            {mockDocuments.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">Geen documenten gevonden</p>
            ) : mockDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{doc.category} · {new Date(doc.date).toLocaleDateString('nl-NL')}</p>
                </div>
                <button type="button" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 dark:text-gray-500 transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </DetailShell>
  )
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}
