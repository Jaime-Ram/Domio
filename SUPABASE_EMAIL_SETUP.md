# Supabase Custom Email Template Setup

Deze guide legt uit hoe je de custom ServeSync email verificatie template instelt in Supabase.

## Stap 1: Upload Afbeeldingen

### 1.1 Logo Upload
1. Upload je logo naar een publiek toegankelijke locatie:
   - Optie A: Upload naar `public/images/logo.png` in je Next.js project
   - Optie B: Upload naar een CDN (bijv. Cloudinary, AWS S3, of Supabase Storage)
   - Optie C: Gebruik een absolute URL naar je logo

2. Noteer de URL van je logo (bijv. `https://your-domain.com/images/logo.png`)

### 1.2 Phone Mockup Upload
1. Maak een iPhone mockup van je app (gebruik tools zoals:
   - [Mockuphone](https://mockuphone.com/)
   - [Screenshots.pro](https://screenshots.pro/)
   - [AppMockup](https://app-mockup.com/)
   
2. Upload de mockup naar een publiek toegankelijke locatie
3. Noteer de URL (bijv. `https://your-domain.com/images/phone-mockup.png`)

### 1.3 App Icon
Je `Appicon.png` kan gebruikt worden in de mockup of als favicon in de email.

## Stap 2: Supabase Dashboard Configuratie

### 2.1 Ga naar Email Templates
1. Log in op je [Supabase Dashboard](https://app.supabase.com)
2. Selecteer je project
3. Ga naar **Authentication** > **Email Templates**
4. Klik op **Confirm signup** template

### 2.2 Configureer de Template

Kopieer de HTML template uit `lib/email/templates/verification-email.html` en pas de volgende variabelen aan:

**Vervang deze placeholders:**
- `{{LOGO_URL}}` → Je logo URL
- `{{PHONE_MOCKUP_URL}}` → Je phone mockup URL
- `{{USER_NAME}}` → `{{ .UserMetaData.full_name }}` of `{{ .Email }}`
- `{{USER_EMAIL}}` → `{{ .Email }}`
- `{{VERIFICATION_URL}}` → `{{ .ConfirmationURL }}`
- `{{HOME_URL}}` → `https://your-domain.com`
- `{{BLOG_URL}}` → `https://your-domain.com/blog`
- `{{TUTORIAL_URL}}` → `https://your-domain.com/tutorial`
- `{{SUPPORT_URL}}` → `https://your-domain.com/support`
- `{{APP_STORE_URL}}` → Je App Store link (bijv. `https://apps.apple.com/app/servesync`)
- `{{GOOGLE_PLAY_URL}}` → Je Google Play link (bijv. `https://play.google.com/store/apps/details?id=com.servesync`)
- `{{UNSUBSCRIBE_URL}}` → `https://your-domain.com/unsubscribe`
- `{{MANAGE_PREFERENCES_URL}}` → `https://your-domain.com/preferences`
- `{{CURRENT_YEAR}}` → `{{ .Year }}` of gewoon `2025`
- `{{TWITTER_URL}}` → Je Twitter/X link
- `{{FACEBOOK_URL}}` → Je Facebook link
- `{{INSTAGRAM_URL}}` → Je Instagram link

### 2.3 Supabase Template Variabelen

Supabase gebruikt Go template syntax. Hier zijn de beschikbare variabelen:

- `{{ .Email }}` - Gebruiker email
- `{{ .ConfirmationURL }}` - Verificatie link
- `{{ .Token }}` - Verificatie token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Je site URL (geconfigureerd in Settings)
- `{{ .RedirectTo }}` - Redirect URL na verificatie
- `{{ .UserMetaData.full_name }}` - Volledige naam (als opgeslagen in metadata)

## Stap 3: Complete Template (Kopieer dit)

Hier is de complete template met Supabase variabelen:

```html
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ServeSync</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #0F172A;
            background-color: #F8FAFC;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
        }
        .header {
            padding: 24px;
            border-bottom: 1px solid #E2E8F0;
        }
        .nav {
            display: flex;
            gap: 24px;
            margin-top: 16px;
        }
        .nav a {
            color: #0F172A;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
        }
        .nav a:hover {
            color: #675AFF;
        }
        .content {
            padding: 40px 24px;
        }
        .greeting {
            font-size: 16px;
            color: #0F172A;
            margin-bottom: 16px;
        }
        .message {
            font-size: 16px;
            color: #475569;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .cta-button {
            display: inline-block;
            margin: 24px 0;
            padding: 12px 24px;
            background-color: #675AFF;
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #3A2DF4;
        }
        .closing {
            font-size: 16px;
            color: #0F172A;
            margin-top: 24px;
        }
        .app-promo {
            margin: 40px 0;
            padding: 32px 24px;
            background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);
            border-radius: 12px;
            text-align: center;
        }
        .app-promo-title {
            font-size: 24px;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 12px;
        }
        .app-promo-text {
            font-size: 16px;
            color: #475569;
            margin-bottom: 24px;
        }
        .phone-mockup {
            margin: 24px 0;
            text-align: center;
        }
        .phone-mockup img {
            max-width: 200px;
            height: auto;
            border-radius: 24px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        .app-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 24px;
        }
        .app-button {
            display: inline-block;
            padding: 12px 20px;
            background-color: #0F172A;
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        .app-button:hover {
            background-color: #1E293B;
        }
        .app-button img {
            vertical-align: middle;
            margin-right: 8px;
        }
        .footer {
            padding: 24px;
            border-top: 1px solid #E2E8F0;
            font-size: 12px;
            color: #94A3B8;
        }
        .footer-links {
            margin: 16px 0;
        }
        .footer-links a {
            color: #675AFF;
            text-decoration: underline;
        }
        .footer-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #E2E8F0;
        }
        .logo-section {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .logo-section img {
            width: 24px;
            height: 24px;
        }
        .logo-section span {
            font-weight: 600;
            color: #0F172A;
            font-size: 14px;
        }
        .social-icons {
            display: flex;
            gap: 12px;
        }
        .social-icon {
            width: 24px;
            height: 24px;
            opacity: 0.6;
        }
        .social-icon:hover {
            opacity: 1;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 24px 16px;
            }
            .app-buttons {
                flex-direction: column;
            }
            .app-button {
                width: 100%;
            }
            .footer-bottom {
                flex-direction: column;
                gap: 16px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-section">
                <img src="https://your-domain.com/images/logo.png" alt="ServeSync Logo" />
                <span>ServeSync</span>
            </div>
            <div class="nav">
                <a href="https://your-domain.com">Home</a>
                <a href="https://your-domain.com/blog">Blog</a>
                <a href="https://your-domain.com/tutorial">Tutorial</a>
                <a href="https://your-domain.com/support">Support</a>
            </div>
        </div>

        <div class="content">
            <div class="greeting">Hi {{ if .UserMetaData.full_name }}{{ .UserMetaData.full_name }}{{ else }}{{ .Email }}{{ end }},</div>
            
            <div class="message">
                We're glad to have you onboard! You're already on your way to managing your payments and team more efficiently.
            </div>
            
            <div class="message">
                To get started, please verify your email address by clicking the button below. Once verified, you'll have full access to all ServeSync features.
            </div>

            <a href="{{ .ConfirmationURL }}" class="cta-button">Verify Email Address</a>

            <div class="closing">
                Thanks,<br>
                The ServeSync Team
            </div>

            <div class="app-promo">
                <div class="app-promo-title">We hebben ook een mobiele app!</div>
                <div class="app-promo-text">
                    Download de ServeSync app voor iOS en Android en beheer je betalingen en team onderweg.
                </div>
                
                <div class="phone-mockup">
                    <img src="https://your-domain.com/images/phone-mockup.png" alt="ServeSync Mobile App" />
                </div>

                <div class="app-buttons">
                    <a href="https://apps.apple.com/app/servesync" class="app-button">
                        <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1289433600" alt="Download on the App Store" style="height: 20px; width: auto;" />
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=com.servesync" class="app-button">
                        <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" style="height: 20px; width: auto;" />
                    </a>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="footer-links">
                This email was sent to {{ .Email }}. If you'd rather not receive this kind of email, you can 
                <a href="https://your-domain.com/unsubscribe">unsubscribe</a> or 
                <a href="https://your-domain.com/preferences">manage your email preferences</a>.
            </div>
            
            <div style="margin-top: 16px; color: #475569;">
                © 2025 ServeSync, 100 Smith Street, Melbourne VIC 3000
            </div>

            <div class="footer-bottom">
                <div class="logo-section">
                    <img src="https://your-domain.com/images/logo.png" alt="ServeSync" />
                    <span>ServeSync</span>
                </div>
                <div class="social-icons">
                    <a href="https://twitter.com/servesync">
                        <img src="https://cdn.simpleicons.org/x/000000" alt="Twitter" class="social-icon" />
                    </a>
                    <a href="https://facebook.com/servesync">
                        <img src="https://cdn.simpleicons.org/facebook/000000" alt="Facebook" class="social-icon" />
                    </a>
                    <a href="https://instagram.com/servesync">
                        <img src="https://cdn.simpleicons.org/instagram/000000" alt="Instagram" class="social-icon" />
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

## Stap 4: Subject Line

Voor de **Subject** regel, gebruik:
```
Verify your ServeSync account
```

Of:
```
Welcome to ServeSync - Verify your email
```

## Stap 5: Testen

1. Maak een test account aan via je signup pagina
2. Check je email inbox (en spam folder)
3. Verifieer dat:
   - Logo correct wordt weergegeven
   - Phone mockup zichtbaar is
   - App Store en Google Play links werken
   - Verificatie link werkt
   - Styling correct is op desktop en mobile

## Stap 6: Custom SMTP (Optioneel)

Als je je eigen SMTP server wilt gebruiken (voor betere deliverability):

1. Ga naar **Settings** > **Auth** > **SMTP Settings**
2. Configureer je SMTP provider (SendGrid, Mailgun, AWS SES, etc.)
3. De email templates blijven hetzelfde werken

## Troubleshooting

### Afbeeldingen worden niet weergegeven
- Zorg dat je afbeeldingen publiek toegankelijk zijn (niet achter authenticatie)
- Gebruik absolute URLs (begin met `https://`)
- Test de URLs in een browser voordat je ze in de template plakt

### Email wordt niet verzonden
- Check je Supabase project settings
- Verifieer dat email verificatie is ingeschakeld
- Check je spam folder
- Test met een andere email provider

### Styling ziet er anders uit
- Veel email clients ondersteunen niet alle CSS
- Test in verschillende email clients (Gmail, Outlook, Apple Mail)
- Gebruik inline styles waar mogelijk (de template gebruikt al veel inline styles)

## Extra: Phone Mockup Maken

Om een professionele iPhone mockup te maken:

1. **Screenshot van je app** (als je die al hebt)
2. **Mockup tool gebruiken:**
   - [Mockuphone](https://mockuphone.com/) - Gratis, eenvoudig
   - [Screenshots.pro](https://screenshots.pro/) - Betaald, professioneel
   - [AppMockup](https://app-mockup.com/) - Gratis templates

3. **Design tool:**
   - Figma met mockup templates
   - Photoshop met mockup templates
   - Canva met app mockup templates

4. **Upload naar:**
   - Je Next.js `public/images/` folder
   - Of een CDN service

## App Store Links

Wanneer je app live is, vervang de placeholder links:

- **App Store:** `https://apps.apple.com/app/servesync` (of je echte app ID)
- **Google Play:** `https://play.google.com/store/apps/details?id=com.servesync` (of je echte package name)

Tot die tijd kun je de links leeg laten of verwijzen naar een "Coming Soon" pagina.




