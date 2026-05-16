import { Resend } from 'resend'
import * as React from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Domio <noreply@domiovastgoedbeheer.nl>'

interface SendEmailOptions {
  to: string
  subject: string
  react: React.ReactElement
  tags?: string[]
}

export async function sendEmail({ to, subject, react, tags = [] }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping send')
    return { success: true, skipped: true }
  }

  // In dev: stuur naar test-adres als EMAIL_DEV_OVERRIDE is ingesteld, anders gewoon het echte adres
  const recipient = process.env.EMAIL_DEV_OVERRIDE ?? to

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: recipient,
    subject,
    react,
    tags: tags.map(t => ({ name: t, value: '1' })),
  })

  if (error) throw new Error(`Email send failed: ${error.message}`)
  return { success: true, data }
}
