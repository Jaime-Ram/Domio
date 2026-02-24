import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import mammoth from 'mammoth'
import { getExtractionPrompt, getExtractionSchema } from '@/lib/ai/document-extraction'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

// Gemini inlineData ondersteunt alleen deze MIME types (docx doen we via tekst-extractie)
const INLINE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

export async function POST(request: NextRequest) {
  try {
    const { base64Content, mimeType, documentType } = await request.json()

    if (!base64Content || !documentType) {
      return NextResponse.json(
        { error: 'Missing base64Content or documentType' },
        { status: 400 }
      )
    }

    const effectiveMime = mimeType || 'application/pdf'
    const isDocx = effectiveMime === DOCX_MIME
    const isSupportedInline = INLINE_MIME_TYPES.includes(effectiveMime)

    if (!isDocx && !isSupportedInline) {
      return NextResponse.json(
        {
          error: `Bestandstype niet ondersteund (${effectiveMime}). Gebruik PDF, Word (.docx), of een afbeelding (JPEG, PNG, GIF, WebP).`,
        },
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Google Gemini API key not configured' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })
    const prompt = getExtractionPrompt(documentType)

    let result: Awaited<ReturnType<typeof model.generateContent>>

    if (isDocx) {
      // .docx: tekst uit bestand halen met mammoth, dan als tekst naar Gemini sturen
      const buffer = Buffer.from(base64Content, 'base64')
      const { value: docText } = await mammoth.extractRawText({ buffer })
      const documentContent = (docText || '').trim() || '(Geen leesbare tekst in document.)'
      result = await model.generateContent([
        {
          text: `Documentinhoud (tekst geëxtraheerd uit Word-document):\n\n${documentContent}`,
        },
        {
          text: prompt,
        },
      ])
    } else {
      // PDF / afbeelding: direct als inlineData naar Gemini
      result = await model.generateContent([
        {
          inlineData: {
            data: base64Content,
            mimeType: effectiveMime,
          },
        },
        {
          text: prompt,
        },
      ])
    }

    const responseText = result.response.text()

    // Parse the response as JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to extract structured data from document' },
        { status: 400 }
      )
    }

    const extractedData = JSON.parse(jsonMatch[0])

    // Validate against the appropriate schema
    const schema = getExtractionSchema(documentType)
    const validatedData = schema.partial().parse(extractedData)

    return NextResponse.json({
      success: true,
      data: validatedData,
      rawResponse: responseText,
    })
  } catch (error) {
    console.error('Document extraction error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Document extraction failed',
      },
      { status: 500 }
    )
  }
}
