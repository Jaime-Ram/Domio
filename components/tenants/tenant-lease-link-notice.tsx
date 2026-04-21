'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Toont melding als ?koppeling=mislukt (na aanmaken huurder zonder gelukte lease-koppeling). */
export function TenantLeaseLinkNotice() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  if (searchParams.get('koppeling') !== 'mislukt') return null

  const dismiss = () => {
    router.replace(pathname, { scroll: false })
  }

  return (
    <div
      role="status"
      className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium">Koppeling aan eenheid niet gelukt</p>
        <p className="text-amber-900/90 dark:text-amber-200/90">
          De huurder is wel aangemaakt. Koppel een huurovereenkomst alsnog via het object of contracten.
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/40"
        onClick={dismiss}
        aria-label="Sluiten"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
