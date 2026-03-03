# Supabase Auth Email Templates – Domio

Uniforme email-design voor alle Supabase-auth e-mails, in lijn met ons onboarding-design en design system.

## Installatie

1. Ga naar [Supabase Dashboard](https://supabase.com/dashboard) → je project
2. **Authentication** → **Email Templates**
3. Koppel elk bestand aan het juiste Supabase-template in de linkerkolom:

   | Supabase-template (in dashboard) | Bestand              | Subject                     |
   |---------------------------------|----------------------|-----------------------------|
   | **Confirm signup**              | `confirm-signup.html`   | Bevestig je e-mailadres     |
   | **Magic Link**                  | `magic-link.html`       | Log in op Domio             |
   | **Recovery** (Reset Password)   | `reset-password.html`   | Wachtwoord opnieuw instellen |
   | **Change Email Address**        | `change-email.html`     | Bevestig je nieuwe e-mailadres |
   | **Invite user**                 | `invite-user.html`      | Je bent uitgenodigd voor Domio |

4. Kopieer voor elk template de HTML uit het bestand naar het content-veld
5. Controleer **URL Configuration**: Site URL zonder trailing slash (bijv. `https://domio.nl`)
6. **Logo**: Zet `DomioLogo.png` in `public/images/` zodat het bereikbaar is op `{{ .SiteURL }}/images/DomioLogo.png`

### Waar staat wat in Supabase?

In de Email Templates-pagina zie je links de lijst met templates. **Magic Link** heet letterlijk zo in Supabase – daar plak je de inhoud van `magic-link.html`. **Recovery** is de "Reset Password"-e-mail. **Change Email Address** is de "Bevestig je nieuwe e-mailadres"-mail.

## Design tokens (Domio)

- **Primary (Forest Green):** `#163300` – tekst, focus
- **Accent (Bright Green):** `#9FE870` – primary buttons
- **Primary hover:** `#356258`
- **Text:** `#0F172A` (midnight), `#475569` (slate)
- **Border:** `#E2E8F0`
- **Background:** `#F8FAFC` (body), `#FFFFFF` (container)
- **Radius:** 1rem (block), 9999px (pill buttons)

## Supabase template variables

- `{{ .ConfirmationURL }}` – link om de actie te voltooien
- `{{ .Email }}` – e-mailadres van de gebruiker
- `{{ .SiteURL }}` – site-URL (configureer in Auth settings)
- `{{ .RedirectTo }}` – redirect na bevestiging
- `{{ .Token }}` – 6-digit OTP (alternatief voor link)
- `{{ .NewEmail }}` – nieuw e-mailadres (Change email only)
- `{{ .Data }}` – user metadata (bijv. `{{ .Data.full_name }}`)
