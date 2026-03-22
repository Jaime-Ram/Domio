/** Eén gedeelde PDF.js-load voor previews (documentkaarten, upload-popup, …). */
let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null

export function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((m) => {
      const version = (m as { version?: string }).version ?? '4.4.168'
      m.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
      return m
    })
  }
  return pdfjsPromise
}
