# ServeSync Email Verificatie Template Setup

## Stap 1: Supabase Email Template Configureren

1. Ga naar je Supabase Dashboard
2. Navigeer naar **Authentication** > **Email Templates**
3. Selecteer **Confirm signup** template
4. Vervang de standaard template met de volgende configuratie:

### Email Subject
```
Bevestig je email adres voor ServeSync
```

### Email Body (HTML)

**Belangrijk:** De template gebruikt `{{ .UserMetaData.full_name }}` om de naam op te halen die tijdens de registratie is ingevoerd. Als de naam niet beschikbaar is, wordt "Gebruiker" gebruikt als fallback.

Gebruik deze inline HTML template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bevestig je email adres</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; background-color: #F8FAFC;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #675AFF; border-radius: 8px 8px 0 0;">
          <tr>
            <td style="padding: 32px 24px 24px;">
              <img src="https://servesync.nl/logo.png" alt="ServeSync" width="120" height="32" style="display: block;" />
            </td>
          </tr>
        </table>
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 32px 24px;">
              <p style="font-size: 16px; line-height: 24px; color: #0F172A; margin: 0 0 16px 0;">
                Hallo {{ if .UserMetaData.full_name }}{{ .UserMetaData.full_name }}{{ else }}Gebruiker{{ end }},
              </p>
              <p style="font-size: 16px; line-height: 24px; color: #0F172A; margin: 0 0 16px 0;">
                Welkom bij ServeSync! We zijn blij dat je je hebt aangemeld.
              </p>
              <p style="font-size: 16px; line-height: 24px; color: #0F172A; margin: 0 0 16px 0;">
                Om je account te activeren, moet je eerst je email adres bevestigen. Klik op de onderstaande knop om je email te verifiëren.
              </p>
              <p style="font-size: 16px; line-height: 24px; color: #0F172A; margin: 0 0 32px 0;">
                Als je deze email niet hebt aangevraagd, kun je deze negeren.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #675AFF; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Bevestig email adres
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #F8FAFC; border-radius: 0 0 8px 8px;">
          <tr>
            <td style="padding: 32px 24px;">
              <p style="font-size: 12px; line-height: 16px; color: #475569; margin: 0;">
                ServeSync - Betalingsbeheerplatform voor de Nederlandse horeca<br />
                © 2024 ServeSync. Alle rechten voorbehouden.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Alternatief:** Als je Supabase's custom email templates ondersteunt met externe URLs, kun je ook deze URL gebruiken:
```
https://jouw-domein.nl/api/email/verification?userName={{ if .UserMetaData.full_name }}{{ .UserMetaData.full_name }}{{ else }}Gebruiker{{ end }}&verificationUrl={{ .ConfirmationURL }}
```

## Stap 2: Supabase Email Settings

1. Ga naar **Authentication** > **Settings**
2. Zorg ervoor dat **Enable email confirmations** is ingeschakeld
3. Configureer je **Site URL** (bijv. `https://servesync.nl`)
4. Configureer **Redirect URLs** om de verificatie redirect te bepalen

## Stap 3: Testen

1. Maak een nieuw account aan via de signup pagina
2. Controleer je email inbox
3. Klik op de verificatie link
4. Je zou moeten worden doorgestuurd naar je dashboard

## Opmerkingen

- De template gebruikt ServeSync branding kleuren (#675AFF)
- De template is volledig in het Nederlands
- De template is responsive en werkt op mobiele apparaten
- Vervang `https://servesync.nl/logo.png` met je daadwerkelijke logo URL

