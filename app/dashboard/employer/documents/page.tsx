'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExtractionPreview } from '@/components/documents/extraction-preview'
import { fileToBase64, getMimeType } from '@/lib/ai/file-utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  FileText,
  Plus,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  File,
} from 'lucide-react'
import { mockDocuments, mockProperties } from '@/lib/mock-data/vastgoed'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DocumentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    type: '',
    propertyId: '',
  })

  // AI extraction state
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [matchedPropertyIds, setMatchedPropertyIds] = useState<string[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')

  const normalizeAddress = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')
  const extractStreetCity = (value: string) => {
    const normalized = normalizeAddress(value)
    const parts = normalized.split(',').map((part) => part.trim()).filter(Boolean)
    const street = parts[0] || ''
    const city = parts[parts.length - 1] || ''
    return { street, city }
  }
  const getAddressScore = (haystack: string, needle: string) => {
    if (!needle) return 0
    if (haystack === needle) return 3
    const { street: needleStreet, city: needleCity } = extractStreetCity(needle)
    if (!needleStreet || !needleCity) return 0
    const { street: haystackStreet, city: haystackCity } = extractStreetCity(haystack)
    const streetMatch = haystackStreet.includes(needleStreet) || needleStreet.includes(haystackStreet)
    const cityMatch = haystackCity.includes(needleCity) || needleCity.includes(haystackCity)
    return streetMatch && cityMatch ? 2 : 0
  }

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || doc.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    return <FileText className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'Contract': 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500',
      'Keuring': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500',
      'Verzekering': 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-500',
      'Factuur': 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-500',
      'Overig': 'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-500',
    }
    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    )
  }

  const handleUpload = async (fileOverride?: File, typeOverride?: string) => {
    const file = fileOverride ?? uploadForm.file
    const documentType = typeOverride ?? uploadForm.type
    if (!file || !documentType) return

    setIsExtracting(true)
    setExtractionError(null)
    setExtractedData(null)
    setMatchedPropertyIds([])
    setSelectedPropertyId('new')
    setShowPreview(true)

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file)
      const mimeType = getMimeType(file)

      // Call extraction API
      const response = await fetch('/api/documents/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Content: base64,
          mimeType,
          documentType,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Extraction failed')
      }

      const result = await response.json()
      const data = result.data || {}
      setExtractedData(data)

      const extractedAddress = typeof data.propertyAddress === 'string' ? normalizeAddress(data.propertyAddress) : ''
      if (extractedAddress) {
        const scored = mockProperties
          .map((property) => ({
            id: property.id,
            score: getAddressScore(normalizeAddress(property.address), extractedAddress),
          }))
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
        const matchIds = scored.map((item) => item.id)
        setMatchedPropertyIds(matchIds)
        setSelectedPropertyId(matchIds[0] || 'new')
      } else {
        setMatchedPropertyIds([])
        setSelectedPropertyId('new')
      }
      setShowPreview(true)
    } catch (error) {
      setExtractionError(error instanceof Error ? error.message : 'Extraction failed')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleConfirmExtraction = (data: Record<string, any>) => {
    console.log('Document upload with extracted data:', {
      file: uploadForm.file?.name,
      type: uploadForm.type,
      propertyId: selectedPropertyId && selectedPropertyId !== 'new' ? selectedPropertyId : null,
      extractedData: data,
    })

    // TODO: Save document and extracted data to the system
    setShowUploadModal(false)
    setShowPreview(false)
    setExtractedData(null)
    
    setUploadForm({
      file: null,
      type: '',
      propertyId: '',
    })
  }

  const handleEditExtraction = () => {
    setShowPreview(false)
    setExtractedData(null)
    setExtractionError(null)
    setMatchedPropertyIds([])
    setSelectedPropertyId('new')
  }

  const handleDownload = (doc: typeof mockDocuments[0]) => {
    console.log('Download document:', doc.id)
    // Implementation for download
  }

  const handleView = (doc: typeof mockDocuments[0]) => {
    console.log('View document:', doc.id)
    // Implementation for view
  }

  const handleDelete = (doc: typeof mockDocuments[0]) => {
    console.log('Delete document:', doc.id)
    // Implementation for delete
  }

  // Calculate stats
  const docsByType = mockDocuments.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Documenten
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Al je documenten
                </p>
              </div>
              <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                <DialogTrigger asChild>
                  <Button className="bg-[#163300] hover:bg-[#356258] text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{showPreview ? 'Controleer gegevens' : 'Upload Document'}</DialogTitle>
                    <DialogDescription>
                      {showPreview
                        ? 'Controleer en corrigeer de geëxtraheerde gegevens'
                        : uploadForm.file
                          ? 'Document klaar voor upload'
                          : uploadForm.type
                            ? 'Selecteer het bestand'
                            : 'Kies eerst het documenttype'}
                    </DialogDescription>
                  </DialogHeader>

                  {showPreview ? (
                    <div className="py-4">
                      <ExtractionPreview
                        documentType={uploadForm.type}
                        extractedData={extractedData || {}}
                        isLoading={isExtracting}
                        error={extractionError}
                        properties={mockProperties.map((property) => ({
                          id: property.id,
                          name: property.name,
                          address: property.address,
                        }))}
                        matchedPropertyIds={matchedPropertyIds}
                        selectedPropertyId={selectedPropertyId}
                        onSelectProperty={setSelectedPropertyId}
                        onConfirm={handleConfirmExtraction}
                        onEdit={handleEditExtraction}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="doc-type">Selecteer type</Label>
                        <Select
                          value={uploadForm.type}
                          onValueChange={(value) => {
                            setUploadForm({ ...uploadForm, type: value })
                            if (uploadForm.file) {
                              void handleUpload(uploadForm.file, value)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kies een type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Keuring">Keuring</SelectItem>
                            <SelectItem value="Factuur">Factuur</SelectItem>
                            <SelectItem value="Verzekering">Verzekering</SelectItem>
                            <SelectItem value="Overig">Overig</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {uploadForm.type && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="file">Selecteer bestand</Label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-6 text-center hover:border-[#163300] dark:hover:border-[#9FE870] transition-colors cursor-pointer">
                              <Input
                                id="file"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null
                                  setUploadForm({ ...uploadForm, file })
                                  if (file && uploadForm.type) {
                                    void handleUpload(file, uploadForm.type)
                                  }
                                }}
                              />
                              <label htmlFor="file" className="cursor-pointer">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {uploadForm.file ? uploadForm.file.name : 'Klik om een bestand te selecteren of sleep het hier'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  PDF, JPG, PNG tot 10MB
                                </p>
                              </label>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {!showPreview && (
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowUploadModal(false)
                          setUploadForm({
                            file: null,
                            type: '',
                            propertyId: '',
                          })
                        }}
                      >
                        Annuleren
                      </Button>
                    </DialogFooter>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Totaal</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockDocuments.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contracten</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{docsByType['Contract'] || 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Keuringen</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{docsByType['Keuring'] || 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verzekeringen</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{docsByType['Verzekering'] || 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Facturen</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{docsByType['Factuur'] || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className={dashboardCardClass('mb-6')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Zoek op bestandsnaam..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Type: {typeFilter === 'all' ? 'Alle' : typeFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                        Alle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter('Contract')}>
                        Contract
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter('Keuring')}>
                        Keuring
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter('Factuur')}>
                        Factuur
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter('Verzekering')}>
                        Verzekering
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter('Overig')}>
                        Overig
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* Documents Table */}
            <Card className={dashboardCardClass()}>
              <CardHeader>
                <CardTitle>Alle Documenten ({filteredDocuments.length})</CardTitle>
                <CardDescription>Bekijk, download of verwijder documenten</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-neutral-800">
                      <TableHead>Bestandsnaam</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Gekoppeld aan</TableHead>
                      <TableHead>Upload datum</TableHead>
                      <TableHead>Grootte</TableHead>
                      <TableHead className="text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => (
                        <TableRow key={doc.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {getTypeIcon(doc.type)}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(doc.type)}
                          </TableCell>
                          <TableCell>
                            {doc.property ? (
                              <Button 
                                variant="link" 
                                className="p-0 h-auto font-medium text-[#163300] dark:text-[#9FE870]"
                                onClick={() => router.push(`/dashboard/employer/portfolio/properties/${doc.property?.id}`)}
                              >
                                {doc.property.address}
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-500">Algemeen</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {format(new Date(doc.uploadDate), 'd MMM yyyy', { locale: nl })}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{doc.size}</p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => handleView(doc)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => handleDownload(doc)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(doc)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">Geen documenten gevonden</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
    </>
  )
}



