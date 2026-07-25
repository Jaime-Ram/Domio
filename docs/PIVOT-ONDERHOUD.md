# Pivot naar puur agentic onderhoud

**Datum:** 25 juli 2026

Domio richt zich vanaf nu volledig op agentic vastgoedonderhoud. Niet langer
een volledige vastgoedadministratie, maar de onderhoudslaag die naast de
bestaande software van de klant draait.

## Terugdraaien

De volledige staat van vóór de pivot is bewaard:

| Wat | Waar |
|---|---|
| Branch | `voor-onderhoud-pivot` |
| Tag | `voor-onderhoud-pivot-2026-07-25` |
| Commit | `6711668` |

Terughalen van één bestand:

```bash
git checkout voor-onderhoud-pivot -- app/dashboard-nieuw/huurders/page.tsx
```

Alles bekijken zoals het was:

```bash
git switch voor-onderhoud-pivot
```

## Wat blijft, wat verdwijnt

### Blijft, dit is de ruggengraat
- **Meldingen en tickets**, de keten van melding tot afgehandelde factuur
- **MJOP**, gepland onderhoud in plaats van alleen reactief
- **Partners**, het netwerk van monteurs en leveranciers waar de agent mee werkt
- **Panden en eenheden**, als lichte objectregistratie met onderhoudshistorie
- **Documenten**, beperkt tot offertes, werkbonnen, keuringen en garanties
- **Onderhoudskosten**, begroot tegenover werkelijk
- **Compliance**, alleen het deel dat onderhoudstaken genereert (keuringen,
  rookmelders, energielabels)

### Verdwijnt
- **Huurincasso in zijn geheel**: betalingen, achterstanden, huurafrekeningen
  en indexatie. Eigen product, zwaar gereguleerd, geen raakvlak met onderhoud.
- **Huurders als CRM-module**. Per eenheid blijft een contactpersoon bestaan om
  over een storing te communiceren, maar geen contractbeheer.
- **Bezetting en leegstand**, dat is assetmanagement.
- **Flows**. Een visuele flowbouwer is het oude paradigma waarin de gebruiker de
  regels vooraf uittekent. Dat is precies wat de agent vervangt. Er komt een
  **Beleid**-scherm voor in de plaats: bedragsgrenzen en welke acties een agent
  zelfstandig mag uitvoeren, per categorie.

## Gevolg voor de positionering

Domio vervangt de vastgoedsoftware van de klant niet, maar komt ernaast te
staan en koppelt eraan. Dat betekent kortere verkoopcycli (niemand hoeft te
migreren) en maakt de integratiepagina een verkoopargument in plaats van
huiswerk.

De landingpage claimt nu "alles in één". Dat wordt "alles voor onderhoud,
gekoppeld aan wat je al hebt".
