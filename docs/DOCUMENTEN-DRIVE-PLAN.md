# Plan: Documenten Drive — Upload + Gegenereerde PDF’s

## Doel

1. **Uploads**: Gebruikers kunnen documenten uploaden (PDF, Word, etc.) naar de Drive, met preview waar mogelijk.
2. **Gegenereerde documenten**: Domio genereert standaard-PDF’s (o.a. huurcontract, puntentelling) en slaat ze op in de Drive.

---

## 1. Database

De tabel `documents` heeft al: `id`, `owner_id`, `property_id`, `name`, `type`, `file_name`, `mime_type`, `extracted_data`, `created_at`, `updated_at`.

**Uitbreiding (migratie):**

| Kolom           | Type    | Toelichting |
|-----------------|--------|-------------|
| `storage_path`  | `text` | Pad in Supabase Storage, bijv. `{owner_id}/{document_id}/bestand.pdf`. Verplicht voor bestanden die we tonen/downloaden. |
| `source`        | `text` | `'upload'` of `'generated'`. Bepaalt of het bestand door de gebruiker is geüpload of door Domio gegenereerd. |
| `template_type` | `text` | Optioneel. Bij `source = 'generated'`: welk template, bijv. `'huurcontract'`, `'puntentelling_wws'`. |

- Bestaande rijen: `storage_path` en `source` nullable; later backfill of alleen voor nieuwe documenten verplicht.
- RLS blijft zoals nu (alleen eigen documenten).

---

## 2. Supabase Storage

- **Bucket**: `documents` (private).
- **Structuur**: `{owner_id}/{document_id}/{file_name}` zodat:
  - Per eigenaar geïsoleerd.
  - Document-id gelijk aan de rij in `documents` (na insert).
- **Policies**: 
  - Select (download): alleen als `auth.uid() = owner_id` (owner_id uit path of uit metadata).
  - Insert: alleen eigen `owner_id`-pad.
  - Delete: alleen eigen pad.

Omdat path `owner_id` bevat, kunnen we in de policy de eerste segment van het path gebruiken, of we slaan metadata op het object op. Alternatief: per-owner prefix en policy op `storage.objects` met `bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text`.

---

## 3. Upload-flow

1. **Frontend**: Bestand kiezen (PDF, .docx, etc.) → aanroep API (bijv. `POST /api/documents/upload`) met `FormData` (file + metadata: type, property_id, naam).
2. **API**:
   - Auth check (session).
   - Optioneel: bestandsgrootte/type-whitelist.
   - Insert in `documents` (zonder `storage_path`) → krijg `id`.
   - Upload naar Storage: path `{owner_id}/{id}/{original_name}`.
   - Update `documents`: `storage_path`, `file_name`, `mime_type`, `source = 'upload'`.
   - Optioneel: bij type Factuur, na upload `POST /api/documents/extract` aanroepen en `extracted_data` bijwerken.
3. **Download/Preview**: 
   - Signed URL ophalen via API (bijv. `GET /api/documents/[id]/url?action=download`) die met service role of server client een signed URL uit Storage genereert (met expiry), of een proxy-route die de bytes streamt.
   - Frontend: open in nieuw tab (download) of toon in iframe/embed (preview).

---

## 4. Preview

- **PDF**: 
  - Optie A: signed URL in `<iframe src="..." />` of `<embed>` (eenvoudig).
  - Optie B: `react-pdf` voor ingebouwde viewer (meer controle, geen signed URL in src nodig als we via proxy streamen).
- **Word (.docx)**: 
  - Geen native browser-preview. Keuzes: (1) alleen icoon + “Bekijken” = download; (2) server-side converteren naar PDF (bijv. LibreOffice headless of cloud service) en die PDF tonen. Eerst (1), later (2) als gewenst.
- **Overige**: icoon + download.

---

## 5. Gegenereerde documenten (Domio → PDF)

- **Huidige situatie**: Puntentelling WWS wordt al als HTML gegenereerd in `lib/pdf/generate-wws-pdf.ts`; nu client-side “print” (HTML in nieuw venster + print-dialog).
- **Gewenste situatie**: 
  - Server-side PDF maken en opslaan in Storage + rij in `documents` met `source = 'generated'`, `template_type = 'puntentelling_wws'`.
  - Zelfde patroon voor o.a. standaard huurcontract.

