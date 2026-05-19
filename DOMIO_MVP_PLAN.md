# Domio MVP Plan

## Beslissingen

- **Paywall**: Stripe, alleen voor verhuurders. Huurders gratis via invite.
- **Tickets**: Berichten → Tickets. 1-op-1 threaded per onderwerp, met status. Buiten tickets: bulk-aankondigingen, formele acties (huurverhoging etc.), geautomatiseerde betalingsherinneringen, onboarding.
- **Huurder zonder account**: Magic link — altijd e-mail, met tijdelijke gastview. "Maak account aan" CTA. Geen keuze voor verhuurder nodig.
- **Formele communicatie**: Via snelknoppen op dashboard (bijv. huurverhoging). Genereert document + stuurt branded Domio-mail ("open in Domio").
- **Sidebar**: Compacter à la Stripe — kleinere tekst, minder padding, geen speelsheid.
- **Domio Assist**: Coming soon label in sidebar + App toevoegen aan navigatie.
- **Financials**: Handled by compagnon, buiten scope.

---

## To-Do

### P0 — Blokkers
- [ ] Stripe paywall — checkout, webhook, subscription status in middleware

### P1 — Core UX
- [ ] Huurverhoging flow — datum, %, brief genereren, huurder notificeren
- [ ] Sidebar compacten — Stripe-stijl
- [ ] Assist "coming soon" + App in navigatie
- [ ] Ticketing — dashboard widget (open per prioriteit, SLA-overschreden, nieuwste huurdertickets)

### P2 — Launch polish
- [ ] Branded e-mail templates met "open in Domio" CTA
- [ ] Compliance verdieping — EPC, jaarlijkse takencalender (gas, electra, lift, brand)

---

## Afgerond

### Ticketing systeem (volledig)
- [x] DB schema — category, source, ticket_number, assignee_id, sla_deadline, resolved_at, ticket_events, work_orders
- [x] Ticket detail panel — tabs Activiteit / Details / Notities / Werkbon
- [x] Categorie + bron bij aanmaken (verhuurder & huurder portaal)
- [x] SLA timers — berekend op basis van prioriteit, badge in tabel + detail
- [x] Huurder portaal — ticket indienen, categorie kiezen, voortgang volgen

### Uitnodigingssysteem
- [x] Tenant aanmaken + invite via /api/invitations/send
- [x] Uitnodiging verstuurd via Resend (transactionele e-mail actief)
- [x] Magic link registratie voor huurders

### UI componentisatie
- [x] DataTable component — herbruikbaar voor alle tabellen (portfolio, huurders, inspecties, planning)
- [x] TableToolbar — uniform zoeken + filteren + toevoegen
- [x] SortableTable — klikbare kolomkoppen
- [x] Huurders pagina — DetailSheet patroon (geen aparte [id] pagina)
