'use client'

import { useState, useRef, useCallback } from 'react'
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
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { mockDocuments, mockProperties } from '@/lib/mock-data/vastgoed'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
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
  const { isDemo, basePath } = useDashboardUser()
  const [searchQuery, setSearchQuery] = useState('')

  const documents = isDemo ? mockDocuments : []
  const properties = isDemo ? mockProperties : []
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Upload form state: meerdere bestanden, verwerken alleen op klik
  const [uploadForm, setUploadForm] = useState({
    files: [] as File[],
    type: '',
    propertyId: '',
  })
  const [previewFile, setPreviewFile] = useState<File | null>(null)

  // Per-file progress: status, 0-100 progress, error message
  const [fileStatus, setFileStatus] = useState<Record<string, 'pending' | 'processing' | 'done' | 'error'>>({})
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({})
  const [fileError, setFileError] = useState<Record<string, string>>({})
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fileKey = useCallback((file: File) => `${file.name}-${file.size}-${file.lastModified}`, [])

  // AI extraction state
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [matchedPropertyIds, setMatchedPropertyIds] = useState<string[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [isDragging, setIsDragging] = useState(false)

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

  const filteredDocuments = documents.filter((doc: typeof mockDocuments[0]) => {
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

  const handleProcessFile = async (file: File) => {
    const documentType = uploadForm.type
    if (!documentType) return

    const key = fileKey(file)
    setPreviewFile(file)
    setIsExtracting(true)
    setExtractionError(null)
    setExtractedData(null)
    setMatchedPropertyIds([])
    setSelectedPropertyId('new')
    setShowPreview(true)
    setFileStatus((s) => ({ ...s, [key]: 'processing' }))
    setFileProgress((p) => ({ ...p, [key]: 0 }))
    setFileError((e) => ({ ...e, [key]: '' }))

    // Simulated progress (0 → 85%) zodat de gebruiker ziet dat er iets gebeurt
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    let progress = 0
    progressIntervalRef.current = setInterval(() => {
      progress = Math.min(85, progress + 4 + Math.random() * 4)
      setFileProgress((p) => ({ ...p, [key]: Math.round(progress) }))
      if (progress >= 85 && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }, 280)

    try {
      const base64 = await fileToBase64(file)
      const mimeType = getMimeType(file)

      const response = await fetch('/api/documents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Content: base64, mimeType, documentType }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Extraction failed')
      }

      const result = await response.json()
      const data = result.data || {}
      setExtractedData(data)

      const extractedAddress = typeof data.propertyAddress === 'string' ? normalizeAddress(data.propertyAddress) : ''
      if (extractedAddress) {
        const scored = properties
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
      setFileProgress((p) => ({ ...p, [key]: 100 }))
      setFileStatus((s) => ({ ...s, [key]: 'done' }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Extraction failed'
      setExtractionError(message)
      setFileError((e) => ({ ...e, [key]: message }))
      setFileProgress((p) => ({ ...p, [key]: 100 }))
      setFileStatus((s) => ({ ...s, [key]: 'error' }))
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setIsExtracting(false)
    }
  }

  const handleConfirmExtraction = (data: Record<string, any>) => {
    console.log('Document upload with extracted data:', {
      file: previewFile?.name,
      type: uploadForm.type,
      propertyId: selectedPropertyId && selectedPropertyId !== 'new' ? selectedPropertyId : null,
      extractedData: data,
    })

    // TODO: Save document and extracted data to the system
    const fileToRemove = previewFile
    setShowPreview(false)
    setExtractedData(null)
    setPreviewFile(null)

    const newFiles = uploadForm.files.filter((f) => f !== fileToRemove)
    const keyToRemove = fileToRemove ? fileKey(fileToRemove) : ''
    setUploadForm((prev) => ({
      ...prev,
      files: newFiles,
      ...(newFiles.length === 0 ? { type: '', propertyId: '' } : {}),
    }))
    if (keyToRemove) {
      setFileStatus((s) => {
        const next = { ...s }
        delete next[keyToRemove]
        return next
      })
      setFileProgress((p) => {
        const next = { ...p }
        delete next[keyToRemove]
        return next
      })
      setFileError((e) => {
        const next = { ...e }
        delete next[keyToRemove]
        return next
      })
    }
    if (newFiles.length === 0) setShowUploadModal(false)
  }

  const handleEditExtraction = () => {
    setShowPreview(false)
    setExtractedData(null)
    setExtractionError(null)
    setMatchedPropertyIds([])
    setSelectedPropertyId('new')
    setPreviewFile(null)
  }

  const addFiles = (newFiles: FileList | File[]) => {
    const list = Array.from(newFiles)
    setUploadForm((prev) => ({ ...prev, files: [...prev.files, ...list] }))
    setFileStatus((s) => {
      const next = { ...s }
      list.forEach((file) => { next[fileKey(file)] = 'pending' })
      return next
    })
    setFileProgress((p) => {
      const next = { ...p }
      list.forEach((file) => { next[fileKey(file)] = 0 })
      return next
    })
  }

  const removeFile = (file: File) => {
    const key = fileKey(file)
    setUploadForm((prev) => ({ ...prev, files: prev.files.filter((f) => f !== file) }))
    setFileStatus((s) => {
      const next = { ...s }
      delete next[key]
      return next
    })
    setFileProgress((p) => {
      const next = { ...p }
      delete next[key]
      return next
    })
    setFileError((e) => {
      const next = { ...e }
      delete next[key]
      return next
    })
    if (previewFile === file) {
      setShowPreview(false)
      setPreviewFile(null)
      setExtractedData(null)
      setExtractionError(null)
    }
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
  const docsByType = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Drive
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
                        : uploadForm.files.length > 0
                          ? `${uploadForm.files.length} bestand(en) geladen. Kies een type en klik op Verwerken.`
                          : uploadForm.type
                            ? 'Voeg bestanden toe (klik of sleep), kies type en klik Verwerken'
                            : 'Kies eerst het documenttype en voeg daarna bestanden toe'}
                    </DialogDescription>
                  </DialogHeader>

                  {showPreview ? (
                    <div className="py-4">
                      <ExtractionPreview
                        documentType={uploadForm.type}
                        extractedData={extractedData || {}}
                        isLoading={isExtracting}
                        error={extractionError}
                        properties={properties.map((property: typeof mockProperties[0]) => ({
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
                          onValueChange={(value) => setUploadForm({ ...uploadForm, type: value })}
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
                            <div
                              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                                isDragging
                                  ? 'border-[#163300] dark:border-[#9FE870] bg-[#163300]/5 dark:bg-[#9FE870]/10'
                                  : 'border-gray-300 dark:border-neutral-700 hover:border-[#163300] dark:hover:border-[#9FE870]'
                              }`}
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsDragging(true)
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsDragging(false)
                              }}
                              onDrop={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsDragging(false)
                                const list = e.dataTransfer.files
                                if (list?.length) addFiles(list)
                              }}
                            >
                              <Input
                                id="file"
                                type="file"
                                className="hidden"
                                accept=".pdf,.docx,.doc,image/jpeg,image/png,image/gif,image/webp"
                                multiple
                                onChange={(e) => {
                                  const list = e.target.files
                                  if (list?.length) addFiles(list)
                                  e.target.value = ''
                                }}
                              />
                              <label htmlFor="file" className="cursor-pointer block">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Klik om bestanden te selecteren of sleep ze hier
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  PDF, Word (.docx), JPG, PNG. Meerdere bestanden mogelijk.
                                </p>
                              </label>
                            </div>
                            {uploadForm.files.length > 0 && (
                              <div className="space-y-2">
                                {(() => {
                                  const keys = uploadForm.files.map(fileKey)
                                  const done = keys.filter((k) => fileStatus[k] === 'done').length
                                  const processing = keys.filter((k) => fileStatus[k] === 'processing').length
                                  const pending = keys.filter((k) => fileStatus[k] === 'pending' || !fileStatus[k]).length
                                  const errors = keys.filter((k) => fileStatus[k] === 'error').length
                                  const parts = []
                                  if (done) parts.push(`${done} klaar`)
                                  if (processing) parts.push(`${processing} bezig`)
                                  if (pending) parts.push(`${pending} wachtrij`)
                                  if (errors) parts.push(`${errors} fout`)
                                  return (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Voortgang: {parts.length ? parts.join(', ') : '—'}
                                    </p>
                                  )
                                })()}
                                <Label>Geladen bestanden ({uploadForm.files.length})</Label>
                                <ul className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-neutral-700 p-2">
                                  {uploadForm.files.map((file) => {
                                    const key = fileKey(file)
                                    const status = fileStatus[key] || 'pending'
                                    const progress = fileProgress[key] ?? 0
                                    const errorMsg = fileError[key]
                                    return (
                                      <li
                                        key={key}
                                        className="rounded-md border border-gray-100 dark:border-neutral-700 p-2 space-y-1.5"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="truncate flex-1 text-sm font-medium" title={file.name}>
                                            {file.name}
                                          </span>
                                          <div className="flex items-center gap-1 shrink-0">
                                            {status === 'pending' && (
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="default"
                                                className="h-7 px-2 text-xs bg-[#163300] hover:bg-[#356258]"
                                                onClick={() => void handleProcessFile(file)}
                                                disabled={!uploadForm.type || isExtracting}
                                              >
                                                Verwerken
                                              </Button>
                                            )}
                                            {status === 'processing' && (
                                              <span className="flex items-center gap-1 text-xs text-[#163300] dark:text-[#9FE870]">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                {progress}%
                                              </span>
                                            )}
                                            {status === 'done' && (
                                              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Klaar
                                              </span>
                                            )}
                                            {status === 'error' && (
                                              <>
                                                <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400" title={errorMsg}>
                                                  <AlertCircle className="h-3.5 w-3.5" />
                                                  Fout
                                                </span>
                                                <Button
                                                  type="button"
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-7 px-2 text-xs"
                                                  onClick={() => {
                                                    setFileStatus((s) => ({ ...s, [key]: 'pending' }))
                                                    setFileProgress((p) => ({ ...p, [key]: 0 }))
                                                    setFileError((e) => ({ ...e, [key]: '' }))
                                                    void handleProcessFile(file)
                                                  }}
                                                  disabled={!uploadForm.type || isExtracting}
                                                >
                                                  Opnieuw
                                                </Button>
                                              </>
                                            )}
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="ghost"
                                              className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                                              onClick={() => removeFile(file)}
                                              title="Verwijderen"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                        {status === 'processing' && (
                                          <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                                            <div
                                              className="h-full bg-[#163300] dark:bg-[#9FE870] transition-all duration-300 ease-out"
                                              style={{ width: `${progress}%` }}
                                            />
                                          </div>
                                        )}
                                        {status === 'error' && errorMsg && (
                                          <p className="text-xs text-red-600 dark:text-red-400 truncate" title={errorMsg}>
                                            {errorMsg}
                                          </p>
                                        )}
                                      </li>
                                    )
                                  })}
                                </ul>
                              </div>
                            )}
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
                          setUploadForm({ files: [], type: '', propertyId: '' })
                          setFileStatus({})
                          setFileProgress({})
                          setFileError({})
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
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
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
                <CardTitle>Alle documenten ({filteredDocuments.length})</CardTitle>
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
                                onClick={() => router.push(`${basePath}/portfolio/properties/${doc.property?.id}`)}
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



