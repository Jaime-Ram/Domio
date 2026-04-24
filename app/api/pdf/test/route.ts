import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const exec = promisify(execFile)

export async function GET() {
  const worker = path.join(process.cwd(), 'scripts/pdf-worker.mjs')

  const { stdout } = await exec('node', [worker, 'test', '{}'], {
    encoding: 'buffer',
    maxBuffer: 20 * 1024 * 1024, // 20MB
  })

  return new Response(stdout, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="domio-test.pdf"',
    },
  })
}
