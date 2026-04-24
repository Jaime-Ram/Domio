import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

// ─── Brand tokens ─────────────────────────────────────────────────────────────

export const C = {
  primary: '#163300',
  accent: '#9FE870',
  gray: '#6B7280',
  lightGray: '#F9FAFB',
  border: '#E5E7EB',
  text: '#111827',
  muted: '#9CA3AF',
} as const

// ─── Shared styles ────────────────────────────────────────────────────────────

export const t = StyleSheet.create({
  // Text sizes
  h1: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.primary },
  h2: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.primary, marginBottom: 6 },
  h3: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.text },
  body: { fontSize: 10, color: C.text, lineHeight: 1.5 },
  small: { fontSize: 8, color: C.muted },
  label: { fontSize: 8, color: C.gray, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },

  // Layout
  row: { flexDirection: 'row' },
  col: { flexDirection: 'column' },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Spacing
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb20: { marginBottom: 20 },
  mb32: { marginBottom: 32 },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: C.border, marginVertical: 12 },
  dividerStrong: { borderBottomWidth: 2, borderBottomColor: C.primary, marginBottom: 4 },
})

// ─── Section block ────────────────────────────────────────────────────────────

const sectionStyles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  bar: { width: 3, height: 14, backgroundColor: C.accent, marginRight: 8, borderRadius: 2 },
})

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={sectionStyles.wrap}>
      <View style={sectionStyles.headerRow}>
        <View style={sectionStyles.bar} />
        <Text style={t.h2}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

// ─── Data table row ───────────────────────────────────────────────────────────

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.border },
  rowAlt: { backgroundColor: C.lightGray },
  key: { width: 160, fontSize: 9, color: C.gray },
  value: { flex: 1, fontSize: 9, color: C.text, fontFamily: 'Helvetica-Bold' },
})

export function DataRow({ label, value, alt }: { label: string; value: string; alt?: boolean }) {
  return (
    <View style={[rowStyles.row, alt ? rowStyles.rowAlt : {}]}>
      <Text style={rowStyles.key}>{label}</Text>
      <Text style={rowStyles.value}>{value || '—'}</Text>
    </View>
  )
}

// ─── DomioDocument shell ──────────────────────────────────────────────────────

const pageStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.text,
    paddingTop: 80,
    paddingBottom: 56,
    paddingHorizontal: 48,
    backgroundColor: '#ffffff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  headerLogo: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  headerTagline: {
    fontSize: 8,
    color: C.accent,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerDocType: {
    fontSize: 9,
    color: C.accent,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRef: {
    fontSize: 8,
    color: '#ffffff',
    opacity: 0.6,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  footerLeft: {
    fontSize: 8,
    color: C.muted,
  },
  footerRight: {
    fontSize: 8,
    color: C.muted,
  },
  accentBar: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: C.accent,
  },
})

interface DomioDocumentProps {
  docType: string
  reference?: string
  children: ReactNode
}

export function DomioDocument({ docType, reference, children }: DomioDocumentProps) {
  const ref = reference ?? `DOM-${Date.now().toString(36).toUpperCase()}`

  return (
    <Document>
      <Page size="A4" style={pageStyles.page}>
        {/* Header */}
        <View style={pageStyles.header} fixed>
          <View>
            <Text style={pageStyles.headerLogo}>DOMIO</Text>
            <Text style={pageStyles.headerTagline}>Vastgoedbeheer</Text>
          </View>
          <View style={pageStyles.headerRight}>
            <Text style={pageStyles.headerDocType}>{docType}</Text>
            <Text style={pageStyles.headerRef}>{ref}</Text>
          </View>
        </View>

        {/* Accent bar under header */}
        <View style={pageStyles.accentBar} fixed />

        {/* Content */}
        {children}

        {/* Footer */}
        <View style={pageStyles.footer} fixed>
          <Text style={pageStyles.footerLeft}>domiovastgoedbeheer.nl</Text>
          <Text
            style={pageStyles.footerRight}
            render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} van ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
