import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { yapilyRequest } from '@/lib/yapily/client'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await yapilyRequest('/institutions?countries=NL')
  if (!res.ok) {
    const body = await res.text()
    console.error(`Yapily institutions failed: ${res.status}`, body)
    return NextResponse.json(
      { error: `Yapily returned ${res.status}`, detail: body },
      { status: 500 }
    )
  }

  const data = await res.json()
  const institutions = (data.data ?? []).map((inst: {
    id: string
    name: string
    media?: Array<{ type: string; source: string }>
  }) => ({
    id: inst.id,
    name: inst.name,
    logo: inst.media?.find(m => m.type === 'icon' || m.type === 'logo')?.source ?? null,
  }))

  return NextResponse.json({ institutions })
}
