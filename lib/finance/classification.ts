export type UnitStatus = 'betaald' | 'verwacht' | 'aandacht' | 'achterstand'

export interface PaymentProfile {
  pay_date: number
  reminders: number[]
}

export function computePaymentWindow(
  duePeriod: string,
  profile: PaymentProfile
): { first: Date; last: Date } {
  const d = new Date(duePeriod)
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth()
  const dueDate = new Date(year, month, profile.pay_date)
  const minOffset = Math.min(...profile.reminders)
  const maxOffset = Math.max(...profile.reminders)
  const first = new Date(dueDate)
  first.setDate(first.getDate() + minOffset)
  const last = new Date(dueDate)
  last.setDate(last.getDate() + maxOffset)
  return { first, last }
}

// Per-expectation status — extends UnitStatus with 'toekomst' for not-yet-due rows
export type ExpectationStatus = UnitStatus | 'toekomst'

// Per-expectation classification — used in the drawer for individual row pills
export function classifyExpectation(
  paid: number,
  expected: number,
  duePeriod: string,
  profile: PaymentProfile,
  today: Date
): ExpectationStatus {
  if (paid >= expected - 0.005) return 'betaald'
  if (paid > 0) return 'aandacht'
  const { first, last } = computePaymentWindow(duePeriod, profile)
  if (today > last) return 'achterstand'
  if (today >= first) return 'verwacht'
  return 'toekomst'
}

// Whole-lease classification with priority ordering — used in the panel cards
export function classifyUnit(
  expectations: Array<{ id: string; due_period: string; amount_expected: number }>,
  paidByExp: Map<string, number>,
  profile: PaymentProfile | null,
  today: Date,
  leaseId: string
): UnitStatus {
  if (!profile) {
    console.warn(`Lease ${leaseId} has no payment_profile — data integrity issue`)
    return 'betaald'
  }
  if (expectations.length === 0) return 'betaald'

  for (const exp of expectations) {
    const paid = paidByExp.get(exp.id) ?? 0
    if (paid !== 0) continue
    const { last } = computePaymentWindow(exp.due_period, profile)
    if (today > last) return 'achterstand'
  }

  for (const exp of expectations) {
    const paid = paidByExp.get(exp.id) ?? 0
    const expected = Number(exp.amount_expected)
    if (paid > 0 && Math.abs(paid - expected) >= 0.005) return 'aandacht'
  }

  for (const exp of expectations) {
    const paid = paidByExp.get(exp.id) ?? 0
    if (paid !== 0) continue
    const { first, last } = computePaymentWindow(exp.due_period, profile)
    if (today >= first && today <= last) return 'verwacht'
  }

  return 'betaald'
}
