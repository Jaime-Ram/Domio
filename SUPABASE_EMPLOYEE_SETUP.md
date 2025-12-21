# Supabase Employee Database Setup - Stap voor Stap

## 📋 Wat moet je doen?

Je moet het `EMPLOYEE_DATABASE.sql` bestand kopiëren en uitvoeren in de Supabase SQL Editor.

---

## 🚀 Stap-voor-Stap Instructies

### Stap 1: Open Supabase Dashboard
1. Ga naar [https://app.supabase.com](https://app.supabase.com)
2. Log in met je account
3. Selecteer je ServeSync project

### Stap 2: Open SQL Editor
1. Klik in het linker menu op **"SQL Editor"** (of **"SQL"**)
2. Klik op **"+ New query"** of **"New query"** om een nieuwe query te maken

### Stap 3: Kopieer het SQL Script
1. Open het bestand `EMPLOYEE_DATABASE.sql` in je project
2. **Selecteer ALLES** (Cmd+A / Ctrl+A)
3. **Kopieer** het volledige bestand (Cmd+C / Ctrl+C)

### Stap 4: Plak en Voer Uit
1. **Plak** het gekopieerde SQL script in de Supabase SQL Editor (Cmd+V / Ctrl+V)
2. Controleer of alle code zichtbaar is
3. Klik op **"Run"** of druk op **Cmd+Enter** / **Ctrl+Enter**

### Stap 5: Controleer Resultaat
Je zou een succesbericht moeten zien zoals:
- ✅ "Success. No rows returned"
- Of een lijst met tabellen die zijn aangemaakt

---

## 📁 Welk Bestand?

**Bestandsnaam:** `EMPLOYEE_DATABASE.sql`  
**Locatie:** In de root van je ServeSync2 project

Dit bestand bevat:
- ✅ `employee_availability` tabel (voor beschikbaarheid)
- ✅ `work_hours` tabel (voor gewerkte uren)
- ✅ `employee_bank_accounts` tabel (voor rekeninggegevens)
- ✅ Alle benodigde indexes en security policies

---

## ⚠️ Belangrijk

### Als je al eerder database tabellen hebt aangemaakt:
Het script gebruikt `CREATE TABLE IF NOT EXISTS`, dus het is veilig om meerdere keren uit te voeren. Bestaande tabellen worden niet overschreven.

### Als je fouten krijgt:
1. **Controleer of je de juiste database gebruikt** (je ServeSync project)
2. **Zorg dat je alle code hebt gekopieerd** (van regel 1 tot het einde)
3. **Kijk naar de foutmelding** - deze geeft aan wat er mis is

### Veelvoorkomende fouten:
- **"relation already exists"** → Dit is OK, de tabel bestaat al
- **"permission denied"** → Controleer of je de juiste rechten hebt
- **"syntax error"** → Controleer of je alles hebt gekopieerd

---

## ✅ Verificatie

Na het uitvoeren kun je controleren of alles werkt:

### In Supabase Dashboard:
1. Ga naar **"Table Editor"** in het linker menu
2. Je zou de volgende tabellen moeten zien:
   - ✅ `employee_availability`
   - ✅ `work_hours`
   - ✅ `employee_bank_accounts`

### Of voer deze query uit in SQL Editor:
```sql
-- Check of tabellen bestaan
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('employee_availability', 'work_hours', 'employee_bank_accounts');
```

Je zou 3 rijen moeten zien (één voor elke tabel).

---

## 🔄 Als je ook de basis tabellen nodig hebt

Als je nog niet de basis database hebt aangemaakt (user_profiles, payments, etc.), voer dan EERST uit:
1. `SUPABASE_SQL.sql` - Voor de basis tabellen
2. Daarna `EMPLOYEE_DATABASE.sql` - Voor employee specifieke tabellen

---

## 📞 Hulp Nodig?

Als je problemen hebt:
1. Controleer de foutmelding in Supabase
2. Zorg dat je alle code hebt gekopieerd
3. Probeer het opnieuw - het script is idempotent (veilig om meerdere keren uit te voeren)

---

## ✨ Klaar!

Na het uitvoeren van het script:
- ✅ Alle tabellen zijn aangemaakt
- ✅ Security policies zijn ingesteld
- ✅ Je kunt direct het employee dashboard gebruiken
- ✅ Werknemers kunnen hun beschikbaarheid, uren en rekeninggegevens beheren




