import { Hr, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, emailStyles } from './_components/layout'
import { CtaButton } from './_components/button'

interface TenantInviteEmailProps {
  tenantName: string
  landlordName: string
  propertyAddress: string
  portalUrl: string
  expiresInHours?: number
}

export default function TenantInviteEmail({
  tenantName,
  landlordName,
  propertyAddress,
  portalUrl,
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

      <Section style={{ margin: '32px 0 24px' }}>
        <CtaButton href={portalUrl}>
          Bekijk uitnodiging
        </CtaButton>
      </Section>

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
  expiresInHours: 72,
} satisfies TenantInviteEmailProps
