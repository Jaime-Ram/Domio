'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, Building2, Users, FileText, Wrench, Euro, FolderOpen, ShieldCheck, Settings, Plus, Download, Send, Edit, Eye, Calendar, BarChart3, Home, UserCircle, Briefcase, Link2, CreditCard, Receipt, TrendingUp, CheckCircle, AlertCircle, Zap, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchAction {
  id: string
  label: string
  category: string
  keywords: string[]
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  description?: string
}

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const allActions: SearchAction[] = [
    // Panden
    { id: 'property-add', label: 'Nieuw pand toevoegen', category: 'Panden', keywords: ['pand', 'toevoegen', 'nieuw', 'object', 'property', 'add'], icon: Plus, action: () => router.push('/dashboard/employer/portfolio/properties/new'), description: 'Voeg een nieuw pand toe aan je portefeuille' },
    { id: 'property-view', label: 'Panden bekijken', category: 'Panden', keywords: ['pand', 'bekijken', 'portfolio', 'objecten', 'properties', 'view'], icon: Building2, action: () => router.push('/dashboard/employer/portfolio'), description: 'Bekijk al je panden en objecten' },
    { id: 'property-edit', label: 'Pand bewerken', category: 'Panden', keywords: ['pand', 'bewerken', 'edit', 'wijzigen', 'aanpassen'], icon: Edit, action: () => router.push('/dashboard/employer/portfolio'), description: 'Bewerk pand details' },
    
    // Huurders
    { id: 'tenant-add', label: 'Nieuwe huurder aanmaken', category: 'Huurders', keywords: ['huurder', 'aanmaken', 'toevoegen', 'nieuw', 'tenant', 'add', 'create'], icon: Plus, action: () => router.push('/dashboard/employer/tenants/new'), description: 'Maak een nieuwe huurder aan' },
    { id: 'tenant-view', label: 'Huurders bekijken', category: 'Huurders', keywords: ['huurder', 'bekijken', 'tenants', 'view', 'overzicht'], icon: Users, action: () => router.push('/dashboard/employer/tenants'), description: 'Bekijk alle huurders' },
    { id: 'tenant-edit', label: 'Huurder bewerken', category: 'Huurders', keywords: ['huurder', 'bewerken', 'edit', 'wijzigen'], icon: Edit, action: () => router.push('/dashboard/employer/tenants'), description: 'Bewerk huurder informatie' },
    
    // Contracten
    { id: 'contract-download', label: 'Contract downloaden', category: 'Contracten', keywords: ['contract', 'downloaden', 'download', 'huurovereenkomst', 'pdf'], icon: Download, action: () => router.push('/dashboard/employer/contracts/leases'), description: 'Download huurovereenkomst als PDF' },
    { id: 'contract-send', label: 'Contract verzenden', category: 'Contracten', keywords: ['contract', 'verzenden', 'send', 'email', 'sturen'], icon: Send, action: () => router.push('/dashboard/employer/contracts/leases'), description: 'Verstuur contract via email' },
    { id: 'contract-create', label: 'Nieuw contract aanmaken', category: 'Contracten', keywords: ['contract', 'aanmaken', 'nieuw', 'huurovereenkomst', 'create'], icon: Plus, action: () => router.push('/dashboard/employer/contracts/leases/new'), description: 'Maak een nieuw huurcontract aan' },
    { id: 'contract-view', label: 'Contracten bekijken', category: 'Contracten', keywords: ['contract', 'bekijken', 'overzicht', 'leases'], icon: FileText, action: () => router.push('/dashboard/employer/contracts/leases'), description: 'Bekijk alle contracten' },
    
    // Onderhoud
    { id: 'maintenance-create', label: 'Onderhoudsmelding aanmaken', category: 'Onderhoud', keywords: ['onderhoud', 'melding', 'ticket', 'aanmaken', 'reparatie', 'maintenance'], icon: Plus, action: () => router.push('/dashboard/employer/maintenance/tickets/new'), description: 'Maak een nieuwe onderhoudsmelding' },
    { id: 'maintenance-view', label: 'Onderhoud bekijken', category: 'Onderhoud', keywords: ['onderhoud', 'bekijken', 'tickets', 'reparaties', 'maintenance'], icon: Wrench, action: () => router.push('/dashboard/employer/maintenance'), description: 'Bekijk alle onderhoudsmeldingen' },
    
    // Financieel
    { id: 'invoice-create', label: 'Factuur aanmaken', category: 'Financieel', keywords: ['factuur', 'invoice', 'aanmaken', 'nieuw', 'billing'], icon: Plus, action: () => router.push('/dashboard/employer/financial/invoices/new'), description: 'Maak een nieuwe factuur aan' },
    { id: 'invoice-send', label: 'Factuur verzenden', category: 'Financieel', keywords: ['factuur', 'verzenden', 'send', 'email', 'sturen', 'invoice'], icon: Send, action: () => router.push('/dashboard/employer/financial/invoices'), description: 'Verstuur factuur via email' },
    { id: 'invoice-download', label: 'Factuur downloaden', category: 'Financieel', keywords: ['factuur', 'downloaden', 'download', 'pdf', 'invoice'], icon: Download, action: () => router.push('/dashboard/employer/financial/invoices'), description: 'Download factuur als PDF' },
    { id: 'invoice-view', label: 'Facturen bekijken', category: 'Financieel', keywords: ['factuur', 'invoice', 'bekijken', 'overzicht'], icon: Receipt, action: () => router.push('/dashboard/employer/financial/invoices'), description: 'Bekijk alle facturen' },
    { id: 'payment-view', label: 'Betalingen bekijken', category: 'Financieel', keywords: ['betaling', 'payment', 'bekijken', 'transacties'], icon: CreditCard, action: () => router.push('/dashboard/employer/financial/payments'), description: 'Bekijk alle betalingen' },
    { id: 'financial-reports', label: 'Financiële rapporten', category: 'Financieel', keywords: ['rapport', 'report', 'financieel', 'overzicht', 'stats'], icon: BarChart3, action: () => router.push('/dashboard/employer/financial/reports'), description: 'Bekijk financiële rapporten en statistieken' },
    
    // Documenten
    { id: 'document-upload', label: 'Document uploaden', category: 'Documenten', keywords: ['document', 'uploaden', 'upload', 'bestand', 'toevoegen'], icon: Plus, action: () => router.push('/dashboard/employer/documents'), description: 'Upload een nieuw document' },
    { id: 'document-view', label: 'Documenten bekijken', category: 'Documenten', keywords: ['document', 'bekijken', 'bestanden', 'files'], icon: FolderOpen, action: () => router.push('/dashboard/employer/documents'), description: 'Bekijk alle documenten' },
    { id: 'document-download', label: 'Document downloaden', category: 'Documenten', keywords: ['document', 'downloaden', 'download', 'pdf'], icon: Download, action: () => router.push('/dashboard/employer/documents'), description: 'Download documenten' },
    { id: 'document-send', label: 'Document verzenden', category: 'Documenten', keywords: ['document', 'verzenden', 'send', 'email', 'sturen'], icon: Send, action: () => router.push('/dashboard/employer/documents'), description: 'Verstuur document via email' },
    
    // Onderhoud acties
    { id: 'maintenance-assign', label: 'Onderhoud toewijzen', category: 'Onderhoud', keywords: ['onderhoud', 'toewijzen', 'assign', 'leverancier', 'supplier'], icon: Edit, action: () => router.push('/dashboard/employer/maintenance'), description: 'Wijs onderhoud toe aan leverancier' },
    { id: 'maintenance-complete', label: 'Onderhoud voltooien', category: 'Onderhoud', keywords: ['onderhoud', 'voltooien', 'complete', 'afronden', 'afgewerkt'], icon: CheckCircle, action: () => router.push('/dashboard/employer/maintenance'), description: 'Markeer onderhoud als voltooid' },
    
    // Contract acties
    { id: 'contract-renew', label: 'Contract verlengen', category: 'Contracten', keywords: ['contract', 'verlengen', 'renew', 'verlenging'], icon: Calendar, action: () => router.push('/dashboard/employer/contracts/leases'), description: 'Verleng een huurcontract' },
    { id: 'contract-terminate', label: 'Contract beëindigen', category: 'Contracten', keywords: ['contract', 'beëindigen', 'terminate', 'opzeggen', 'ontbinden'], icon: AlertCircle, action: () => router.push('/dashboard/employer/contracts/leases'), description: 'Beëindig een huurcontract' },
    
    // Portefeuille acties
    { id: 'portfolio-owners', label: 'Eigenaren bekijken', category: 'Portefeuille', keywords: ['eigenaar', 'owner', 'eigenaren', 'owners'], icon: UserCircle, action: () => router.push('/dashboard/employer/portfolio/owners'), description: 'Bekijk alle eigenaren' },
    
    // Huurders acties
    { id: 'tenant-delete', label: 'Huurder verwijderen', category: 'Huurders', keywords: ['huurder', 'verwijderen', 'delete', 'verwijder'], icon: AlertCircle, action: () => router.push('/dashboard/employer/tenants'), description: 'Verwijder een huurder' },
    
    // Onderhoud acties (extra)
    { id: 'maintenance-inspection', label: 'Inspectie plannen', category: 'Onderhoud', keywords: ['inspectie', 'inspection', 'plannen', 'schedule', 'plan'], icon: Calendar, action: () => router.push('/dashboard/employer/maintenance/inspections'), description: 'Plan een nieuwe inspectie' },
    
    // Financieel acties (extra)
    { id: 'payment-record', label: 'Betaling registreren', category: 'Financieel', keywords: ['betaling', 'registreren', 'record', 'payment', 'toevoegen'], icon: Plus, action: () => router.push('/dashboard/employer/financial/payments'), description: 'Registreer een nieuwe betaling' },
    { id: 'indexation-calculate', label: 'Indexatie berekenen', category: 'Financieel', keywords: ['indexatie', 'indexation', 'berekenen', 'calculate', 'verhogen'], icon: TrendingUp, action: () => router.push('/dashboard/employer/financial/indexation'), description: 'Bereken huurindexatie' },
    { id: 'service-costs', label: 'Servicekosten afrekenen', category: 'Financieel', keywords: ['servicekosten', 'service', 'afrekenen', 'settlement', 'afrekening'], icon: Receipt, action: () => router.push('/dashboard/employer/financial/service-costs'), description: 'Maak servicekostenafrekening' },
    
    // Portefeuille acties (extra)
    { id: 'property-delete', label: 'Pand verwijderen', category: 'Panden', keywords: ['pand', 'verwijderen', 'delete', 'verwijder'], icon: AlertCircle, action: () => router.push('/dashboard/employer/portfolio'), description: 'Verwijder een pand' },
    
    // Boekhouden
    { id: 'accounting-view', label: 'Boekhouden', category: 'Boekhouden', keywords: ['boekhouden', 'accounting', 'boekhouding', 'administratie'], icon: BookOpen, action: () => router.push('/dashboard/employer/accounting'), description: 'Beheer boekhouding en integraties' },
    { id: 'accounting-integration', label: 'Boekhoudprogramma koppelen', category: 'Boekhouden', keywords: ['boekhoudprogramma', 'koppelen', 'integratie', 'exact', 'moneybird', 'afas'], icon: Link2, action: () => router.push('/dashboard/employer/accounting'), description: 'Koppel een boekhoudprogramma' },
    { id: 'accounting-export', label: 'Exporteer boekhouding', category: 'Boekhouden', keywords: ['export', 'exporteren', 'boekhouding', 'data'], icon: Download, action: () => router.push('/dashboard/employer/accounting'), description: 'Exporteer boekhouddata' },
    
    // Pagina's
    { id: 'page-dashboard', label: 'Dashboard', category: 'Pagina\'s', keywords: ['dashboard', 'overzicht', 'home'], icon: BarChart3, action: () => router.push('/dashboard/employer'), description: 'Ga naar het dashboard' },
    { id: 'page-portfolio', label: 'Portefeuille', category: 'Pagina\'s', keywords: ['portefeuille', 'portfolio', 'panden', 'objecten'], icon: Building2, action: () => router.push('/dashboard/employer/portfolio'), description: 'Bekijk je portefeuille' },
    { id: 'page-tenants', label: 'Huurders', category: 'Pagina\'s', keywords: ['huurders', 'tenants'], icon: Users, action: () => router.push('/dashboard/employer/tenants'), description: 'Bekijk alle huurders' },
    { id: 'page-contracts', label: 'Contracten', category: 'Pagina\'s', keywords: ['contracten', 'contracts', 'huurovereenkomsten'], icon: FileText, action: () => router.push('/dashboard/employer/contracts/leases'), description: 'Bekijk alle contracten' },
    { id: 'page-maintenance', label: 'Onderhoud', category: 'Pagina\'s', keywords: ['onderhoud', 'maintenance', 'tickets'], icon: Wrench, action: () => router.push('/dashboard/employer/maintenance'), description: 'Bekijk onderhoud' },
    { id: 'page-financial', label: 'Financieel', category: 'Pagina\'s', keywords: ['financieel', 'financial', 'geld', 'facturen'], icon: Euro, action: () => router.push('/dashboard/employer/financial'), description: 'Bekijk financiën' },
    { id: 'page-accounting', label: 'Boekhouden', category: 'Pagina\'s', keywords: ['boekhouden', 'accounting', 'boekhouding'], icon: BookOpen, action: () => router.push('/dashboard/employer/accounting'), description: 'Bekijk boekhouden' },
    { id: 'page-documents', label: 'Documenten', category: 'Pagina\'s', keywords: ['documenten', 'documents', 'bestanden'], icon: FolderOpen, action: () => router.push('/dashboard/employer/documents'), description: 'Bekijk documenten' },
    { id: 'page-compliance', label: 'Compliance', category: 'Pagina\'s', keywords: ['compliance', 'naleving'], icon: ShieldCheck, action: () => router.push('/dashboard/employer/compliance'), description: 'Bekijk compliance' },
    { id: 'page-settings', label: 'Instellingen', category: 'Pagina\'s', keywords: ['instellingen', 'settings', 'configuratie'], icon: Settings, action: () => router.push('/dashboard/employer/settings'), description: 'Bekijk instellingen' },
  ]

  const fuzzyMatch = (text: string, pattern: string): number => {
    const textLower = text.toLowerCase()
    const patternLower = pattern.toLowerCase()
    
    // Exact match
    if (textLower === patternLower) return 1.0
    
    // Starts with match (highest priority after exact)
    if (textLower.startsWith(patternLower)) return 0.9
    
    // Contains match
    if (textLower.includes(patternLower)) return 0.8
    
    // Word matching
    const textWords = textLower.split(/\s+/)
    const patternWords = patternLower.split(/\s+/)
    const matchingWords = patternWords.filter(pw => textWords.some(tw => tw.includes(pw) || pw.includes(tw))).length
    if (matchingWords === patternWords.length) return 0.7
    if (matchingWords > 0) return 0.5 + (matchingWords / patternWords.length) * 0.2
    
    // Character matching (fuzzy)
    let charMatches = 0
    let textIndex = 0
    for (let i = 0; i < patternLower.length; i++) {
      const charIndex = textLower.indexOf(patternLower[i], textIndex)
      if (charIndex !== -1) {
        charMatches++
        textIndex = charIndex + 1
      }
    }
    
    return charMatches > 0 ? (charMatches / patternLower.length) * 0.4 : 0
  }

  // Popular/Default suggestions when no query
  const defaultSuggestions = useMemo(() => [
    allActions.find(a => a.id === 'property-add'),
    allActions.find(a => a.id === 'tenant-add'),
    allActions.find(a => a.id === 'contract-create'),
    allActions.find(a => a.id === 'invoice-create'),
    allActions.find(a => a.id === 'maintenance-create'),
    allActions.find(a => a.id === 'document-upload'),
    allActions.find(a => a.id === 'accounting-view'),
    allActions.find(a => a.id === 'page-dashboard'),
  ].filter(Boolean) as SearchAction[], [])

  const filteredActions = useMemo(() => {
    // Show default suggestions when search is empty but open
    if (query.trim() === '') {
      return defaultSuggestions
    }
    
    // Filter actions based on query
    return allActions
      .map(action => ({
        ...action,
        score: Math.max(
          ...action.keywords.map(keyword => fuzzyMatch(keyword, query)),
          fuzzyMatch(action.label, query),
          fuzzyMatch(action.category, query),
          action.description ? fuzzyMatch(action.description, query) : 0
        )
      }))
      .filter(action => action.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [query, defaultSuggestions])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (event.key === 'Enter' && filteredActions[selectedIndex]) {
        event.preventDefault()
        filteredActions[selectedIndex].action()
        setQuery('')
        setIsOpen(false)
      } else if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, filteredActions, selectedIndex])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setIsOpen(true)
    setSelectedIndex(0)
  }

  const handleActionClick = (action: SearchAction) => {
    action.action()
    setQuery('')
    setIsOpen(false)
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl min-w-0">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Zoek voor alles..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4 h-10 rounded-full border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm placeholder:text-gray-400 focus-visible:ring-[#002A1F] dark:focus-visible:ring-[#9AFF7C]"
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && filteredActions.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-[1.75rem] border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg z-50 max-h-96 overflow-y-auto overflow-x-hidden">
          {query.trim() === '' && (
            <div className="px-4 py-3 border-b border-gray-200/80 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-800/50">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Populaire acties</p>
            </div>
          )}
          <div className="p-2">
            {filteredActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 rounded-2xl transition-colors text-left',
                    index === selectedIndex
                      ? 'bg-gray-100 dark:bg-neutral-800'
                      : 'hover:bg-gray-50 dark:hover:bg-neutral-800/70'
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0 h-9 w-9 rounded-full bg-[#002A1F]/10 dark:bg-[#9AFF7C]/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#002A1F] dark:text-[#9AFF7C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.label}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-0.5 rounded-xl">
                        {action.category}
                      </span>
                    </div>
                    {action.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {action.description}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {isOpen && query.trim() !== '' && filteredActions.length === 0 && (
        <div className="absolute top-full mt-2 w-full rounded-[1.75rem] border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-8 text-center">
            <Search className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Geen resultaten gevonden voor &quot;{query}&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

