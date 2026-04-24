/**
 * Standalone PDF generator — runs outside Next.js's React/RSC context.
 * Called by the API route via child_process. Writes PDF bytes to stdout.
 *
 * Usage: node scripts/pdf-worker.mjs <template> <dataJson>
 *   template: "test" | "huurovereenkomst" | ...
 *   dataJson: JSON string with template variables
 */

import { renderToBuffer, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { createElement as h } from 'react'

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const C = {
  primary: '#163300',
  accent: '#9FE870',
  gray: '#6B7280',
  lightGray: '#F9FAFB',
  border: '#E5E7EB',
  text: '#111827',
  muted: '#9CA3AF',
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.text,
    paddingTop: 72,
    paddingBottom: 48,
    paddingHorizontal: 48,
    backgroundColor: '#ffffff',
  },

  // Header (fixed — repeats on every page)
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 52,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  headerLogo: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  headerTagline: { fontSize: 7, color: C.accent, marginTop: 2 },
  headerDocType: { fontSize: 8, color: C.accent, fontFamily: 'Helvetica-Bold' },
  headerRef: { fontSize: 7, color: '#ffffff', opacity: 0.5, marginTop: 2 },

  // Accent bar
  accentBar: {
    position: 'absolute',
    top: 52, left: 0, right: 0,
    height: 3,
    backgroundColor: C.accent,
  },

  // Footer (fixed)
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  footerText: { fontSize: 7, color: C.muted },

  // Content
  h1: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.primary, marginBottom: 4 },
  h2: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.primary, marginBottom: 6 },
  h3: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.text, marginBottom: 3 },
  body: { fontSize: 9, color: C.text, lineHeight: 1.6 },
  muted: { fontSize: 8, color: C.muted },
  label: { fontSize: 7, color: C.gray, fontFamily: 'Helvetica-Bold' },

  sectionWrap: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionBar: { width: 3, height: 12, backgroundColor: C.accent, marginRight: 7, borderRadius: 2 },

  dataRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  dataKey: { width: 160, fontSize: 8, color: C.gray },
  dataVal: { flex: 1, fontSize: 8, color: C.text, fontFamily: 'Helvetica-Bold' },

  articleWrap: { marginBottom: 10 },

  sigRow: { flexDirection: 'row', marginTop: 40 },
  sigBlock: { flex: 1, marginRight: 24, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 6 },
  sigLine: { marginTop: 28, borderTopWidth: 1, borderTopColor: C.text, paddingTop: 3, fontSize: 8, color: C.text },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return '_______________'
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtCurrency(n) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0)
}

// ─── Shell (header + footer + accent bar) ────────────────────────────────────

function Shell({ docType, reference, children }) {
  const ref = reference ?? `DOM-${Date.now().toString(36).toUpperCase()}`
  return h(Document, null,
    h(Page, { size: 'A4', style: s.page },
      // Header
      h(View, { style: s.header, fixed: true },
        h(View, null,
          h(Text, { style: s.headerLogo }, 'DOMIO'),
          h(Text, { style: s.headerTagline }, 'Vastgoedbeheer'),
        ),
        h(View, { style: { alignItems: 'flex-end' } },
          h(Text, { style: s.headerDocType }, docType),
          h(Text, { style: s.headerRef }, ref),
        ),
      ),
      // Accent bar
      h(View, { style: s.accentBar, fixed: true }),
      // Footer with page numbers
      h(View, { style: s.footer, fixed: true },
        h(Text, { style: s.footerText }, 'domiovastgoedbeheer.nl'),
        h(Text, {
          style: s.footerText,
          render: ({ pageNumber, totalPages }) => `Pagina ${pageNumber} van ${totalPages}`,
        }),
      ),
      // Page content
      ...children,
    )
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return h(View, { style: s.sectionWrap },
    h(View, { style: s.sectionHeader },
      h(View, { style: s.sectionBar }),
      h(Text, { style: s.h2 }, title),
    ),
    ...children,
  )
}

function DataRow({ label, value, alt }) {
  return h(View, { style: [s.dataRow, alt ? { backgroundColor: C.lightGray } : {}] },
    h(Text, { style: s.dataKey }, label),
    h(Text, { style: s.dataVal }, value || '—'),
  )
}

// ─── Templates ────────────────────────────────────────────────────────────────

function TestDocument() {
  const today = fmtDate(new Date().toISOString())
  return Shell({ docType: 'Testdocument', reference: 'DOM-TEST-001', children: [
    h(View, { style: { marginBottom: 20 } },
      h(Text, { style: s.h1 }, 'PDF Generator — Test'),
      h(Text, { style: [s.muted, { marginTop: 4 }] }, `Gegenereerd op ${today}`),
    ),
    Section({ title: 'Testgegevens', children: [
      DataRow({ label: 'Status', value: 'Werkend ✓', alt: false }),
      DataRow({ label: 'Generator', value: '@react-pdf/renderer v4', alt: true }),
      DataRow({ label: 'Template', value: 'Domio standaard shell', alt: false }),
    ]}),
    Section({ title: 'Volgende stappen', children: [
      h(View, { style: s.articleWrap },
        h(Text, { style: s.body },
          'De Domio PDF-generator is correct geconfigureerd. We kunnen nu de echte ' +
          'templates bouwen: huurovereenkomsten, facturen, huurverhogingsbrieven en meer.'
        ),
      ),
    ]}),
  ]})
}

// ─── Template registry ────────────────────────────────────────────────────────

const templates = {
  test: (data) => TestDocument(data),
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [,, template = 'test', rawData = '{}'] = process.argv
  const data = JSON.parse(rawData)
  const factory = templates[template]
  if (!factory) {
    process.stderr.write(`Unknown template: ${template}\n`)
    process.exit(1)
  }
  const element = factory(data)
  const buffer = await renderToBuffer(element)
  process.stdout.write(buffer)
}

main().catch((err) => {
  process.stderr.write(`PDF generation failed: ${err.message}\n`)
  process.exit(1)
})
