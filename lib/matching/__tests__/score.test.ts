import { describe, it, expect } from "vitest";
import { scoreCandidate } from "../score";
import type { DbRawTransaction, EnrichedCandidate, ScoredCandidate } from "../types";

// Baseline fixtures — individual tests override only the fields they care about
const DUE_PERIOD = "2026-04-01";
const PROFILE = { pay_date: 1, reminders: [-3, 7, 14] };
// pay_date=1 → due_date=2026-04-01 → window=[2026-03-29, 2026-04-15]
const IN_WINDOW_DATE = "2026-04-05";
const OUT_WINDOW_DATE = "2026-04-20";
const IBAN = "NL91ABNA0417164300";
const PROPERTY = "Prinsengracht 123";

function makeTx(overrides: Partial<DbRawTransaction> = {}): DbRawTransaction {
  return {
    id: "tx-1",
    owner_id: "owner-1",
    booking_date: IN_WINDOW_DATE,
    amount: 1000,
    counterparty_iban: null,
    counterparty_name: null,
    description: null,
    ...overrides,
  };
}

function makeCandidate(overrides: Partial<EnrichedCandidate> = {}): EnrichedCandidate {
  return {
    expectationIds: ["exp-1"],
    amountAssigned: 1000,
    assignments: [{ expectationId: "exp-1", amount: 1000 }],
    duePeriod: DUE_PERIOD,
    tenantIbans: [],
    paymentProfile: PROFILE,
    propertyAddress: PROPERTY,
    ...overrides,
  };
}

type Case = {
  label: string;
  tx: DbRawTransaction;
  candidate: EnrichedCandidate;
  expectedScore: ScoredCandidate["score"];
  expectedMethod: ScoredCandidate["method"];
};

