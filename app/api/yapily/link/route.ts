import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { yapilyRequest } from '@/lib/yapily/client'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const institutionId = new URL(request.url).searchParams.get('institutionId')
  if (!institutionId) {
    return NextResponse.redirect(
      new URL('/dashboard/landlord/settings?tab=koppelingen&yapily_error=true', request.url)
    )
  }

  const res = await yapilyRequest('/account-auth-requests', {
    method: 'POST',
    body: JSON.stringify({
      applicationUserId: user.id,
      institutionId,
      callback: process.env.YAPILY_REDIRECT_URI,
    }),
  })

  if (!res.ok) {
    console.error('Yapily auth request failed:', await res.text())
    return NextResponse.redirect(
      new URL('/dashboard/landlord/settings?tab=koppelingen&yapily_error=true', request.url)
    )
  }

  const data = await res.json()
  const authorisationUrl = data?.data?.authorisationUrl

  if (!authorisationUrl) {
    return NextResponse.redirect(
      new URL('/dashboard/landlord/settings?tab=koppelingen&yapily_error=true', request.url)
    )
  }

  return NextResponse.redirect(authorisationUrl)
}
