import { createClient } from '@supabase/supabase-js'
import { matchTransaction } from '@/lib/matching'
import { yapilyRequestWithConsent } from './client'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface YapilyAccountIdentification {
  type: string
  identification: string
}

interface YapilyPartyDetails {
  name?: string
  accountIdentifications?: YapilyAccountIdentification[]
}

interface YapilyTransaction {
  id: string
  bookingDateTime?: string
  valueDateTime?: string
  status: string
  amount: number
  currency: string
  transactionAmount?: { amount: number; currency: string }
  reference?: string
  description?: string
  payeeDetails?: YapilyPartyDetails
  payerDetails?: YapilyPartyDetails
}

interface YapilyTransactionsResponse {
  data: YapilyTransaction[]
}

export interface SyncResult {
  imported: number
  skipped: number
  pending: number
  total: number
}

function getIban(party?: YapilyPartyDetails): string | null {
  return party?.accountIdentifications?.find(i => i.type === 'IBAN')?.identification ?? null
}

export async function fetchTransactions(
  bankConnectionId: string,
  consentToken: string,
  ownerId: string,
  accountId: string,
): Promise<SyncResult> {
  const allTransactions: YapilyTransaction[] = []
  let offset = 0
  const limit = 1000
  let hasMore = true

  while (hasMore) {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      sort: '-date',
    })

    const res = await yapilyRequestWithConsent(
      `/accounts/${accountId}/transactions?${params}`,
      consentToken
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Yapily transactions fetch failed: ${res.status} ${text}`)
    }

    const data: YapilyTransactionsResponse = await res.json()
    const page = data.data ?? []
    allTransactions.push(...page)
    offset += page.length
    hasMore = page.length === limit

    console.log(`Yapily: fetched page (${page.length} txns, total so far: ${allTransactions.length})`)
  }

  if (allTransactions.length === 0) {
    return { imported: 0, skipped: 0, pending: 0, total: 0 }
  }

  const MAX_AMOUNT = 9_999_999_999_9999 // stays within numeric(20,4)
  const rows = allTransactions.map(txn => {
    const raw = txn.transactionAmount?.amount ?? txn.amount
    const amount = Math.max(-MAX_AMOUNT, Math.min(MAX_AMOUNT, raw))
    const currency = txn.transactionAmount?.currency ?? txn.currency ?? 'EUR'
    const bookingDate = txn.bookingDateTime?.split('T')[0] ?? null
    const valueDate = txn.valueDateTime?.split('T')[0] ?? bookingDate

    // For debits (outgoing), counterparty is the payee; for credits (incoming), the payer
    const counterpartyParty = amount < 0 ? txn.payeeDetails : txn.payerDetails
    const counterpartyName = counterpartyParty?.name ?? null
    const counterpartyIban = getIban(counterpartyParty)

    return {
      owner_id: ownerId,
      bank_connection_id: bankConnectionId,
      source: 'yapily',
      external_id: txn.id,
      amount,
      currency,
      booking_date: bookingDate,
      value_date: valueDate,
      counterparty_iban: counterpartyIban,
      counterparty_name: counterpartyName,
      description: txn.reference ?? txn.description ?? null,
      raw_data: txn,
    }
  })

  const BATCH_SIZE = 500
  let imported = 0
  const newIds: string[] = []

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { data, error } = await supabaseAdmin
      .from('raw_transactions')
      .upsert(batch, {
        onConflict: 'bank_connection_id,external_id',
        ignoreDuplicates: true,
      })
      .select('id')

    if (error) throw error
    const batchIds = (data ?? []).map(r => r.id as string)
    imported += batchIds.length
    newIds.push(...batchIds)
  }

  await supabaseAdmin
    .from('bank_connections')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', bankConnectionId)

  const result: SyncResult = {
    imported,
    skipped: allTransactions.length - imported,
    pending: 0,
    total: allTransactions.length,
  }

  console.log('Yapily sync complete:', result)

  if (newIds.length > 0) {
    const settled = await Promise.allSettled(newIds.map(id => matchTransaction(id)))
    const rejected = settled.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    const statuses = settled
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof matchTransaction>>> =>
        r.status === 'fulfilled'
      )
      .map(r => r.value.status)
    const committed = statuses.filter(s => s === 'auto_committed').length
    const review = statuses.filter(s => s === 'review_queue').length
    const noMatch = statuses.filter(s => s === 'no_match').length
    console.log(`Matching: ${committed} auto-committed, ${review} review queue, ${noMatch} no match, ${rejected.length} errors`)
    if (rejected.length > 0) {
      const sample = rejected[0].reason
      console.error('Matching error:', sample instanceof Error ? sample.message : sample)
    }
  }

  return result
}
