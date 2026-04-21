'use client'

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

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoogleDriveComingSoonDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={addDialogContentClassName('max-w-md')}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
          <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Google Drive</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            De koppeling met Google Drive komt binnenkort. Tot die tijd kun je bestanden van je computer toevoegen
            of documenten uit Domio kiezen via het paperclipmenu of met @ in je bericht.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
