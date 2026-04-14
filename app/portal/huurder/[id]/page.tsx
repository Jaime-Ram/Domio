'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  Home, Euro, Calendar, CheckCircle2, Clock, XCircle,
  FileText, Wrench, AlertTriangle, ChevronRight,
  Phone, Mail, Download, Plus, Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

// ─── Mock data voor demo ────────────────────────────────────────────────
const MOCK_TENANT = {
  id: '1',
  name: 'Jan Jansen',
  email: 'jan@example.com',
  phone: '+31 6 12 34 56 78',
  address: 'Keizersgracht 12-A, Amsterdam',
  property: 'Keizersgracht 12',
  startDate: '2023-01-01',
  endDate: null,
  monthlyRent: 1450,
  deposit: 2900,
  depositStatus: 'gestort' as const,
  landlordName: 'Domio Beheer',
  landlordPhone: '+31 20 1234567',
  landlordEmail: 'beheer@domio.nl',
  nextPaymentDate: '2026-05-01',
  balance: 0,
}

const MOCK_PAYMENTS = [
  { id: '1', period: 'April 2026', amount: 1450, paidOn: '2026-04-01', status: 'Betaald' },
  { id: '2', period: 'Maart 2026', amount: 1450, paidOn: '2026-03-01', status: 'Betaald' },
  { id: '3', period: 'Februari 2026', amount: 1450, paidOn: '2026-02-03', status: 'Te laat' },
  { id: '4', period: 'Januari 2026', amount: 1450, paidOn: '2026-01-01', status: 'Betaald' },
  { id: '5', period: 'December 2025', amount: 1450, paidOn: '2025-12-01', status: 'Betaald' },
]

const MOCK_TICKETS = [
  { id: '1', title: 'Lekkage badkamer', category: 'Loodgieterswerk', status: 'in_behandeling', date: '2026-04-02', description: 'Water druppelt van het plafond bij de douche.' },
  { id: '2', title: 'Kapotte CV-ketel', category: 'Verwarming', status: 'afgerond', date: '2026-01-15', description: 'Ketel sloeg af, geen verwarming.' },
]

const MOCK_DOCUMENTS = [
  { id: '1', name: 'Huurovereenkomst 2023', category: 'Contract', date: '2023-01-01' },
  { id: '2', name: 'Borgovereenkomst', category: 'Borg', date: '2023-01-01' },
  { id: '3', name: 'Plaatsbeschrijving intrede', category: 'Inspectie', date: '2023-01-05' },
  { id: '4', name: 'Jaarafrekening servicekosten 2025', category: 'Financieel', date: '2026-02-01' },
]
// ───────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'Betaald') return (
    <Badge className="bg-[#163300]/8 text-[#163300] dark:bg-[#9FE870]/10 dark:text-[#9FE870] border-0 gap-1 font-medium">
      <CheckCircle2 className="h-3 w-3" />Betaald
    </Badge>
  )
  if (status === 'Te laat') return (
    <Badge className="bg-amber-50 text-amber-700 border-0 gap-1">
      <Clock className="h-3 w-3" />Te laat
    </Badge>
  )
  return (
    <Badge className="bg-red-50 text-red-600 border-0 gap-1">
      <XCircle className="h-3 w-3" />Openstaand
    </Badge>
  )
}

function TicketStatusBadge({ status }: { status: string }) {
  if (status === 'afgerond') return <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">Afgerond</Badge>
  if (status === 'in_behandeling') return <Badge className="bg-blue-50 text-blue-600 border-0 text-xs gap-1"><Wrench className="h-3 w-3" />In behandeling</Badge>
  return <Badge className="bg-amber-50 text-amber-600 border-0 text-xs gap-1"><Clock className="h-3 w-3" />Open</Badge>
}

