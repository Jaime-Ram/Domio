import { Hr, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, emailStyles } from './_components/layout'
import { CtaButton } from './_components/button'

interface TicketAssignedEmailProps {
  assigneeName: string
  assignedByName: string
  ticketTitle: string
  ticketNumber: number | null
  category: string | null
  priority: string
  dashboardUrl: string
}

const PRIORITY_NL: Record<string, string> = {
  urgent: 'Spoed', hoog: 'Hoog', normaal: 'Normaal', laag: 'Laag',
}

export default function TicketAssignedEmail({
  assigneeName,
  assignedByName,
  ticketTitle,
  ticketNumber,
  category,
  priority,
  dashboardUrl,
}: TicketAssignedEmailProps) {
  const firstName = assigneeName.split(' ')[0]
  const numberTag = ticketNumber ? `#${ticketNumber} · ` : ''

  return (
    <EmailLayout preview={`Ticket aan jou toegewezen: ${ticketTitle}`}>

      <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '13px', margin: '0 0 16px' }}>
        Hoi {firstName},
      </Text>

      <Text style={emailStyles.h1}>
        Ticket aan jou toegewezen
      </Text>

      <Text style={emailStyles.body}>
        <strong style={{ color: '#111111' }}>{assignedByName}</strong> heeft een ticket aan jou toegewezen.
      </Text>

      <Section style={{
        backgroundColor: '#f8f8f8',
        borderRadius: '8px',
        padding: '20px 24px',
        margin: '0 0 28px',
        textAlign: 'left',
      }}>
        <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px', textAlign: 'left' }}>
          {numberTag}{category ?? 'Ticket'}
        </Text>
        <Text style={{ ...emailStyles.h1, fontSize: '18px', margin: '0 0 10px', textAlign: 'left' }}>
          {ticketTitle}
        </Text>
        <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '13px', margin: 0, textAlign: 'left' }}>
          Prioriteit: <strong style={{ color: '#111111' }}>{PRIORITY_NL[priority] ?? priority}</strong>
        </Text>
      </Section>

      <Section style={{ margin: '0 0 32px' }}>
        <CtaButton href={dashboardUrl}>
          Bekijk ticket
        </CtaButton>
      </Section>

      <Hr style={emailStyles.divider} />

      <Text style={emailStyles.small}>
        Je ontvangt dit bericht omdat een ticket aan jou is toegewezen in Domio.
      </Text>

    </EmailLayout>
  )
}

TicketAssignedEmail.PreviewProps = {
  assigneeName: 'Jaime Blok',
  assignedByName: 'Jaime Blok',
  ticketTitle: 'Dakgoot verstopt',
  ticketNumber: 1042,
  category: 'onderhoud',
  priority: 'hoog',
  dashboardUrl: 'https://domiovastgoedbeheer.nl/dashboard/landlord/maintenance',
} satisfies TicketAssignedEmailProps
