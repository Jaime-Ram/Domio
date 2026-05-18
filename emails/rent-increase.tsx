import { Hr, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, emailStyles } from './_components/layout'
import { CtaButton } from './_components/button'

interface RentIncreaseEmailProps {
  tenantName: string
  landlordName: string
  propertyAddress: string
  oldRent: number
  newRent: number
  percentage: number
  effectiveDate: string
  method: 'cpi' | 'cpi_plus' | 'fixed'
  cpiYear?: number
  cpiMonth?: number
  portalUrl: string
}

const MONTH_NL = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december']

function formatEur(amount: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)
}

function methodLabel(method: RentIncreaseEmailProps['method'], cpiYear?: number, cpiMonth?: number) {
  const period = cpiYear && cpiMonth ? ` (${MONTH_NL[cpiMonth - 1]} ${cpiYear})` : ''
  if (method === 'cpi') return `CBS CPI-index${period}`
  if (method === 'cpi_plus') return `CBS CPI-index${period} + contractuele opslag`
  return 'Contractueel vastgesteld percentage'
}

export default function RentIncreaseEmail({
  tenantName,
  landlordName,
  propertyAddress,
  oldRent,
  newRent,
  percentage,
  effectiveDate,
  method,
  cpiYear,
  cpiMonth,
  portalUrl,
}: RentIncreaseEmailProps) {
  const firstName = tenantName.split(' ')[0]

  return (
    <EmailLayout preview={`Aankondiging huurverhoging ${propertyAddress}`}>

      <Text style={{ ...emailStyles.body, color: '#888888', fontSize: '13px', margin: '0 0 16px' }}>
        Hoi {firstName},
      </Text>

      <Text style={emailStyles.h1}>
        Aankondiging huurverhoging
      </Text>

      <Text style={emailStyles.body}>
        Per <strong style={{ color: '#111111' }}>{effectiveDate}</strong> wordt de huurprijs
        voor <strong style={{ color: '#111111' }}>{propertyAddress}</strong> aangepast.
      </Text>

      {/* Bedragenoverzicht */}
      <Section style={{ background: '#f9f9f9', borderRadius: '12px', padding: '20px', margin: '24px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ ...emailStyles.body, color: '#888888', paddingBottom: '8px' }}>Huidige huur</td>
              <td style={{ ...emailStyles.body, textAlign: 'right', paddingBottom: '8px' }}>{formatEur(oldRent)}</td>
            </tr>
            <tr>
              <td style={{ ...emailStyles.body, color: '#888888', paddingBottom: '8px' }}>Verhoging ({percentage.toFixed(2)}%)</td>
              <td style={{ ...emailStyles.body, textAlign: 'right', paddingBottom: '8px' }}>+ {formatEur(newRent - oldRent)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid #e5e5e5' }}>
              <td style={{ ...emailStyles.body, fontWeight: 700, paddingTop: '8px' }}>Nieuwe huur</td>
              <td style={{ ...emailStyles.body, fontWeight: 700, textAlign: 'right', paddingTop: '8px', color: '#163300' }}>{formatEur(newRent)}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={emailStyles.small}>
        Grondslag: {methodLabel(method, cpiYear, cpiMonth)}. De verhoging is berekend conform
        het in uw huurcontract met <strong>{landlordName}</strong> overeengekomen indexatiebeding.
      </Text>

      <Section style={{ margin: '32px 0 16px' }}>
        <CtaButton href={portalUrl}>
          Bekijk in mijn portal
        </CtaButton>
      </Section>

      <Hr style={emailStyles.divider} />

      <Text style={emailStyles.small}>
        Vragen? Neem contact op met {landlordName}.
      </Text>

    </EmailLayout>
  )
}

RentIncreaseEmail.PreviewProps = {
  tenantName: 'Piet Jansen',
  landlordName: 'Jaime Blok',
  propertyAddress: 'Keizersgracht 123, Amsterdam',
  oldRent: 1250,
  newRent: 1291.25,
  percentage: 3.3,
  effectiveDate: '1 juli 2026',
  method: 'cpi',
  cpiYear: 2026,
  cpiMonth: 4,
  portalUrl: 'https://domiovastgoedbeheer.nl/portal/abc123',
} satisfies RentIncreaseEmailProps
