import { SignJWT, jwtVerify } from 'jose'
import { createClient } from '@/lib/supabase/server'
import * as React from 'react'
import { sendEmail } from './email'
import TenantInviteEmail from '@/emails/tenant-invite'

const INVITE_EXPIRY_HOURS = 72
const secret = new TextEncoder().encode(
  process.env.INVITATION_JWT_SECRET ?? 'fallback-dev-secret-change-in-production'
)

export interface InvitationPayload {
  invitationId: string
  tenantId: string
  ownerId: string
  email: string
  type: 'tenant_invitation'
}

export async function createInvitationToken(payload: Omit<InvitationPayload, 'type'>): Promise<string> {
  return new SignJWT({ ...payload, type: 'tenant_invitation' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${INVITE_EXPIRY_HOURS}h`)
    .sign(secret)
}

export async function verifyInvitationToken(token: string): Promise<InvitationPayload> {
  const { payload } = await jwtVerify(token, secret)

  if (payload.type !== 'tenant_invitation') throw new Error('Invalid token type')

  return payload as unknown as InvitationPayload
}

export async function buildInvitationUrl({
  invitationId, tenantId, ownerId, tenantEmail, appUrl,
}: {
  invitationId: string; tenantId: string; ownerId: string; tenantEmail: string; appUrl: string
}) {
  const token = await createInvitationToken({ invitationId, tenantId, ownerId, email: tenantEmail })
  return { token, portalUrl: `${appUrl}/portal/${token}` }
}

export async function sendTenantInvitationEmail({
  tenantEmail,
  tenantName,
  landlordName,
  propertyAddress,
  portalUrl,
}: {
  tenantEmail: string
  tenantName: string
  landlordName: string
  propertyAddress: string
  portalUrl: string
}) {
  await sendEmail({
    to: tenantEmail,
    subject: `${landlordName} heeft je uitgenodigd — ${propertyAddress}`,
    react: React.createElement(TenantInviteEmail, {
      tenantName,
      landlordName,
      propertyAddress,
      portalUrl,
      expiresInHours: INVITE_EXPIRY_HOURS,
    }),
    tags: ['tenant-invite'],
  })
}

/** @deprecated use buildInvitationUrl + sendTenantInvitationEmail separately */
export async function sendTenantInvitation(params: {
  invitationId: string; tenantId: string; ownerId: string; tenantEmail: string
  tenantName: string; landlordName: string; propertyAddress: string; appUrl: string
}) {
  const { token, portalUrl } = await buildInvitationUrl(params)
  await sendTenantInvitationEmail({ ...params, portalUrl })
  return { token, portalUrl }
}
