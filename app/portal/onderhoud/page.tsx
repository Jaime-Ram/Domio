'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  ADD_DIALOG_BODY_CLASS,
  ADD_DIALOG_CLOSE_BUTTON_CLASS,
  ADD_DIALOG_FOOTER_CLASS,
  ADD_DIALOG_HEADER_CLASS,
  ADD_DIALOG_TITLE_CLASS,
  addDialogContentClassName,
} from '@/components/ui/add-dialog-layout'
import { Wrench, Clock, CheckCircle2, Plus, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { MOCK_TICKETS } from '@/lib/mock-data/portal'

type TicketStatus = 'open' | 'in_behandeling' | 'afgerond'

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  if (status === 'afgerond') return <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">Afgerond</Badge>
  if (status === 'in_behandeling') return (
    <Badge className="bg-blue-50 text-blue-600 border-0 text-xs gap-1">
      <Wrench className="h-3 w-3" />In behandeling
    </Badge>
  )
  return (
    <Badge className="bg-amber-50 text-amber-600 border-0 text-xs gap-1">
      <Clock className="h-3 w-3" />Open
    </Badge>
  )
}

const CATEGORIES = ['Loodgieterswerk', 'Verwarming', 'Elektra', 'Dak', 'Ramen/deuren', 'Schimmel/vocht', 'Overig']

export default function OnderhoudPage() {
  const [tickets, setTickets] = useState(MOCK_TICKETS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Algemeen')
  const [desc, setDesc] = useState('')

  const open = tickets.filter(t => t.status !== 'afgerond')
  const closed = tickets.filter(t => t.status === 'afgerond')

  const handleSubmit = () => {
    if (!title.trim() || !desc.trim()) return
    setTickets(prev => [{
      id: `${Date.now()}`,
      title: title.trim(),
      category,
      status: 'open' as const,
      date: new Date().toISOString().slice(0, 10),
      description: desc.trim(),
    }, ...prev])
    setSubmitted(true)
    setTimeout(() => {
      setDialogOpen(false)
      setSubmitted(false)
      setTitle('')
      setDesc('')
      setCategory('Algemeen')
    }, 1800)
  }

  return (
    <div className="space-y-4">
      <div className="pt-2 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onderhoud</h1>
          <p className="text-sm text-gray-500 mt-0.5">Dien meldingen in en volg de status</p>
        </div>
        <Button
          size="sm"
          className="rounded-full h-9 bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] font-medium gap-1.5 mt-1"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nieuwe melding
        </Button>
      </div>

      {/* Open meldingen */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            Open meldingen
            {open.length > 0 && (
              <span className="h-5 w-5 rounded-full bg-[#163300] text-white text-xs flex items-center justify-center font-bold">{open.length}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {open.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Geen open meldingen</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {open.map((t) => (
                <div key={t.id} className="flex items-start justify-between px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Wrench className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.category} · {format(new Date(t.date), 'd MMM yyyy', { locale: nl })}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.description}</p>
                    </div>
                  </div>
                  <TicketStatusBadge status={t.status as TicketStatus} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Afgeronde meldingen */}
      {closed.length > 0 && (
        <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-base font-semibold text-gray-900">Afgerond</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <div className="divide-y divide-gray-50">
              {closed.map((t) => (
                <div key={t.id} className="flex items-start justify-between px-5 py-4 opacity-60">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <Wrench className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.category} · {format(new Date(t.date), 'd MMM yyyy', { locale: nl })}</p>
                    </div>
                  </div>
                  <TicketStatusBadge status={t.status as TicketStatus} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog nieuwe melding */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={addDialogContentClassName('sm:max-w-md')}
          closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
        >
          {submitted ? (
            <>
              <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
                <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Melding verstuurd</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 pt-1">
                  We nemen zo snel mogelijk contact op.
                </DialogDescription>
              </DialogHeader>
              <div className={cn(ADD_DIALOG_BODY_CLASS, 'py-8 text-center')}>
                <div className="h-12 w-12 rounded-full bg-[#9FE870] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-[#163300]" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">Bedankt!</p>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
                <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Nieuwe melding</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 pt-1">
                  Beschrijf het probleem zo duidelijk mogelijk.
                </DialogDescription>
              </DialogHeader>
              <div className={cn(ADD_DIALOG_BODY_CLASS, 'space-y-4')}>
                <div className="space-y-1.5">
                  <Label>Onderwerp</Label>
                  <Input placeholder="bijv. Lekkage badkamer" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Categorie</Label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300] dark:bg-neutral-900 dark:border-neutral-700"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Beschrijving</Label>
                  <Textarea placeholder="Beschrijf het probleem zo uitgebreid mogelijk..." value={desc} onChange={e => setDesc(e.target.value)} rows={4} className="rounded-xl resize-none" />
                </div>
              </div>
              <DialogFooter className={ADD_DIALOG_FOOTER_CLASS}>
                <Button
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-sm font-semibold px-4 py-2 disabled:opacity-50"
                  disabled={!title.trim() || !desc.trim()}
                  onClick={handleSubmit}
                >
                  <Send className="h-4 w-4 shrink-0" />
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
