// Public API types

export type MatchResult = {
  status: "auto_committed" | "review_queue" | "no_match";
  candidates: ScoredCandidate[];
  committed?: PaymentAssignment[];
};

export type ScoredCandidate = {
  expectationIds: string[];
  amountAssigned: number;
  score: 0 | 80 | 85 | 90;
  method: "iban" | "description_full" | "description_huur" | "description_address";
  reasoning: string;
};

export type PaymentAssignment = {
  id: string;
  raw_transaction_id: string;
  rent_expectation_id: string;
  amount_assigned: number;
  match_method: ScoredCandidate["method"];
  confidence_score: number;
  assigned_by: null;
};

// Internal DB row types (column names from schema.sql)

export type DbRawTransaction = {
  id: string;
  owner_id: string;
  booking_date: string;
  amount: number;
  counterparty_iban: string | null;
  counterparty_name: string | null;
  description: string | null;
};

export type DbRentExpectation = {
  id: string;
  owner_id: string;
  lease_id: string;
  due_period: string; // date, always 1st of month e.g. "2026-04-01"
  amount_expected: number;
};

export type DbLease = {
  id: string;
  tenant_id: string | null;
  unit_id: string;
};

export type DbTenant = {
  id: string;
  iban: string | null;
  payment_profile_id: string | null;
};

export type DbPaymentProfile = {
  id: string;
  pay_date: number;  // 1–28, day of month rent is due
  reminders: number[]; // offsets in days from due date
};

export type DbUnit = {
  id: string;
  property_id: string;
};

export type DbProperty = {
  id: string;
  address: string;
};

// Enriched candidate built in candidates.ts, consumed by score.ts and index.ts
export type EnrichedCandidate = {
  expectationIds: string[];
  amountAssigned: number;
  // Per-expectation amounts needed for DB inserts (split candidates have 2 entries)
  assignments: Array<{ expectationId: string; amount: number }>;
  duePeriod: string;
  tenantIban: string | null;
  paymentProfile: Pick<DbPaymentProfile, "pay_date" | "reminders"> | null;
  propertyAddress: string | null;
};
