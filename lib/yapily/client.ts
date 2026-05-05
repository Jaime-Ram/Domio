const YAPILY_BASE = 'https://api.yapily.com'

function basicAuthHeader() {
  const creds = Buffer.from(
    `${process.env.YAPILY_APP_UUID}:${process.env.YAPILY_APP_SECRET}`
  ).toString('base64')
  return `Basic ${creds}`
}

export function yapilyRequest(path: string, options: RequestInit = {}) {
  return fetch(`${YAPILY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  })
}

export function yapilyRequestWithConsent(
  path: string,
  consentToken: string,
  options: RequestInit = {}
) {
  return fetch(`${YAPILY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: basicAuthHeader(),
      Consent: consentToken,
      ...(options.headers as Record<string, string>),
    },
  })
}