**Technische opties voor PDF van HTML:**

| Optie | Voor | Tegen |
|-------|------|--------|
| **Puppeteer/Playwright** | HTML → PDF op server,zelfde templates | Extra dependency, mogelijk Docker/Node runtime |
| **@react-pdf/renderer** | Geen browser, licht | Andere “template”-taal dan onze huidige HTML |
| **Bestaande HTML + print** | Geen server-PDF; gebruiker print/save | Geen opslag in Drive, geen echte “ gegenereerd document” in lijst |

**Aanbeveling**: Eerst **Puppeteer** (of Playwright) in een API-route: bestaande HTML (WWS) en later huurcontract-HTML als input, render → PDF buffer → upload naar Storage → insert/update `documents`. Als je geen headless browser wilt, kan een externe “HTML to PDF” API gebruikt worden.

**Flow gegenereerd document:**

1. Gebruiker vraagt “Genereer huurcontract” (bij een unit/tenant/lease) of “Bewaar puntentelling als PDF”.
2. API-route (bijv. `POST /api/documents/generate`) met body `{ template: 'huurcontract' | 'puntentelling_wws', context: { lease_id, unit_id, ... } }`.
3. Server haalt data op (lease, tenant, property, …), vult HTML-template, maakt PDF (Puppeteer), uploadt naar Storage, maakt rij in `documents` met `source = 'generated'`, `template_type`, `storage_path`.
4. Response: document-id + eventueel signed URL; frontend kan tonen in Drive en preview openen.

---

## 6. Templates tegenereerde documenten

- **Puntentelling WWS**: Bestaande `generateWWSHTML()` in `lib/pdf/generate-wws-pdf.ts` hergebruiken; server-side aanroepen, HTML → PDF → Storage.
- **Standaard huurcontract**: Nieuw template (HTML of React-PDF), velden: verhuurder, huurder, adres, periode, huur, borg, etc. Data uit `leases`, `tenants`, `units`, `properties`.

Later uitbreidbaar: plaatsbeschrijving, opzegbrief, etc.

---

## 7. Implementatie-volgorde (voorstel)

1. **Migratie**: `storage_path`, `source`, `template_type` op `documents`; Types (TypeScript) bijwerken.
2. **Storage**: Bucket `documents` aanmaken + RLS/policies in Supabase Dashboard (of migratie).
3. **Upload API**: `POST /api/documents/upload` (multipart) → insert document → upload naar Storage → update document. Optioneel extract voor Factuur.
4. **URL API**: `GET /api/documents/[id]/url` (signed URL) of proxy voor download/preview.
5. **Drive-pagina**: Upload-knop, na upload lijst verversen; “Bekijken” opent signed URL (iframe voor PDF, download voor overige).
6. **Preview-component**: PDF in iframe of react-pdf; Word/overige = icoon + download.
7. **Generate API**: `POST /api/documents/generate` met template + context; WWS eerst (bestaande HTML → Puppeteer → Storage → document).
8. **UI “Genereer document”**: Bij puntentelling “Download PDF” uitbreiden met “Opslaan in Drive”; bij huurcontract “Genereer en opslaan”.

Daarna: huurcontract-template toevoegen en koppelen aan generate-API.

---

## 8. Samenvatting

| Onderdeel | Aanpak |
|-----------|--------|
| **Opslag** | Supabase Storage bucket `documents`, path `{owner_id}/{document_id}/{filename}` |
| **DB** | `documents.storage_path`, `source` ('upload' \| 'generated'), `template_type` (optioneel) |
| **Upload** | API upload → Storage + document-row; eventueel extract voor facturen |
| **Preview** | PDF: iframe/signed URL (of react-pdf); Word: download; rest: download |
| **Gegenereerde PDF’s** | Server-side HTML → PDF (Puppeteer) → Storage → document met source='generated' |
| **Templates** | Puntentelling: bestaande HTML; Huurcontract: nieuw HTML-template met lease/tenant/property data |

Als je wilt, kan de volgende stap zijn: migratie-bestand toevoegen en de upload-API + Storage bucket (inclusief policies) concreet uitwerken.
