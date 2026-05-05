// Regex: greedily capture street, then house number at end.
// House number: digits, optional letter suffix, optional range (e.g. 12, 12a, 100-102b)
const ADDRESS_RE = /^(.+?)\s+(\d+[a-zA-Z]?(?:-\d+[a-zA-Z]?)?)\s*$/;

export type ParsedAddress = {
  street: string;
  houseNumber: string | null;
};

export function parseAddress(address: string): ParsedAddress {
  const m = address.match(ADDRESS_RE);
  if (!m) return { street: address.trim(), houseNumber: null };
  return { street: m[1].trim(), houseNumber: m[2] };
}

export function normalizeText(text: string): string {
  let s = text.toLowerCase();
  // Insert space at letter↔digit boundaries
  s = s.replace(/([a-z])(\d)/g, "$1 $2").replace(/(\d)([a-z])/g, "$1 $2");
  // Replace non-alphanumerics with space, collapse runs
  s = s.replace(/[^a-z0-9]+/g, " ").trim();
  return s;
}

// Whole-phrase token match (handles multi-token house numbers like "123 a" from "123a")
function phraseToken(normalizedDesc: string, phrase: string): boolean {
  const normPhrase = normalizeText(phrase);
  if (!normPhrase) return false;
  const escaped = normPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^| )${escaped}(?: |$)`).test(normalizedDesc);
}

export function hasStreet(normalizedDesc: string, street: string): boolean {
  const normStreet = normalizeText(street);
  if (!normStreet) return false;
  return normalizedDesc.includes(normStreet);
}

export function hasHouseNumber(normalizedDesc: string, houseNumber: string): boolean {
  return phraseToken(normalizedDesc, houseNumber);
}

export function hasHuur(normalizedDesc: string): boolean {
  return phraseToken(normalizedDesc, "huur");
}

const DUTCH_MONTHS_FULL = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

const DUTCH_MONTHS_SHORT = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

// Check if normalized description contains the month of duePeriod (ISO date string).
// Matches Dutch full/short month names or numeric MM/YYYY, YYYY-MM, MM-YYYY patterns.
export function hasDutchMonth(normalizedDesc: string, duePeriod: string): boolean {
  const d = new Date(duePeriod + "T00:00:00Z");
  const month = d.getUTCMonth(); // 0-based
  const year = d.getUTCFullYear();
  const mm = String(month + 1).padStart(2, "0");
  const yyyy = String(year);

  if (phraseToken(normalizedDesc, DUTCH_MONTHS_FULL[month])) return true;
  if (phraseToken(normalizedDesc, DUTCH_MONTHS_SHORT[month])) return true;

  // After normalization "/" and "-" become " ", so all three numeric formats
  // collapse to either "MM YYYY" or "YYYY MM"
  const mmYyyy = `${mm} ${yyyy}`;
  const yyyyMm = `${yyyy} ${mm}`;
  if (normalizedDesc.includes(mmYyyy) || normalizedDesc.includes(yyyyMm)) return true;

  return false;
}
