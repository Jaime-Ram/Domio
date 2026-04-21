'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  ADD_DIALOG_CLOSE_BUTTON_CLASS,
  addDialogContentClassName,
} from '@/components/ui/add-dialog-layout'

const CONFIRM_PHRASE = 'mijn account verwijderen'

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  isDemo?: boolean
}

export function DeleteAccountDialog({ open, onOpenChange, onConfirm, isDemo }: DeleteAccountDialogProps) {
  const [input, setInput] = useState('')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  const matches = input === CONFIRM_PHRASE

  async function handleDelete() {
    if (!matches || working) return
    setWorking(true)
    setError('')
    try {
      await onConfirm()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Er is een fout opgetreden')
      setWorking(false)
    }
  }

  function handleOpenChange(val: boolean) {
    if (working) return
    if (!val) { setInput(''); setError('') }
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={addDialogContentClassName('max-w-md')}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        <div className="px-6 pt-6 pb-6 space-y-5">
          <DialogHeader>
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-full bg-[#163300]/8 dark:bg-[#163300]/20 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-[#163300] dark:text-white">
                  Account definitief verwijderen
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Deze actie kan niet ongedaan worden gemaakt.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Wat er verwijderd wordt */}
          <div className="rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 px-4 py-3.5 space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Wat er wordt verwijderd:</p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
              {[
                'Je accountgegevens en profiel',
                'Alle documenten en bestanden',
                'Je volledige betalingshistorie',
                'Alle berichten en notities',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#163300]/40 dark:bg-[#9FE870]/60 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {isDemo ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
              Account verwijderen is niet beschikbaar in de demo-omgeving.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Typ de volgende zin om te bevestigen:
                </p>
                <p className="font-mono text-sm bg-[#163300]/6 dark:bg-neutral-800 text-[#163300] dark:text-[#9FE870] px-3.5 py-2.5 rounded-xl select-all">
                  {CONFIRM_PHRASE}
                </p>
              </div>

              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError('') }}
                onPaste={(e) => e.preventDefault()}
                placeholder="Typ de zin hierboven..."
                className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30 focus:border-[#163300]/40 dark:focus:border-[#9FE870]/40 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                autoComplete="off"
                spellCheck={false}
              />

              {error && (
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              )}

              <div className="flex gap-2.5 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-full border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 font-medium"
                  onClick={() => handleOpenChange(false)}
                  disabled={working}
                >
                  Annuleren
                </Button>
                <Button
                  className="flex-1 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-40 transition-colors border-0"
                  onClick={handleDelete}
                  disabled={!matches || working}
                >
                  {working ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><Trash2 className="h-4 w-4 mr-1.5" />Verwijderen</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
