# Domio Design System (Wise-inspired)

Onze UI is geïnspireerd op het **Wise Design System** (wise.design): clean, fintech-achtig, met duidelijke hiërarchie en semantic tokens. Alle componenten gebruiken dezelfde brand tokens voor een consistente uitstraling.

## Brandkleuren

| Token | Waarde | Gebruik |
|-------|--------|--------|
| **Primary** | `#002A1F` | Knoppen, iconen, links, focus |
| **Accent** | `#9FE870` | Secundaire acties, highlights, dark mode accent |
| **Primary hover** | `#356258` | Hover op primary knoppen |

### In code

- **Tailwind:** `bg-brand-primary`, `text-brand-accent`, `ring-brand-primary`, `hover:bg-brand-primary-hover`
- **CSS vars:** `var(--color-primary-500)`, `var(--color-accent-400)`
- **Shadcn/HSL:** `bg-primary`, `text-accent` (zelfde kleuren, via theme)

Gebruik waar mogelijk de Tailwind brand-tokens in plaats van hardcoded `#002A1F` / `#9FE870`.

---

## Spacing (Wise-style)

Semantische spacing voor consistente witruimte:

| Token | Waarde | Tailwind |
|-------|--------|----------|
| x-small | 8px | `p-wise-xs`, `gap-wise-xs` |
| small | 16px | `p-wise-sm`, `gap-wise-sm` |
| medium | 24px | `p-wise-md`, `gap-wise-md` |
| large | 32px | `p-wise-lg`, `gap-wise-lg` |

CSS: `var(--space-x-small)` t/m `var(--space-large)`.

---

## Radius (Wise-style)

| Token | Waarde | Gebruik |
|-------|--------|--------|
| **card** | 1.75rem | Kaarten, dropdowns, modals |
| **block** | 1rem | Binnenblokken, list items, inputs |
| **pill** | 9999px | Pills, full-rounded knoppen |

Tailwind: `rounded-card`, `rounded-block`, `rounded-pill`.

---

## Component-principes (Wise-achtig)

1. **Cards:** Witte achtergrond, `rounded-card`, subtiele border, shadow. Geen zware borders.
2. **List items:** Icon (cirkel primary of grijs), titel (vet), ondertitel (grijs), optioneel bedrag rechts. Scheid met lichte borders of spacing.
3. **Knoppen:** Primary = `bg-brand-primary`; secundair = outline of ghost met `text-brand-primary` / `text-brand-accent`.
4. **Focus/ring:** `ring-brand-primary` voor toegankelijkheid.

---

## Bronnen

- [Wise Design – Components](https://wise.design/components)
- [Wise Design – Foundations](https://wise.design/foundations) (colour, spacing, radius)

Onze tokens sluiten aan op hun semantic spacing (8/16/24/32) en radius-schaal; de kleuren blijven Domio (#002A1F, #9FE870).
