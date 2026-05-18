import * as React from 'react'
import { sendEmail } from './email'
import RentIncreaseEmail from '@/emails/rent-increase'
import type { IndexationResult } from './indexation'

const MONTH_NL = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december']

export async function sendRentIncreaseEmail({
  tenantEmail,
  tenantName,
  landlordName,
  propertyAddress,
  result,
  effectiveDate,
  portalUrl,
}: {
  tenantEmail: string
  tenantName: string
  landlordName: string
  propertyAddress: string
  result: IndexationResult
  effectiveDate: string
  portalUrl: string
}) {
  const cpiMonthLabel = result.cpiYear && result.cpiMonth
    ? `${MONTH_NL[result.cpiMonth - 1]} ${result.cpiYear}`
    : undefined

  await sendEmail({
    to: tenantEmail,
    subject: `Aankondiging huurverhoging — ${propertyAddress}`,
    react: React.createElement(RentIncreaseEmail, {
      tenantName,
      landlordName,
      propertyAddress,
      oldRent: result.oldRent,
      newRent: result.newRent,
      percentage: result.percentage,
      effectiveDate,
      method: result.method as 'cpi' | 'cpi_plus' | 'fixed',
      cpiYear: result.cpiYear,
      cpiMonth: result.cpiMonth,
      portalUrl,
    }),
    tags: ['rent-increase'],
  })
}