const cases: Case[] = [
  // ── Tier 90: IBAN ────────────────────────────────────────────────────────────
  {
    label: "90 IBAN — matching IBAN, amount, booking_date in window",
    tx: makeTx({ counterparty_iban: IBAN, booking_date: IN_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [IBAN] }),
    expectedScore: 90,
    expectedMethod: "iban",
  },
  {
    label: "90 IBAN — IBAN comparison is case-insensitive",
    tx: makeTx({ counterparty_iban: IBAN.toLowerCase(), booking_date: IN_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [IBAN] }),
    expectedScore: 90,
    expectedMethod: "iban",
  },
  {
    label: "not 90 IBAN — booking_date outside window → falls to description tiers",
    tx: makeTx({ counterparty_iban: IBAN, booking_date: OUT_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [IBAN] }),
    expectedScore: 0,
    expectedMethod: "description_address",
  },
  {
    label: "not 90 IBAN — IBAN mismatch → falls to description tiers",
    tx: makeTx({ counterparty_iban: "NL01OTHER0000000000", booking_date: IN_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [IBAN] }),
    expectedScore: 0,
    expectedMethod: "description_address",
  },

  // ── Tier 90: description_full ─────────────────────────────────────────────────
  {
    label: "90 description_full — street + house + huur + month in description",
    tx: makeTx({ description: "Huur Prinsengracht 123 april 2026", booking_date: OUT_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [] }),
    expectedScore: 90,
    expectedMethod: "description_full",
  },
  {
    label: "90 description_full — numeric month format MM/YYYY",
    tx: makeTx({ description: "Huur Prinsengracht 123 04/2026", booking_date: OUT_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [] }),
    expectedScore: 90,
    expectedMethod: "description_full",
  },
  {
    label: "90 description_full — short month name 'apr'",
    tx: makeTx({ description: "huur prinsengracht 123 apr 2026", booking_date: OUT_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [] }),
    expectedScore: 90,
    expectedMethod: "description_full",
  },

  // ── Tier 85: description_huur ─────────────────────────────────────────────────
  {
    label: "85 description_huur — street + house + huur + in window (no month)",
    tx: makeTx({ description: "Huur Prinsengracht 123", booking_date: IN_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [] }),
    expectedScore: 85,
    expectedMethod: "description_huur",
  },
  {
    label: "not 85 — has huur + street + house but outside window and no month → score 0",
    tx: makeTx({ description: "Huur Prinsengracht 123", booking_date: OUT_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [] }),
    expectedScore: 0,
    expectedMethod: "description_address",
  },

  // ── Tier 80: description_address ──────────────────────────────────────────────
  {
    label: "80 description_address — street + house + in window (no huur, no month)",
    tx: makeTx({ description: "Prinsengracht 123 betaling", booking_date: IN_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [] }),
    expectedScore: 80,
    expectedMethod: "description_address",
  },
  {
    label: "not 80 — has street + house but outside window → score 0",
    tx: makeTx({ description: "Prinsengracht 123 betaling", booking_date: OUT_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [] }),
    expectedScore: 0,
    expectedMethod: "description_address",
  },

  // ── Score 0: no criteria ──────────────────────────────────────────────────────
  {
    label: "0 — unrelated description, no IBAN",
    tx: makeTx({ description: "Boodschappen supermarkt", booking_date: IN_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [] }),
    expectedScore: 0,
    expectedMethod: "description_address",
  },
  {
    label: "0 — null description, no IBAN",
    tx: makeTx({ description: null, booking_date: IN_WINDOW_DATE }),
    candidate: makeCandidate({ tenantIbans: [] }),
    expectedScore: 0,
    expectedMethod: "description_address",
  },
  {
    label: "0 — no house number in property address → all description tiers fail",
    tx: makeTx({ description: "Huur Ergens huur april 2026", booking_date: IN_WINDOW_DATE }),
    candidate: makeCandidate({ propertyAddress: "Ergens", tenantIbans: [] }),
    expectedScore: 0,
    expectedMethod: "description_address",
  },

  // ── Edge: null paymentProfile → default window ────────────────────────────────
  {
    label: "uses default window (pay_date=1, reminders=[-3,7,14]) when paymentProfile is null",
    tx: makeTx({ description: "Huur Prinsengracht 123", booking_date: IN_WINDOW_DATE }),
    candidate: makeCandidate({ paymentProfile: null, tenantIbans: [] }),
    expectedScore: 85,
    expectedMethod: "description_huur",
  },

  // ── Edge: multi-word street ────────────────────────────────────────────────────
  {
    label: "90 description_full — multi-word street",
    tx: makeTx({
      description: "Huur Van der Helststraat 12 april 2026",
      booking_date: OUT_WINDOW_DATE,
    }),
    candidate: makeCandidate({ propertyAddress: "Van der Helststraat 12", tenantIbans: [] }),
    expectedScore: 90,
    expectedMethod: "description_full",
  },
];

describe("scoreCandidate — table-driven", () => {
  for (const { label, tx, candidate, expectedScore, expectedMethod } of cases) {
    it(label, () => {
      const result = scoreCandidate(tx, candidate);
      expect(result.score).toBe(expectedScore);
      expect(result.method).toBe(expectedMethod);
    });
  }
});

describe("scoreCandidate — payment window boundary", () => {
  // pay_date=1, reminders=[-3,7,14] → window=[2026-03-29, 2026-04-15]
  it("first day of window (2026-03-29) is in window", () => {
    const result = scoreCandidate(
      makeTx({ description: "Huur Prinsengracht 123", booking_date: "2026-03-29" }),
      makeCandidate({ tenantIbans: [] })
    );
    expect(result.score).toBe(85);
  });

  it("last day of window (2026-04-15) is in window", () => {
    const result = scoreCandidate(
      makeTx({ description: "Huur Prinsengracht 123", booking_date: "2026-04-15" }),
      makeCandidate({ tenantIbans: [] })
    );
    expect(result.score).toBe(85);
  });

  it("day before window (2026-03-28) is outside window", () => {
    const result = scoreCandidate(
      makeTx({ description: "Huur Prinsengracht 123", booking_date: "2026-03-28" }),
      makeCandidate({ tenantIbans: [] })
    );
    expect(result.score).toBe(0);
  });

  it("day after window (2026-04-16) is outside window", () => {
    const result = scoreCandidate(
      makeTx({ description: "Huur Prinsengracht 123", booking_date: "2026-04-16" }),
      makeCandidate({ tenantIbans: [] })
    );
    expect(result.score).toBe(0);
  });
});
