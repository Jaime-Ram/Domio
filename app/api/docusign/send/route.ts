import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { createEnvelope } from '@/lib/docusign/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const exec = promisify(execFile)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { contractData, signers, subject } = body as {
      contractData: {
        propertyAddress: string
        propertyType?: string
        monthlyRent: number
        deposit?: number
        startDate?: string
        endDate?: string
        billingDay?: number
        landlordName?: string
        landlordAddress?: string
        tenants: { name: string; email?: string; phone?: string }[]
        reference?: string
      }
      signers: { name: string; email: string }[]
      subject?: string
    }

    if (!contractData || !signers?.length) {
      return Response.json({ error: 'contractData en signers zijn verplicht' }, { status: 400 })
    }

    // ── Stap 1: genereer PDF via de worker ──────────────────────────────────
    const worker = path.join(process.cwd(), 'scripts/pdf-worker.mjs')
    const { stdout } = await exec(
      'node',
      [worker, 'huurovereenkomst', JSON.stringify(contractData)],
      { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 },
    )
    const pdfBase64 = Buffer.from(stdout).toString('base64')

    // ── Stap 2: maak DocuSign envelope aan ──────────────────────────────────
    const propertyShort = contractData.propertyAddress?.split(',')[0] ?? 'object'
    const envelope = await createEnvelope({
      subject: subject ?? `Huurovereenkomst — ${propertyShort}`,
      pdfBase64,
      fileName: `huurovereenkomst-${propertyShort.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      signers,
      send: true,
    })

    return Response.json({
      envelopeId: envelope.envelopeId,
      status: envelope.status,
      message: `Huurovereenkomst verstuurd naar ${signers.map((s) => s.email).join(', ')}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    console.error('[docusign/send]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
