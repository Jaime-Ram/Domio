import { Hr, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, emailStyles } from './_components/layout'
import { CtaButton } from './_components/button'

interface TicketStatusChangedEmailProps {
  tenantName: string
  ticketTitle: string
  ticketNumber: number | null
  fromStatus: string
  toStatus: string
  propertyLabel: string
  message?: string | null
  portalUrl: string
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_behandeling: 'In behandeling',
  gepland: 'Gepland',
  afgerond: 'Afgerond',
  geannuleerd: 'Geannuleerd',
}

const STATUS_COLORS: Record<string, string> = {
  open: '#6b7280',
  in_behandeling: '#2563eb',
  gepland: '#7c3aed',
  afgerond: '#16a34a',
  geannuleerd: '#dc2626',
}

export default function TicketStatusChangedEmail({
  tenantName,
  ticketTitle,
  ticketNumber,
  fromStatus,
  toStatus,
  propertyLabel,
  message,
  portalUrl,
}: TicketStatusChangedEmailProps) {
  const firstName = tenantName.split(' ')[0]
  const toLabel = STATUS_LABELS[toStatus] ?? toStatus
  const toColor = STATUS_COLORS[toStatus] ?? '#163300'
  const numberTag = ticketNumber ? `#${ticketNumber} · ` : ''

  const isDone = toStatus === 'afgerond'
  const headline = isDone ? 'Je ticket is afgerond' : `Status gewijzigd: ${toLabel}`
  const intro = isDone
    ? `Je onderhoudsverzoek voor <strong>${propertyLabel}</strong> is afgerond.`
    : `De status van je ticket bij <strong>${propertyLabel}</strong> is bijgewerkt.`

  return (
    <EmailLayout preview={`${ticketTitle} — nu: ${toLabel}`}>

      <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '13px', margin: '0 0 16px' }}>
        Hoi {firstName},
      </Text>

      <Text style={emailStyles.h1}>
        {headline}
      </Text>

      <Text
        style={emailStyles.body}
        dangerouslySetInnerHTML={{ __html: intro }}
      />

      {/* Status change block */}
      <Section style={{
        backgroundColor: '#f8f8f8',
        borderRadius: '8px',
        padding: '20px 24px',
        margin: '0 0 28px',
        textAlign: 'left',
      }}>
        <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px', textAlign: 'left' }}>
          {numberTag}{ticketTitle}
        </Text>
        <Text style={{ fontSize: '14px', color: '#555555', margin: '0 0 4px', fontFamily: emailStyles.font, textAlign: 'left' }}>
          Vorige status:{' '}
          <span style={{ color: STATUS_COLORS[fromStatus] ?? '#888888', fontWeight: '600' }}>
            {STATUS_LABELS[fromStatus] ?? fromStatus}
          </span>
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: '700', color: toColor, margin: 0, fontFamily: emailStyles.font, textAlign: 'left' }}>
          Nieuwe status: {toLabel}
        </Text>
      </Section>

      {message && (
        <Section style={{
          borderLeft: '3px solid #9FE870',
          paddingLeft: '16px',
          margin: '0 0 28px',
          textAlign: 'left',
        }}>
          <Text style={{ ...emailStyles.body, color: '#444444', fontSize: '14px', margin: 0, textAlign: 'left', fontStyle: 'italic' }}>
            "{message}"
          </Text>
        </Section>
      )}

      <Section style={{ margin: '0 0 32px' }}>
        <CtaButton href={portalUrl}>
          Bekijk je ticket
        </CtaButton>
      </Section>

      <Hr style={emailStyles.divider} />

      <Text style={emailStyles.small}>
        Je ontvangt dit bericht omdat de status van je ticket is gewijzigd in Domio.
      </Text>

    </EmailLayout>
  )
}

TicketStatusChangedEmail.PreviewProps = {
  tenantName: 'Piet Jansen',
  ticketTitle: 'Dakgoot verstopt',
  ticketNumber: 1042,
  fromStatus: 'open',
  toStatus: 'in_behandeling',
  propertyLabel: 'Adriaan Pauwstraat 3, Amsterdam',
  message: 'We plannen een monteur in voor volgende week.',
  portalUrl: 'https://domiovastgoedbeheer.nl/dashboard/tenant/tickets',
} satisfies TicketStatusChangedEmailProps
