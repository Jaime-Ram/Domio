import { getEnvelopeStatus } from '@/lib/docusign/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const envelopeId = searchParams.get('envelopeId')

  if (!envelopeId) {
    return Response.json({ error: 'envelopeId is verplicht' }, { status: 400 })
  }

  try {
    const data = await getEnvelopeStatus(envelopeId)
    return Response.json({
      envelopeId: data.envelopeId,
      status: data.status,
      sentDateTime: data.sentDateTime,
      completedDateTime: data.completedDateTime,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return Response.json({ error: message }, { status: 500 })
  }
}
