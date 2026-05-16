import { Hr, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, emailStyles } from './_components/layout'
import { CtaButton } from './_components/button'

interface TicketSubmittedEmailProps {
  landlordName: string
  tenantName: string
  ticketTitle: string
  ticketNumber: number | null
  propertyLabel: string
  category: string
  description?: string | null
  dashboardUrl: string
}

const CATEGORY_LABELS: Record<string, string> = {
  onderhoud: 'Onderhoud',
  inspectie: 'Inspectie',
  klacht: 'Klacht',
  compliance: 'Compliance',
  huurgebeurtenis: 'Huurgebeurtenis',
}

export default function TicketSubmittedEmail({
  landlordName,
  tenantName,
  ticketTitle,
  ticketNumber,
  propertyLabel,
  category,
  description,
  dashboardUrl,
}: TicketSubmittedEmailProps) {
  const firstName = landlordName.split(' ')[0]
  const categoryLabel = CATEGORY_LABELS[category] ?? category
  const numberTag = ticketNumber ? `#${ticketNumber} · ` : ''

  return (
    <EmailLayout preview={`Nieuw ticket van ${tenantName}: ${ticketTitle}`}>

      <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '13px', margin: '0 0 16px' }}>
        Hoi {firstName},
      </Text>

      <Text style={emailStyles.h1}>
        Nieuw ticket ingediend
      </Text>

      <Text style={emailStyles.body}>
        <strong style={{ color: '#111111' }}>{tenantName}</strong> heeft een ticket ingediend voor{' '}
        <strong style={{ color: '#111111' }}>{propertyLabel}</strong>.
      </Text>

      {/* Ticket summary block */}
      <Section style={{
        backgroundColor: '#f8f8f8',
        borderRadius: '8px',
        padding: '20px 24px',
        margin: '0 0 28px',
        textAlign: 'left',
      }}>
        <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px', textAlign: 'left' }}>
          {numberTag}{categoryLabel}
        </Text>
        <Text style={{ ...emailStyles.h1, fontSize: '18px', margin: '0 0 12px', textAlign: 'left' }}>
          {ticketTitle}
        </Text>
        {description && (
          <Text style={{ ...emailStyles.body, color: '#666666', fontSize: '14px', margin: 0, textAlign: 'left' }}>
            {description}
          </Text>
        )}
      </Section>

      <Section style={{ margin: '0 0 32px' }}>
        <CtaButton href={dashboardUrl}>
          Bekijk ticket
        </CtaButton>
      </Section>

      <Hr style={emailStyles.divider} />

      <Text style={emailStyles.small}>
        Je ontvangt dit bericht omdat een huurder een ticket heeft ingediend in Domio.
      </Text>

    </EmailLayout>
  )
}

TicketSubmittedEmail.PreviewProps = {
  landlordName: 'Jaime Blok',
  tenantName: 'Piet Jansen',
  ticketTitle: 'Dakgoot verstopt',
  ticketNumber: 1042,
  propertyLabel: 'Adriaan Pauwstraat 3, Amsterdam',
  category: 'onderhoud',
  description: 'De dakgoot loopt over bij regen en het water sijpelt langs de muur naar binnen.',
  dashboardUrl: 'https://domiovastgoedbeheer.nl/dashboard/landlord/maintenance',
} satisfies TicketSubmittedEmailProps
