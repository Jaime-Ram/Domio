import {
  parseAddress,
  normalizeText,
  hasStreet,
  hasHouseNumber,
  hasHuur,
  hasDutchMonth,
} from "./normalize";
import type { DbRawTransaction, EnrichedCandidate, ScoredCandidate } from "./types";

const DEFAULT_PAY_DATE = 1;
const DEFAULT_REMINDERS = [-3, 7, 14];

function computePaymentWindow(
  duePeriod: string,
  profile: Pick<{ pay_date: number; reminders: number[] }, "pay_date" | "reminders"> | null
): { first: Date; last: Date } {
  const d = new Date(duePeriod + "T00:00:00Z");
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const payDate = profile?.pay_date ?? DEFAULT_PAY_DATE;
  const reminders =
    profile?.reminders && profile.reminders.length > 0
      ? profile.reminders
      : DEFAULT_REMINDERS;

  const dueDate = new Date(Date.UTC(year, month, payDate));
  const minOffset = Math.min(...reminders);
  const maxOffset = Math.max(...reminders);

  const first = new Date(dueDate);
  first.setUTCDate(first.getUTCDate() + minOffset);

  const last = new Date(dueDate);
  last.setUTCDate(last.getUTCDate() + maxOffset);

  return { first, last };
}

type ScoreResult = Pick<ScoredCandidate, "score" | "method" | "reasoning">;

export function scoreCandidate(
  tx: DbRawTransaction,
  candidate: EnrichedCandidate
): ScoreResult {
  const { first, last } = computePaymentWindow(candidate.duePeriod, candidate.paymentProfile);
  const bookingDate = new Date(tx.booking_date + "T00:00:00Z");
  const inWindow = bookingDate >= first && bookingDate <= last;

  const normalizedDesc = tx.description ? normalizeText(tx.description) : "";

  const parsed = candidate.propertyAddress ? parseAddress(candidate.propertyAddress) : null;
  const streetMatch = parsed ? hasStreet(normalizedDesc, parsed.street) : false;
  // If parseAddress found no houseNumber, houseMatch is always false → description tiers score 0
  const houseMatch = parsed?.houseNumber
    ? hasHouseNumber(normalizedDesc, parsed.houseNumber)
    : false;
  const huurMatch = hasHuur(normalizedDesc);
  const monthMatch = hasDutchMonth(normalizedDesc, candidate.duePeriod);

  const windowStr = `[${first.toISOString().slice(0, 10)}, ${last.toISOString().slice(0, 10)}]`;

  // Tier 90 — IBAN
  const normalizedTxIban = tx.counterparty_iban?.replace(/\s/g, "").toUpperCase();
  const ibanMatch =
    normalizedTxIban &&
    candidate.tenantIbans.some(
      (iban) => iban.replace(/\s/g, "").toUpperCase() === normalizedTxIban
    );
  if (ibanMatch && inWindow) {
    return {
      score: 90,
      method: "iban",
      reasoning: `IBAN ${tx.counterparty_iban} matches tenant; booking_date ${tx.booking_date} in window ${windowStr}`,
    };
  }

  // Tier 90 — full description match (street + house + huur + month)
  if (streetMatch && houseMatch && huurMatch && monthMatch) {
    return {
      score: 90,
      method: "description_full",
      reasoning: "Description contains street, house number, 'huur', and month of due period",
    };
  }

  // Tier 85 — street + house + huur, within payment window
  if (streetMatch && houseMatch && huurMatch && inWindow) {
    return {
      score: 85,
      method: "description_huur",
      reasoning: `Description contains street, house number, 'huur'; booking_date ${tx.booking_date} in window ${windowStr}`,
    };
  }

  // Tier 80 — street + house, within payment window
  if (streetMatch && houseMatch && inWindow) {
    return {
      score: 80,
      method: "description_address",
      reasoning: `Description contains street and house number; booking_date ${tx.booking_date} in window ${windowStr}`,
    };
  }

  return {
    score: 0,
    method: "description_address",
    reasoning: "No matching IBAN, description, or payment window criteria met",
  };
}
