import { Hr, Text, Section, Link } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, emailStyles } from './_components/layout'
import { CtaButton } from './_components/button'

interface TenantInviteEmailProps {
  tenantName: string
  landlordName: string
  propertyAddress: string
  portalUrl: string
  magicLinkUrl?: string | null
  expiresInHours?: number
}

export default function TenantInviteEmail({
  tenantName,
  landlordName,
  propertyAddress,
  portalUrl,
  magicLinkUrl,
  expiresInHours = 72,
}: TenantInviteEmailProps) {
  const firstName = tenantName.split(' ')[0]

  return (
    <EmailLayout preview={`${landlordName} heeft je uitgenodigd voor ${propertyAddress}`}>

      <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '13px', margin: '0 0 16px' }}>
        Hoi {firstName},
      </Text>

      <Text style={emailStyles.h1}>
        Er staat een uitnodiging voor je klaar
      </Text>

      <Text style={emailStyles.body}>
        <strong style={{ color: '#111111' }}>{landlordName}</strong> heeft je uitgenodigd om toegang te krijgen tot je huurinformatie voor{' '}
        <strong style={{ color: '#111111' }}>{propertyAddress}</strong>.
      </Text>

      <Section style={{ margin: '32px 0 16px' }}>
        <CtaButton href={portalUrl}>
          Account aanmaken
        </CtaButton>
      </Section>

      {/* Magic link optie — URL wordt ingevuld zodra magic links zijn geïmplementeerd */}
      <Text style={{ ...emailStyles.small, margin: '0 0 32px' }}>
        {magicLinkUrl ? (
          <Link
            href={magicLinkUrl}
            style={{ color: '#aaaaaa', textDecoration: 'underline', fontFamily: emailStyles.font }}
          >
            Ik maak liever geen gebruik van Domio en bekijk mijn info graag zonder account
          </Link>
        ) : (
          <span style={{ color: '#cccccc' }}>
            Ik maak liever geen gebruik van Domio en bekijk mijn info graag zonder account
          </span>
        )}
      </Text>

      <Hr style={emailStyles.divider} />

      <Text style={emailStyles.small}>
        Link is {expiresInHours} uur geldig. Werkt de knop niet? Kopieer:
      </Text>
      <Text style={emailStyles.monoLink}>{portalUrl}</Text>

    </EmailLayout>
  )
}

TenantInviteEmail.PreviewProps = {
  tenantName: 'Piet Jansen',
  landlordName: 'Jaime Blok',
  propertyAddress: 'Keizersgracht 123, Amsterdam',
  portalUrl: 'https://domiovastgoedbeheer.nl/portal/abc123',
  magicLinkUrl: null,
  expiresInHours: 72,
} satisfies TenantInviteEmailProps
