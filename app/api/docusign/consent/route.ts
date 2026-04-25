export const dynamic = 'force-dynamic'

export async function GET() {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY!
  const callbackUrl = 'http://localhost:3000/api/docusign/callback'

  const consentUrl =
    `https://account-d.docusign.com/oauth/auth` +
    `?response_type=code` +
    `&scope=signature%20impersonation` +
    `&client_id=${integrationKey}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl)}`

  return Response.redirect(consentUrl, 302)
}
