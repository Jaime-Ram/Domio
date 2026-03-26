'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type GekoppeldeRekening = {
  name: string
  last4: string
  description: string
}

/** Officiële merkkleuren voor miniatuurpas (streep bovenaan de pas) – hex voor inline style (Tailwind JIT ziet dynamische classes niet) */
function getCardAccentHex(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('abn')) return '#009488'   // ABN AMRO teal/groen (Pantone 3285 C)
  if (n.includes('ing')) return '#FF6200'   // ING oranje (Pantone 165 C)
  if (n.includes('rabo')) return '#2C3696'  // Rabobank blauw (Pantone 10249 C)
  return '#163300' // standaard Domio-groen
}

function PasMiniatuur({ name, last4 }: { name: string; last4: string }) {
  const stripeColor = getCardAccentHex(name)
  return (
    <div
      className="shrink-0 w-14 h-[34px] rounded-[6px] overflow-hidden border border-gray-200/80 dark:border-neutral-600 shadow-sm bg-white dark:bg-neutral-800 flex flex-col"
      aria-hidden
    >
      <div className="h-2 w-full" style={{ backgroundColor: stripeColor }} />
      <div className="flex-1 px-1.5 py-0.5 flex flex-col justify-center min-w-0">
        <span className="text-[8px] font-semibold text-gray-700 dark:text-gray-300 truncate leading-tight">
          {name.split(' ')[0]}
        </span>
        <span className="text-[9px] tabular-nums text-gray-500 dark:text-gray-400 mt-0.5">
          •••• {last4}
        </span>
      </div>
    </div>
  )
}

const sCard =
  'rounded-card border-[0.5px] border-gray-200 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900'

type GekoppeldeRekeningenBlockProps = {
  accounts: GekoppeldeRekening[]
  /** Optioneel: eigen miniatuur voor de pas (bijv. /images/card-miniature.svg). Zet een SVG in public/images/ en geef het pad hier. */
  cardImageSrc?: string
  permissionsTitle?: string
  permissionsStatus?: string
  permissionsContent?: React.ReactNode
  emptyMessage?: string
  onAddAccount?: () => void
  className?: string
}

export function GekoppeldeRekeningenBlock({
  accounts,
  cardImageSrc,
  permissionsTitle = 'Rechten',
  permissionsStatus,
  permissionsContent,
  emptyMessage = 'Nog geen rekeningen gekoppeld. Koppel een bankrekening om betalingen te ontvangen.',
  onAddAccount,
  className,
}: GekoppeldeRekeningenBlockProps) {
  const [permissionsOpen, setPermissionsOpen] = useState(false)

  return (
    <div className={cn(sCard, 'overflow-hidden', className)}>
      <div className="p-5 sm:p-7">
        <h2 className="text-2xl font-semibold text-[#163300] dark:text-white">Gekoppelde rekeningen</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Bankrekeningen gekoppeld voor ontvangst en betalingen
        </p>

        {accounts.length === 0 ? (
          <div className="mt-6 py-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
            {onAddAccount && (
              <Button
                onClick={onAddAccount}
                className="mt-4 bg-[#163300] hover:bg-[#356258] text-white"
              >
                Rekening koppelen
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {accounts.map((acc, i) => (
                <div
                  key={`${acc.name}-${acc.last4}-${i}`}
                  className="flex items-start gap-4"
                >
                  {cardImageSrc ? (
                    <img
                      src={cardImageSrc}
                      alt=""
                      className="shrink-0 w-14 h-[34px] rounded-[6px] object-cover border border-gray-200/80 dark:border-neutral-600 shadow-sm"
                    />
                  ) : (
                    <PasMiniatuur name={acc.name} last4={acc.last4} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {acc.name} •••• {acc.last4}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {acc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {permissionsTitle && (permissionsStatus != null || permissionsContent) && (
              <>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-700">
                  <button
                    type="button"
                    onClick={() => setPermissionsOpen(!permissionsOpen)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {permissionsTitle}
                      </p>
                      {permissionsStatus && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {permissionsStatus}
                        </p>
                      )}
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 shrink-0">
                      {permissionsOpen ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </span>
                  </button>
                  {permissionsOpen && permissionsContent && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                      {permissionsContent}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
