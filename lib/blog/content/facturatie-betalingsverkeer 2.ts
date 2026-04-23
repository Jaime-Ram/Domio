export const content = `
Huurinkomsten zijn de levensader van je vastgoedportefeuille. Toch is de administratie rondom facturatie, incasso en betalingsverkeer voor veel verhuurders een bron van frustratie: late betalingen, handmatige verwerking, fouten in de boekhouding. In dit artikel behandelen we de volledige cyclus — van factuur tot aanmaning — en laten we zien hoe automatisering dit proces stroomlijnt.

## Hoe werkt huurincasso?

Er zijn drie gangbare manieren waarop huurders betalen:

**1. Overboeking door huurder (automatische overschrijving)**
De huurder boekt zelf over op de peildatum (doorgaans de 1e van de maand). Eenvoudig, maar je bent afhankelijk van de discipline van de huurder.

**2. Doorlopende machtiging (SEPA-incasso)**
Jij als verhuurder incasseert automatisch op de afgesproken datum. Huurder hoeft niets te doen. Vereist een getekend SEPA-mandaat. Stornering is mogelijk, maar geeft je direct inzicht in betalingsproblemen.

**3. Betaalverzoek / iDEAL-link**
Via een vastgoedsysteem of betaalplatform verstuur je een betaalverzoek per e-mail. Huurder klikt en betaalt direct. Handig als aanvulling bij incidentele betalingen of achterstanden.

**Aanbeveling:** SEPA-incasso biedt de meeste controle en minste handmatig werk. Combineer met een goedgekeurd mandaat in de huurovereenkomst.

## Factuurvereisten

Technisch gezien is een "huurrekening" geen btw-factuur — woonverhuur is btw-vrijgesteld. Toch is het goed om huurders een maandoverzicht te sturen met:

- Naam en adres verhuurder en huurder
- Omschrijving: huur [adres] [periode]
- Kale huurprijs
- Eventuele servicekosten (als apart bedrag)
- Totaalbedrag
- Vervaldatum
- Betalingsreferentie of kenmerk

Een vaste betalingsreferentie (bijv. huurdersnummer + maand) maakt automatische matching in de boekhouding mogelijk.

## Wet Ketenaansprakelijkheid incasso (Wki)

Verhuurders die via een incassobureau of beheerder invorderen, moeten zich houden aan de **Wet Ketenaansprakelijkheid incasso (Wki)**. Kernpunten:

- Buitengerechtelijke incassokosten zijn gereguleerd (staffel op basis van openstaand bedrag)
- Maximum voor incassokosten bij vorderingen t/m €267: **€40**
- Bij vorderingen van €267–€1.334: 15% met minimum €40
- Hoger bij grotere vorderingen (zie staffel)
- Kosten mogen pas in rekening worden gebracht na een **aanmaning met 14-dagentermijn**

Ga je zelf invorderen? Dan gelden dezelfde regels. Stuur altijd een formele aanmaning vóórdat je incassokosten in rekening brengt.

## Aanmaningsprocedure: stap voor stap

**Stap 1 — Herinnering (dag 5–10 na vervaldatum)**
Vriendelijke herinnering per e-mail of app: betaling nog niet ontvangen, controleer dit alstublieft.

**Stap 2 — Formele aanmaning (dag 14)**
Schriftelijke aanmaning (e-mail + brief) met vermelding van:
- Openstaand bedrag
- Uiterste betaaldatum (14 dagen)
- Mededeling dat bij niet-betaling incassokosten volgen

**Stap 3 — Incasso of rechtbank (na 28 dagen)**
- Overdragen aan incassobureau, of
- Dagvaarding via kantonrechter (voor vorderingen t/m €25.000)

**Stap 4 — Ontbinding huurovereenkomst**
Als de huurachterstand drie of meer maanden bedraagt, kun je via de rechter ontbinding van de huurovereenkomst vorderen. Dit is doorgaans pas een laatste redmiddel.

**Bewaar altijd documentatie** van elke stap: wanneer verstuurde je de aanmaning, wat was de respons, wanneer heb je het overdragen?

## Bankimport en MT940

Handmatige verwerking van bankafschriften kost enorm veel tijd. De standaard voor bancaire uitwisseling is het **MT940-formaat** — een bestandstype dat vrijwel alle Nederlandse banken ondersteunen.

Met een MT940-koppeling in je vastgoedsoftware:
- Download je dagelijks of wekelijks een exportbestand van je bank
- Importeer je dit in het systeem
- Worden betalingen automatisch gematcht aan openstaande huurposten
- Zie je direct wie betaald heeft en wie niet

Modernere systemen werken met **PSD2-bankintegratie** (Open Banking) waarbij de koppeling volledig realtime is.

## Automatisering: wat kun je verwachten?

Een goed ingericht vastgoedbeheersysteem neemt het volgende over:

- **Automatische huurincasso** op de afgesproken datum
- **Directe status per huurder:** betaald / te laat / gestoorneerd
- **Automatische herinneringen en aanmaningen** op basis van ingestelde termijnen
- **Aanmaning met automatische incassokostenberekening** (Wki-conform)
- **Bankimport of PSD2-koppeling** voor directe matching
- **Overzichtsrapportage:** betalingsgedrag per huurder, openstaande posten, verwachte ontvangsten

Dit bespaart een beheerder gemiddeld 3–5 uur per week per 10 woningen in vergelijking met handmatig beheer.

## Servicekosten apart factureren

Servicekosten worden idealiter op een aparte post in de maandelijkse huurrekening weergegeven. Dit maakt de jaarlijkse afrekening eenvoudiger: je hebt een duidelijk overzicht van wat de huurder per post heeft vooruitbetaald.

Koppel in je systeem elke servicekostenpost aan de onderliggende factuur van de leverancier. Zo is de afrekening op elk moment reproduceerbaar.

## Bewaarplicht

Huuradministratie moet worden bewaard conform de fiscale bewaarplicht:
- **Basisadministratie (facturen, bankafschriften):** 7 jaar
- **Onroerend goed gerelateerde documenten (koopaktes, kadastrale stukken):** 10 jaar

Digitale bewaring is toegestaan mits het om een authentieke, niet-wijzigbare kopie gaat (bijv. gescand en opgeslagen in de cloud).
`
