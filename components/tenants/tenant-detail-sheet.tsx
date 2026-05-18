'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  TicketPlus,
  Loader2,
  Bell,
  MessageSquare,
  FileUp,
  CalendarDays,
  FileX,
  ClipboardList,
  UserX,
  Pencil,
} from 'lucide-react'
import { tenantQueries, leaseQueries, ticketQueries } from '@/lib/supabase/queries'
import { ActionListRow, ActionListSection } from '@/components/ui/action-list'
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
  { id: 'tijdlijn',   label: 'Activiteit' },
  { id: 'info',       label: 'Info' },
  { id: 'acties',     label: 'Acties' },
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
  const router = useRouter()
  const { isDemo, basePath } = useDashboardUser()

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

  const [inviteSending, setInviteSending] = useState(false)
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sent' | 'error'>('idle')

  type ActiveAction = 'betalingsherinnering' | 'huurverhoging' | 'indexatie' | 'opzeggen' | 'einddatum' | null
  const [activeAction, setActiveAction] = useState<ActiveAction>(null)
  const [actionSaving, setActionSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [huurverhogingForm, setHuurverhogingForm] = useState({ bedrag: '', datum: '' })
  const [opzegForm, setOpzegForm] = useState({ datum: '', reden: '' })
  const [einddatumForm, setEinddatumForm] = useState({ datum: '' })

  const openAction = (action: ActiveAction) => {
    setActionError(null); setActionSuccess(null)
    if (action === 'huurverhoging') setHuurverhogingForm({ bedrag: activeLease ? String(activeLease.monthly_rent) : '', datum: '' })
    if (action === 'einddatum') setEinddatumForm({ datum: activeLease?.end_date ?? '' })
    if (action === 'opzeggen') setOpzegForm({ datum: '', reden: '' })
    setActiveAction(action)
  }

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
        setLeases(
          (allLeases || [])
            .filter((l: any) => l.tenant_id === tenantId)
            .map((l: any) => ({
              ...l,
              unit: l.units ? { ...l.units, property: l.units.properties ?? null } : null,
            }))
        )
      } catch (err) {
        const code = (err as { code?: string })?.code
        if (code !== 'PGRST116' && err instanceof Error) console.error(err)
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
      initEditForm(updated)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally { setSaving(false) }
  }

  const activeLease = leases.find((l: any) => l.status === 'actief')
  const monthlyRent = activeLease?.monthly_rent ?? 1250

  const isDirty = tenant && (
    editForm.full_name !== (tenant.full_name ?? '') ||
    editForm.email !== (tenant.email ?? '') ||
    editForm.phone !== (tenant.phone ?? '') ||
    editForm.date_of_birth !== (tenant.date_of_birth ?? '')
  )

  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false)

  const handleClose = () => {
    if (isEditing && isDirty) { setConfirmDiscardOpen(true); return }
    if (isEditing) { setIsEditing(false); return }
    onClose()
  }

  const handleDiscard = () => {
    setConfirmDiscardOpen(false)
    if (tenant) initEditForm(tenant)
    setIsEditing(false)
    onClose()
  }

  const handleSendInvite = async () => {
    if (!tenantId || !tenant?.email || inviteSending) return
    setInviteSending(true)
    setInviteStatus('idle')
    try {
      const res = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })
      setInviteStatus(res.ok ? 'sent' : 'error')
    } catch {
      setInviteStatus('error')
    } finally {
      setInviteSending(false)
    }
  }

  const runAction = async (fn: () => Promise<string>) => {
    setActionSaving(true); setActionError(null); setActionSuccess(null)
    try {
      const msg = await fn()
      setActionSuccess(msg)
      setActiveAction(null)
    } catch (err: any) {
      setActionError(err?.message ?? 'Er is een fout opgetreden')
    } finally {
      setActionSaving(false) }
  }

  const handleBetalingsherinnering = () => runAction(async () => {
    const { user } = await getUser(); if (!user) throw new Error('Niet ingelogd')
    await ticketQueries.create({ owner_id: user.id, title: 'Betalingsherinnering verstuurd', scope: 'persoon', lease_id: activeLease?.id ?? null, unit_id: activeLease?.unit_id ?? null, source: 'landlord', status: 'open', priority: 'hoog', category: 'huurgebeurtenis' } as any)
    return 'Betalingsherinnering aangemaakt'
  })

  const [indexatiePreview, setIndexatiePreview] = useState<{ oldRent: number; newRent: number; percentage: number } | null>(null)

  const handleIndexatiePreview = async () => {
    if (!activeLease?.id) return
    setIndexatiePreview(null)
    const res = await fetch('/api/leases/index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaseId: activeLease.id, preview: true }),
    })
    if (res.ok) {
      const { result } = await res.json()
      setIndexatiePreview(result)
    }
  }

  const handleIndexatie = () => runAction(async () => {
    if (!activeLease?.id) throw new Error('Geen actief contract')
    const res = await fetch('/api/leases/index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaseId: activeLease.id, preview: false }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Indexatie mislukt')
    }
    const { result } = await res.json()
    setLeases(ls => ls.map(l => l.id === activeLease.id ? { ...l, monthly_rent: result.newRent } : l))
    return `Huur geïndexeerd naar €${Number(result.newRent).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`
  })

  const handleHuurverhoging = () => runAction(async () => {
    if (!activeLease?.id) throw new Error('Geen actief contract')
    const nieuw = parseFloat(huurverhogingForm.bedrag)
    if (!nieuw || nieuw <= 0) throw new Error('Voer een geldig bedrag in')
    await leaseQueries.update(activeLease.id, { monthly_rent: nieuw } as any)
    setLeases(ls => ls.map(l => l.id === activeLease.id ? { ...l, monthly_rent: nieuw } : l))
    const { user } = await getUser(); if (!user) throw new Error('Niet ingelogd')
    await ticketQueries.create({ owner_id: user.id, title: `Huurverhoging naar €${nieuw.toLocaleString('nl-NL')}${huurverhogingForm.datum ? ` per ${huurverhogingForm.datum}` : ''}`, scope: 'persoon', lease_id: activeLease.id, unit_id: activeLease.unit_id ?? null, source: 'landlord', status: 'afgerond', priority: 'normaal', category: 'huurgebeurtenis' } as any)
    return 'Huurverhoging doorgevoerd'
  })

  const handleOpzeggen = () => runAction(async () => {
    if (!activeLease?.id) throw new Error('Geen actief contract')
    if (!opzegForm.datum) throw new Error('Voer een opzegdatum in')
    await leaseQueries.endLease(activeLease.id, opzegForm.datum)
    setLeases(ls => ls.map(l => l.id === activeLease.id ? { ...l, status: 'opgezegd', end_date: opzegForm.datum } : l))
    return 'Contract opgezegd'
  })

  const handleEinddatum = () => runAction(async () => {
    if (!activeLease?.id) throw new Error('Geen actief contract')
    if (!einddatumForm.datum) throw new Error('Voer een datum in')
    await leaseQueries.update(activeLease.id, { end_date: einddatumForm.datum } as any)
    setLeases(ls => ls.map(l => l.id === activeLease.id ? { ...l, end_date: einddatumForm.datum } : l))
    return 'Einddatum aangepast'
  })

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
    <>
    {/* ── Action mini-dialogs ─────────────────────────────────────────── */}
    {activeAction && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setActiveAction(null)} />
        <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">

          {activeAction === 'indexatie' && (<>
            <p className="text-base font-semibold text-gray-900 dark:text-white">Huurindexatie toepassen</p>
            {indexatiePreview ? (
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Huidige huur</span>
                  <span>€{indexatiePreview.oldRent.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verhoging ({indexatiePreview.percentage.toFixed(2)}%)</span>
                  <span>+ €{(indexatiePreview.newRent - indexatiePreview.oldRent).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-gray-200 dark:border-neutral-700 pt-2">
                  <span>Nieuwe huur</span>
                  <span className="text-[#163300] dark:text-[#9FE870]">€{indexatiePreview.newRent.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">Berekening ophalen via CBS…</p>
            )}
          </>)}

          {activeAction === 'huurverhoging' && (<>
            <p className="text-base font-semibold text-gray-900 dark:text-white">Huurverhoging handmatig</p>
            <ActionField label="Nieuw maandbedrag (€)">
              <input autoFocus type="number" min="0" step="0.01" value={huurverhogingForm.bedrag} onChange={e => setHuurverhogingForm(f => ({ ...f, bedrag: e.target.value }))} className={FIELD_CLS} placeholder="1250" />
            </ActionField>
            <ActionField label="Ingangsdatum (optioneel)">
              <input type="date" value={huurverhogingForm.datum} onChange={e => setHuurverhogingForm(f => ({ ...f, datum: e.target.value }))} className={FIELD_CLS} />
            </ActionField>
          </>)}

          {activeAction === 'einddatum' && (<>
            <p className="text-base font-semibold text-gray-900 dark:text-white">Einddatum aanpassen</p>
            <ActionField label="Nieuwe einddatum">
              <input autoFocus type="date" value={einddatumForm.datum} onChange={e => setEinddatumForm({ datum: e.target.value })} className={FIELD_CLS} />
            </ActionField>
          </>)}

          {activeAction === 'opzeggen' && (<>
            <p className="text-base font-semibold text-gray-900 dark:text-white">Contract opzeggen</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Het contract wordt op de gekozen datum beëindigd.</p>
            <ActionField label="Opzegdatum">
              <input autoFocus type="date" value={opzegForm.datum} onChange={e => setOpzegForm(f => ({ ...f, datum: e.target.value }))} className={FIELD_CLS} />
            </ActionField>
            <ActionField label="Reden (optioneel)">
              <textarea value={opzegForm.reden} onChange={e => setOpzegForm(f => ({ ...f, reden: e.target.value }))} rows={2} className={FIELD_CLS} placeholder="Bijv. einde huurperiode, wederzijds akkoord…" />
            </ActionField>
          </>)}


          {actionError && <p className="text-xs text-red-500">{actionError}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setActiveAction(null)} className="text-sm text-gray-500 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
              Annuleren
            </button>
            <button
              type="button"
              disabled={actionSaving}
              onClick={
                activeAction === 'indexatie'     ? handleIndexatie :
                activeAction === 'huurverhoging' ? handleHuurverhoging :
                activeAction === 'einddatum'     ? handleEinddatum :
                activeAction === 'opzeggen'      ? handleOpzeggen :
                undefined
              }
              className={cn(
                'text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-40 transition-colors flex items-center gap-1.5',
                activeAction === 'opzeggen'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#163300] hover:bg-[#1f4a00] text-white'
              )}
            >
              {actionSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {activeAction === 'opzeggen' ? 'Opzeggen bevestigen' : 'Bevestigen'}
            </button>
          </div>
        </div>
      </div>
    )}

    <DetailShell
      open={open}
      onClose={handleClose}
      title={loading ? '…' : (tenant?.full_name ?? 'Huurder')}
      subtitle={tenant?.email ?? undefined}
      footer={
        <div className="border-t border-gray-100 dark:border-neutral-800 p-4 flex items-center justify-end gap-3 shrink-0">
          {editError && <p className="text-xs text-red-500 flex-1">{editError}</p>}
          <button
            type="button"
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1"
          >
            {isEditing ? 'Annuleren' : 'Sluiten'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isEditing || !isDirty}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] disabled:opacity-40 text-[#163300] text-sm font-semibold px-5 py-2 transition-colors"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Opslaan
          </button>
        </div>
      }
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
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">Persoonlijke info</p>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-medium text-[#163300] dark:text-[#9FE870] hover:underline"
                    >
                      Bewerken
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <>
                    <EditRow icon={User}     label="Naam"          value={editForm.full_name}     onChange={v => setEditForm(f => ({ ...f, full_name: v }))} />
                    <EditRow icon={Mail}     label="E-mail"        value={editForm.email}         onChange={v => setEditForm(f => ({ ...f, email: v }))}     type="email" />
                    <EditRow icon={Phone}    label="Telefoon"      value={editForm.phone}         onChange={v => setEditForm(f => ({ ...f, phone: v }))} />
                    <EditRow icon={Calendar} label="Geboortedatum" value={editForm.date_of_birth} onChange={v => setEditForm(f => ({ ...f, date_of_birth: v }))} type="date" />
                  </>
                ) : (
                  <>
                    <InfoRow icon={User}     label="Naam"          value={tenant.full_name} />
                    <InfoRow icon={Mail}     label="E-mail"        value={tenant.email} />
                    <InfoRow icon={Phone}    label="Telefoon"      value={tenant.phone} />
                    <InfoRow icon={Calendar} label="Geboortedatum" value={tenant.date_of_birth} />
                  </>
                )}
                {activeLease && (
                  <>
                    <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 mt-4">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3">Huurcontract</p>
                    </div>
                    <InfoRow icon={Home}       label="Object"      value={activeLease.unit?.property?.name ?? '—'} />
                    <InfoRow icon={Euro}       label="Huurprijs"   value={activeLease.monthly_rent ? `€ ${Number(activeLease.monthly_rent).toLocaleString('nl-NL')} / mnd` : '—'} />
                    <InfoRow icon={Calendar}   label="Startdatum"  value={activeLease.start_date} />
                    <InfoRow icon={CreditCard} label="Waarborgsom" value={activeLease.deposit ? `€ ${Number(activeLease.deposit).toLocaleString('nl-NL')}` : '—'} />
                  </>
                )}

              </>
            )}
          </div>
        )}

        {/* ── Acties ────────────────────────────────────────────────────── */}
        {activeTab === 'acties' && (
          <div className="space-y-6">
            {actionSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 px-4 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-sm text-green-800 dark:text-green-300">{actionSuccess}</p>
              </div>
            )}

            <ActionListSection title="Communicatie">
              <ActionListRow
                icon={TicketPlus}
                title="Ticket aanmaken"
                subtitle="Opent ticketbeheer met huurder pre-ingevuld"
                onClick={() => {
                  const params = new URLSearchParams({ create: '1' })
                  if (activeLease?.id) params.set('leaseId', activeLease.id)
                  router.push(`${basePath}/maintenance?${params.toString()}`)
                  onClose()
                }}
                slim
              />
              <ActionListRow icon={Bell} title="Betalingsherinnering sturen" subtitle="Registreert een herinnering in de activiteitenlog" onClick={handleBetalingsherinnering} slim />
              <ActionListRow icon={MessageSquare} title="Bericht sturen" subtitle="Directe chat met huurder" slim right={<span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Binnenkort</span>} />
              <ActionListRow icon={FileUp} title="Document versturen" subtitle="Stuur een PDF of brief naar de huurder" slim right={<span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Binnenkort</span>} />
            </ActionListSection>

            <ActionListSection title="Contract">
              <ActionListRow
                icon={TrendingUp}
                title="Huurindexatie toepassen"
                subtitle={activeLease?.indexation_method && activeLease.indexation_method !== 'none'
                  ? `Methode: ${activeLease.indexation_method === 'cpi' ? 'CBS CPI' : activeLease.indexation_method === 'cpi_plus' ? `CBS CPI + ${activeLease.indexation_pct}%` : `Vast ${activeLease.indexation_pct}%`}`
                  : 'Geen indexatie ingesteld op contract'}
                onClick={activeLease?.indexation_method && activeLease.indexation_method !== 'none' ? () => { openAction('indexatie'); handleIndexatiePreview() } : undefined}
                slim
              />
              <ActionListRow icon={TrendingUp} title="Huurverhoging handmatig" subtitle={activeLease ? `Huidig: €${Number(activeLease.monthly_rent).toLocaleString('nl-NL')} / mnd` : 'Geen actief contract'} onClick={activeLease ? () => openAction('huurverhoging') : undefined} slim />
              <ActionListRow icon={CalendarDays} title="Einddatum aanpassen" subtitle={activeLease?.end_date ? `Huidig: ${activeLease.end_date}` : 'Onbepaalde tijd'} onClick={activeLease ? () => openAction('einddatum') : undefined} slim />
              <ActionListRow icon={FileX} title="Contract opzeggen" subtitle="Zet huurovereenkomst op opgezegd" onClick={activeLease ? () => openAction('opzeggen') : undefined} danger slim />
            </ActionListSection>

            <ActionListSection title="Inspectie & onderhoud">
              <ActionListRow
                icon={Wrench}
                title="Inspectie inplannen"
                subtitle="Opent ticketbeheer met categorie inspectie pre-ingevuld"
                onClick={() => {
                  const params = new URLSearchParams({ create: '1', category: 'inspectie' })
                  if (activeLease?.id) params.set('leaseId', activeLease.id)
                  router.push(`${basePath}/maintenance?${params.toString()}`)
                  onClose()
                }}
                slim
              />
              <ActionListRow icon={ClipboardList} title="Plaatsbeschrijving aanmaken" subtitle="Intrede/uittrede staat van de woning" slim right={<span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Binnenkort</span>} />
            </ActionListSection>

            <ActionListSection title="Account">
              <ActionListRow
                icon={inviteStatus === 'sent' ? CheckCircle2 : inviteStatus === 'error' ? AlertCircle : Send}
                title={inviteStatus === 'sent' ? 'Uitnodiging verstuurd' : inviteStatus === 'error' ? 'Opnieuw proberen' : 'Uitnodiging versturen'}
                subtitle={tenant?.email ? `Stuurt toegangslink naar ${tenant.email}` : 'Geen e-mailadres bekend'}
                onClick={!inviteSending && tenant?.email ? handleSendInvite : undefined}
                slim
              />
              <ActionListRow icon={UserX} title="Account deactiveren" subtitle="Trek huurder toegang tot het portaal in" slim right={<span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Binnenkort</span>} />
            </ActionListSection>
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

    <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Wijzigingen annuleren?</AlertDialogTitle>
          <AlertDialogDescription>
            Je hebt aanpassingen gedaan die nog niet zijn opgeslagen. Als je annuleert gaan deze verloren.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Terug</AlertDialogCancel>
          <AlertDialogAction onClick={handleDiscard} className="bg-red-600 hover:bg-red-700 text-white">
            Wijzigingen verwerpen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
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

function EditRow({ icon: Icon, label, value, onChange, type = 'text' }: {
  icon: React.ElementType
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'email' | 'date'
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-5">
        <Icon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#9FE870] transition-shadow"
        />
      </div>
    </div>
  )
}

const FIELD_CLS = 'w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#9FE870] transition-shadow resize-none'

function ActionField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      {children}
    </div>
  )
}

