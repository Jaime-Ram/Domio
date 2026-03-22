# Domio (Expo)

Mobiele app in dezelfde repo als de Next.js-dashboard. Deel **Supabase** (URL + anon key) met de webapp.

**Expo SDK 54** — past bij **Expo Go** uit de App Store / Play Store. (SDK 55 werkt vaak nog niet met de store-versie van Expo Go; zie [Expo changelog](https://expo.dev/changelog).)

---

## Al gedaan (in deze repo)

- Expo-project met login + tabs, `app.json` (Domio, scheme `domio`), **EAS `projectId`**, `eas.json`
- `mobile/.env.example` als sjabloon voor env-variabelen
- Scripts: `npm start`, `npm run start:tunnel` (in `mobile/`) en vanaf root: `npm run mobile`, `npm run mobile:tunnel`

**Ik kan niet voor jou:** je echte Supabase-keys invullen, inloggen op jouw Expo-account op jouw machine, of je telefoon verbinden — dat doe jij lokaal.

---

## Wat jij doet (Expo Go)

### 1. Telefoon

Installeer **Expo Go** (App Store / Play Store).

### 2. Laptop — env

```bash
cd mobile
cp .env.example .env
```

Open `mobile/.env` en zet **exact dezelfde waarden** als in je webapp (`.env.local`):

| In `mobile/.env`              | Meestal gelijk aan (web)   |
|------------------------------|----------------------------|
| `EXPO_PUBLIC_SUPABASE_URL`   | `NEXT_PUBLIC_SUPABASE_URL` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

Optioneel: `EXPO_PUBLIC_WEB_APP_URL` = je productie- of dev-URL (voor Registreren / Wachtwoord vergeten).

### 3. Dependencies (eenmalig als je `mobile/node_modules` nog niet hebt)

```bash
cd mobile
npm install
```

### 4. Dev server starten

```bash
cd mobile
npx expo start
```

Of vanaf **repository-root**: `npm run mobile`

- **Zelfde Wi‑Fi** als je telefoon → scan de **QR-code** in de terminal.
  - **iOS**: Camera → QR opent Expo Go  
  - **Android**: Expo Go → **Scan QR code**

### 5. Als de QR niet verbindt

Start met tunnel (langzamer, werkt vaker via andere netwerken):

```bash
cd mobile
npm run start:tunnel
```

Of root: `npm run mobile:tunnel`  
Eerste keer kan Expo vragen om **in te loggen** met je Expo-account — dat is normaal.

### 6. In de app

Log in met een **bestaand Supabase-user** (e-mail + wachtwoord). Daarna zie je de tabbalk onderaan.

---

## Wat zit erin

- **Inlogscherm** — zelfde flow/stijl als web (e-mail/wachtwoord, onthouden, groene knop; social = placeholders).
- **Na inloggen** — witte schermen + tabs: Dashboard, Chat, Onderhoud, Documenten, Account (met uitloggen).
- **2FA-e-mail** van de website zit **niet** in deze basis; alleen `signInWithPassword`.

## Deep link

Scheme: **`domio://`** (in `app.json`).

## EAS builds

```bash
cd mobile
npx eas-cli@latest login
npx eas-cli@latest build --platform ios   # of android
```

`projectId` staat al in `app.json` → `extra.eas`.
