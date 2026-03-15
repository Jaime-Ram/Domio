# Rechtspersonen en organen voor objecten

Objecten (panden) kunnen vallen onder verschillende **rechtspersonen** (BV, stichting, VvE, etc.) of **organen** (bijv. een fonds of portefeuille binnen een rechtspersoon). Dit document beschrijft het datamodel en gebruik.

## Datamodel

- **`legal_entities`** (rechtspersonen)  
  Naam, KvK, BTW, adres, etc. Optioneel `parent_id`: een orgaan is een kind van een rechtspersoon (bijv. “Fonds Noord” onder “BV Beheer”).

- **`profile_legal_entities`**  
  Koppeltabel: welke gebruiker (profile) mag welke rechtspersoon beheren. Een gebruiker kan aan meerdere rechtspersonen gekoppeld zijn (rol: beheerder, eigenaar, medewerker).

- **`properties.legal_entity_id`**  
  Elk object kan aan één rechtspersoon (of orgaan) gekoppeld worden. Leeg = bestaand gedrag (alleen `owner_id`).

## Toegang

- Een gebruiker ziet objecten van rechtspersonen waaraan hij in `profile_legal_entities` gekoppeld is.
- Bestaande objecten met alleen `owner_id` blijven zichtbaar voor die eigenaar (backwards compatibility).
- Nieuwe objecten kunnen bij aanmaak een `legal_entity_id` meekrijgen; de ingelogde gebruiker moet aan die rechtspersoon gekoppeld zijn.

## Gebruik in de app

1. **Rechtspersonen beheren**  
   Instellingen of een apart scherm waar de gebruiker rechtspersonen aanmaakt. Na aanmaak direct een rij in `profile_legal_entities` toevoegen (profile_id = huidige user, legal_entity_id = nieuw id), zodat de maker toegang houdt.

2. **Object toewijzen**  
   Bij aanmaken/bewerken van een pand: dropdown/select met rechtspersonen (en eventueel organen) waar de gebruiker toegang toe heeft. Waarde opslaan in `properties.legal_entity_id`.

3. **Filteren op Objecten-pagina**  
   Optioneel filter “Rechtspersoon” toevoegen zodat je alleen objecten van één gekozen rechtspersoon/orgaan ziet.

## Migratie

Voer de migratie uit:

```bash
# Supabase CLI
supabase db push
```

Of voer het bestand handmatig uit in de SQL Editor van het Supabase-dashboard:

`lib/supabase/migrations/20260314_legal_entities_and_organs.sql`

Daarna in de app:

- Queries voor objecten uitbreiden met `legal_entity_id` en eventueel join op `legal_entities`.
- Bij create property: na insert van een nieuwe `legal_entity` direct een rij in `profile_legal_entities` aanmaken voor de huidige gebruiker.
