import { Hr, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, emailStyles } from './_components/layout'
import { CtaButton } from './_components/button'

interface TicketReplyEmailProps {
  recipientName: string
  senderName: string
  ticketTitle: string
  ticketNumber: number | null
  messageContent: string
  portalUrl: string
  direction: 'landlord_to_tenant' | 'tenant_to_landlord'
}

export default function TicketReplyEmail({
  recipientName,
  senderName,
  ticketTitle,
  ticketNumber,
  messageContent,
  portalUrl,
  direction,
}: TicketReplyEmailProps) {
  const firstName = recipientName.split(' ')[0]
  const numberTag = ticketNumber ? `#${ticketNumber} · ` : ''
  const isFromLandlord = direction === 'landlord_to_tenant'

  return (
    <EmailLayout preview={`${senderName} heeft gereageerd: ${messageContent.slice(0, 60)}`}>

      <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '13px', margin: '0 0 16px' }}>
        Hoi {firstName},
      </Text>

      <Text style={emailStyles.h1}>
        {isFromLandlord ? 'Reactie van je verhuurder' : 'Reactie van huurder'}
      </Text>

      <Text style={emailStyles.body}>
        <strong style={{ color: '#111111' }}>{senderName}</strong> heeft gereageerd op{' '}
        <strong style={{ color: '#111111' }}>{numberTag}{ticketTitle}</strong>.
      </Text>

      {/* Message block */}
      <Section style={{
        backgroundColor: '#f8f8f8',
        borderRadius: '8px',
        borderLeft: '3px solid #9FE870',
        padding: '16px 20px',
        margin: '0 0 28px',
        textAlign: 'left',
      }}>
        <Text style={{ ...emailStyles.body, color: '#333333', fontSize: '15px', margin: 0, textAlign: 'left', fontStyle: 'italic' }}>
          "{messageContent}"
        </Text>
      </Section>

      <Section style={{ margin: '0 0 32px' }}>
        <CtaButton href={portalUrl}>
          {isFromLandlord ? 'Bekijk reactie' : 'Bekijk ticket'}
        </CtaButton>
      </Section>

      <Hr style={emailStyles.divider} />

      <Text style={emailStyles.small}>
        Je ontvangt dit bericht omdat er een reactie is geplaatst op een ticket in Domio.
      </Text>

    </EmailLayout>
  )
}

TicketReplyEmail.PreviewProps = {
  recipientName: 'Piet Jansen',
  senderName: 'Jaime Blok',
  ticketTitle: 'Dakgoot verstopt',
  ticketNumber: 1042,
  messageContent: 'We plannen een monteur in voor volgende week donderdag. Kun je thuis zijn tussen 9 en 12?',
  portalUrl: 'https://domiovastgoedbeheer.nl/dashboard/tenant/tickets',
  direction: 'landlord_to_tenant',
} satisfies TicketReplyEmailProps
