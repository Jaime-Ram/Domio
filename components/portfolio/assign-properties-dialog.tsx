'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  ADD_DIALOG_BODY_SCROLL_CLASS,
  ADD_DIALOG_CLOSE_BUTTON_CLASS,
  ADD_DIALOG_FOOTER_CLASS,
  ADD_DIALOG_HEADER_CLASS,
  ADD_DIALOG_TITLE_CLASS,
  addDialogContentClassName,
} from '@/components/ui/add-dialog-layout'
import { Building2, Check, MapPin, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AssignableProperty = { id: string; name: string; address: string }

interface AssignPropertiesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolioName: string
  properties: AssignableProperty[]
  onAssign: (ids: string[]) => Promise<void>
}

export function AssignPropertiesDialog({
  open,
  onOpenChange,
  portfolioName,
  properties,
  onAssign,
}: AssignPropertiesDialogProps) {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setQ('')
      setSelected(new Set())
      setSaving(false)
    }
  }, [open])

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    if (!n) return properties
    return properties.filter(
      (p) => p.name.toLowerCase().includes(n) || p.address.toLowerCase().includes(n)
    )
  }, [properties, q])

  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((p) => next.delete(p.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((p) => next.add(p.id))
        return next
      })
    }
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleConfirm = async () => {
    if (selected.size === 0) return
    setSaving(true)
    try {
      await onAssign([...selected])
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={addDialogContentClassName('max-w-md')}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
          <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>
            Indelen in {portfolioName}
          </DialogTitle>
        </DialogHeader>

        <div className={cn(ADD_DIALOG_BODY_SCROLL_CLASS, 'space-y-3')}>
          {properties.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
              Alle objecten zijn al ingedeeld.
            </p>
          ) : (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Zoek op naam of adres…"
                  className="h-9 rounded-xl pl-9 text-sm"
                  autoFocus
                />
              </div>

              {/* Select all toggle */}
              {filtered.length > 1 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-medium text-[#163300] dark:text-[#9FE870] hover:underline"
                >
                  {allSelected ? 'Deselecteer alles' : 'Selecteer alles'}
                </button>
              )}

              {/* Property checklist */}
              <div className="rounded-xl border border-gray-100 dark:border-neutral-800 overflow-hidden overflow-y-auto max-h-64 divide-y divide-gray-100 dark:divide-neutral-800">
                {filtered.map((prop) => (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => toggle(prop.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors',
                      selected.has(prop.id)
                        ? 'bg-[#163300]/5 dark:bg-[#9FE870]/8'
                        : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50'
                    )}
                  >
                    {/* Custom checkbox */}
                    <div
                      className={cn(
                        'h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors',
                        selected.has(prop.id)
                          ? 'bg-[#163300] dark:bg-[#9FE870] border-[#163300] dark:border-[#9FE870]'
                          : 'border-gray-300 dark:border-neutral-600'
                      )}
                    >
                      {selected.has(prop.id) && (
                        <Check className="h-3 w-3 text-white dark:text-[#163300]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {prop.name}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {prop.address}
                      </p>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">Geen resultaten.</p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className={ADD_DIALOG_FOOTER_CLASS}>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || selected.size === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] disabled:opacity-50 text-[#163300] text-sm font-semibold px-4 py-2 transition-colors"
          >
            <Check className="h-4 w-4 shrink-0" />
            {saving
              ? 'Bezig…'
              : selected.size > 0
              ? `${selected.size} object${selected.size !== 1 ? 'en' : ''} indelen`
              : 'Indelen'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
