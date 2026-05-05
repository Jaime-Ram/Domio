import { describe, it, expect } from "vitest";
import {
  parseAddress,
  normalizeText,
  hasStreet,
  hasHouseNumber,
  hasHuur,
  hasDutchMonth,
} from "../normalize";

describe("parseAddress", () => {
  const cases: Array<{ input: string; street: string; houseNumber: string | null }> = [
    { input: "Prinsengracht 123",      street: "Prinsengracht",        houseNumber: "123" },
    { input: "Keizersgracht 1",        street: "Keizersgracht",        houseNumber: "1" },
    { input: "Van der Helststraat 12a", street: "Van der Helststraat", houseNumber: "12a" },
    { input: "Lange Voorhout 31B",     street: "Lange Voorhout",       houseNumber: "31B" },
    { input: "Keizersgracht 100-102",  street: "Keizersgracht",        houseNumber: "100-102" },
    { input: "Herengracht 100-102b",   street: "Herengracht",          houseNumber: "100-102b" },
    // Trailing whitespace stripped
    { input: "Straat 5  ",             street: "Straat",               houseNumber: "5" },
    // No number → houseNumber is null
    { input: "Ergens",                 street: "Ergens",               houseNumber: null },
    { input: "Lange Laan",             street: "Lange Laan",           houseNumber: null },
  ];

  for (const { input, street, houseNumber } of cases) {
    it(`"${input}" → street="${street}", houseNumber=${JSON.stringify(houseNumber)}`, () => {
      expect(parseAddress(input)).toEqual({ street, houseNumber });
    });
  }
});

describe("normalizeText", () => {
  const cases: Array<{ input: string; expected: string }> = [
    // Letter↔digit boundary insertion
    { input: "gracht12",              expected: "gracht 12" },
    { input: "12abc",                 expected: "12 abc" },
    { input: "test123test",           expected: "test 123 test" },
    // Non-alphanumerics replaced, spaces collapsed
    { input: "Huur  Prinsengracht",   expected: "huur prinsengracht" },
    { input: "test.abc-def",          expected: "test abc def" },
    { input: "huur/april",            expected: "huur april" },
    // Mixed
    { input: "Huur Gracht12a april",  expected: "huur gracht 12 a april" },
    // Already clean
    { input: "huur",                  expected: "huur" },
  ];

  for (const { input, expected } of cases) {
    it(`normalizes "${input}" → "${expected}"`, () => {
      expect(normalizeText(input)).toBe(expected);
    });
  }
});

describe("hasStreet", () => {
  it("matches normalized street as substring", () => {
    const desc = normalizeText("Huur Prinsengracht 123 april");
    expect(hasStreet(desc, "Prinsengracht")).toBe(true);
  });

  it("matches multi-word street", () => {
    const desc = normalizeText("Van der Helststraat 12 huur");
    expect(hasStreet(desc, "Van der Helststraat")).toBe(true);
  });

  it("does not match partial street name", () => {
    const desc = normalizeText("gracht 12 huur");
    expect(hasStreet(desc, "Prinsengracht")).toBe(false);
  });
});

describe("hasHouseNumber", () => {
  it("matches simple house number as whole token", () => {
    const desc = normalizeText("Prinsengracht 123 huur");
    expect(hasHouseNumber(desc, "123")).toBe(true);
  });

  it("does not match partial number (1234 does not match 123)", () => {
    const desc = normalizeText("Prinsengracht 1234 huur");
    expect(hasHouseNumber(desc, "123")).toBe(false);
  });

  it("matches suffixed house number after normalization (123a → '123 a')", () => {
    const desc = normalizeText("Prinsengracht 123a huur");
    expect(hasHouseNumber(desc, "123a")).toBe(true);
  });
});

describe("hasHuur", () => {
  it("matches 'huur' as whole token", () => {
    expect(hasHuur(normalizeText("Prinsengracht 123 huur april"))).toBe(true);
  });

  it("does not match 'huur' inside another word", () => {
    // "verhuur" normalized is "verhuur"; token "huur" should not match inside it
    expect(hasHuur(normalizeText("verhuur"))).toBe(false);
  });
});

describe("hasDutchMonth", () => {
  const due = "2026-04-01"; // April 2026

  it("matches full Dutch month name", () => {
    expect(hasDutchMonth(normalizeText("huur prinsengracht 123 april 2026"), due)).toBe(true);
  });

  it("matches short Dutch month name (apr)", () => {
    expect(hasDutchMonth(normalizeText("huur prinsengracht 123 apr 2026"), due)).toBe(true);
  });

  it("matches MM/YYYY format (normalized to '04 2026')", () => {
    expect(hasDutchMonth(normalizeText("huur prinsengracht 04/2026"), due)).toBe(true);
  });

  it("matches YYYY-MM format (normalized to '2026 04')", () => {
    expect(hasDutchMonth(normalizeText("huur prinsengracht 2026-04"), due)).toBe(true);
  });

  it("matches MM-YYYY format (normalized to '04 2026')", () => {
    expect(hasDutchMonth(normalizeText("huur prinsengracht 04-2026"), due)).toBe(true);
  });

  it("does not match wrong month", () => {
    expect(hasDutchMonth(normalizeText("huur prinsengracht maart 2026"), due)).toBe(false);
  });

  it("handles 'mei' (May) — same in full and short form", () => {
    const dueMay = "2026-05-01";
    expect(hasDutchMonth(normalizeText("huur gracht 5 mei 2026"), dueMay)).toBe(true);
  });
});
