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

const tile = 'bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3'
const label = 'text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5'
const inputCls =
  'w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0'
const selectTriggerCls =
  'h-auto w-full p-0 text-sm font-medium text-gray-900 dark:text-white bg-transparent border-0 shadow-none focus:ring-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-gray-400'

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

          {/* Naam */}
          <div className={tile}>
            <p className={label}>
              <Briefcase className="inline h-3 w-3 mr-1" />
              Naam portefeuille *
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="bijv. Privé — Jan Jansen of Jansen Vastgoed BV"
              className={inputCls}
              autoFocus
            />
          </div>

          {/* Rechtspersoon */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 px-1">
              Eigenaar / rechtspersoon (optioneel)
            </p>

            {/* Koppel aan bestaande rechtspersoon */}
            {!isDemo && (
              <div className={tile}>
                <p className={label}>
                  <Landmark className="inline h-3 w-3 mr-1" />
                  {loadingEntities ? 'Laden…' : existingEntities.length > 0 ? 'Koppel bestaande rechtspersoon' : 'Rechtspersoon'}
                </p>
                {existingEntities.length > 0 ? (
                  <Select
                    value={selectedEntityId || '__nieuw'}
                    onValueChange={handleEntitySelect}
                  >
                    <SelectTrigger className={selectTriggerCls}>
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
              </div>
            )}

            {/* Naam + type + kvk (alleen tonen als geen bestaande geselecteerd) */}
            {!selectedEntityId && (
              <>
                <div className={tile}>
                  <p className={label}>
                    <Building2 className="inline h-3 w-3 mr-1" />
                    Naam eigenaar
                  </p>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="bijv. J.P. van der Berg of Jansen BV"
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className={tile}>
                    <p className={label}>Type rechtspersoon</p>
                    <Select value={entityType || '__geen'} onValueChange={(v) => setEntityType(v === '__geen' ? '' : v)}>
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Kies type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__geen" disabled>Kies type</SelectItem>
                        {ENTITY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={tile}>
                    <p className={label}>KvK-nummer</p>
                    <input
                      type="text"
                      value={kvk}
                      onChange={(e) => setKvk(e.target.value)}
                      placeholder="12345678"
                      className={inputCls}
                      maxLength={8}
                    />
                  </div>
                </div>

                {ownerName.trim() && !isDemo && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 px-1">
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
