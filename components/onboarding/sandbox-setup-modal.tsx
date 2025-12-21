'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/Logo'
import { User, Lock, Users, Building2, Sparkles, ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SandboxSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Step {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const steps: Step[] = [
  {
    id: 'details',
    title: 'Jouw gegevens',
    description: 'Vul je naam en e-mailadres in',
    icon: User,
  },
  {
    id: 'password',
    title: 'Kies een wachtwoord',
    description: 'Kies een veilig wachtwoord',
    icon: Lock,
  },
  {
    id: 'role',
    title: 'Selecteer je rol',
    description: 'Ben je een werkgever of werknemer?',
    icon: Users,
  },
  {
    id: 'setup',
    title: 'Voltooi setup',
    description: 'Maak je account setup af',
    icon: Sparkles,
  },
]

export function SandboxSetupModal({ open, onOpenChange }: SandboxSetupModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as 'employer' | 'employee',
    employerEmail: '',
    restaurantName: '',
    restaurantAddress: '',
  })

  const updateFormData = (field: string, value: string) => {
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

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0: // Details
        if (!formData.fullName || !formData.email) {
          setError('Vul alle verplichte velden in')
          return false
        }
        
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const normalizedEmail = formData.email.toLowerCase().trim()
        if (!emailRegex.test(normalizedEmail)) {
          setError('Voer een geldig e-mailadres in')
          return false
        }
        
        // Check if email already exists in user_profiles
        const { data: existingProfile, error: checkError } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('email', normalizedEmail)
          .maybeSingle()
        
        // Log for debugging
        console.log('Email check for:', normalizedEmail, 'Result:', { existingProfile, checkError })
        
        if (existingProfile) {
          const errorMsg = 'Dit e-mailadres is al in gebruik. Gebruik een ander e-mailadres of log in met je bestaande account.'
          console.log('Email already exists, setting error')
          setError(errorMsg)
          return false
        }
        
        // If there was an error checking (but not "not found"), log it
        if (checkError && checkError.code !== 'PGRST116') {
          console.warn('Error checking email:', checkError)
        }
        
        // Also try to check in auth by attempting a password reset (this will fail if email doesn't exist)
        // Note: We can't directly query auth.users, so we rely on the signup error
        // But we can check if we can sign in with a dummy password (this will tell us if email exists)
        // Actually, better approach: try to sign up and catch the error immediately
        
        return true
      case 1: // Password
        if (!formData.password || !formData.confirmPassword) {
          setError('Vul beide wachtwoordvelden in')
          return false
        }
        if (formData.password.length < 8) {
          setError('Wachtwoord moet minimaal 8 tekens lang zijn')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Wachtwoorden komen niet overeen')
          return false
        }
        return true
      case 2: // Role
        if (!formData.role) {
          setError('Selecteer je rol')
          return false
        }
        return true
      case 3: // Setup
        if (formData.role === 'employee') {
          if (!formData.employerEmail || formData.employerEmail.trim() === '') {
            setError('Vul het e-mailadres van je werkgever in')
            return false
          }
          // Basic email validation for employer email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(formData.employerEmail.trim())) {
            setError('Voer een geldig e-mailadres in voor je werkgever')
            return false
          }
        }
        if (formData.role === 'employer') {
          if (!formData.restaurantName || formData.restaurantName.trim() === '') {
            setError('Vul de naam van je restaurant in')
            return false
          }
        }
        return true
      default:
        return true
    }
  }

  const handleNext = async () => {
    setError(null) // Clear previous errors
    setValidating(true)
    try {
      const isValid = await validateStep(currentStep)
      if (isValid) {
        // Clear error if validation passed
        setError(null)
        if (currentStep === steps.length - 1) {
          handleSubmit()
        } else {
          nextStep()
        }
      } else {
        // Error is already set by validateStep
        // Make sure it's visible
        console.log('Validation failed, error:', error)
      }
    } catch (err: any) {
      console.error('Validation error:', err)
      setError(err.message || 'Er is een fout opgetreden bij de validatie')
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Normalize email
      const normalizedEmail = formData.email.toLowerCase().trim()

      // Check if email already exists in user_profiles
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (existingProfile) {
        setError('Dit e-mailadres is al in gebruik. Gebruik een ander e-mailadres of log in met je bestaande account.')
        setLoading(false)
        return
      }

      // Create account - Supabase Auth will also check for duplicates
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      })

      if (authError) {
        // Check for various duplicate email error messages
        const errorMessage = authError.message?.toLowerCase() || ''
        if (errorMessage.includes('already registered') || 
            errorMessage.includes('already exists') ||
            errorMessage.includes('user already registered') ||
            errorMessage.includes('email address is already') ||
            errorMessage.includes('duplicate') ||
            authError.status === 422) {
          setError('Dit e-mailadres is al in gebruik. Log in met je bestaande account of gebruik een ander e-mailadres.')
        } else {
          setError(authError.message || 'Er is een fout opgetreden bij het aanmaken van je account.')
        }
        setLoading(false)
        return
      }

      if (authData.user) {
        // Wait a moment for trigger to create profile (if trigger exists)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if profile already exists (might be created by trigger)
        let profile = null
        let retries = 3
        
        while (!profile && retries > 0) {
          const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()
          
          if (existingProfile && !fetchError) {
            profile = existingProfile
            break
          }
          
          // If profile doesn't exist and it's not a "not found" error, try to create it
          if (fetchError && fetchError.code === 'PGRST116') {
            // Profile doesn't exist - try to create it
            const profileData: any = {
              id: authData.user.id,
              email: normalizedEmail,
              full_name: formData.fullName,
              role: formData.role,
            }
            
            // Add role-specific fields
            if (formData.role === 'employee' && formData.employerEmail) {
              profileData.employer_email = formData.employerEmail.toLowerCase().trim()
            }
            if (formData.role === 'employer') {
              if (formData.restaurantName) {
                profileData.restaurant_name = formData.restaurantName
              }
              if (formData.restaurantAddress) {
                profileData.restaurant_address = formData.restaurantAddress
              }
            }
            
            const { data: newProfile, error: profileError } = await supabase
              .from('user_profiles')
              .insert(profileData)
              .select()
              .single()

            if (newProfile && !profileError) {
              profile = newProfile
              break
            } else if (profileError) {
              // If it's an RLS error, wait and retry (trigger might create it)
              if (profileError.message?.includes('row-level security') || 
                  profileError.message?.includes('violates row-level security') ||
                  profileError.code === '42501' ||
                  profileError.code === 'PGRST301') {
                console.warn('RLS error on insert, waiting for trigger...', profileError)
                await new Promise(resolve => setTimeout(resolve, 1000))
                retries--
                continue
              } else {
                // Other error - show to user
                setError(`Fout bij aanmaken profiel: ${profileError.message || 'Onbekende fout'}`)
                setLoading(false)
                return
              }
            }
          } else {
            // Other error fetching profile
            console.error('Error fetching profile:', fetchError)
            break
          }
          
          retries--
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
        
        // If we have a profile, update it with additional info
        if (profile) {
          const updateData: any = {
            full_name: formData.fullName,
            role: formData.role,
          }
          
          // Add role-specific fields
          if (formData.role === 'employee' && formData.employerEmail) {
            updateData.employer_email = formData.employerEmail.toLowerCase().trim()
          } else if (formData.role === 'employer') {
            updateData.employer_email = null
            if (formData.restaurantName) {
              updateData.restaurant_name = formData.restaurantName
            }
            if (formData.restaurantAddress) {
              updateData.restaurant_address = formData.restaurantAddress
            }
          }
          
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('id', authData.user.id)

          if (updateError) {
            console.error('Profile update error:', updateError)
            // Don't block the flow if update fails
          }
        } else {
          // Profile still doesn't exist after retries - continue anyway
          // The profile might be created later by a trigger, or the user can continue without it
          console.warn('Profile could not be created, but continuing with user creation')
          // Don't block the flow - user can still use the app
        }

        // Redirect to dashboard - fetch profile to get role
        try {
          const { data: finalProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single()
          
          if (finalProfile?.role === 'employer') {
            router.push('/dashboard/employer')
          } else if (finalProfile?.role === 'employee') {
            router.push('/dashboard/employee')
          } else {
            // Fallback to generic dashboard
            router.push('/dashboard')
          }
        } catch (err) {
          // If we can't fetch profile, use formData role
          if (formData.role === 'employer') {
            router.push('/dashboard/employer')
          } else {
            router.push('/dashboard/employee')
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Details
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Volledige naam <span className="text-red-500">*</span>
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
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mailadres <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="jouw@voorbeeld.nl"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
              />
            </div>
          </div>
        )
      case 1: // Password
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Wachtwoord <span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Minimaal 8 tekens"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bevestig wachtwoord <span className="text-red-500">*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Herhaal je wachtwoord"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                required
              />
            </div>
          </div>
        )
      case 2: // Role
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ik ben een... <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updateFormData('role', 'employee')}
                  className={cn(
                    'p-6 rounded-xl border-2 text-left transition-all',
                    formData.role === 'employee'
                      ? 'border-[#002A1F] bg-[#002A1F]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <Users className="h-8 w-8 mb-2 text-[#002A1F]" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Werknemer</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ik werk voor een restaurant
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData('role', 'employer')}
                  className={cn(
                    'p-6 rounded-xl border-2 text-left transition-all',
                    formData.role === 'employer'
                      ? 'border-[#002A1F] bg-[#002A1F]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <Building2 className="h-8 w-8 mb-2 text-[#002A1F]" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Werkgever</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ik beheer een restaurant
                  </p>
                </button>
              </div>
            </div>
          </div>
        )
      case 3: // Setup
        return (
          <div className="space-y-4">
            {formData.role === 'employee' ? (
              <div className="space-y-2">
                <label htmlFor="employerEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-mailadres van je werkgever <span className="text-red-500">*</span>
                </label>
                <Input
                  id="employerEmail"
                  type="email"
                  placeholder="werkgever@restaurant.nl"
                  value={formData.employerEmail}
                  onChange={(e) => updateFormData('employerEmail', e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="restaurantName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Naam van je restaurant <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="restaurantName"
                    type="text"
                    placeholder="Restaurant De Gouden Leeuw"
                    value={formData.restaurantName}
                    onChange={(e) => updateFormData('restaurantName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="restaurantAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Adres van je restaurant
                  </label>
                  <Input
                    id="restaurantAddress"
                    type="text"
                    placeholder="Hoofdstraat 123, Amsterdam"
                    value={formData.restaurantAddress}
                    onChange={(e) => updateFormData('restaurantAddress', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const CurrentIcon = steps[currentStep].icon

  // Prevent closing when clicking outside - only allow closing via explicit actions
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Allow opening
      onOpenChange(true)
    } else {
      // Only allow closing if we're on step 0 (first step)
      // This allows the "Terug" button to work, but prevents closing by clicking outside
      if (currentStep === 0) {
        onOpenChange(false)
      }
      // Otherwise, ignore the close request (clicking outside or Escape key)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
      <DialogContent 
        className="max-w-4xl p-0 overflow-hidden h-auto max-h-[600px] border-0 bg-transparent shadow-2xl"
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with Escape key
          e.preventDefault()
        }}
      >
        <DialogTitle className="sr-only">Account aanmaken</DialogTitle>
        {/* Modal Content */}
        <div className="relative z-50 grid lg:grid-cols-2 h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
          {/* Left Panel - Configuration Form */}
          <div className="flex flex-col p-6 lg:p-8 bg-white dark:bg-gray-900 overflow-y-auto">
            {/* Back Button */}
            {currentStep > 0 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6 w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                Terug
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenChange(false)
                  router.push('/')
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6 w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                Terug
              </button>
            )}

            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#002A1F]/10 border-2 border-[#002A1F]">
                  <CurrentIcon className="h-4 w-4 text-[#002A1F]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: "'Codec Pro', sans-serif" }}>
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Stap {currentStep + 1} van {steps.length}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Form Content */}
            <div className="mb-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                    disabled={loading}
                  >
                    Vorige
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className={cn('flex-1', currentStep === 0 && 'w-full')}
                  disabled={loading || validating}
                >
                  {loading || validating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {validating ? 'Controleren...' : 'Bezig...'}
                    </>
                  ) : currentStep === steps.length - 1 ? (
                    'Account aanmaken'
                  ) : (
                    'Volgende'
                  )}
                </Button>
              </div>
              
              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Heb je al een account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false)
                      router.push('/login')
                    }}
                    className="font-medium text-[#002A1F] hover:underline"
                  >
                    Log hier in
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Dashboard Preview with Gradient */}
          <div className="relative hidden lg:block bg-gradient-to-br from-[#002A1F] via-[#356258] to-[#9AFF7C] p-8">
            {/* Dashboard Preview Content */}
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="text-white font-semibold">Domio</span>
                  </div>
                </div>
                <div className="h-1 bg-white/20 rounded-full"></div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2 mb-6">
                {['Startpagina', 'Saldo\'s', 'Transacties', 'Klanten', 'Productcatalogus'].map((item) => (
                  <div key={item} className="h-2 bg-white/20 rounded w-3/4"></div>
                ))}
              </div>

              {/* Products Section */}
              <div className="mb-4">
                <div className="h-2 bg-white/30 rounded w-1/2 mb-3"></div>
                <div className="space-y-2">
                  {['Billing', 'Invoicing', 'Connect', 'Tax'].map((item) => (
                    <div key={item} className="h-2 bg-white/20 rounded w-2/3"></div>
                  ))}
                </div>
              </div>

              {/* Chart Preview */}
              <div className="mt-auto">
                <div className="h-32 bg-white/10 rounded-lg p-4">
                  <div className="h-full flex items-end gap-2">
                    {[30, 50, 70, 60, 80, 90, 100].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-white/30 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
