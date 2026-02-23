import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getExtractionPrompt, getExtractionSchema } from '@/lib/ai/document-extraction'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { base64Content, mimeType, documentType } = await request.json()

    if (!base64Content || !documentType) {
      return NextResponse.json(
        { error: 'Missing base64Content or documentType' },
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

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Content,
          mimeType: mimeType || 'application/pdf',
        },
      },
      {
        text: prompt,
      },
    ])

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
