'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dashboardCardClass } from '@/app/dashboard/landlord/dashboard-ui'
import {
  inviteTenantToPortal,
  resendTenantInvite,
  revokeTenantInvite,
} from '@/app/dashboard/landlord/tenants/actions'

type PortalStatus = 'niet_uitgenodigd' | 'uitgenodigd' | 'actief' | 'ingetrokken'

interface TenantPortalAccessSectionProps {
  tenantId: string
  fullName: string
  email: string | null
  portalStatus: PortalStatus | string
  invitedAt: string | null
  claimedAt: string | null
  isDemo?: boolean
  onChanged?: () => void | Promise<void>
}

function formatDutchDate(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusDot({ status }: { status: PortalStatus | string }) {
  const cls =
    status === 'actief'
      ? 'bg-green-500'
      : status === 'uitgenodigd'
        ? 'bg-amber-500'
        : status === 'ingetrokken'
          ? 'bg-red-500'
          : 'bg-gray-300 dark:bg-neutral-600'
  return <span className={cn('inline-block h-2 w-2 rounded-full', cls)} aria-hidden />
}

export function TenantPortalAccessSection({
  tenantId,
  fullName,
  email,
  portalStatus,
  invitedAt,
  claimedAt,
  isDemo,
  onChanged,
}: TenantPortalAccessSectionProps) {
  const [pending, startTransition] = useTransition()
  const [activeAction, setActiveAction] = useState<'invite' | 'resend' | 'revoke' | null>(null)

  const refresh = async () => {
    if (onChanged) await onChanged()
  }

  const runInvite = () => {
    setActiveAction('invite')
    startTransition(async () => {
      const result = await inviteTenantToPortal(tenantId)
      setActiveAction(null)
      if (result.ok) {
        toast.success(email ? `Uitnodiging verstuurd naar ${email}` : 'Uitnodiging verstuurd')
        await refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const runResend = () => {
    setActiveAction('resend')
    startTransition(async () => {
      const result = await resendTenantInvite(tenantId)
      setActiveAction(null)
      if (result.ok) {
        toast.success('Uitnodiging opnieuw verstuurd')
        await refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const runRevoke = () => {
    setActiveAction('revoke')
    startTransition(async () => {
      const result = await revokeTenantInvite(tenantId)
      setActiveAction(null)
      if (result.ok) {
        toast.success('Toegang ingetrokken')
        await refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const inviteDisabled = pending || (!email && portalStatus === 'niet_uitgenodigd')
  const hasEmail = Boolean(email)

  const isUitgenodigd = portalStatus === 'uitgenodigd'
  const isActief = portalStatus === 'actief'
  const isIngetrokken = portalStatus === 'ingetrokken'

  return (
    <Card className={dashboardCardClass(undefined, isDemo)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Portaaltoegang</CardTitle>
          <StatusDot status={portalStatus} />
        </div>
        <CardDescription>
          Beheer toegang tot het huurdersportaal voor deze huurder.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {portalStatus === 'niet_uitgenodigd' && hasEmail && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deze huurder heeft nog geen toegang tot het portaal. Door een uitnodiging te versturen krijgt {fullName} per e-mail een link om een account aan te maken.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={runInvite}
                disabled={inviteDisabled}
                className="rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] h-9 px-4 text-sm font-medium gap-2"
              >
                {pending && activeAction === 'invite' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Uitnodigen voor portaal
              </Button>
            </div>
          </>
        )}

        {portalStatus === 'niet_uitgenodigd' && !hasEmail && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Een e-mailadres is vereist om een uitnodiging te versturen. Voeg eerst een e-mailadres toe aan deze huurder.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled
                title="Voeg eerst een e-mailadres toe"
                className="rounded-full h-9 px-4 text-sm font-medium gap-2"
              >
                <Mail className="h-4 w-4" />
                Uitnodigen voor portaal
              </Button>
              <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
                Voeg eerst een e-mailadres toe
              </span>
            </div>
          </>
        )}

        {isUitgenodigd && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uitgenodigd op <span className="font-medium text-gray-900 dark:text-white">{formatDutchDate(invitedAt)}</span>.
              {' '}{fullName} heeft de uitnodiging nog niet geaccepteerd.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={runResend}
                disabled={pending}
                className="rounded-full h-9 px-4 text-sm font-medium gap-2"
              >
                {pending && activeAction === 'resend' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Opnieuw versturen
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={pending}
                    className="rounded-full h-9 px-4 text-sm font-medium gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Uitnodiging intrekken
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Uitnodiging intrekken?</AlertDialogTitle>
                    <AlertDialogDescription>
                      De uitnodiging voor {fullName} wordt ongedaan gemaakt. Ze kunnen het portaal niet meer bereiken via de eerder verzonden e-mail.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={runRevoke}
                      className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                    >
                      Intrekken
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}

        {isActief && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Actief sinds <span className="font-medium text-gray-900 dark:text-white">{formatDutchDate(claimedAt)}</span>.
              {' '}{fullName} heeft toegang tot het huurdersportaal.
            </p>
            <div className="flex flex-wrap gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={pending}
                    className="rounded-full h-9 px-4 text-sm font-medium gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Toegang intrekken
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Toegang intrekken?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {fullName} verliest direct toegang tot het portaal. Hun account wordt verwijderd. Deze actie kan niet ongedaan worden gemaakt.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={runRevoke}
                      className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                    >
                      Intrekken
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}

        {isIngetrokken && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toegang ingetrokken. {hasEmail ? `Je kunt ${fullName} opnieuw uitnodigen voor het portaal.` : 'Voeg een e-mailadres toe om opnieuw uit te nodigen.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={runInvite}
                disabled={pending || !hasEmail}
                className="rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] h-9 px-4 text-sm font-medium gap-2 disabled:opacity-60"
              >
                {pending && activeAction === 'invite' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Opnieuw uitnodigen
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
