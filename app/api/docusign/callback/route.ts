export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return new Response(
      `<html><body style="font-family:sans-serif;padding:40px">
        <h2>❌ DocuSign consent geweigerd</h2>
        <p>Fout: ${error}</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  if (code) {
    return new Response(
      `<html><body style="font-family:sans-serif;padding:40px">
        <h2>✅ DocuSign consent gegeven!</h2>
        <p>Je kunt dit venster sluiten. Domio kan nu huurovereenkomsten versturen via DocuSign.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  return new Response('Geen code ontvangen', { status: 400 })
}
