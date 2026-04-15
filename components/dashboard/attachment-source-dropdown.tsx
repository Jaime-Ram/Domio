'use client'

import { useEffect, useState } from 'react'
import { Paperclip, Laptop, Cloud, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type AttachmentSourceDropdownProps = {
  disabled?: boolean
  onPickComputer: () => void
  onPickDomioDocuments: () => void
  onPickGoogleDrive: () => void
  triggerClassName?: string
  ariaLabel?: string
}

export function AttachmentSourceDropdown({
  disabled,
  onPickComputer,
  onPickDomioDocuments,
  onPickGoogleDrive,
  triggerClassName,
  ariaLabel = 'Bijlage toevoegen',
}: AttachmentSourceDropdownProps) {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])

  const triggerClass = cn(
    'size-10 min-w-10 min-h-10 p-0 shrink-0 rounded-full border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900',
    triggerClassName
  )

  if (!hydrated) {
    return (
      <Button type="button" size="icon" variant="outline" disabled={disabled} className={triggerClass} aria-label={ariaLabel}>
        <Paperclip className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="icon" variant="outline" disabled={disabled} className={triggerClass} aria-label={ariaLabel}>
          <Paperclip className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={8}
        className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 min-w-[220px] p-1.5"
      >
        <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1.5">
          Document toevoegen vanuit
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-neutral-800" />
        <DropdownMenuItem
          className="rounded-lg cursor-pointer"
          onSelect={() => {
            requestAnimationFrame(() => onPickComputer())
          }}
        >
          <Laptop className="h-4 w-4 mr-2 text-[#163300] dark:text-[#9FE870] shrink-0" />
          Deze computer
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg cursor-pointer"
          onSelect={() => onPickDomioDocuments()}
        >
          <FolderOpen className="h-4 w-4 mr-2 text-[#163300] dark:text-[#9FE870] shrink-0" />
          Domio documenten
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg cursor-pointer"
          onSelect={() => onPickGoogleDrive()}
        >
          <Cloud className="h-4 w-4 mr-2 text-[#163300] dark:text-[#9FE870] shrink-0" />
          Google Drive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
