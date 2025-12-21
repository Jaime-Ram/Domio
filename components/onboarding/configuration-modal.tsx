'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Settings, 
  Building2, 
  Users, 
  CreditCard, 
  CheckCircle2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfigurationModalProps {
  user: any
  userProfile: any
  onComplete: () => void
}

export function ConfigurationModal({ user, userProfile, onComplete }: ConfigurationModalProps) {
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    // Personal info
    fullName: userProfile?.full_name || user?.user_metadata?.full_name || '',
    phoneNumber: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'nl',
    
    // Employer specific
    restaurantName: userProfile?.restaurant_name || '',
    restaurantAddress: '',
    restaurantPhone: '',
    businessType: 'restaurant',
    taxId: '',
    
    // Employee specific
    position: '',
    hourlyRate: '',
    preferredPaymentMethod: 'bank_transfer',
    
    // Preferences
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
  })

  const isEmployer = userProfile?.role === 'employer'
  const isEmployee = userProfile?.role === 'employee'

  // Steps configuration
  const steps = isEmployer 
    ? [
        {
          id: 'welcome',
          title: 'Aan de slag in je sandbox',
          description: 'Je sandbox is een veilige omgeving om in te testen. Je kunt functies uitproberen zonder transacties met echt geld uit te voeren.',
        },
        {
          id: 'personal',
          title: 'Persoonlijke informatie',
          description: 'Vul je persoonlijke gegevens in.',
        },
        {
          id: 'restaurant',
          title: 'Restaurant informatie',
          description: 'Configureer je restaurant gegevens.',
        },
        {
          id: 'payment',
          title: 'Betalingsinstellingen',
          description: 'Stel je betalingsvoorkeuren in.',
        },
        {
          id: 'preferences',
          title: 'Voorkeuren',
          description: 'Pas je notificaties en weergave aan.',
        },
      ]
    : [
        {
          id: 'welcome',
          title: 'Welkom bij Domio',
          description: 'Laten we je account configureren zodat je direct aan de slag kunt.',
        },
        {
          id: 'personal',
          title: 'Persoonlijke informatie',
          description: 'Vul je persoonlijke gegevens in.',
        },
        {
          id: 'work',
          title: 'Werk informatie',
          description: 'Configureer je werkgegevens.',
        },
        {
          id: 'payment',
          title: 'Betalingsvoorkeuren',
          description: 'Hoe wil je betaald worden?',
        },
        {
          id: 'preferences',
          title: 'Voorkeuren',
          description: 'Pas je notificaties en weergave aan.',
        },
      ]

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      // Update user profile with configuration
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          timezone: formData.timezone,
          language: formData.language,
          restaurant_name: isEmployer ? formData.restaurantName : null,
          restaurant_address: isEmployer ? formData.restaurantAddress : null,
          restaurant_phone: isEmployer ? formData.restaurantPhone : null,
          business_type: isEmployer ? formData.businessType : null,
          tax_id: isEmployer ? formData.taxId : null,
          position: isEmployee ? formData.position : null,
          hourly_rate: isEmployee ? formData.hourlyRate : null,
          preferred_payment_method: isEmployee ? formData.preferredPaymentMethod : null,
          email_notifications: formData.emailNotifications,
          sms_notifications: formData.smsNotifications,
          dark_mode: formData.darkMode,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      onComplete()
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#002A1F] text-white">
                  <span className="text-lg font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Voltooi je configuratie
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Volg de stappen in je configuratiegids om functies te leren kennen die aansluiten op de behoeften van je onderneming.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#002A1F] text-white">
                  <span className="text-lg font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Schakel over naar een live account
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Wanneer je klaar bent om live te gaan, moet je een paar vragen beantwoorden om je onderneming te verifiëren.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#002A1F] text-white">
                  <span className="text-lg font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Je bent klaar!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kopieer je werk naar je live account en begin betalingen te ontvangen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'personal':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Volledige naam
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => updateFormData('fullName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Telefoonnummer
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+31 6 12345678"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData('phoneNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="timezone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tijdzone
              </label>
              <Input
                id="timezone"
                type="text"
                value={formData.timezone}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Taal
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => updateFormData('language', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        )

      case 'restaurant':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="restaurantName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Restaurant naam *
              </label>
              <Input
                id="restaurantName"
                type="text"
                placeholder="Mijn Restaurant"
                value={formData.restaurantName}
                onChange={(e) => updateFormData('restaurantName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="restaurantAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Adres
              </label>
              <Input
                id="restaurantAddress"
                type="text"
                placeholder="Straatnaam 123, 1234 AB Stad"
                value={formData.restaurantAddress}
                onChange={(e) => updateFormData('restaurantAddress', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="restaurantPhone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Restaurant telefoon
              </label>
              <Input
                id="restaurantPhone"
                type="tel"
                placeholder="+31 20 1234567"
                value={formData.restaurantPhone}
                onChange={(e) => updateFormData('restaurantPhone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="businessType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Type bedrijf
              </label>
              <select
                id="businessType"
                value={formData.businessType}
                onChange={(e) => updateFormData('businessType', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="restaurant">Restaurant</option>
                <option value="cafe">Café</option>
                <option value="bar">Bar</option>
                <option value="catering">Catering</option>
                <option value="other">Anders</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="taxId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                BTW nummer (optioneel)
              </label>
              <Input
                id="taxId"
                type="text"
                placeholder="NL123456789B01"
                value={formData.taxId}
                onChange={(e) => updateFormData('taxId', e.target.value)}
              />
            </div>
          </div>
        )

      case 'work':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Functie
              </label>
              <Input
                id="position"
                type="text"
                placeholder="Bijv. Server, Kok, Bartender"
                value={formData.position}
                onChange={(e) => updateFormData('position', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uurtarief (€)
              </label>
              <Input
                id="hourlyRate"
                type="number"
                placeholder="15.00"
                value={formData.hourlyRate}
                onChange={(e) => updateFormData('hourlyRate', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-4">
            {isEmployee ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="preferredPaymentMethod" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Voorkeurs betaalmethode
                  </label>
                  <select
                    id="preferredPaymentMethod"
                    value={formData.preferredPaymentMethod}
                    onChange={(e) => updateFormData('preferredPaymentMethod', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="bank_transfer">Bankoverschrijving</option>
                    <option value="stripe">Stripe (Direct)</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Je werkgever kan je betalen via Domio. Zorg dat je betaalgegevens up-to-date zijn in je profiel.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Stripe Connect Setup
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Verbind je Stripe account om betalingen te ontvangen en werknemers te betalen.
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = '/connect'}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Stripe verbinden
                  </Button>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Je kunt Stripe later ook verbinden via de instellingen.
                  </p>
                </div>
              </>
            )}
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-mail notificaties
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ontvang updates via e-mail
                </p>
              </div>
              <input
                type="checkbox"
                id="emailNotifications"
                checked={formData.emailNotifications}
                onChange={(e) => updateFormData('emailNotifications', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#002A1F] focus:ring-[#002A1F]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  SMS notificaties
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ontvang belangrijke updates via SMS
                </p>
              </div>
              <input
                type="checkbox"
                id="smsNotifications"
                checked={formData.smsNotifications}
                onChange={(e) => updateFormData('smsNotifications', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#002A1F] focus:ring-[#002A1F]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="darkMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Donkere modus
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gebruik donker thema
                </p>
              </div>
              <input
                type="checkbox"
                id="darkMode"
                checked={formData.darkMode}
                onChange={(e) => updateFormData('darkMode', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#002A1F] focus:ring-[#002A1F]"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="mb-6">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Terug
                </Button>
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {renderStepContent()}
            </div>

            <div className="mt-8 flex gap-3">
              {currentStep === 0 && isEmployer ? (
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full"
                >
                  Ga naar sandbox
                </Button>
              ) : (
                <>
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={loading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Vorige
                    </Button>
                  )}
                  <Button
                    onClick={currentStep === steps.length - 1 ? handleComplete : nextStep}
                    disabled={loading}
                    className={currentStep > 0 ? "flex-1" : "w-full"}
                  >
                    {loading ? (
                      'Opslaan...'
                    ) : currentStep === steps.length - 1 ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Voltooien
                      </>
                    ) : (
                      <>
                        Doorgaan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Preview/Gradient */}
          <div 
            className="hidden lg:flex w-1/3 flex-col p-8 text-white"
            style={{
              background: 'linear-gradient(135deg, #002A1F 0%, #356258 50%, #9AFF7C 100%)'
            }}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Sandbox</h3>
              <p className="text-sm opacity-90">
                {isEmployer ? 'Test je restaurant configuratie' : 'Test je werknemer account'}
              </p>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-semibold">Domio</span>
              </div>
              
              <div className="space-y-2">
                <div className="h-2 bg-white/20 rounded w-full"></div>
                <div className="h-2 bg-white/20 rounded w-3/4"></div>
                <div className="h-2 bg-white/20 rounded w-1/2"></div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold mb-2">Producten</p>
                <div className="space-y-1">
                  <div className="text-sm opacity-90">Facturering</div>
                  <div className="text-sm opacity-90">Facturen</div>
                  <div className="text-sm opacity-90">Connect</div>
                  <div className="text-sm opacity-90">Belasting</div>
                </div>
              </div>

              <div className="mt-6 h-24 bg-white/10 rounded-lg flex items-end p-4">
                <div className="w-full">
                  <div className="h-1 bg-white/30 rounded mb-2"></div>
                  <div className="h-1 bg-white/30 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

