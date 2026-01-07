'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User,
  Building2,
  Bell,
  Upload,
  Save,
} from 'lucide-react'

export default function SettingsPage() {
  // Account settings state
  const [accountForm, setAccountForm] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+31 6 12345678',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Company settings state
  const [companyForm, setCompanyForm] = useState({
    companyName: 'Mijn Vastgoedbeheer BV',
    address: 'Hoofdstraat 123',
    postalCode: '1234 AB',
    city: 'Amsterdam',
    kvk: '12345678',
    email: 'info@mijnvastgoed.nl',
    phone: '+31 20 1234567',
    logo: null as File | null,
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    newPayment: true,
    paymentOverdue: true,
    maintenanceRequest: true,
    documentExpiring: true,
    emailNotifications: true,
  })

  const handleSaveAccount = () => {
    console.log('Save account settings:', accountForm)
  }

  const handleSaveCompany = () => {
    console.log('Save company settings:', companyForm)
  }

  const handleSaveNotifications = () => {
    console.log('Save notification settings:', notificationSettings)
  }

  return (
    <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Instellingen
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Beheer je account en voorkeuren
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="account">
                  <User className="h-4 w-4 mr-2" />
                  Mijn Account
                </TabsTrigger>
                <TabsTrigger value="company">
                  <Building2 className="h-4 w-4 mr-2" />
                  Bedrijfsgegevens
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaties
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Mijn Account */}
              <TabsContent value="account">
                <Card className="border border-gray-200 dark:border-neutral-700">
                  <CardHeader>
                    <CardTitle>Persoonlijke Gegevens</CardTitle>
                    <CardDescription>Update je persoonlijke informatie</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Naam</Label>
                        <Input
                          id="name"
                          value={accountForm.name}
                          onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={accountForm.email}
                          onChange={(e) => setAccountForm({...accountForm, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefoonnummer</Label>
                      <Input
                        id="phone"
                        value={accountForm.phone}
                        onChange={(e) => setAccountForm({...accountForm, phone: e.target.value})}
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Wachtwoord Wijzigen
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Huidig wachtwoord</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={accountForm.currentPassword}
                            onChange={(e) => setAccountForm({...accountForm, currentPassword: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nieuw wachtwoord</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={accountForm.newPassword}
                            onChange={(e) => setAccountForm({...accountForm, newPassword: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Bevestig nieuw wachtwoord</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={accountForm.confirmPassword}
                            onChange={(e) => setAccountForm({...accountForm, confirmPassword: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSaveAccount} className="bg-[#002A1F] hover:bg-[#356258] text-white">
                        <Save className="h-4 w-4 mr-2" />
                        Opslaan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Bedrijfsgegevens */}
              <TabsContent value="company">
                <Card className="border border-gray-200 dark:border-neutral-700">
                  <CardHeader>
                    <CardTitle>Bedrijfsgegevens</CardTitle>
                    <CardDescription>Informatie voor correspondentie en documenten</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Bedrijfsnaam</Label>
                      <Input
                        id="company-name"
                        value={companyForm.companyName}
                        onChange={(e) => setCompanyForm({...companyForm, companyName: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Adres</Label>
                        <Input
                          id="address"
                          value={companyForm.address}
                          onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal-code">Postcode</Label>
                        <Input
                          id="postal-code"
                          value={companyForm.postalCode}
                          onChange={(e) => setCompanyForm({...companyForm, postalCode: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Plaats</Label>
                        <Input
                          id="city"
                          value={companyForm.city}
                          onChange={(e) => setCompanyForm({...companyForm, city: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kvk">KvK-nummer</Label>
                        <Input
                          id="kvk"
                          value={companyForm.kvk}
                          onChange={(e) => setCompanyForm({...companyForm, kvk: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-email">Email (voor correspondentie)</Label>
                        <Input
                          id="company-email"
                          type="email"
                          value={companyForm.email}
                          onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-phone">Telefoon</Label>
                        <Input
                          id="company-phone"
                          value={companyForm.phone}
                          onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="logo">Logo upload (voor documenten)</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-neutral-700">
                            {companyForm.logo ? (
                              <p className="text-xs text-center p-2">{companyForm.logo.name}</p>
                            ) : (
                              <Building2 className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <Input
                              id="logo"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setCompanyForm({...companyForm, logo: e.target.files?.[0] || null})}
                              className="hidden"
                            />
                            <label htmlFor="logo">
                              <Button variant="outline" asChild>
                                <span>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Logo
                                </span>
                              </Button>
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              PNG of JPG, max 2MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSaveCompany} className="bg-[#002A1F] hover:bg-[#356258] text-white">
                        <Save className="h-4 w-4 mr-2" />
                        Opslaan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Notificaties */}
              <TabsContent value="notifications">
                <Card className="border border-gray-200 dark:border-neutral-700">
                  <CardHeader>
                    <CardTitle>Notificatie Voorkeuren</CardTitle>
                    <CardDescription>Kies welke notificaties je wilt ontvangen</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-neutral-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Email notificaties</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ontvang alle notificaties via email
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                        />
                      </div>

                      <div className="space-y-4 pt-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">Email notificaties voor:</h3>
                        
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Nieuwe betaling</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Wanneer een huurder een betaling doet
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.newPayment}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newPayment: checked})}
                            disabled={!notificationSettings.emailNotifications}
                          />
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Huurachterstand &gt; 14 dagen</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Wanneer een betaling meer dan 14 dagen achterstallig is
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.paymentOverdue}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, paymentOverdue: checked})}
                            disabled={!notificationSettings.emailNotifications}
                          />
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Onderhoud gemeld</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Wanneer er een nieuwe onderhoudsmelding is
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.maintenanceRequest}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, maintenanceRequest: checked})}
                            disabled={!notificationSettings.emailNotifications}
                          />
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Document verloopt binnen 30 dagen</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Herinnering voor verlopende keuringen en verzekeringen
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.documentExpiring}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, documentExpiring: checked})}
                            disabled={!notificationSettings.emailNotifications}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSaveNotifications} className="bg-[#002A1F] hover:bg-[#356258] text-white">
                        <Save className="h-4 w-4 mr-2" />
                        Opslaan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
    </>
  )
}

