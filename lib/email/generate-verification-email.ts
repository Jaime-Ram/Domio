/**
 * Generate verification email HTML with Untitled UI styling
 * This function replaces placeholders in the email template with actual values
 */

interface EmailVariables {
  userName: string
  userEmail: string
  verificationUrl: string
  logoUrl?: string
  phoneMockupUrl?: string
  appStoreUrl?: string
  googlePlayUrl?: string
  homeUrl?: string
  blogUrl?: string
  tutorialUrl?: string
  supportUrl?: string
  unsubscribeUrl?: string
  managePreferencesUrl?: string
  twitterUrl?: string
  facebookUrl?: string
  instagramUrl?: string
}

export function generateVerificationEmail(variables: EmailVariables): string {
  const {
    userName,
    userEmail,
    verificationUrl,
    logoUrl = 'https://your-domain.com/images/DomioLogo.png',
    phoneMockupUrl = 'https://your-domain.com/images/phone-mockup.png',
    appStoreUrl = 'https://apps.apple.com/app/domio',
    googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.domio',
    homeUrl = 'https://your-domain.com',
    blogUrl = 'https://your-domain.com/blog',
    tutorialUrl = 'https://your-domain.com/tutorial',
    supportUrl = 'https://your-domain.com/support',
    unsubscribeUrl = 'https://your-domain.com/unsubscribe',
    managePreferencesUrl = 'https://your-domain.com/preferences',
    twitterUrl = 'https://twitter.com/domio',
    facebookUrl = 'https://facebook.com/domio',
    instagramUrl = 'https://instagram.com/domio',
  } = variables

  const currentYear = new Date().getFullYear()

  // Read the template (in a real implementation, you'd read from file system)
  // For Supabase, we'll provide the template HTML directly
  const template = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Domio</title>
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
            color: #163300;
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
            background-color: #163300;
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #356258;
        }
        .closing {
            font-size: 16px;
            color: #0F172A;
            margin-top: 24px;
        }
        .app-promo {
            margin: 40px 0;
            padding: 32px 24px;
            background: linear-gradient(135deg, #E6F5F2 0%, #CCEBE5 100%);
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
            color: #163300;
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
                <img src="${logoUrl}" alt="Domio Logo" />
                <span>Domio</span>
            </div>
            <div class="nav">
                <a href="${homeUrl}">Home</a>
                <a href="${blogUrl}">Blog</a>
                <a href="${tutorialUrl}">Tutorial</a>
                <a href="${supportUrl}">Support</a>
            </div>
        </div>

        <div class="content">
            <div class="greeting">Hi ${userName},</div>
            
            <div class="message">
                We're glad to have you onboard! You're already on your way to managing your payments and team more efficiently.
            </div>
            
            <div class="message">
                To get started, please verify your email address by clicking the button below. Once verified, you'll have full access to all Domio features.
            </div>

            <a href="${verificationUrl}" class="cta-button">Verify Email Address</a>

            <div class="closing">
                Thanks,<br>
                The Domio Team
            </div>

            <div class="app-promo">
                <div class="app-promo-title">We hebben ook een mobiele app!</div>
                <div class="app-promo-text">
                    Download de Domio app voor iOS en Android en beheer je betalingen en team onderweg.
                </div>
                
                <div class="phone-mockup">
                    <img src="${phoneMockupUrl}" alt="Domio Mobile App" />
                </div>

                <div class="app-buttons">
                    <a href="${appStoreUrl}" class="app-button">
                        <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1289433600" alt="Download on the App Store" style="height: 20px; width: auto;" />
                    </a>
                    <a href="${googlePlayUrl}" class="app-button">
                        <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" style="height: 20px; width: auto;" />
                    </a>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="footer-links">
                This email was sent to ${userEmail}. If you'd rather not receive this kind of email, you can 
                <a href="${unsubscribeUrl}">unsubscribe</a> or 
                <a href="${managePreferencesUrl}">manage your email preferences</a>.
            </div>
            
            <div style="margin-top: 16px; color: #475569;">
                © ${currentYear} Domio, 100 Smith Street, Melbourne VIC 3000
            </div>

            <div class="footer-bottom">
                <div class="logo-section">
                    <img src="${logoUrl}" alt="Domio" />
                    <span>Domio</span>
                </div>
                <div class="social-icons">
                    <a href="${twitterUrl}">
                        <img src="https://cdn.simpleicons.org/x/000000" alt="Twitter" class="social-icon" />
                    </a>
                    <a href="${facebookUrl}">
                        <img src="https://cdn.simpleicons.org/facebook/000000" alt="Facebook" class="social-icon" />
                    </a>
                    <a href="${instagramUrl}">
                        <img src="https://cdn.simpleicons.org/instagram/000000" alt="Instagram" class="social-icon" />
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`

  return template
}




