'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Pencil, X, Check, Phone, Mail, Bell, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_TENANT } from '@/lib/mock-data/portal'

export default function InstellingenPage() {
  const tenant = MOCK_TENANT
  const [editingName, setEditingName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [name, setName] = useState(tenant.name)
  const [phone, setPhone] = useState(tenant.phone)
  const [savedName, setSavedName] = useState(false)
  const [savedPhone, setSavedPhone] = useState(false)

  const handleSave = (field: 'name' | 'phone') => {
    if (field === 'name') { setEditingName(false); setSavedName(true); setTimeout(() => setSavedName(false), 2000) }
    if (field === 'phone') { setEditingPhone(false); setSavedPhone(true); setTimeout(() => setSavedPhone(false), 2000) }
  }

  return (
    <div className="space-y-4">
      <div className="pt-2 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Instellingen</h1>
        <p className="text-sm text-gray-500 mt-0.5">Jouw account en voorkeuren</p>
      </div>

      {/* Profiel */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-gray-900">Profiel</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#163300] flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-white">{name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{name}</p>
              <p className="text-sm text-gray-400">{tenant.address}</p>
            </div>
          </div>

          {/* Naam */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Naam</Label>
            {editingName ? (
              <div className="flex gap-2">
                <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl flex-1" autoFocus />
                <Button size="icon" variant="ghost" className="rounded-xl shrink-0" onClick={() => handleSave('name')}><Check className="h-4 w-4 text-[#163300]" /></Button>
                <Button size="icon" variant="ghost" className="rounded-xl shrink-0" onClick={() => setEditingName(false)}><X className="h-4 w-4 text-gray-400" /></Button>
              </div>
            ) : (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-900">{name}</span>
                <div className="flex items-center gap-2">
                  {savedName && <CheckCircle2 className="h-4 w-4 text-[#163300]" />}
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => setEditingName(true)}><Pencil className="h-3.5 w-3.5 text-gray-400" /></Button>
                </div>
              </div>
            )}
          </div>

          {/* E-mail (niet aanpasbaar) */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">E-mailadres</Label>
            <div className="flex items-center gap-2 py-2">
              <Mail className="h-4 w-4 text-gray-300 shrink-0" />
              <span className="text-sm text-gray-500">{tenant.email}</span>
              <Badge className="ml-auto bg-gray-100 text-gray-400 border-0 text-xs">Niet aanpasbaar</Badge>
            </div>
          </div>

          {/* Telefoon */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Telefoonnummer</Label>
            {editingPhone ? (
              <div className="flex gap-2">
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="rounded-xl flex-1" autoFocus />
                <Button size="icon" variant="ghost" className="rounded-xl shrink-0" onClick={() => handleSave('phone')}><Check className="h-4 w-4 text-[#163300]" /></Button>
                <Button size="icon" variant="ghost" className="rounded-xl shrink-0" onClick={() => setEditingPhone(false)}><X className="h-4 w-4 text-gray-400" /></Button>
              </div>
            ) : (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-300 shrink-0" />
                  <span className="text-sm text-gray-900">{phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  {savedPhone && <CheckCircle2 className="h-4 w-4 text-[#163300]" />}
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => setEditingPhone(true)}><Pencil className="h-3.5 w-3.5 text-gray-400" /></Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notificaties */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-400" />Notificaties
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {[
            { label: 'Nieuwe berichten', sub: 'Ontvang een melding bij nieuwe berichten van je verhuurder' },
            { label: 'Betalingsherinnering', sub: 'Herinnering 3 dagen voor de huurvervaldatum' },
            { label: 'Status onderhoud', sub: 'Updates over je onderhoudsmeldingen' },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
              <button
                type="button"
                className="relative inline-flex h-5 w-9 shrink-0 rounded-full bg-[#163300] transition-colors mt-0.5"
              >
                <span className="translate-x-4 inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Uitloggen */}
      <Card className="rounded-2xl border border-gray-100 shadow-none bg-white">
        <CardContent className="px-5 py-5">
          <Button variant="outline" className="w-full rounded-xl text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 gap-2">
            <LogOut className="h-4 w-4" />
            Uitloggen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
