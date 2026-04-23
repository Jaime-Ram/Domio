export const content = `
Jaarlijkse huurindexatie is voor de meeste verhuurders een terugkerende administratieve klus: de CBS-index opzoeken, berekeningen maken, brieven versturen en verwerken in de boekhouding. Wie dit handmatig doet, maakt snel fouten — of vergeet het simpelweg. In dit artikel leggen we uit hoe indexatie wettelijk werkt, hoe je de berekening correct uitvoert en hoe vastgoedsoftware dit proces volledig kan automatiseren.

## Wettelijke basis

Huurindexatie is geregeld in artikel 7:250 BW. De wet staat verhuurders toe om de huurprijs jaarlijks te verhogen, mits:

1. Het huurcontract een indexatieclausule bevat
2. De indexatiemethode schriftelijk is vastgelegd
3. De wettelijke maximumverhoging niet wordt overschreden

Zonder contractuele indexatieclausule mag je de huur **niet** verhogen — behalve via een volledige huurverhogingsprocedure bij de Huurcommissie.

## CBS-index: hoe werkt het?

De meest gebruikte methode koppelt de huurverhoging aan de **Consumenten Prijsindex (CPI)** van het Centraal Bureau voor de Statistiek. De formule:

**Nieuwe huur = oude huur × (CPI nieuw / CPI oud)**

Concreet:
- Huurcontract indexeert op 1 juli elk jaar
- Referentiemaand: CPI april van het lopende jaar t.o.v. CPI april van het voorgaande jaar
- CPI april 2025: 135,6 | CPI april 2024: 130,2
- Indexatiepercentage: 135,6 / 130,2 − 1 = **4,1%**

Let op welke CPI-reeks je contractueel hebt vastgelegd: alle huishoudens, alle huishoudens afgeleid (zonder energiecomponent), of een andere variant. Dit staat in het huurcontract en mag je niet achteraf aanpassen.

## Maximumverhogingen per sector (2026)

Ook bij contractuele indexatie geldt een wettelijk maximum:

| Sector | Maximum 2026 |
|---|---|
| Sociale huur (gereguleerd) | 4,1% (CPI) |
| Middenhuur (gereguleerd middensegment) | 6,1% (CPI + 1%) |
| Vrije sector | 4,4% (CPI + 0,3%) |

Overschrijding van het maximum is nietig — de huurder hoeft het meerdere niet te betalen en kan terugvordering eisen.

## Timing en procedure

**Wanneer indexeren?**
De meeste contracten kennen een vaste indexatiedatum, vaak 1 januari of 1 juli. Controleer het huurcontract.

**Minimale aanzegtermijn:**
Bij sociale en gereguleerde huur: minimaal **twee maanden** vóór ingang. Bij vrije sector: minimaal **één maand**.

**Hoe aanzeggen?**
Schriftelijk, met vermelding van:
- De nieuwe huurprijs
- De ingangsdatum
- De gebruikte CBS-index en het berekende percentage

**Tip:** Stuur de aanzegging ook per e-mail zodat je een bewijs van verzending hebt.

## Stap-voor-stap berekening

1. Zoek de CPI-waarden op via CBS Statline (zoek op "Consumenten Prijsindex")
2. Bepaal de referentiemaanden (staat in het huurcontract)
3. Bereken het indexatiepercentage: (CPI nieuw / CPI oud − 1) × 100
4. Toets aan het wettelijk maximum voor jouw sector
5. Bereken de nieuwe huurprijs
6. Stuur de aanzeggingsbrief binnen de aanzegtermijn
7. Verwerk de nieuwe prijs in de boekhouding en huurincasso

## Veelgemaakte fouten

**Verkeerde CPI-reeks:** Sommige contracten verwijzen naar "alle huishoudens", andere naar "alle huishoudens afgeleid". De uitkomsten verschillen en je mag dit niet eenzijdig aanpassen.

**Te late aanzegging:** Bij een aanzegging die te laat binnenkomt, schuift de ingangsdatum automatisch op.

**Geen indexatieclausule:** Soms wordt dit pas ontdekt bij het eerste indexatiemoment. Herstel is complex — voeg een addendum toe met instemming van de huurder.

**Cumulatieve fouten:** Bij handmatige berekeningen worden fouten jaar na jaar meegesleept. Na vijf jaar kan dit honderden euro's scheelschelen.

## Automatisering via vastgoedsoftware

Vastgoedsoftware neemt het hele indexatieproces uit handen:

- **Automatische CBS-koppeling:** De software haalt de actuele CPI-waarden op en berekent het percentage per pand en per sector
- **Signalering:** Je krijgt een melding als de indexatiedatum nadert
- **Bulk-aanzeggingen:** Eén klik genereert gepersonaliseerde aanzeggingsbrieven voor alle huurders
- **Directe verwerking:** De nieuwe huurprijs wordt automatisch doorgevoerd in de incasso
- **Audittrail:** Alle berekeningen worden opgeslagen — handig bij een Huurcommissie-procedure

Dit bespaart niet alleen tijd, het vermindert ook het risico op juridisch kwetsbare fouten.

## Indexatie en huurverhogingen gecombineerd

Indexatie is niet hetzelfde als een huurverhoging boven het indexatiepercentage. Wil je de huur extra verhogen? Dan gelden andere procedures:

- **Sociale huur:** alleen via formele procedure bij Huurcommissie
- **Vrije sector:** contractueel vastgelegd of in onderling overleg
- **Middenhuur:** maximaal CPI + 1% — geen ruimte voor extra verhogingen

Houd indexatie en separate huurverhogingen dus administratief gescheiden.
`
