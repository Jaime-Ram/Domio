import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifyInvitationToken } from '@/lib/invitations'
import { createClient } from '@/lib/supabase/server'
import { MapPin, CheckCircle2, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface PortalPageProps {
  params: Promise<{ token: string }>
}

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
  const alreadyHasAccount = !!tenant.profile_id

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-12 pb-16">

      {/* Logo */}
      <div className="mb-10">
        <Logo width={120} height={32} href="#" />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight text-center leading-tight mb-3">
          Je uitnodiging<br />staat klaar
        </h1>
        <p className="text-gray-500 text-sm text-center leading-relaxed mb-8">
          Hoi {firstName}, je verhuurder heeft je toegang gegeven tot je huurportaal.
        </p>

        {propertyLabel && (
          <div className="flex items-center gap-3 bg-[#f4f4f4] rounded-2xl px-4 py-3.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-[#163300] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#9FE870]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Jouw woning</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{propertyLabel}</p>
              {activeLease?.monthly_rent && (
                <p className="text-xs text-gray-400">€ {Number(activeLease.monthly_rent).toLocaleString('nl-NL')} / maand</p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2.5 mb-8">
          {[
            'Huurbetalingen en betalingshistorie',
            'Documenten en je huurcontract',
            'Berichten van je verhuurder',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
              <span className="text-sm text-gray-600">{item}</span>
            </div>
          ))}
        </div>

        {alreadyHasAccount ? (
          <div className="space-y-3">
            <a
              href={`/login?email=${encodeURIComponent(tenant.email ?? '')}&redirect=/dashboard/tenant`}
              className="flex items-center justify-center w-full bg-[#9FE870] text-[#163300] font-bold text-base py-4 rounded-full hover:bg-[#8AD45F] transition-colors"
            >
              Inloggen
            </a>
            <p className="text-xs text-center text-gray-400">Je hebt al een account op {tenant.email}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              href={`/portal/${token}/accept`}
              className="flex items-center justify-center gap-2 w-full bg-[#9FE870] text-[#163300] font-bold text-base py-4 rounded-full hover:bg-[#8AD45F] transition-colors"
            >
              Uitnodiging accepteren
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-center text-gray-400">Gratis account op {tenant.email}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center space-y-1">
        <p className="text-xs text-gray-300">Domio Vastgoedbeheer B.V.</p>
        <a href="https://domiovastgoedbeheer.nl/privacy" className="text-xs text-gray-300 underline underline-offset-2">
          Privacybeleid
        </a>
      </div>
    </div>
  )
}

function TokenExpiredView() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-12">
      <div className="mb-10"><Logo width={120} height={32} href="#" /></div>
      <div className="w-full max-w-sm text-center">
        <p className="text-4xl mb-5">⏱</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Link verlopen</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Deze uitnodigingslink is niet meer geldig.<br />Vraag je verhuurder om een nieuwe uitnodiging.
        </p>
      </div>
    </div>
  )
}

function AlreadyAcceptedView({ tenantName }: { tenantName: string }) {
  const firstName = tenantName.split(' ')[0]
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-12">
      <div className="mb-10"><Logo width={120} height={32} href="#" /></div>
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-[#9FE870]/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7 text-[#15803D]" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Al geaccepteerd</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Hoi {firstName}, je hebt deze uitnodiging al geaccepteerd.
        </p>
        <a
          href="/login"
          className="flex items-center justify-center w-full bg-[#9FE870] text-[#163300] font-bold text-base py-4 rounded-full hover:bg-[#8AD45F] transition-colors"
        >
          Inloggen
        </a>
      </div>
    </div>
  )
}