export default function HuurderPortalPage() {
  const tenant = MOCK_TENANT
  const [ticketOpen, setTicketOpen] = useState(false)
  const [ticketTitle, setTicketTitle] = useState('')
  const [ticketCategory, setTicketCategory] = useState('Algemeen')
  const [ticketDesc, setTicketDesc] = useState('')
  const [tickets, setTickets] = useState(MOCK_TICKETS)
  const [submitted, setSubmitted] = useState(false)

  const openTickets = tickets.filter(t => t.status !== 'afgerond')

  const handleSubmitTicket = () => {
    if (!ticketTitle.trim() || !ticketDesc.trim()) return
    setTickets(prev => [{
      id: `${Date.now()}`,
      title: ticketTitle.trim(),
      category: ticketCategory,
      status: 'open',
      date: new Date().toISOString().slice(0, 10),
      description: ticketDesc.trim(),
    }, ...prev])
    setSubmitted(true)
    setTimeout(() => {
      setTicketOpen(false)
      setSubmitted(false)
      setTicketTitle('')
      setTicketDesc('')
      setTicketCategory('Algemeen')
    }, 1800)
  }

  return (
    <div className="space-y-4">

      {/* Welcome */}
      <div className="pt-2 pb-4">
        <p className="text-sm text-gray-500 mb-0.5">Huurderportal</p>
        <h1 className="text-2xl font-bold text-gray-900">Hallo, {tenant.name.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
          <Home className="h-3.5 w-3.5" />
          {tenant.address}
        </p>
      </div>

      {/* Balance / status banner */}
      <div className={cn(
        'rounded-2xl p-4 flex items-center justify-between',
        tenant.balance === 0
          ? 'bg-[#163300] text-white'
          : 'bg-red-600 text-white'
      )}>
        <div>
          <p className="text-xs opacity-70 font-medium uppercase tracking-wide">Saldo</p>
          <p className="text-2xl font-bold mt-0.5">
            {tenant.balance === 0 ? 'Op peil' : `−€${Math.abs(tenant.balance).toLocaleString('nl-NL')}`}
          </p>
          <p className="text-xs opacity-70 mt-0.5">
            Volgende betaling: {format(new Date(tenant.nextPaymentDate), 'd MMMM yyyy', { locale: nl })} · €{tenant.monthlyRent.toLocaleString('nl-NL')}
          </p>
        </div>
        {tenant.balance === 0 && <CheckCircle2 className="h-8 w-8 opacity-40" />}
        {tenant.balance !== 0 && <AlertTriangle className="h-8 w-8 opacity-60" />}
      </div>

      {/* Contract summary */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-gray-900">Huurovereenkomst</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-2 gap-y-4">
            {[
              { label: 'Huurprijs', value: `€${tenant.monthlyRent.toLocaleString('nl-NL')}/mnd` },
              { label: 'Borgsom', value: `€${tenant.deposit.toLocaleString('nl-NL')}` },
              { label: 'Ingangsdatum', value: format(new Date(tenant.startDate), 'd MMM yyyy', { locale: nl }) },
              { label: 'Type', value: 'Onbepaalde tijd' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Borgstatus</p>
              <Badge className="bg-[#163300]/8 text-[#163300] border-0 text-xs font-medium">
                <CheckCircle2 className="h-3 w-3 mr-1" />Gestort
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="rounded-full h-8 text-xs gap-1.5 border-gray-200">
              <Download className="h-3 w-3" />
              Contract downloaden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-gray-900">Betalingen</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <div className="divide-y divide-gray-50">
            {MOCK_PAYMENTS.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.period}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {p.paidOn ? `Betaald op ${format(new Date(p.paidOn), 'd MMM', { locale: nl })}` : 'Niet betaald'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">€{p.amount.toLocaleString('nl-NL')}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">Meldingen</CardTitle>
            <Button
              size="sm"
              className="rounded-full h-8 text-xs bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] font-medium gap-1.5"
              onClick={() => setTicketOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Nieuwe melding
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {tickets.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-gray-400">Geen meldingen.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tickets.map((t) => (
                <div key={t.id} className="flex items-start justify-between px-5 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Wrench className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.category} · {format(new Date(t.date), 'd MMM yyyy', { locale: nl })}</p>
                    </div>
                  </div>
                  <TicketStatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-gray-900">Documenten</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <div className="divide-y divide-gray-50">
            {MOCK_DOCUMENTS.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.category} · {format(new Date(doc.date), 'd MMM yyyy', { locale: nl })}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-gray-700">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact verhuurder */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-gray-900">Contact verhuurder</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <p className="text-sm font-medium text-gray-900">{tenant.landlordName}</p>
          <a href={`tel:${tenant.landlordPhone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#163300] transition-colors">
            <Phone className="h-4 w-4 text-gray-400" />{tenant.landlordPhone}
          </a>
          <a href={`mailto:${tenant.landlordEmail}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#163300] transition-colors">
            <Mail className="h-4 w-4 text-gray-400" />{tenant.landlordEmail}
          </a>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 pt-2 pb-6">
        Beheerd door <span className="font-semibold text-[#163300]">Domio</span>
      </p>

      {/* New ticket dialog */}
      <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
        <DialogContent className="sm:max-w-md border border-gray-200 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Nieuwe melding indienen</DialogTitle>
            <DialogDescription>Beschrijf het probleem zo duidelijk mogelijk.</DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-[#9FE870] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-[#163300]" />
              </div>
              <p className="font-semibold text-gray-900">Melding verstuurd!</p>
              <p className="text-sm text-gray-500 mt-1">We nemen zo snel mogelijk contact op.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Onderwerp</Label>
                  <Input
                    placeholder="bijv. Lekkage badkamer"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Categorie</Label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]"
                  >
                    {['Loodgieterswerk', 'Verwarming', 'Elektra', 'Dak', 'Ramen/deuren', 'Schimmel/vocht', 'Overig'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Beschrijving</Label>
                  <Textarea
                    placeholder="Beschrijf het probleem zo uitgebreid mogelijk..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    rows={4}
                    className="rounded-xl resize-none"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => setTicketOpen(false)}>Annuleren</Button>
                <Button
                  className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] gap-1.5"
                  disabled={!ticketTitle.trim() || !ticketDesc.trim()}
                  onClick={handleSubmitTicket}
                >
                  <Send className="h-4 w-4" />
                  Versturen
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
