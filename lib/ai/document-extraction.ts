// Document extraction prompts and schemas for Gemini
import { z } from 'zod'

// Response schemas for each document type
const TenantSchema = z.object({
  name: z.string().optional().describe('Full name of the tenant'),
  email: z.string().optional().describe('Tenant email address'),
  phone: z.string().optional().describe('Tenant phone number'),
})

export const ContractExtractionSchema = z.object({
  propertyAddress: z.string().optional().describe('Full address of the rental property'),
  monthlyRent: z.number().optional().describe('Monthly rent amount in euros'),
  tenants: z.array(TenantSchema).optional().describe('Array of tenants'),
})

export const KeuringExtractionSchema = z.object({
    // Todo
})

export const FactuurExtractionSchema = z.object({
    // Todo
})

export const VerzekeringExtractionSchema = z.object({
    // Todo
})

export const GenericExtractionSchema = z.object({
  title: z.string().optional().describe('Document title'),
  date: z.string().optional().describe('Document date (YYYY-MM-DD format)'),
  description: z.string().optional().describe('Summary of document contents'),
})

export type ContractExtraction = z.infer<typeof ContractExtractionSchema>
export type KeuringExtraction = z.infer<typeof KeuringExtractionSchema>
export type FactuurExtraction = z.infer<typeof FactuurExtractionSchema>
export type VerzekeringExtraction = z.infer<typeof VerzekeringExtractionSchema>
export type GenericExtraction = z.infer<typeof GenericExtractionSchema>

// Get the appropriate schema for a document type
export function getExtractionSchema(documentType: string) {
  switch (documentType) {
    case 'Contract':
      return ContractExtractionSchema
    case 'Keuring':
      return KeuringExtractionSchema
    case 'Factuur':
      return FactuurExtractionSchema
    case 'Verzekering':
      return VerzekeringExtractionSchema
    default:
      return GenericExtractionSchema
  }
}

// Get the extraction prompt for a document type
export function getExtractionPrompt(documentType: string): string {
  const basePrompt = `You are a document analysis AI. Extract structured data from the provided document image.
Return ONLY valid JSON matching the schema below, with no additional text or markdown formatting.
For dates, use YYYY-MM-DD format. Leave fields empty string if not found.
If a field is not present in the document, omit it from the response.`

  const typePrompts: Record<string, string> = {
    Contract: `${basePrompt}

  Extract rental contract information:
  - Property address
  - Monthly rent amount + all associated costs (e.g., utilities, service fees)
  - Tenants: array of all tenants listed in the contract, each with:
    - name (full name)
    - email (email address)
    - phone (phone number)

  Example JSON structure:
  {"propertyAddress": "Hoofdstraat 123, Amsterdam", "monthlyRent": 1200, "tenants": [{"name": "Jan Jansen", "email": "jan@example.com", "phone": "+31612345678"}, {"name": "Marie Jansen", "email": "marie@example.com", "phone": "+31687654321"}]}`,

    Keuring: `${basePrompt}
TODO`,

    Factuur: `${basePrompt}
TODO`,

    Verzekering: `${basePrompt}
TODO`,

    Overig: `${basePrompt}
TODO`,
  }

  return typePrompts[documentType] || basePrompt
}
