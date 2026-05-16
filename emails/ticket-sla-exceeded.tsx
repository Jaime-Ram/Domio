import { Hr, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, emailStyles } from './_components/layout'
import { CtaButton } from './_components/button'

interface TicketSlaExceededEmailProps {
  landlordName: string
  ticketTitle: string
  ticketNumber: number | null
  priority: string
  hoursOverdue: number
  propertyLabel: string
  dashboardUrl: string
}

const PRIORITY_NL: Record<string, string> = {
  urgent: 'Spoed', hoog: 'Hoog', normaal: 'Normaal', laag: 'Laag',
}

export default function TicketSlaExceededEmail({
  landlordName,
  ticketTitle,
  ticketNumber,
  priority,
  hoursOverdue,
  propertyLabel,
  dashboardUrl,
}: TicketSlaExceededEmailProps) {
  const firstName = landlordName.split(' ')[0]
  const numberTag = ticketNumber ? `#${ticketNumber} · ` : ''
  const overdueLabel = hoursOverdue >= 24
    ? `${Math.floor(hoursOverdue / 24)} dag${Math.floor(hoursOverdue / 24) === 1 ? '' : 'en'}`
    : `${hoursOverdue} uur`

  return (
    <EmailLayout preview={`SLA overschreden: ${ticketTitle} — ${overdueLabel} te laat`}>

      <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '13px', margin: '0 0 16px' }}>
        Hoi {firstName},
      </Text>

      <Text style={emailStyles.h1}>
        SLA-tijd overschreden
      </Text>

      <Text style={emailStyles.body}>
        Een ticket voor <strong style={{ color: '#111111' }}>{propertyLabel}</strong> heeft de responstijd voor prioriteit{' '}
        <strong style={{ color: '#111111' }}>{PRIORITY_NL[priority] ?? priority}</strong> overschreden.
      </Text>

      {/* Alert block */}
      <Section style={{
        backgroundColor: '#fff5f5',
        borderRadius: '8px',
        borderLeft: '3px solid #ef4444',
        padding: '16px 20px',
        margin: '0 0 28px',
        textAlign: 'left',
      }}>
        <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px', textAlign: 'left' }}>
          {numberTag}SLA OVERSCHREDEN
        </Text>
        <Text style={{ ...emailStyles.h1, fontSize: '18px', margin: '0 0 8px', textAlign: 'left', color: '#111111' }}>
          {ticketTitle}
        </Text>
        <Text style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444', margin: 0, fontFamily: emailStyles.font, textAlign: 'left' }}>
          {overdueLabel} te laat
        </Text>
      </Section>

      <Section style={{ margin: '0 0 32px' }}>
        <CtaButton href={dashboardUrl}>
          Bekijk ticket
        </CtaButton>
      </Section>

      <Hr style={emailStyles.divider} />

      <Text style={emailStyles.small}>
        Je ontvangt dit bericht omdat de SLA-tijd voor dit ticket is overschreden.
      </Text>

    </EmailLayout>
  )
}

TicketSlaExceededEmail.PreviewProps = {
  landlordName: 'Jaime Blok',
  ticketTitle: 'Dakgoot verstopt',
  ticketNumber: 1042,
  priority: 'hoog',
  hoursOverdue: 6,
  propertyLabel: 'Adriaan Pauwstraat 3, Amsterdam',
  dashboardUrl: 'https://domiovastgoedbeheer.nl/dashboard/landlord/maintenance',
} satisfies TicketSlaExceededEmailProps
