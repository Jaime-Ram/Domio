'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Upload,
  Download,
  Eye,
  Bell,
} from 'lucide-react'
import { mockCompliance, mockRentArrearsProcedures, mockLetterTemplates, mockProperties, mockTenants } from '@/lib/mock-data/vastgoed'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function CompliancePage() {
  const router = useRouter()
  const [selectedProperty, setSelectedProperty] = useState<typeof mockProperties[0] | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof mockLetterTemplates[0] | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'green':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Compliant</Badge>
      case 'orange':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-500"><Clock className="h-3 w-3 mr-1" />Aandacht</Badge>
      case 'red':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500"><XCircle className="h-3 w-3 mr-1" />Niet compliant</Badge>
      default:
        return null
    }
  }

  const getCheckIcon = (valid: boolean | null) => {
    if (valid === true) return <CheckCircle2 className="h-5 w-5 text-green-600" />
    if (valid === false) return <XCircle className="h-5 w-5 text-red-600" />
    return <Clock className="h-5 w-5 text-orange-600" />
  }

  const handleViewDetails = (property: typeof mockProperties[0]) => {
    setSelectedProperty(property)
    setShowDetailModal(true)
  }

  const handleGenerateLetter = (template: typeof mockLetterTemplates[0], procedure: typeof mockRentArrearsProcedures[0]) => {
    setSelectedTemplate(template)
    setShowTemplateModal(true)
    // In real implementation, this would fill in merge fields
  }

  // Calculate stats
  const compliantCount = mockCompliance.filter(c => c.overallStatus === 'green').length
  const needsAttention = mockCompliance.filter(c => c.overallStatus === 'orange').length
  const nonCompliant = mockCompliance.filter(c => c.overallStatus === 'red').length

  return (
    <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Compliance
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Voldoe aan Nederlandse wetgeving en regelgeving
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Compliant</p>
                      <p className="text-2xl font-bold text-green-600">{compliantCount}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Aandacht vereist</p>
                      <p className="text-2xl font-bold text-orange-600">{needsAttention}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCardClass()}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Niet compliant</p>
                      <p className="text-2xl font-bold text-red-600">{nonCompliant}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="checklist" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>
                <TabsTrigger value="arrears">Huurachterstand Procedures</TabsTrigger>
              </TabsList>

              {/* Tab 1: Compliance Checklist */}
              <TabsContent value="checklist">
                <Card className={dashboardCardClass()}>
                  <CardHeader>
                    <CardTitle>Compliance per Pand</CardTitle>
                    <CardDescription>Status van verplichte items per object</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-neutral-800">
                          <TableHead>Pand</TableHead>
                          <TableHead className="text-center">Rookmelders</TableHead>
                          <TableHead className="text-center">Elektra-keuring</TableHead>
                          <TableHead className="text-center">Verzekering</TableHead>
                          <TableHead>Overall Status</TableHead>
                          <TableHead className="text-right">Acties</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockCompliance.map((item) => (
                          <TableRow key={item.propertyId} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                            <TableCell>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {item.property.address}
                              </p>
                            </TableCell>
                            <TableCell className="text-center">
                              {getCheckIcon(item.smokeDetectors)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                {getCheckIcon(item.electricityInspection.valid)}
                                {item.electricityInspection.expiryDate && (
                                  <span className="text-xs text-gray-500">
                                    t/m {format(new Date(item.electricityInspection.expiryDate), 'MM/yyyy')}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                {getCheckIcon(item.insurance.valid)}
                                {item.insurance.expiryDate && (
                                  <span className="text-xs text-gray-500">
                                    t/m {format(new Date(item.insurance.expiryDate), 'MM/yyyy')}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(item.overallStatus)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewDetails(item.property)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Detail Modal */}
                <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Compliance Details</DialogTitle>
                      <DialogDescription>
                        {selectedProperty?.address}
                      </DialogDescription>
                    </DialogHeader>
                    {selectedProperty && (
                      <div className="space-y-6 py-4">
                        {/* Rookmelders */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Rookmelders aanwezig?</Label>
                            <Checkbox defaultChecked={mockCompliance.find(c => c.propertyId === selectedProperty.id)?.smokeDetectors} />
                          </div>
                        </div>

                        {/* Elektra-keuring */}
                        <div className="space-y-3 border-t pt-4">
                          <p className="font-medium text-gray-900 dark:text-white">Elektra-keuring geldig?</p>
                          <div className="flex items-center gap-2">
                            <Checkbox defaultChecked={mockCompliance.find(c => c.propertyId === selectedProperty.id)?.electricityInspection.valid} />
                            <span className="text-sm">Geldig</span>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expiry-date">Vervaldatum</Label>
                            <Input
                              id="expiry-date"
                              type="date"
                              defaultValue={mockCompliance.find(c => c.propertyId === selectedProperty.id)?.electricityInspection.expiryDate || ''}
                            />
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload document
                          </Button>
                        </div>

                        {/* Verzekering */}
                        <div className="space-y-3 border-t pt-4">
                          <p className="font-medium text-gray-900 dark:text-white">Verzekering actief?</p>
                          <div className="flex items-center gap-2">
                            <Checkbox defaultChecked={mockCompliance.find(c => c.propertyId === selectedProperty.id)?.insurance.valid} />
                            <span className="text-sm">Actief</span>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="insurance-expiry">Vervaldatum</Label>
                            <Input
                              id="insurance-expiry"
                              type="date"
                              defaultValue={mockCompliance.find(c => c.propertyId === selectedProperty.id)?.insurance.expiryDate || ''}
                            />
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload polis
                          </Button>
                        </div>

                        {/* Huurdersverzekering */}
                        <div className="space-y-2 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <Label>Huurdersverzekering ontvangen?</Label>
                            <Checkbox defaultChecked={mockCompliance.find(c => c.propertyId === selectedProperty.id)?.tenantInsurance} />
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload document
                          </Button>
                        </div>

                        {/* Alerts */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-400">Automatische herinneringen</p>
                              <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
                                Je ontvangt 30 dagen voor de vervaldatum een email notificatie.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                        Sluiten
                      </Button>
                      <Button className="bg-[#002A1F] hover:bg-[#356258]">
                        Opslaan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              {/* Tab 2: Huurachterstand Procedures */}
              <TabsContent value="arrears">
                <Card className={dashboardCardClass('mb-6')}>
                  <CardHeader>
                    <CardTitle>Actieve Huurachterstand Procedures</CardTitle>
                    <CardDescription>Procedures voor huurders met achterstand</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mockRentArrearsProcedures.length > 0 ? (
                      <div className="space-y-6">
                        {mockRentArrearsProcedures.map((procedure) => (
                          <div key={procedure.id} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {procedure.tenant.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {procedure.property.address}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge className="bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500">
                                    Achterstand: €{procedure.totalArrears.toLocaleString('nl-NL')}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {procedure.daysPastDue} dagen achterstallig
                                  </span>
                                </div>
                              </div>
                              <Badge variant="outline">{procedure.status}</Badge>
                            </div>

                            {/* Procedure Steps */}
                            <div className="space-y-3">
                              {procedure.steps.map((step) => (
                                <div 
                                  key={step.step} 
                                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                                    step.completed 
                                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' 
                                      : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700'
                                  }`}
                                >
                                  <div className="flex-shrink-0">
                                    {step.completed ? (
                                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    ) : (
                                      <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        Stap {step.step}: {step.name}
                                      </p>
                                      {step.completedDate && (
                                        <span className="text-xs text-gray-500">
                                          {format(new Date(step.completedDate), 'd MMM yyyy', { locale: nl })}
                                        </span>
                                      )}
                                    </div>
                                    {step.notes && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{step.notes}</p>
                                    )}
                                    {step.document && (
                                      <Button size="sm" variant="outline" className="mt-2">
                                        <Download className="h-3 w-3 mr-2" />
                                        {step.document}
                                      </Button>
                                    )}
                                    {!step.completed && (
                                      <div className="flex gap-2 mt-3">
                                        <Button size="sm" className="bg-[#002A1F] hover:bg-[#356258]">
                                          <CheckCircle2 className="h-3 w-3 mr-2" />
                                          Markeer als voltooid
                                        </Button>
                                        {step.step <= 3 && (
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => {
                                              const template = mockLetterTemplates[step.step - 1]
                                              if (template) handleGenerateLetter(template, procedure)
                                            }}
                                          >
                                            <FileText className="h-3 w-3 mr-2" />
                                            Genereer brief
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Geen actieve huurachterstand procedures
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Brief Templates */}
                <Card className={dashboardCardClass()}>
                  <CardHeader>
                    <CardTitle>Brief Templates</CardTitle>
                    <CardDescription>Standaard templates voor huurachterstand communicatie</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {mockLetterTemplates.map((template) => (
                        <div 
                          key={template.id}
                          className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <FileText className="h-8 w-8 text-[#002A1F] dark:text-[#9AFF7C] mb-3" />
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {template.name}
                          </h4>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              setSelectedTemplate(template)
                              setShowTemplateModal(true)
                            }}
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            Bekijk template
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Template Preview Modal */}
                <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                      <DialogDescription>
                        Bekijk en genereer de brief met automatisch ingevulde gegevens
                      </DialogDescription>
                    </DialogHeader>
                    {selectedTemplate && (
                      <div className="space-y-4 py-4">
                        <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                          <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-sans">
                            {selectedTemplate.content}
                          </pre>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                          <p className="text-xs text-blue-900 dark:text-blue-400">
                            Merge velden zoals {`{{huurder_naam}}, {{bedrag}}, {{adres}}`} worden automatisch ingevuld bij genereren.
                          </p>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                        Sluiten
                      </Button>
                      <Button className="bg-[#002A1F] hover:bg-[#356258]">
                        <Download className="h-4 w-4 mr-2" />
                        Genereer PDF
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
    </>
  )
}



