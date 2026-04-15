'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoogleDriveComingSoonDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-200 dark:border-neutral-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Google Drive</DialogTitle>
          <DialogDescription>
            De koppeling met Google Drive komt binnenkort. Tot die tijd kun je bestanden van je computer toevoegen
            of documenten uit Domio kiezen via het paperclipmenu of met @ in je bericht.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
