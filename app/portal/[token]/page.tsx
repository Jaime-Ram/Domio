import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifyInvitationToken } from '@/lib/invitations'
import { createClient } from '@/lib/supabase/server'
import { MapPin, CheckCircle2, ArrowRight } from 'lucide-react'
import { AuthPageShell } from '@/components/auth/auth-page-shell'

interface PortalPageProps {
  params: Promise<{ token: string }>
}

const PRIMARY_BTN =
  'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#9FE870] text-[#163300] font-semibold text-base hover:bg-[#9FE870]/90 shadow-sm transition-colors border-0'

export default async function PortalPage({ params }: PortalPageProps) {
  const { token } = await params

  let payload
  try {
    payload = await verifyInvitationToken(token)
  } catch {
    return <TokenExpiredView />
  }

  const supabase = await createClient()
  const db = supabase as any

  const [{ data: invitation }, { data: tenant }] = await Promise.all([
    db.from('tenant_invitations').select('id, status, expires_at').eq('id', payload.invitationId).single(),
    db.from('tenants').select('id, full_name, email, profile_id, leases(status, monthly_rent, units(unit_number, properties(address, city)))').eq('id', payload.tenantId).single(),
  ])

  if (!invitation || !tenant) return notFound()
  if (invitation.status === 'accepted') return <AlreadyAcceptedView tenantName={tenant.full_name} />
  if (invitation.status === 'cancelled') return <TokenExpiredView />

  const activeLease = (tenant.leases as any[])?.find((l: any) => l.status === 'actief')
  const unit = activeLease?.units
  const property = unit?.properties
  const propertyLabel = property
    ? `${property.address}${unit?.unit_number ? `, ${unit.unit_number}` : ''}, ${property.city}`
    : null

  const firstName = tenant.full_name.split(' ')[0]

  return (
    <AuthPageShell>
      <h1 className="text-4xl font-bold text-[#163300]">
        Je uitnodiging staat klaar
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Hoi {firstName}, je verhuurder heeft je toegang gegeven tot je huurportaal.
      </p>

      {propertyLabel && (
        <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#163300]">
            <MapPin className="h-5 w-5 text-[#9FE870]" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Jouw woning</div>
            <div className="truncate text-sm font-semibold text-gray-900">{propertyLabel}</div>
            {activeLease?.monthly_rent && (
              <div className="text-xs text-gray-500">€ {Number(activeLease.monthly_rent).toLocaleString('nl-NL')} / maand</div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2.5">
        {[
          'Huurbetalingen en betalingshistorie',
          'Documenten en je huurcontract',
          'Berichten van je verhuurder',
        ].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#15803D]" />
            <span className="text-sm text-gray-600">{item}</span>
          </div>
        ))}
      </div>

      <Link href={`/portal/${token}/accept`} className={`${PRIMARY_BTN} mt-8`}>
        Aanvraag accepteren
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-3 text-center text-xs text-gray-400">Voor {tenant.email}</p>
    </AuthPageShell>
  )
}

function TokenExpiredView() {
  return (
    <AuthPageShell>
      <h1 className="text-4xl font-bold text-[#163300]">Link verlopen</h1>
      <p className="mt-2 text-sm text-gray-600">
        Deze uitnodigingslink is niet meer geldig. Vraag je verhuurder om een nieuwe uitnodiging.
      </p>
    </AuthPageShell>
  )
}

function AlreadyAcceptedView({ tenantName }: { tenantName: string }) {
  const firstName = tenantName.split(' ')[0]
  return (
    <AuthPageShell>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#9FE870]/20">
        <CheckCircle2 className="h-7 w-7 text-[#15803D]" />
      </div>
      <h1 className="text-4xl font-bold text-[#163300]">Al geaccepteerd</h1>
      <p className="mt-2 text-sm text-gray-600">
        Hoi {firstName}, je hebt deze uitnodiging al geaccepteerd.
      </p>
      <Link href="/login" className={`${PRIMARY_BTN} mt-8`}>
        Inloggen
      </Link>
    </AuthPageShell>
  )
}
