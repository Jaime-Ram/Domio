'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ADD_DIALOG_CLOSE_BUTTON_CLASS,
  ADD_DIALOG_HEADER_CLASS,
  ADD_DIALOG_TITLE_CLASS,
  addDialogContentClassName,
} from '@/components/ui/add-dialog-layout'
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
      <DialogContent
        className={addDialogContentClassName('max-w-md flex flex-col max-h-[80vh]')}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
          <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Domio documenten</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kies een document uit je bibliotheek om toe te voegen.</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5 space-y-3 flex flex-col flex-1 min-h-0">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
