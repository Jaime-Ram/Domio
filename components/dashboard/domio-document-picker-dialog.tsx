'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FileText } from 'lucide-react'

export type DomioDocumentRow = { id: string; name: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  documents: DomioDocumentRow[]
  onPick: (doc: DomioDocumentRow) => void
}

export function DomioDocumentPickerDialog({ open, onOpenChange, documents, onPick }: Props) {
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    if (!n) return documents
    return documents.filter((d) => d.name.toLowerCase().includes(n))
  }, [documents, q])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-200 dark:border-neutral-700 sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Domio documenten</DialogTitle>
          <DialogDescription>Kies een document uit je bibliotheek om toe te voegen.</DialogDescription>
        </DialogHeader>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Zoek op naam…"
          className="h-10 rounded-xl"
        />
        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 dark:border-neutral-700 p-1 space-y-0.5 max-h-64">
          {filtered.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                onPick(d)
                onOpenChange(false)
              }}
              className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-gray-900 dark:text-gray-100 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800"
            >
              <FileText className="h-4 w-4 shrink-0 text-[#163300] dark:text-[#9FE870]" />
              <span className="truncate">{d.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-gray-500 px-2 py-3 text-center">Geen documenten gevonden.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
