export type MentionItem = {
  id: string
  kind: 'ticket' | 'document' | 'contact'
  label: string
  search: string
  sourceId?: string
}

export type ComposerAttachment = {
  id: string
  source: 'upload' | 'mention-document' | 'google-drive'
  name: string
  sizeKb?: number
  previewUrl?: string
  file?: File
  documentId?: string
}

/** @-mention: alleen als @ aan begin of na whitespace/( */
export function getMentionContext(value: string, cursor: number) {
  const prefix = value.slice(0, cursor)
  const at = prefix.lastIndexOf('@')
  if (at < 0) return null
  const prev = at === 0 ? ' ' : prefix[at - 1]
  if (!/\s|[(\[{]/.test(prev)) return null
  const query = prefix.slice(at + 1)
  if (query.includes(' ') || query.includes('\n')) return null
  return { at, query: query.toLowerCase() }
}
