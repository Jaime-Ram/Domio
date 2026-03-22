'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  BookOpen,
  Calculator,
  Link2,
  CheckCircle2,
  ExternalLink,
  Plug,
  X,
  Building2,
  TrendingUp,
  FileText,
  Download,
  Upload
} from 'lucide-react'

interface AccountingIntegration {
  id: string
  name: string
  description: string
  logo?: string
  website: string
  isConnected: boolean
  connectedDate?: string
}

const accountingIntegrations: AccountingIntegration[] = [
  {
    id: 'exact-online',
    name: 'Exact Online',
    description: 'Integreer met Exact Online voor automatische boekhouding en administratie',
    website: 'https://www.exact.com/nl',
    isConnected: false,
  },
  {
    id: 'afas',
    name: 'AFAS',
    description: 'Koppel met AFAS voor complete administratieve oplossingen',
    website: 'https://www.afas.nl',
    isConnected: false,
  },
  {
    id: 'moneybird',
    name: 'Moneybird',
    description: 'Synchroniseer facturen en administratie met Moneybird',
    website: 'https://www.moneybird.nl',
    isConnected: true,
    connectedDate: '2024-01-15',
  },
  {
    id: 'yuki',
    name: 'Yuki',
    description: 'Automatiseer je boekhouding met Yuki integratie',
    website: 'https://www.yuki.nl',
    isConnected: false,
  },
  {
    id: 'snelstart',
    name: 'SnelStart',
    description: 'Koppel met SnelStart voor eenvoudige boekhouding',
    website: 'https://www.snelstart.nl',
    isConnected: false,
  },
  {
    id: 'eboekhouden',
    name: 'e-Boekhouden.nl',
    description: 'Integreer met e-Boekhouden.nl voor online boekhouden',
    website: 'https://www.e-boekhouden.nl',
    isConnected: false,
  },
  {
    id: 'jortt',
    name: 'Jortt',
    description: 'Automatiseer facturering en administratie met Jortt',
    website: 'https://www.jortt.nl',
    isConnected: false,
  },
]

export default function AccountingPage() {
  const { basePath, isDemo } = useDashboardUser()
  const [integrations, setIntegrations] = useState<AccountingIntegration[]>(accountingIntegrations)
  const [showConnectDialog, setShowConnectDialog] = useState<string | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<AccountingIntegration | null>(null)

  const handleConnect = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId)
    if (integration) {
      setSelectedIntegration(integration)
      setShowConnectDialog(integrationId)
    }
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, isConnected: false, connectedDate: undefined }
          : integration
      )
    )
  }

  const confirmConnect = () => {
    if (selectedIntegration) {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === selectedIntegration.id 
            ? { ...integration, isConnected: true, connectedDate: new Date().toISOString().split('T')[0] }
            : integration
        )
      )
      setShowConnectDialog(null)
      setSelectedIntegration(null)
      // Here you would typically call an API to actually connect the integration
      console.log('Connecting to:', selectedIntegration.name)
    }
  }

  const connectedIntegrations = integrations.filter(i => i.isConnected)
  const availableIntegrations = integrations.filter(i => !i.isConnected)

  return (
    <div className="pl-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870] mb-2">
          Boekhouden
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Beheer je boekhouding zelf of koppel met een bestaand boekhoudprogramma
        </p>
      </div>

      {/* Eigen Boekhouding Section */}
      <Card className={dashboardCardClass('mb-8', isDemo)}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#163300]/10 dark:bg-[#9FE870]/10 rounded-lg">
              <Calculator className="h-6 w-6 text-[#163300] dark:text-[#9FE870]" />
            </div>
            <div className="flex-1">
              <CardTitle className="mb-2">Eigen Boekhouding</CardTitle>
              <CardDescription>
                Gebruik de ingebouwde boekhoudfunctionaliteit van Domio om direct te kunnen boeken zonder externe software.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-[#163300] dark:text-[#9FE870]">Facturen</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Creëer en beheer facturen
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Ga naar Facturen
              </Button>
            </div>
            <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-[#163300] dark:text-[#9FE870]">Inkomsten & Uitgaven</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Registreer en beheer financiële transacties
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`${basePath}/financial`}>Ga naar Financieel</a>
              </Button>
            </div>
            <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Export</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Exporteer data voor externe boekhouding
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Exporteer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gekoppelde Integraties */}
      {connectedIntegrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#163300] dark:text-[#9FE870] mb-4">
            Gekoppelde Integraties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedIntegrations.map((integration) => (
              <Card key={integration.id} className={dashboardCardClass()}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg">
                        <Plug className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        {integration.connectedDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Gekoppeld op {new Date(integration.connectedDate).toLocaleDateString('nl-NL')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white hover:bg-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Gekoppeld
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {integration.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(integration.website, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Website
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Ontkoppel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Beschikbare Integraties */}
      <div>
        <h2 className="text-xl font-semibold text-[#163300] dark:text-[#9FE870] mb-4">
          Beschikbare Integraties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableIntegrations.map((integration) => (
            <Card key={integration.id} className={dashboardCardClass('hover:border-[#163300] dark:hover:border-[#9FE870] transition-colors', isDemo)}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                      <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {integration.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(integration.id)}
                    className="flex-1"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Koppel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(integration.website, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog !== null} onOpenChange={(open) => !open && setShowConnectDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Koppel {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                Je wordt doorgestuurd naar {selectedIntegration?.name} om de koppeling te autoriseren. 
                Na goedkeuring wordt de integratie automatisch gekoppeld aan je Domio account.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Automatische synchronisatie van facturen</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Export van financiële gegevens</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Veilige OAuth-authenticatie</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(null)}>
              Annuleren
            </Button>
            <Button 
              onClick={confirmConnect}
              className="bg-[#163300] hover:bg-[#356258] text-white"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Start Koppeling
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

