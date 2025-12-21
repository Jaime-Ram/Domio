# Dashboard Layout - Domio Vastgoedbeheer

## ✅ Voltooid

### 1. Analyse Document
- **VASTGOEDBEHEER_ANALYSE.md** - Uitgebreide analyse van:
  - Soorten vastgoedbeheerders (Portefeuillebeheerder, Professioneel Beheerder, Hybride)
  - Alle kernfunctionaliteiten (8 hoofdcategorieën)
  - Database schema concepten
  - Dashboard structuur

### 2. Nieuwe Sidebar Component
- **components/dashboard/vastgoed-sidebar.tsx** - Nieuwe sidebar met:
  - ✅ Dashboard (Home)
  - ✅ Portefeuille (Objecten, Eigenaren, Overzicht)
  - ✅ Huurders (Lijst, Nieuw, Portaal)
  - ✅ Contracten (Huurovereenkomsten, Assets, Leveranciers, Templates)
  - ✅ Onderhoud (Tickets, Inspecties, Planning, Leveranciers, MJOP)
  - ✅ Financieel (Betalingen, Facturering, Servicekosten, Indexatie, Inkoop, Rapportages)
  - ✅ Documenten
  - ✅ Instellingen (Portefeuille, Integraties, Gebruikers, Templates, Algemeen)

### 3. Dashboard Integratie
- Sidebar geïntegreerd in `/app/dashboard/employer/page.tsx`
- Responsive design (mobile menu support)
- Active state highlighting
- Nested menu items met icons

## 📋 Dashboard Modules Overzicht

### **Dashboard (Home)**
- KPI cards (Objecten, Bezetting %, Openstaande betalingen, Open tickets)
- Grafieken (Inkomsten trend, Bezetting, Uitgaven)
- Recente activiteiten
- Snelle acties

### **Portefeuille**
1. **Objecten**
   - Lijst alle vastgoedobjecten
   - Objectdetails (gebouw > verdieping > unit)
   - Objectstatus (verhuurd, leegstand, renovatie)
   - Foto's en documenten

2. **Eigenaren** (voor beheer voor derden)
   - Eigenaren/opdrachtgevers beheren
   - Per eigenaar portefeuille
   - Rapportages per eigenaar

3. **Overzicht**
   - Portfolio dashboard
   - KPI's per portefeuille
   - Bezettingsoverzicht

### **Huurders**
1. **Huurderlijst**
   - Alle huurders
   - Filter en zoek
   - Contactgegevens
   - Contractstatus

2. **Nieuwe huurder**
   - Huurder toevoegen formulier
   - Contract direct koppelen

3. **Huurderportaal**
   - Online toegang voor huurders
   - Contracten inzien
   - Betalingen doen
   - Onderhoud melden

### **Contracten**
1. **Huurovereenkomsten**
   - Actieve contracten
   - Verlopen contracten
   - Contractdetails
   - Automatische verlenging

2. **Assetscontracten**
   - Onderhoudscontracten
   - Servicecontracten
   - Verlopen tracking

3. **Leverancierscontracten**
   - Leveranciersovereenkomsten
   - Contractbeheer

4. **Templates**
   - Contract templates
   - Factuur templates
   - E-mail templates

### **Onderhoud**
1. **Tickets**
   - Onderhoudsverzoeken
   - Prioritering
   - Status tracking
   - Toewijzing

2. **Inspecties**
   - Periodieke inspecties
   - Inspectierapporten
   - Foto's en notities

3. **Planning**
   - Preventief onderhoud
   - Onderhoudsplanning
   - Budgettering

4. **Leveranciers**
   - Onderhoudsleveranciers
   - Contactgegevens
   - Contracten

5. **MJOP**
   - Meerjarenonderhoudsplan
   - Budgetplanning
   - Analyse

### **Financieel**
1. **Betalingen**
   - Inkomende betalingen
   - Openstaande bedragen
   - Betalingshistorie
   - Automatische matching

2. **Facturering**
   - Huurfacturen
   - Automatische generatie
   - PDF verzending
   - Factuurhistorie

3. **Servicekosten**
   - Servicekostenafrekening
   - Voorschot vs. werkelijke kosten
   - Afrekening per huurder

4. **Indexatie**
   - Automatische huurprijsindexatie
   - CPI berekening
   - Indexatiebrieven

5. **Inkoopfacturen**
   - Leveranciersfacturen
   - OCR scanning
   - Goedkeuring (vierogenprincipe)
   - Koppeling aan objecten

6. **Rapportages**
   - Financiële overzichten
   - Cashflow
   - Winst/verlies
   - Export Excel/PDF

### **Documenten**
- Documentbibliotheek
- Gedeelde mappen
- Recente documenten
- Versiebeheer
- Toegangsrechten

### **Instellingen**
1. **Portefeuille**
   - Algemene instellingen
   - Facturatie instellingen
   - Indexatie instellingen

2. **Integraties**
   - Boekhoudkoppeling (Exact, AFAS, Moneybird)
   - Bankkoppeling (Bizcuit)
   - Ondertekenen.nl
   - CBS Data

3. **Gebruikers & Rechten**
   - Teamleden
   - Rollen en rechten
   - SSO configuratie

4. **Templates**
   - Contract templates
   - Factuur templates
   - E-mail templates

5. **Algemeen**
   - Account instellingen
   - Notificaties
   - Taal en regio

## 🎯 Volgende Stappen

### Fase 1: Database Schema (Supabase)
1. Tabellen aanmaken:
   - `portfolios` - Portefeuilles
   - `properties` - Vastgoedobjecten
   - `tenants` - Huurders
   - `leases` - Huurovereenkomsten
   - `maintenance_requests` - Onderhoudsverzoeken
   - `inspections` - Inspecties
   - `invoices` - Facturen
   - `payments` - Betalingen
   - `purchase_invoices` - Inkoopfacturen
   - `contracts` - Contracten
   - `documents` - Documenten
   - `owners` - Eigenaren

2. Relaties definiëren
3. RLS policies instellen
4. Indexen toevoegen

### Fase 2: Core Functionaliteiten
1. Portefeuille & Objectbeheer
2. Huurderbeheer
3. Contractbeheer
4. Basis financiële functionaliteit

### Fase 3: Geavanceerde Features
1. Automatische facturering
2. Indexatie
3. Servicekostenafrekening
4. Onderhoudsmodule
5. Integraties

## 📁 Bestanden

- `VASTGOEDBEHEER_ANALYSE.md` - Uitgebreide analyse
- `components/dashboard/vastgoed-sidebar.tsx` - Nieuwe sidebar component
- `app/dashboard/employer/page.tsx` - Dashboard met nieuwe sidebar
- `DASHBOARD_LAYOUT.md` - Dit document

## 🚀 Klaar voor Implementatie

De dashboard layout is nu compleet en klaar om te gebruiken. Alle modules zijn gedefinieerd en de navigatie is geïmplementeerd. We kunnen nu beginnen met het bouwen van de functionaliteiten in Supabase!


