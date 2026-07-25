'use client'

import type { ComposerAttachment } from '@/lib/dashboard/chat-composer'

export function renderMessageWithDocumentMentions(text: string, attachments: ComposerAttachment[]) {
  const docMentions = attachments
    .filter((a) => a.source === 'mention-document')
    .map((a) => `@${a.name}`)
    .filter(Boolean)

  if (!text || docMentions.length === 0) return <>{text}</>

  let cursor = 0
  const out: React.ReactNode[] = []

  while (cursor < text.length) {
    let matchToken: string | null = null
    let matchIndex = -1
    for (const token of docMentions) {
      const idx = text.indexOf(token, cursor)
      if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
        matchIndex = idx
        matchToken = token
      }
    }

    if (!matchToken || matchIndex === -1) {
      out.push(text.slice(cursor))
      break
    }

    if (matchIndex > cursor) out.push(text.slice(cursor, matchIndex))
    out.push(
      <span key={`${matchToken}-${matchIndex}`} className="font-semibold text-[#161f13] dark:text-[#94f477]">
        {matchToken}
      </span>
    )
    cursor = matchIndex + matchToken.length
  }

  return <>{out}</>
}

export function renderComposerWithDocumentMentions(text: string, attachments: ComposerAttachment[]) {
  if (!text) return <span className="text-[#97978f] dark:text-[#97978f]">Typ een bericht…</span>

  const docMentions = attachments
    .filter((a) => a.source === 'mention-document')
    .map((a) => `@${a.name}`)
    .filter(Boolean)

  if (docMentions.length === 0) return <span className="text-[#1a1c18] dark:text-gray-100">{text}</span>

  let cursor = 0
  const out: React.ReactNode[] = []

  while (cursor < text.length) {
    let matchToken: string | null = null
    let matchIndex = -1
    for (const token of docMentions) {
      const idx = text.indexOf(token, cursor)
      if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
        matchIndex = idx
        matchToken = token
      }
    }

    if (!matchToken || matchIndex === -1) {
      out.push(<span key={`plain-${cursor}`} className="text-[#1a1c18] dark:text-gray-100">{text.slice(cursor)}</span>)
      break
    }

    if (matchIndex > cursor) {
      out.push(
        <span key={`plain-${cursor}`} className="text-[#1a1c18] dark:text-gray-100">
          {text.slice(cursor, matchIndex)}
        </span>
      )
    }
    out.push(
      <span key={`${matchToken}-${matchIndex}`} className="font-semibold text-[#161f13] dark:text-[#94f477]">
        {matchToken}
      </span>
    )
    cursor = matchIndex + matchToken.length
  }

  return <>{out}</>
}
