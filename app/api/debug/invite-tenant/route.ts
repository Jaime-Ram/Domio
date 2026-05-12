import { NextRequest, NextResponse } from 'next/server'
import { inviteTenantToPortal } from '@/app/dashboard/landlord/tenants/actions'

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Niet beschikbaar.' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 })
  }

  const tenantId = (body as { tenantId?: unknown } | null)?.tenantId
  if (typeof tenantId !== 'string' || !tenantId) {
    return NextResponse.json({ error: 'tenantId ontbreekt.' }, { status: 400 })
  }

  const result = await inviteTenantToPortal(tenantId)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
