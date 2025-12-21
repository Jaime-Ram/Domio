# Supabase: Unieke Email Adressen

Om te zorgen dat elk email adres maar één keer gebruikt kan worden, voer dit uit in Supabase.

## 🔧 Stap 1: Voeg Unique Constraint toe aan email kolom

Ga naar **Supabase Dashboard → SQL Editor** en voer dit uit:

```sql
-- Voeg unique constraint toe aan email kolom
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Maak een index voor betere performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_email_unique 
ON public.user_profiles(email);
```

Klik op **Run**. Je zou "Success" moeten zien.

## 🔍 Verifieer

Voer dit uit om te checken of de constraint is toegevoegd:

```sql
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
AND constraint_type = 'UNIQUE';
```

Je zou moeten zien:
- ✅ `user_profiles_email_unique` constraint

## ✅ Wat gebeurt er nu?

1. **Database niveau**: De database voorkomt dat er twee profielen met hetzelfde email worden aangemaakt
2. **Applicatie niveau**: De applicatie controleert ook of het email al bestaat voordat het een account aanmaakt
3. **Duidelijke error**: Gebruikers krijgen een duidelijke melding als ze een email gebruiken dat al bestaat

## 🧪 Test

1. Maak een account aan met email: `test@voorbeeld.nl`
2. Probeer nog een account aan te maken met hetzelfde email
3. Je zou een error moeten zien: "Dit e-mailadres is al geregistreerd"

## 📝 Notities

- De constraint werkt op database niveau, dus zelfs als iemand de applicatie omzeilt, kan er geen duplicate email worden aangemaakt
- Email adressen worden automatisch naar lowercase geconverteerd en getrimd
- De applicatie controleert zowel in `user_profiles` als in `auth.users` voor extra zekerheid




