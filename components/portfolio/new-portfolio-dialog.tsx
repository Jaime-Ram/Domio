'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ADD_DIALOG_BODY_SCROLL_CLASS,
  CreateDialogShell,
} from '@/components/ui/add-dialog-layout'
import { Briefcase, Building2, Landmark } from 'lucide-react'
import { portfolioQueries, legalEntityQueries } from '@/lib/supabase/queries'
import { DialogField } from '@/components/ui/dialog-field'
import { Input } from '@/components/ui/input'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

export type CreatedPortfolioPayload = {
  id: string
  name: string
  entityType?: string
  owner?: string
  legalEntityId?: string | null
}

interface NewPortfolioDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (portfolio: CreatedPortfolioPayload) => void
}

const ENTITY_TYPES = [
  'Privé persoon',
  'Besloten Vennootschap (BV)',
  'Naamloze Vennootschap (NV)',
  'Vennootschap onder Firma (VoF)',
  'Maatschap',
  'Stichting',
  'Overig',
]


export function NewPortfolioDialog({
  open,
  onClose,
  onCreated,
}: NewPortfolioDialogProps) {
  const { isDemo } = useDashboardUser()

  const [name, setName] = useState('')
  const [entityType, setEntityType] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [kvk, setKvk] = useState('')
  const [existingEntities, setExistingEntities] = useState<{ id: string; name: string; kvk_number: string | null }[]>([])
  const [selectedEntityId, setSelectedEntityId] = useState<string>('')
  const [loadingEntities, setLoadingEntities] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName('')
    setEntityType('')
    setOwnerName('')
    setKvk('')
    setSelectedEntityId('')
    setError(null)

    if (isDemo) return

    setLoadingEntities(true)
    getUser()
      .then(({ user }) => {
        if (!user) return
        return legalEntityQueries.getByUser(user.id)
      })
      .then((entities) => setExistingEntities(entities ?? []))
      .catch(() => setExistingEntities([]))
      .finally(() => setLoadingEntities(false))
  }, [open, isDemo])

  const handleEntitySelect = (id: string) => {
    setSelectedEntityId(id === '__nieuw' ? '' : id)
    if (!id || id === '__nieuw') { setOwnerName(''); setKvk(''); return }
    const found = existingEntities.find((e) => e.id === id)
    if (found) {
      setOwnerName(found.name)
      setKvk(found.kvk_number ?? '')
    }
  }

  const canSave = name.trim().length > 0

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      if (isDemo) {
        onCreated({
          id: `demo-portfolio-${Date.now()}`,
          name: name.trim(),
          entityType: entityType || undefined,
          owner: ownerName || undefined,
        })
        onClose()
        return
      }

      const { user } = await getUser()
      if (!user) throw new Error('Niet ingelogd')

      // Sla eigenaar-info op als beschrijving; koppel rechtspersoon later expliciet
      const descriptionParts = [
        entityType,
        ownerName.trim(),
        kvk.trim() ? `KvK ${kvk.trim()}` : null,
      ].filter(Boolean)

      const payload: Parameters<typeof portfolioQueries.create>[0] = {
        owner_id: user.id,
        name: name.trim(),
        description: descriptionParts.length > 0 ? descriptionParts.join(' · ') : null,
      }
      if (selectedEntityId) payload.legal_entity_id = selectedEntityId

      const created = await portfolioQueries.create(payload)

      onCreated({
        id: created.id,
        name: created.name,
        entityType: entityType || undefined,
        owner: ownerName || undefined,
        legalEntityId: selectedEntityId || null,
      })
      onClose()
    } catch (err: any) {
      console.error('Portfolio aanmaken mislukt:', err)
      setError(err?.message ?? err?.error_description ?? JSON.stringify(err) ?? 'Aanmaken mislukt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <CreateDialogShell
      open={open}
      onOpenChange={(v) => { if (!v) onClose() }}
      title="Nieuwe portefeuille"
      subtitle="Geef de portefeuille een naam en koppel optioneel een eigenaar."
      primaryLabel="Portefeuille aanmaken"
      onPrimary={handleSave}
      primaryDisabled={saving || !canSave}
      primaryLoading={saving}
      scrollBody
    >
        <div className={ADD_DIALOG_BODY_SCROLL_CLASS}>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <DialogField label="Naam portefeuille" required>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="bijv. Privé — Jan Jansen of Jansen Vastgoed BV"
              className="rounded-xl"
              autoFocus
            />
          </DialogField>

          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Eigenaar / rechtspersoon <span className="font-normal text-gray-400">(optioneel)</span>
            </p>

            {!isDemo && (
              <DialogField label={loadingEntities ? 'Laden…' : existingEntities.length > 0 ? 'Koppel bestaande rechtspersoon' : 'Rechtspersoon'}>
                {existingEntities.length > 0 ? (
                  <Select value={selectedEntityId || '__nieuw'} onValueChange={handleEntitySelect}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="— Nieuwe aanmaken —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__nieuw">— Nieuwe aanmaken —</SelectItem>
                      {existingEntities.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}{e.kvk_number ? ` · ${e.kvk_number}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-gray-400">Nog geen rechtspersonen — vul hieronder in</p>
                )}
              </DialogField>
            )}

            {!selectedEntityId && (
              <>
                <DialogField label="Naam eigenaar" optional>
                  <Input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="bijv. J.P. van der Berg of Jansen BV"
                    className="rounded-xl"
                  />
                </DialogField>

                <div className="grid grid-cols-2 gap-2">
                  <DialogField label="Type rechtspersoon" optional>
                    <Select value={entityType || '__geen'} onValueChange={(v) => setEntityType(v === '__geen' ? '' : v)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Kies type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__geen" disabled>Kies type</SelectItem>
                        {ENTITY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </DialogField>
                  <DialogField label="KvK-nummer" optional>
                    <Input
                      type="text"
                      value={kvk}
                      onChange={(e) => setKvk(e.target.value)}
                      placeholder="12345678"
                      className="rounded-xl"
                      maxLength={8}
                    />
                  </DialogField>
                </div>

                {ownerName.trim() && !isDemo && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Er wordt automatisch een nieuwe rechtspersoon aangemaakt voor <strong className="text-gray-600 dark:text-gray-300">{ownerName}</strong>.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
    </CreateDialogShell>
  )
}
