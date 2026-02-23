'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'textarea'
  optional?: boolean
}

interface ExtractionPreviewProps {
  documentType: string
  extractedData: Record<string, any>
  isLoading?: boolean
  error?: string | null
  properties?: Array<{ id: string; name: string; address: string }>
  matchedPropertyIds?: string[]
  selectedPropertyId?: string
  onSelectProperty?: (propertyId: string) => void
  onConfirm: (data: Record<string, any>) => void
  onEdit: () => void
}

const fieldConfigs: Record<string, FieldConfig[]> = {
  Contract: [
    { key: 'propertyAddress', label: 'Adres pand', type: 'text', optional: true },
    { key: 'monthlyRent', label: 'Maandelijkse huur (€)', type: 'number', optional: true },
  ],
  Keuring: [
    { key: 'inspectionType', label: 'Soort inspectie', type: 'text', optional: true },
    { key: 'inspectionDate', label: 'Inspectiédatum', type: 'date', optional: true },
    { key: 'propertyAddress', label: 'Adres pand', type: 'text', optional: true },
    { key: 'status', label: 'Status', type: 'text', optional: true },
    { key: 'findings', label: 'Bevindingen', type: 'textarea', optional: true },
    { key: 'nextInspectionDate', label: 'Volgende inspectiedatum', type: 'date', optional: true },
  ],
  Factuur: [
    { key: 'invoiceNumber', label: 'Factuurnummer', type: 'text', optional: true },
    { key: 'vendor', label: 'Leverancier', type: 'text', optional: true },
    { key: 'amount', label: 'Bedrag (€)', type: 'number', optional: true },
    { key: 'invoiceDate', label: 'Factuurdatum', type: 'date', optional: true },
    { key: 'description', label: 'Omschrijving', type: 'textarea', optional: true },
    { key: 'dueDate', label: 'Vervaldatum', type: 'date', optional: true },
  ],
  Verzekering: [
    { key: 'policyNumber', label: 'Polisnummer', type: 'text', optional: true },
    { key: 'insurer', label: 'Verzekeringsmaatschappij', type: 'text', optional: true },
    { key: 'coverageType', label: 'Type dekking', type: 'text', optional: true },
    { key: 'startDate', label: 'Startdatum', type: 'date', optional: true },
    { key: 'expiryDate', label: 'Vervaldatum', type: 'date', optional: true },
    { key: 'premiumAmount', label: 'Jaarpremie (€)', type: 'number', optional: true },
    { key: 'propertyAddress', label: 'Adres pand', type: 'text', optional: true },
  ],
}

export function ExtractionPreview({
  documentType,
  extractedData,
  isLoading = false,
  error = null,
  properties = [],
  matchedPropertyIds = [],
  selectedPropertyId = '',
  onSelectProperty,
  onConfirm,
  onEdit,
}: ExtractionPreviewProps) {
  const [editedData, setEditedData] = useState(extractedData)

  useEffect(() => {
    setEditedData(extractedData)
  }, [extractedData])

  const fields = fieldConfigs[documentType] || []

  const handleFieldChange = (key: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#163300] mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Document wordt gescand...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">Scan mislukt</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-200">Document gescand</p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Gegevens zijn geëxtraheerd. Controleer en corrigeer indien nodig.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="matched-property">Pand</Label>
          <Select
            value={selectedPropertyId}
            onValueChange={(value) => onSelectProperty?.(value)}
          >
            <SelectTrigger id="matched-property">
              <SelectValue placeholder="Selecteer een pand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Nieuw pand</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.address} ({property.name})
                  {matchedPropertyIds.includes(property.id) ? ' • match' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {fields.map((field) => {
          const value = editedData[field.key] ?? ''

          return (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>
                {field.label}
                {field.optional && <span className="text-gray-500 text-sm"> (optioneel)</span>}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  value={value}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Voer ${field.label.toLowerCase()} in`}
                  className="min-h-24"
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  value={value}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Voer ${field.label.toLowerCase()} in`}
                />
              )}
            </div>
          )
        })}
        
        {/* Render tenants array for Contract documents */}
        {documentType === 'Contract' && editedData.tenants && Array.isArray(editedData.tenants) && (
          <div className="space-y-4 pt-2">
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Huurders</h4>
              {editedData.tenants.map((tenant: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Huurder {index + 1}</p>
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`tenant-${index}-name`}>Naam</Label>
                      <Input
                        id={`tenant-${index}-name`}
                        type="text"
                        value={tenant.name || ''}
                        onChange={(e) => {
                          const newTenants = [...editedData.tenants]
                          newTenants[index] = { ...newTenants[index], name: e.target.value }
                          setEditedData({ ...editedData, tenants: newTenants })
                        }}
                        placeholder="Voer naam in"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`tenant-${index}-email`}>E-mail</Label>
                      <Input
                        id={`tenant-${index}-email`}
                        type="email"
                        value={tenant.email || ''}
                        onChange={(e) => {
                          const newTenants = [...editedData.tenants]
                          newTenants[index] = { ...newTenants[index], email: e.target.value }
                          setEditedData({ ...editedData, tenants: newTenants })
                        }}
                        placeholder="Voer e-mailadres in"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`tenant-${index}-phone`}>Telefoonnummer</Label>
                      <Input
                        id={`tenant-${index}-phone`}
                        type="text"
                        value={tenant.phone || ''}
                        onChange={(e) => {
                          const newTenants = [...editedData.tenants]
                          newTenants[index] = { ...newTenants[index], phone: e.target.value }
                          setEditedData({ ...editedData, tenants: newTenants })
                        }}
                        placeholder="Voer telefoonnummer in"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onEdit} className="flex-1">
          Bestand opnieuw kiezen
        </Button>
        <Button
          onClick={() => onConfirm(editedData)}
          className="flex-1 bg-[#163300] hover:bg-[#356258]"
        >
          Gegevens opslaan
        </Button>
      </div>
    </div>
  )
}
