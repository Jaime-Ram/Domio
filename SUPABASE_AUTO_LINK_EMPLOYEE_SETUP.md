# Automatisch Koppelen van Werknemers aan Werkgevers

## Probleem
Wanneer een werknemer (employee) zich aanmeldt en het email adres van zijn werkgever (employer) invult, wordt alleen de `employer_email` opgeslagen. De `employer_id` wordt niet automatisch gekoppeld, waardoor de werkgever de werknemer niet direct kan zien in zijn dashboard of gebruiken voor shifts.

## Oplossing
Een database trigger die automatisch de `employer_id` koppelt wanneer een werknemer wordt aangemaakt of geüpdatet met een `employer_email` die overeenkomt met een bestaande werkgever.

## Stap 1: Voer het SQL Script uit

1. Ga naar je Supabase Dashboard
2. Navigeer naar **SQL Editor**
3. Open het bestand `SUPABASE_AUTO_LINK_EMPLOYEE_EMPLOYER.sql`
4. Kopieer en plak de volledige SQL code
5. Klik op **Run** om het script uit te voeren

## Wat doet het script?

1. **Functie `auto_link_employee_to_employer()`**:
   - Controleert of een nieuwe/geüpdatete record een employee is met een `employer_email` maar geen `employer_id`
   - Zoekt de werkgever op basis van de `employer_email`
   - Koppelt automatisch de `employer_id` als er een match is

2. **Trigger `trigger_auto_link_employee_to_employer`**:
   - Wordt automatisch uitgevoerd VOOR elke INSERT of UPDATE op `user_profiles`
   - Zorgt ervoor dat nieuwe employees direct worden gekoppeld

3. **Update bestaande records**:
   - Koppelt alle bestaande employees die al een `employer_email` hebben maar nog geen `employer_id`

4. **Indexes**:
   - Voegt indexes toe voor betere performance bij het zoeken op `employer_email` en `employer_id`

## Stap 2: Testen

1. Maak een nieuw werknemer account aan via de signup pagina
2. Vul het email adres van een bestaande werkgever in
3. Log in als die werkgever
4. Ga naar het dashboard
5. De werknemer zou nu automatisch zichtbaar moeten zijn in:
   - De lijst met werknemers
   - De rooster/schedule pagina
   - De opties voor het aanmaken van shifts

## Hoe het werkt

### Voor nieuwe werknemers:
1. Werknemer meldt zich aan en vult `employer_email` in
2. Database trigger detecteert dat `employer_email` is ingevuld maar `employer_id` is NULL
3. Trigger zoekt de werkgever op basis van `employer_email`
4. Trigger koppelt automatisch de `employer_id`
5. Werkgever ziet de werknemer direct in zijn dashboard

### Voor bestaande werknemers:
- Het script update alle bestaande employees die al een `employer_email` hebben maar nog geen `employer_id`
- Deze worden automatisch gekoppeld aan hun werkgever

## Voordelen

✅ **Automatisch**: Geen handmatige actie nodig van de werkgever  
✅ **Direct zichtbaar**: Werknemers zijn direct beschikbaar voor shifts  
✅ **Consistent**: Alle werknemers hebben zowel `employer_email` als `employer_id`  
✅ **Performance**: Indexes zorgen voor snelle queries  

## Opmerkingen

- Als er geen werkgever gevonden wordt met het opgegeven email adres, wordt een waarschuwing gelogd maar wordt de werknemer nog steeds aangemaakt
- De werknemer kan later handmatig worden gekoppeld door de werkgever via de "Werknemer Uitnodigen" functie
- De trigger werkt ook bij updates, dus als een werknemer later een `employer_email` toevoegt, wordt deze automatisch gekoppeld




