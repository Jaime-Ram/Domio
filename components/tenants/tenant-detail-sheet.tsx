'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  User,
  Phone,
  Mail,
  Calendar,
  Home,
  Euro,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Wrench,
  Shield,
  Briefcase,
  Tag,
  Pencil,
  Check,
  X,
  Plus,
  TrendingUp,
  CreditCard,
} from 'lucide-react'
import { tenantQueries, leaseQueries } from '@/lib/supabase/queries'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { getUser } from '@/lib/supabase/auth'

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

export function TenantDetailSheet({ tenantId, open, onClose }: TenantDetailSheetProps) {
  const router = useRouter()
  const { isDemo, basePath } = useDashboardUser()

  const [tenant, setTenant] = useState<any>(null)
  const [leases, setLeases] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  // Edit state
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
    setActiveTab('info')
    setEditError(null)

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
  }, [tenantId, open])

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

  // Derived data
  const activeLease = leases.find((l: any) => l.status === 'actief')
  const monthlyRent = activeLease?.monthly_rent ?? 0

  const paymentHistory = isDemo ? [
    { id: '1', month: 'Januari 2024',   amount: monthlyRent, paidOn: '2024-01-01', status: 'Betaald' },
    { id: '2', month: 'December 2023',  amount: monthlyRent, paidOn: '2023-12-01', status: 'Betaald' },
    { id: '3', month: 'November 2023',  amount: monthlyRent, paidOn: '2023-11-03', status: 'Te laat' },
    { id: '4', month: 'Oktober 2023',   amount: monthlyRent, paidOn: '2023-10-01', status: 'Betaald' },
    { id: '5', month: 'September 2023', amount: monthlyRent, paidOn: null,         status: 'Openstaand' },
  ] : []

  const mockDocuments = isDemo ? [
    { id: '1', name: 'Huurovereenkomst 2023',             category: 'Contract',      date: '2023-01-01', sharedWithTenant: true },
    { id: '2', name: 'Borgovereenkomst',                  category: 'Borg',          date: '2023-01-01', sharedWithTenant: true },
    { id: '3', name: 'Kopie ID-bewijs',                   category: 'Identificatie', date: '2023-01-03', sharedWithTenant: false },
    { id: '4', name: 'Salarisstrook jan 2023',            category: 'Inkomen',       date: '2023-01-05', sharedWithTenant: false },
    { id: '5', name: 'Plaatsbeschrijving intrede',        category: 'Inspectie',     date: '2023-01-05', sharedWithTenant: true },
    { id: '6', name: 'Jaarafrekening servicekosten 2025', category: 'Financieel',    date: '2026-02-01', sharedWithTenant: true },
  ] : []

  const mockTickets = isDemo ? [
    { id: '1', title: 'Lekkage badkamer',         category: 'Loodgieterswerk', status: 'in_behandeling', date: '2026-04-02' },
    { id: '2', title: 'Kapotte CV-ketel',          category: 'Verwarming',      status: 'afgerond',       date: '2026-01-15' },
    { id: '3', title: 'Tochtige ramen woonkamer',  category: 'Ramen/deuren',    status: 'open',           date: '2025-11-10' },
  ] : []

  const totalArrears = paymentHistory.filter(p => p.status === 'Openstaand').reduce((s, p) => s + p.amount, 0)
  const leaseMonths = activeLease?.start_date
    ? Math.max(0, Math.round((Date.now() - new Date(activeLease.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : 0

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-full max-w-2xl flex flex-col p-0 overflow-hidden">

        {/* ── Sticky header ── */}
        <SheetHeader className="shrink-0 px-6 pt-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
          {loading ? (
            <>
              <SheetTitle className="sr-only">Laden…</SheetTitle>
              <div className="space-y-2 animate-pulse">
                <div className="h-6 w-40 bg-gray-200 dark:bg-neutral-700 rounded" />
                <div className="h-4 w-56 bg-gray-100 dark:bg-neutral-800 rounded" />
              </div>
            </>
          ) : !tenant ? (
            <SheetTitle className="text-base text-gray-500">Huurder niet gevonden</SheetTitle>
          ) : (
            <div>
              {/* Top row: title + Bewerken/Save — aligned with the X close button */}
              <div className="flex items-center justify-between gap-4 pr-10">
                <SheetTitle className="text-xl font-bold text-[#163300] dark:text-[#9FE870] leading-tight truncate">
                  {isEditing ? (editForm.full_name || tenant.full_name) : tenant.full_name}
                </SheetTitle>
                {isEditing ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => { initEditForm(tenant); setIsEditing(false); setEditError(null) }} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 transition-colors">
                      <X className="h-3.5 w-3.5" />Annuleren
                    </button>
                    <button type="button" disabled={saving || !editForm.full_name} onClick={handleSave} className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] hover:bg-[#244d00] disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors">
                      <Check className="h-3.5 w-3.5" />{saving ? 'Opslaan…' : 'Opslaan'}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => { initEditForm(tenant); setIsEditing(true); setActiveTab('info') }} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 transition-colors shrink-0">
                    <Pencil className="h-3.5 w-3.5" />Bewerken
                  </button>
                )}
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {activeLease ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" />Actief huurder
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400">
                    Geen actief contract
                  </span>
                )}
                {totalArrears > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" />€{totalArrears.toLocaleString('nl-NL')} achterstand
                  </span>
                )}
              </div>

              {/* KPI strip */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { icon: Euro,        label: 'Maandhuur',  value: monthlyRent ? `€${monthlyRent.toLocaleString('nl-NL')}` : '—', sub: null },
                  { icon: CreditCard,  label: 'Betalingen', value: `${paymentHistory.filter(p => p.status === 'Betaald').length}/${paymentHistory.length}`, sub: 'op tijd' },
                  { icon: TrendingUp,  label: 'Looptijd',   value: leaseMonths ? `${leaseMonths}` : '—', sub: leaseMonths ? 'maanden' : null },
                  { icon: Calendar,    label: 'Startdatum', value: activeLease?.start_date ? new Date(activeLease.start_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : '—', sub: activeLease?.start_date ? String(new Date(activeLease.start_date).getFullYear()) : null },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-3 py-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
                    {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetHeader>

        {/* ── Tabs ── */}
        {!loading && tenant && (
          <Tabs value={activeTab} onValueChange={v => { if (!isEditing) setActiveTab(v) }} className="flex flex-col flex-1 min-h-0">
            <div className="shrink-0 px-6 pt-4 border-b border-gray-100 dark:border-neutral-800">
              <TabsList className="h-9 bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl">
                {[
                  { value: 'info',      label: 'Gegevens' },
                  { value: 'payments',  label: 'Betalingen' },
                  { value: 'documents', label: 'Documenten' },
                  { value: 'tickets',   label: 'Tickets' },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    disabled={isEditing && tab.value !== 'info'}
                    className="text-sm rounded-lg px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm disabled:opacity-40"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* ── INFO TAB ── */}
            <TabsContent value="info" className="flex-1 overflow-y-auto px-6 py-5 mt-0">
              {isEditing ? (
                /* Edit mode — tile grid */
                <div className="space-y-5">
                  {editError && (
                    <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">{editError}</p>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Persoonlijke gegevens</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { label: 'Volledige naam *', key: 'full_name' as const, type: 'text', placeholder: 'Jan de Vries', span: 2 },
                        { label: 'E-mailadres',      key: 'email' as const,     type: 'email', placeholder: 'jan@email.nl',  span: 2 },
                        { label: 'Telefoonnummer',   key: 'phone' as const,     type: 'tel',   placeholder: '+31 6 12345678', span: 1 },
                        { label: 'Geboortedatum',    key: 'date_of_birth' as const, type: 'date', placeholder: '',           span: 1 },
                      ].map(({ label, key, type, placeholder, span }) => (
                        <div key={key} className={cn('bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3', span === 2 && 'col-span-2')}>
                          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">{label}</p>
                          <input
                            type={type}
                            value={editForm[key]}
                            onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── VIEW MODE ── */
                <div className="space-y-5">
                  {/* Contact */}
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Contact</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2 bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Naam</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{tenant.full_name}</p>
                      </div>
                      <div className="col-span-2 bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">E-mail</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{tenant.email || '—'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Telefoon</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{tenant.phone || '—'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Geboortedatum</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{tenant.date_of_birth ? new Date(tenant.date_of_birth).toLocaleDateString('nl-NL') : '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contract */}
                  {activeLease && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Huurcontract</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Startdatum</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeLease.start_date ? new Date(activeLease.start_date).toLocaleDateString('nl-NL') : '—'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Einddatum</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeLease.end_date ? new Date(activeLease.end_date).toLocaleDateString('nl-NL') : 'Lopend'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Huurprijs</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeLease.monthly_rent ? `€${activeLease.monthly_rent.toLocaleString('nl-NL')}/mnd` : '—'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Borgsom</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeLease.monthly_rent ? `€${(activeLease.monthly_rent * 2).toLocaleString('nl-NL')}` : '—'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extra */}
                  {isDemo && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Extra</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">IBAN (incasso)</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">NL91 ABNA 0417 1643 00</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Werkgever</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Acme BV</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Vast dienstverband</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Noodcontact</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">A. Jansen</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">+31 6 98765432</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ── BETALINGEN TAB ── */}
            <TabsContent value="payments" className="flex-1 overflow-y-auto mt-0 flex flex-col min-h-0">
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">{paymentHistory.length} betalingen</p>
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] hover:bg-[#244d00] text-white text-xs font-medium px-3 py-1.5 transition-colors">
                  <Plus className="h-3.5 w-3.5" />Registreer
                </button>
              </div>

              {totalArrears > 0 && (
                <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-semibold text-red-800 dark:text-red-400">Totale achterstand</p>
                  </div>
                  <p className="text-2xl font-bold text-red-800 dark:text-red-400">€{totalArrears.toLocaleString('nl-NL')}</p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {paymentHistory.length === 0 ? (
                  <div className="py-16 text-center">
                    <Euro className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Geen betalingen</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paymentHistory.map((payment) => {
                      const cfg = PAYMENT_STATUS_CONFIG[payment.status] ?? PAYMENT_STATUS_CONFIG.Betaald
                      const Icon = cfg.icon
                      return (
                        <div key={payment.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60">
                          <Icon className={cn('h-4 w-4 shrink-0', payment.status === 'Betaald' ? 'text-green-500' : payment.status === 'Te laat' ? 'text-amber-400' : 'text-red-500')} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{payment.month}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {payment.paidOn ? new Date(payment.paidOn).toLocaleDateString('nl-NL') : 'Nog niet betaald'}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">€{payment.amount.toLocaleString('nl-NL')}</p>
                            <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded-full', cfg.badge)}>{cfg.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── DOCUMENTEN TAB ── */}
            <TabsContent value="documents" className="flex-1 overflow-y-auto mt-0 flex flex-col min-h-0">
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">{mockDocuments.length} document{mockDocuments.length !== 1 ? 'en' : ''}</p>
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] hover:bg-[#244d00] text-white text-xs font-medium px-3 py-1.5 transition-colors">
                  <Plus className="h-3.5 w-3.5" />Document toevoegen
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {mockDocuments.length === 0 ? (
                  <div className="py-16 text-center">
                    <FileText className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Geen documenten</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mockDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                        <div className="h-9 w-9 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">{doc.category}</span>
                            <span className="text-xs text-gray-300 dark:text-neutral-600">·</span>
                            <span className="text-xs text-gray-400">{new Date(doc.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {doc.sharedWithTenant && <span className="text-[11px] text-[#163300] dark:text-[#9FE870] font-medium">Zichtbaar huurder</span>}
                          </div>
                        </div>
                        <button type="button" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-neutral-900 transition-colors shrink-0">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── TICKETS TAB ── */}
            <TabsContent value="tickets" className="flex-1 overflow-y-auto mt-0 flex flex-col min-h-0">
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">{mockTickets.length} meldingen</p>
                <button type="button" onClick={() => { onClose(); router.push(`${basePath}/maintenance`) }} className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] hover:bg-[#244d00] text-white text-xs font-medium px-3 py-1.5 transition-colors">
                  <Plus className="h-3.5 w-3.5" />Nieuw ticket
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {mockTickets.length === 0 ? (
                  <div className="py-16 text-center">
                    <Wrench className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Geen meldingen</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mockTickets.map((ticket) => {
                      const s = TICKET_STATUS_CONFIG[ticket.status] ?? TICKET_STATUS_CONFIG.open
                      return (
                        <div key={ticket.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer" onClick={() => { onClose(); router.push(`${basePath}/maintenance`) }}>
                          <div className="h-9 w-9 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                            <Wrench className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ticket.title}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {ticket.category} · {new Date(ticket.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0', s.cls)}>{s.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="flex-1 px-6 py-6 space-y-4 animate-pulse">
            <div className="grid grid-cols-4 gap-3">
              {[0,1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-neutral-800 rounded-xl" />)}
            </div>
            <div className="h-4 w-24 bg-gray-100 dark:bg-neutral-800 rounded" />
            <div className="h-32 bg-gray-100 dark:bg-neutral-800 rounded-xl" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
