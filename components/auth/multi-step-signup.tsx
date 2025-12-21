'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/Logo'
import { User, Lock, Users, Building2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function MultiStepSignUp() {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Details
        if (!formData.fullName || !formData.email) {
          setError('Vul alle verplichte velden in')
          return false
        }
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
        if (formData.role === 'employee' && !formData.employerEmail) {
          setError('Vul het e-mailadres van je werkgever in')
          return false
        }
        if (formData.role === 'employer' && !formData.restaurantName) {
          setError('Vul de naam van je restaurant in')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === steps.length - 1) {
        handleSubmit()
      } else {
        nextStep()
      }
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (authData.user) {
        // Create profile
        try {
          const response = await fetch('/api/user/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: authData.user.id,
              email: authData.user.email,
              fullName: formData.fullName,
              role: formData.role,
              employerEmail: formData.role === 'employee' ? formData.employerEmail : undefined,
              restaurantName: formData.role === 'employer' ? formData.restaurantName : undefined,
              restaurantAddress: formData.role === 'employer' ? formData.restaurantAddress : undefined,
            }),
          })

          if (!response.ok) {
            const profileData = await response.json()
            console.warn('Profile creation failed:', profileData)
          }
        } catch (profileError) {
          console.error('Error creating profile:', profileError)
        }

        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
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
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your name"
                value={formData.fullName}
                onChange={(e) => updateFormData('fullName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mailadres
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Voer je e-mailadres in"
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
                Kies een wachtwoord
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Maak een wachtwoord"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Moet minimaal 8 tekens lang zijn.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bevestig wachtwoord
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Bevestig je wachtwoord"
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
              <label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ik ben een...
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => updateFormData('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer je rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Werknemer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="employer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Werkgever (Restaurant Eigenaar)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 3: // Setup
        return (
          <div className="space-y-4">
            {formData.role === 'employee' ? (
              <div className="space-y-2">
                <label htmlFor="employerEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-mailadres werkgever
                </label>
                <Input
                  id="employerEmail"
                  type="email"
                  placeholder="Voer het e-mailadres van je werkgever in"
                  value={formData.employerEmail}
                  onChange={(e) => updateFormData('employerEmail', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We sturen een verzoek naar je werkgever om je account te koppelen.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="restaurantName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Restaurant naam
                  </label>
                  <Input
                    id="restaurantName"
                    type="text"
                    placeholder="Voer de naam van je restaurant in"
                    value={formData.restaurantName}
                    onChange={(e) => updateFormData('restaurantName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="restaurantAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Restaurant adres (Optioneel)
                  </label>
                  <Input
                    id="restaurantAddress"
                    type="text"
                    placeholder="Voer het adres van je restaurant in"
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

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Sidebar */}
      <div className="hidden lg:flex w-1/4 min-w-[280px] max-w-[320px] flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="p-6">
          <Logo width={140} height={36} />
        </div>
        <div className="flex-1 px-6 py-8">
          <nav className="space-y-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-start gap-4',
                    isActive && 'text-[#002A1F]'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 transition-colors',
                      isActive
                        ? 'border-[#002A1F] bg-[#002A1F]/10'
                        : isCompleted
                        ? 'border-[#002A1F] bg-[#002A1F]/10'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                    )}
                  >
                    <StepIcon
                      className={cn(
                        'h-5 w-5',
                        isActive || isCompleted
                          ? 'text-[#002A1F]'
                          : 'text-gray-400 dark:text-gray-500'
                      )}
                    />
                  </div>
                  <div className="flex-1 pt-2">
                    <h3
                      className={cn(
                        'text-sm font-semibold',
                        isActive
                          ? 'text-[#002A1F]'
                          : isCompleted
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        'mt-1 text-xs',
                        isActive
                          ? 'text-[#002A1F]'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </nav>
        </div>
        <div className="border-t border-gray-200 p-6 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © Domio {new Date().getFullYear()}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            help@domio.com
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900" style={{ backgroundImage: 'radial-gradient(circle, #E2E8F0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              {/* Featured Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <CurrentIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
              </div>

              {/* Title */}
              <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                {steps[currentStep].title}
              </h1>
              <p className="mb-8 text-center text-sm text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Form Content */}
              <div className="mb-6">{renderStepContent()}</div>

              {/* Actions */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                    disabled={loading}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading
                    ? 'Creating account...'
                    : currentStep === steps.length - 1
                    ? 'Create account'
                    : 'Continue'}
                </Button>
              </div>

              {/* Progress Dots */}
              <div className="mt-8 flex justify-center gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-2 w-2 rounded-full transition-colors',
                      index === currentStep
                        ? 'bg-[#002A1F]'
                        : 'bg-gray-300 dark:bg-gray-700'
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

