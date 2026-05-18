import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateNewRent, isDueForIndexation } from '@/lib/indexation'

/**
 * GET /api/cron/indexation
 * Beveiligd met CRON_SECRET. Draait dagelijks via Vercel Cron.
 * Indexeert alle actieve leases waarvan de index_month overeenkomt met de huidige maand
 * en die dit jaar nog niet zijn geïndexeerd.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Server niet geconfigureerd' }, { status: 500 })

  // Haal alle actieve leases op met indexatie ingesteld
  const { data: leases, error } = await (supabase as any)
    .from('leases')
    .select('*')
    .eq('status', 'actief')
    .neq('indexation_method', 'none')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today = new Date().toISOString().slice(0, 10)
  const results: { leaseId: string; status: string; newRent?: number }[] = []

  for (const lease of leases ?? []) {
    if (!isDueForIndexation(lease)) continue

    const result = await calculateNewRent(lease)
    if (!result) {
      results.push({ leaseId: lease.id, status: 'cpi_unavailable' })
      continue
    }

    const { error: updateErr } = await (supabase as any)
      .from('leases')
      .update({
        monthly_rent: result.newRent,
        last_indexed_at: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lease.id)

    results.push({
      leaseId: lease.id,
      status: updateErr ? 'error' : 'indexed',
      newRent: updateErr ? undefined : result.newRent,
    })
  }

  return NextResponse.json({ processed: results.length, results })
}
