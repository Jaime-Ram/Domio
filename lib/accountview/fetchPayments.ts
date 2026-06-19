import { createClient } from '@supabase/supabase-js'
import { matchTransaction } from '@/lib/matching'
import { decryptJson } from '@/lib/crypto/secrets'
import { fetchAccountviewPayments, type AccountviewCredentials } from './client'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface SyncResult {
  imported: number
  skipped: number
  total: number
}

interface AvConnectionConfig {
  endpoint: string
  secret: string // encryptJson({ username, password })
}

/**
 * Sync betalingen uit een Accountview-koppeling naar `payments` en draai de
 * matcher. Spiegelt lib/tink/fetchTransactions.ts zodat de finance-pijplijn
 * provider-agnostisch blijft.
 */
export async function fetchPayments(
  bankConnectionId: string,
  ownerId: string,
  config: AvConnectionConfig,
): Promise<SyncResult> {
  const { username, password } = decryptJson<{ username: string; password: string }>(config.secret)
  const creds: AccountviewCredentials = { endpoint: config.endpoint, username, password }

  // Alleen sinds de laatste sync ophalen (incrementeel) als beschikbaar.
  const { data: conn } = await supabaseAdmin
    .from('bank_connections')
    .select('last_synced_at')
    .eq('id', bankConnectionId)
    .single<{ last_synced_at: string | null }>()

  const since = conn?.last_synced_at ? conn.last_synced_at.slice(0, 10) : null
  const payments = await fetchAccountviewPayments(creds, since)

  if (payments.length === 0) return { imported: 0, skipped: 0, total: 0 }

  const rows = payments.map((p) => ({
    owner_id: ownerId,
    bank_connection_id: bankConnectionId,
    source: 'accountview',
    external_id: p.externalId,
    amount: p.amount,
    currency: p.currency,
    booking_date: p.bookingDate,
    value_date: p.valueDate,
    counterparty_iban: p.counterpartyIban,
    counterparty_name: p.counterpartyName,
    description: p.description,
    raw_data: p.raw,
  }))

  const BATCH_SIZE = 500
  let imported = 0
  const newIds: string[] = []

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { data, error } = await supabaseAdmin
      .from('payments')
      .upsert(batch, { onConflict: 'bank_connection_id,external_id', ignoreDuplicates: true })
      .select('id')

    if (error) throw error
    const ids = (data ?? []).map((r) => r.id as string)
    imported += ids.length
    newIds.push(...ids)
  }

  await supabaseAdmin
    .from('bank_connections')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', bankConnectionId)

  // Matcher op nieuw geïmporteerde betalingen; allSettled zodat één fout de rest niet breekt.
  if (newIds.length > 0) {
    await Promise.allSettled(newIds.map((id) => matchTransaction(id)))
  }

  return { imported, skipped: payments.length - imported, total: payments.length }
}
