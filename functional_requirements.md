## Into

Functional requirements van domio platform.
MoSCoW standard:

- M := Must have
- S := Should have
- C := Could have
- W := Won't have

### 1. Account

- M: Een verhuurder moet kunnen inloggen
- M: Een verhuurder moet kunnen uitloggen
- M: Een verhuurder moet zijn wachtwoord kunnen wijzigen
- M: Een verhuurder moet automatisch naar de verhuurder dashboard worden geleid
- M: Een huurder moet kunnen inloggen
- M: Een huurder moet kunnen uitloggen
- M: Een huurder moet zijn wachtwoord kunnen wijzigen
- M: Een huurder moet automatisch naar de verhuurder dashboard worden geleid

### 2. Pandenbeheer

- M: Een verhuurder moet handmatig een pand kunnen toevoegen (adres, type, aantal eenheden, etc.)
- M: Een verhuurder moet een pand kunnen toevoegen via de AI scan
- M: Een verhuurder moet een pand kunnen wijzigen
- M: Een verhuurder moet een pand kunnen verwijderen
- M: Een verhuurder moet een overzicht kunnen zien van al zijn panden
- M: Een verhuurder moet een overzicht kunnen zien van alle objecten in een pand
- M: Een verhuurder moet handmatig een object kunnen toevoegen
- M: Een verhuurder moet een object kunnen toevoegen via de AI scan
- M: Een verhuurder moet een object kunnen wijzigen
- M: Een verhuurder moet een object kunnen verwijderen
- C: Een verhuurder moet een object van een pand naar een ander pand kunnen overzetten

### 3. Huurdersbeheer

- M: Een verhuurder moet een huurder kunnen toevoegen aan een object
- M: Een verhuurder moet een huurder kunnen toevoegen door een contract in te scannen
- M: Een verhuurder moet de gegevens van een huurder kunnen wijzigen
- M: Een verhuurder moet een huurder kunnen verwijderen / uitschrijven
- M: Een verhuurder moet een overzicht kunnen zien van al zijn huurders
- M: Een verhuurder moet een overzicht kunnen zien van al zijn huurders per pand
- M: Een verhuurder moet een overzicht kunnen zien van al zijn huurders per object
- S: Een verhuurder moet een contract kunnen maken voor een bestaande huurder
- C: Een verhuurder moet een contract kunnen laten ondertekenen door een bestaande huurder

### 4. Onderhoud & Tickets

- M: Een verhuurder moet een ticket kunnen aanmaken voor een pand
- M: Een verhuurder moet een ticket kunnen aanmaken voor een object
- M: Een verhuurder moet een ticket kunnen aanmaken voor een huurder
- M: Een verhuurder moet een overzicht kunnen zien van alle openstaande onderhoudsticktes
- M: Een verhuurder moet de status van een ticket kunnen bijwerken (open, in behandeling, afgerond)
- C: Een verhuurder moet een ticket kunnen toewijzen aan een derde partij (bijv. aannemer)

### 5. Betalingsbeheer

- M: Een verhuurder moet een overzicht kunnen zien van verwachte en ontvangen betalingen
- M: Een verhuurder moet een betaling handmatig kunnen registreren
- M: Een verhuurder moet betaling kunnen wijzigen
- M: Een verhuurder moet kunnen zien welke huurders een betalingsachterstand hebben
- S: Een verhuurder moet een betalingsherinnering kunnen sturen
- C: Een verhuurder moet een loonsverhoging mail kunnen sturen

### 6. Communicatie

- M: Een verhuurder moet vanuit een onderhoudsticket een bericht kunnen sturen naar de betreffende huurder
- M: Een verhuurder moet de communicatiehistorie per ticket kunnen inzien
- M: Een huurder moet een melding ontvangen wanneer de status van zijn ticket wijzigt
- M: Een huurder moet een melding ontvangen wanneer er een bericht wordt gestuurd bij zijn ticket
