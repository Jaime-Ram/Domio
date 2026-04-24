/**
 * DocuSign eSignature REST API — lichtgewicht client zonder SDK.
 * Gebruikt JWT Grant (server-to-server) voor server-side authenticatie.
 *
 * Benodigde env vars:
 *   DOCUSIGN_INTEGRATION_KEY   — App integration key (client_id)
 *   DOCUSIGN_ACCOUNT_ID        — Account GUID
 *   DOCUSIGN_USER_ID           — API username / impersonated user GUID
 *   DOCUSIGN_PRIVATE_KEY       — RSA private key (PEM, inclusief \n als newlines)
 *   DOCUSIGN_BASE_URL          — https://demo.docusign.net (sandbox) of https://na4.docusign.net
 */

import { SignJWT, importPKCS8 } from 'jose'

const SCOPES = 'signature impersonation'
const TOKEN_TTL = 3600 // seconden

// ─── JWT token ophalen ────────────────────────────────────────────────────────

let cachedToken: { access_token: string; expires_at: number } | null = null

export async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expires_at > now + 60) return cachedToken.access_token

  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY!
  const userId = process.env.DOCUSIGN_USER_ID!
  const baseUrl = process.env.DOCUSIGN_BASE_URL ?? 'https://account-d.docusign.com'
  const rawKey = process.env.DOCUSIGN_PRIVATE_KEY!

  const pemKey = rawKey.replace(/\\n/g, '\n')
  const privateKey = await importPKCS8(pemKey, 'RS256')

  const jwt = await new SignJWT({
    scope: SCOPES,
    iss: integrationKey,
    sub: userId,
    aud: new URL(baseUrl).hostname,
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL}s`)
    .sign(privateKey)

  const res = await fetch(`${baseUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DocuSign token error: ${err}`)
  }

  const json = await res.json()
  cachedToken = {
    access_token: json.access_token,
    expires_at: now + (json.expires_in ?? TOKEN_TTL),
  }
  return cachedToken.access_token
}

// ─── Envelope aanmaken en versturen ──────────────────────────────────────────

export interface DocuSignSigner {
  name: string
  email: string
  routingOrder?: number
}

export interface CreateEnvelopeOptions {
  subject: string
  /** Base64-encoded PDF */
  pdfBase64: string
  fileName: string
  signers: DocuSignSigner[]
  /** Als true: envelope direct versturen, anders draft */
  send?: boolean
}

export interface EnvelopeResult {
  envelopeId: string
  status: string
  /** Alleen aanwezig als er 1 signer is en embedded signing aangevraagd */
  signingUrl?: string
}

export async function createEnvelope(opts: CreateEnvelopeOptions): Promise<EnvelopeResult> {
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID!
  const baseUrl = process.env.DOCUSIGN_BASE_URL ?? 'https://demo.docusign.net'
  const apiBase = `${baseUrl}/restapi/v2.1/accounts/${accountId}`

  const token = await getAccessToken()

  const signerDefs = opts.signers.map((s, i) => ({
    email: s.email,
    name: s.name,
    recipientId: String(i + 1),
    routingOrder: String(s.routingOrder ?? i + 1),
    // Eén standaard sign-here tab onderaan het laatste document
    tabs: {
      signHereTabs: [{
        documentId: '1',
        pageNumber: '1',
        recipientId: String(i + 1),
        tabLabel: `Handtekening ${i + 1}`,
        xPosition: i === 0 ? '72' : '312',
        yPosition: '680',
      }],
      dateSignedTabs: [{
        documentId: '1',
        pageNumber: '1',
        recipientId: String(i + 1),
        xPosition: i === 0 ? '72' : '312',
        yPosition: '720',
      }],
    },
  }))

  const envelope = {
    emailSubject: opts.subject,
    documents: [{
      documentBase64: opts.pdfBase64,
      name: opts.fileName,
      fileExtension: 'pdf',
      documentId: '1',
    }],
    recipients: { signers: signerDefs },
    status: opts.send !== false ? 'sent' : 'created',
  }

  const res = await fetch(`${apiBase}/envelopes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envelope),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(`DocuSign envelope error: ${err.message ?? JSON.stringify(err)}`)
  }

  const result = await res.json()
  return {
    envelopeId: result.envelopeId,
    status: result.status,
  }
}

// ─── Envelope status ophalen ─────────────────────────────────────────────────

export async function getEnvelopeStatus(envelopeId: string) {
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID!
  const baseUrl = process.env.DOCUSIGN_BASE_URL ?? 'https://demo.docusign.net'
  const token = await getAccessToken()

  const res = await fetch(
    `${baseUrl}/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (!res.ok) throw new Error(`DocuSign status error: ${res.statusText}`)
  return res.json()
}
