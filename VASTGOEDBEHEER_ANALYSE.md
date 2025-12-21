# Vastgoedbeheer Analyse - Domio

## Soorten Vastgoedbeheerders

### 1. **Portefeuillebeheerder (Vastgoedhouder)**
- Beheert eigen vastgoedportefeuille
- Directe eigenaar van panden
- Beheert huurders, contracten en financiën zelf
- **Behoefte**: Overzicht van eigen portefeuille, financiële inzichten, huurderbeheer

### 2. **Professioneel Vastgoedbeheerder (Beheerder voor derden)**
- Beheert vastgoed voor meerdere eigenaren/opdrachtgevers
- Werkt voor externe klanten (eigenaren)
- Moet per klant/portefeuille gescheiden werken
- **Behoefte**: Multi-tenant systeem, klantportalen, transparantie, rapportage per eigenaar

### 3. **Hybride Beheerder**
- Beheert zowel eigen vastgoed als vastgoed van derden
- Combinatie van beide bovenstaande typen
- **Behoefte**: Flexibel systeem dat beide modi ondersteunt

## Kernfunctionaliteiten Vastgoedbeheer

### 📋 **1. Portefeuille & Objectbeheer**
- **Panden/Units beheer**
  - Objecten toevoegen (gebouwen, verdiepingen, units)
  - Hiërarchische structuur (gebouw > verdieping > unit)
  - Objectdetails (oppervlakte, type, status, foto's)
  - Objectstatus (verhuurd, leegstand, in renovatie)
  
- **Portefeuille overzicht**
  - Dashboard met KPI's per portefeuille
  - Bezettingsoverzicht
  - Waarde-inschatting
  - Portfolio splitsing (eigen vs. beheer voor derden)

### 👥 **2. Huurderbeheer**
- **Huurderprofielen**
  - Contactgegevens
  - Contracthistorie
  - Betalingsgeschiedenis
  - Communicatie log
  
- **Huurderportaal**
  - Online toegang voor huurders
  - Contracten inzien
  - Betalingen doen
  - Onderhoud melden
  - Documenten downloaden

### 📄 **3. Contracten & Documenten**
- **Huurovereenkomsten**
  - Contracten aanmaken en beheren
  - Automatische verlenging/opzegging
  - Contractvoorwaarden template library
  - Digitaal ondertekenen (integratie met Ondertekenen.nl)
  
- **Assets- en leverancierscontracten**
  - Onderhoudscontracten
  - Servicecontracten
  - Leveranciersovereenkomsten
  - Contractverlopen tracking
  
- **Documentbeheer**
  - Centrale documentopslag
  - Versiebeheer
  - Toegangsrechten per gebruiker/rol
  - Document templates

### 🔧 **4. Onderhoud & Ticketsysteem**
- **Onderhoudsverzoeken**
  - Meldingen van huurders
  - Prioritering (urgent, normaal, gepland)
  - Toewijzing aan onderhoudsmedewerkers/leveranciers
  - Status tracking (open, in behandeling, afgerond)
  - Foto's en documenten bijvoegen
  
- **Inspectiemodule**
  - Periodieke inspecties plannen
  - Inspectierapporten
  - Foto's en notities
  - Follow-up acties
  
- **Onderhoudsplanning**
  - Preventief onderhoud
  - MJOP (Meerjarenonderhoudsplan)
  - Budgettering
  - Leveranciersbeheer

### 💰 **5. Financieel Beheer**
- **Huurfacturering**
  - Automatische huurfacturen genereren
  - Maandelijkse/jaarlijkse facturen
  - Factuurhistorie
  - PDF generatie en verzending
  
- **Betalingen**
  - Betalingen ontvangen en registreren
  - Automatische betalingsverwerking (SEPA, iDEAL)
  - Openstaande bedragen tracking
  - Betalingsherinneringen (automatisch)
  
- **Servicekostenafrekening**
  - Servicekosten berekenen en afrekenen
  - Voorschot vs. werkelijke kosten
  - Afrekening per huurder
  - Transparante kostenverdeling
  
- **Indexeren**
  - Automatische huurprijsindexatie
  - CPI berekening
  - Indexatiebrieven genereren
  - Verlopen contracten tracking
  
- **Inkoopfacturen**
  - Leveranciersfacturen scannen (OCR)
  - Facturen goedkeuren (vierogenprincipe)
  - Facturen koppelen aan objecten/onderhoud
  - Boekhoudkoppeling (Exact, AFAS, Moneybird)
  
- **Financiële rapportage**
  - Inkomsten vs. uitgaven
  - Cashflow overzicht
  - Winst/verlies per object/portefeuille
  - Belastingrapportages

### 🔐 **6. Data & Toegang**
- **Single Sign-On (SSO)**
  - Centrale authenticatie
  - Integratie met externe systemen
  
- **Vierogenprincipe**
  - Goedkeuringsworkflows
  - Dubbele controle voor belangrijke acties
  - Audit trail
  
- **Rol- en rechtenbeheer**
  - Verschillende rollen (beheerder, eigenaar, huurder, accountant)
  - Granulaire toegangsrechten
  - Per portefeuille/object rechten

### 🔗 **7. Integraties**
- **Boekhoudkoppeling**
  - Exact Online
  - AFAS
  - Moneybird
  - Automatische export van transacties
  
- **Bankkoppeling**
  - Bizcuit integratie
  - Automatische bankafschrift import
  - Betalingen matchen
  
- **CBS Data**
  - Indexatiecijfers
  - Marktdata
  
- **Ondertekenen.nl**
  - Digitaal contracten ondertekenen
  - E-handtekeningen

### 📊 **8. Rapportage & Analytics**
- **Dashboard KPI's**
  - Bezetting percentage
  - Gemiddelde huurprijs
  - Openstaande betalingen
  - Onderhoudskosten
  - ROI per object
  
- **Rapportages**
  - Maandelijkse/jaarlijkse rapporten
  - Rapportages per eigenaar (voor beheer voor derden)
  - Export naar Excel/PDF
  - Custom rapportages

## Dashboard Layout Structuur

### **Hoofdnavigatie (Sidebar)**

#### **Dashboard** (Home)
- Overzicht KPI's
- Recente activiteiten
- Snelle acties
- Grafieken (bezetting, inkomsten, uitgaven)

#### **Portefeuille**
- **Objecten**
  - Lijst alle objecten
  - Objectdetails
  - Objectstatus
- **Eigenaren** (voor beheer voor derden)
  - Eigenaren/opdrachtgevers
  - Per eigenaar portefeuille
  - Rapportages per eigenaar

#### **Huurders**
- Huurderlijst
- Huurderdetails
- Contracten per huurder
- Betalingshistorie
- Communicatie

#### **Contracten**
- Huurovereenkomsten
- Assetscontracten
- Leverancierscontracten
- Verlopen tracking
- Templates

#### **Onderhoud**
- Tickets/Verzoeken
- Inspecties
- Onderhoudsplanning
- Leveranciers
- MJOP

#### **Financieel**
- **Betalingen**
  - Inkomende betalingen
  - Openstaande bedragen
  - Betalingshistorie
- **Facturering**
  - Huurfacturen
  - Servicekostenafrekeningen
  - Indexatiebrieven
- **Inkoop**
  - Inkoopfacturen
  - Leveranciers
  - Goedkeuringen
- **Rapportages**
  - Financiële overzichten
  - Cashflow
  - Winst/verlies

#### **Documenten**
- Documentbibliotheek
- Gedeelde mappen
- Recente documenten
- Templates

#### **Instellingen**
- **Portefeuille instellingen**
  - Algemene instellingen
  - Facturatie instellingen
  - Indexatie instellingen
- **Integraties**
  - Boekhoudkoppeling
  - Bankkoppeling
  - Ondertekenen.nl
- **Gebruikers & Rechten**
  - Teamleden
  - Rollen en rechten
  - SSO configuratie
- **Templates**
  - Contract templates
  - Factuur templates
  - E-mail templates

### **Dashboard Widgets (Homepage)**

1. **KPI Cards (Top Row)**
   - Totaal objecten
   - Bezetting %
   - Openstaande betalingen
   - Open tickets

2. **Grafieken (Middle)**
   - Inkomsten trend (laatste 12 maanden)
   - Bezetting over tijd
   - Uitgaven breakdown (categorieën)

3. **Recente Activiteiten (Right Sidebar)**
   - Nieuwe betalingen
   - Nieuwe tickets
   - Verlopen contracten
   - Aankomende inspecties

4. **Snelle Acties (Bottom)**
   - Nieuwe huurder toevoegen
   - Factuur genereren
   - Ticket aanmaken
   - Contract verlengen

## Database Schema Concepten

### **Core Entities**
- `portfolios` - Portefeuilles (eigen of voor derden)
- `properties` - Vastgoedobjecten (gebouwen, units)
- `tenants` - Huurders
- `leases` - Huurovereenkomsten
- `maintenance_requests` - Onderhoudsverzoeken
- `inspections` - Inspecties
- `invoices` - Facturen (huur, servicekosten)
- `payments` - Betalingen
- `purchase_invoices` - Inkoopfacturen
- `contracts` - Assets- en leverancierscontracten
- `documents` - Documenten
- `owners` - Eigenaren (voor beheer voor derden)

### **Relaties**
- Portfolio → Properties (1:N)
- Property → Tenants (1:N via leases)
- Tenant → Leases (1:N)
- Lease → Invoices (1:N)
- Property → Maintenance Requests (1:N)
- Property → Inspections (1:N)
- Invoice → Payments (1:N)
- Property → Contracts (1:N)

## Volgende Stappen

1. ✅ Analyse compleet
2. ⏭️ Dashboard layout implementeren
3. ⏭️ Supabase schema ontwerpen
4. ⏭️ Database tabellen aanmaken
5. ⏭️ Functionaliteiten stap voor stap bouwen


