import crypto from 'crypto'

/**
 * Symmetrische encryptie voor integratie-credentials (AES-256-GCM).
 *
 * Gebruikt voor o.a. Accountview-webservice credentials die we per gebruiker
 * opslaan in bank_connections.config. Nooit platte wachtwoorden in de DB.
 *
 * Vereist env INTEGRATION_ENC_KEY = 64 hex-tekens (32 bytes).
 * Genereer er een met:  openssl rand -hex 32
 */

function getKey(): Buffer {
  const hex = process.env.INTEGRATION_ENC_KEY
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      'INTEGRATION_ENC_KEY ontbreekt of is geen 64 hex-tekens. Genereer met: openssl rand -hex 32',
    )
  }
  return Buffer.from(hex, 'hex')
}

/** Versleutel platte tekst → "v1:<iv>:<tag>:<ciphertext>" (alles base64). */
export function encryptSecret(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`
}

/** Ontsleutel een string die met encryptSecret() is gemaakt. */
export function decryptSecret(payload: string): string {
  const key = getKey()
  const [version, ivB64, tagB64, ctB64] = payload.split(':')
  if (version !== 'v1' || !ivB64 || !tagB64 || !ctB64) {
    throw new Error('Ongeldig secret-formaat')
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()]).toString('utf8')
}

/** Versleutel een JSON-object (bv. {username, password}). */
export function encryptJson(obj: unknown): string {
  return encryptSecret(JSON.stringify(obj))
}

/** Ontsleutel naar een JSON-object. */
export function decryptJson<T>(payload: string): T {
  return JSON.parse(decryptSecret(payload)) as T
}
