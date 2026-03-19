import React from 'react'

export type DocumentTypeKind =
  | 'pdf'
  | 'image'
  | 'word'
  | 'spreadsheet'
  | 'csv'
  | 'text'
  | 'archive'
  | 'unknown'

function getExtension(name: string, file_name?: string | null): string {
  const source = (file_name ?? name ?? '').toString()
  const match = source.match(/\.([a-z0-9]+)$/i)
  return match?.[1]?.toUpperCase() ?? ''
}

function detectKind(opts: { name: string; file_name?: string | null; mime_type?: string | null }): DocumentTypeKind {
  const { name, file_name, mime_type } = opts
  const ext = getExtension(name, file_name)

  if (mime_type === 'application/pdf' || ext === 'PDF') return 'pdf'

  const imageMimes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
  const imageExts = new Set(['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'])
  if ((mime_type && imageMimes.has(mime_type)) || imageExts.has(ext)) return 'image'

  const wordExts = new Set(['DOC', 'DOCX', 'ODT'])
  if (wordExts.has(ext)) return 'word'

  const csvExts = new Set(['CSV'])
  if (csvExts.has(ext) || mime_type === 'text/csv') return 'csv'

  const sheetExts = new Set(['XLS', 'XLSX', 'ODS'])
  if (sheetExts.has(ext)) return 'spreadsheet'

  const textExts = new Set(['TXT', 'MD', 'LOG'])
  if (textExts.has(ext) || mime_type === 'text/plain') return 'text'

  const archiveExts = new Set(['ZIP', 'RAR', '7Z', 'TAR', 'GZ'])
  if (archiveExts.has(ext) || mime_type === 'application/zip') return 'archive'

  return 'unknown'
}

export function DocumentTypeGlyph({
  name,
  file_name,
  mime_type,
  className,
}: {
  name: string
  file_name?: string | null
  mime_type?: string | null
  className?: string
}) {
  const kind = detectKind({ name, file_name, mime_type })

  switch (kind) {
    case 'pdf':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} role="img">
          <path
            d="M7 3h7l3 3v15a1.6 1.6 0 0 1-1.6 1.6H7.6A1.6 1.6 0 0 1 6 21V4.6A1.6 1.6 0 0 1 7.6 3Z"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 3v4a1 1 0 0 0 1 1h4"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.2 13.1h1.5"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.2 16h2.6"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.2 16v-5"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 16v-5"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 14.2c0-.7.6-1.2 1.3-1.2H16"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'image':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} role="img">
          <rect x="4.5" y="5" width="15" height="14" rx="2" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M7 15l3-3 3 2 3-4 2 3v4" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="9" r="1.3" stroke="currentColor" fill="none" strokeWidth="1.6" />
        </svg>
      )
    case 'word':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} role="img">
          <path
            d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.2 8.7 10 16l1.7-4.6L13.4 16l1.6-7.3"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'spreadsheet':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} role="img">
          <rect x="4.5" y="4.5" width="15" height="15" rx="2" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 4.5V19.5" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15 4.5V19.5" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4.5 10h15" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case 'csv':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} role="img">
          <path d="M7 3h7l3 3v15a1.6 1.6 0 0 1-1.6 1.6H7.6A1.6 1.6 0 0 1 6 21V4.6A1.6 1.6 0 0 1 7.6 3Z" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 3v4a1 1 0 0 0 1 1h4" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.2 15.3h7" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="9.3" cy="11.2" r="1.1" stroke="currentColor" fill="none" strokeWidth="1.6" />
          <circle cx="13.5" cy="11.2" r="1.1" stroke="currentColor" fill="none" strokeWidth="1.6" />
          <circle cx="17.7" cy="11.2" r="1.1" stroke="currentColor" fill="none" strokeWidth="1.6" />
        </svg>
      )
    case 'text':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} role="img">
          <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 3v4h4" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.3 12h7.4" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8.3 15.2h5.5" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8.3 8.8h4.2" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case 'archive':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} role="img">
          <path d="M7 8l5-3 5 3v12a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20V8Z" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 11h8" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M9 15h6" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} role="img">
          <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 3v4h4" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

