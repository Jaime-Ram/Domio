'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { SocialButton } from '@/components/ui/social-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Logo } from '@/components/Logo'
import { AlertCircle } from 'lucide-react'
import { signIn, signUp, signInWithGoogle } from '@/lib/supabase/auth'
import { translateAuthError } from '@/lib/auth-errors'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: 'login' | 'signup'
}

export function AuthModal({ open, onOpenChange, defaultMode = 'login' }: AuthModalProps) {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)
  const [signupStep, setSignupStep] = useState<1 | 2>(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'employee' | 'employer'>('employer')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync mode when modal opens with new defaultMode
  useEffect(() => {
    if (open) setMode(defaultMode ?? 'login')
  }, [open, defaultMode])

  // Prevent auto-focus on inputs when modal opens
  useEffect(() => {
    if (open) {
      // Zorg ervoor dat geen input gefocust wordt
      const activeElement = document.activeElement as HTMLElement
      if (activeElement && activeElement.tagName === 'INPUT') {
        activeElement.blur()
      }
    }
  }, [open])

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validate step 1 fields
    if (!name.trim()) {
      setError('Vul je naam in')
      return
    }
    if (!email.trim()) {
      setError('Vul je e-mailadres in')
      return
    }
    
    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => {
      setSignupStep(2)
      setTimeout(() => {
        setIsAnimating(false)
      }, 50)
    }, 300)
  }

  const handlePreviousStep = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setSignupStep(1)
      setTimeout(() => {
        setIsAnimating(false)
      }, 50)
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'login') {
        const { error: authError } = await signIn(email, password)
        if (authError) throw authError
        onOpenChange(false)
        router.push('/dashboard/landlord')
      } else {
        if (password !== confirmPassword) {
          setError('Wachtwoorden komen niet overeen')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Wachtwoord moet minimaal 6 tekens lang zijn')
          setLoading(false)
          return
        }
        const supaRole = role === 'employer' ? 'verhuurder' : 'huurder'
        const { error: authError } = await signUp(email, password, name, supaRole as 'verhuurder' | 'huurder')
        if (authError) throw authError
        onOpenChange(false)
        router.push('/dashboard/landlord')
      }
    } catch (err: any) {
      setError(translateAuthError(err.message || 'Er is een fout opgetreden'))
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await signInWithGoogle()
      if (authError) throw authError
    } catch (err: any) {
      setError(translateAuthError(err.message || 'Google inloggen mislukt'))
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setRole('employer')
    setRememberMe(false)
    setSignupStep(1)
    setError(null)
  }

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg w-full max-h-[90vh] m-0 p-0 border overflow-hidden shadow-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div ref={modalRef} className="p-6 sm:p-8 flex flex-col overflow-y-auto bg-white dark:bg-gray-900">
          {/* Logo */}
          <div className="mb-6 flex justify-center py-2">
            <Logo width={120} height={32} />
          </div>

          {/* Title */}
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {mode === 'login' ? 'Inloggen' : 'Registreren'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {mode === 'login'
                ? 'Welkom terug! Log in op je account.'
                : 'Maak een account aan om te beginnen.'}
            </DialogDescription>
          </DialogHeader>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={mode === 'signup' && signupStep === 1 ? handleNextStep : handleSubmit} className="mt-4 sm:mt-6 space-y-4 flex-1 flex flex-col min-h-0">
            {mode === 'signup' ? (
              <div className="relative overflow-visible flex-1 flex flex-col min-h-0" style={{ padding: '0 2px' }}>
                <>
                  {signupStep === 1 && (
                    <div
                      key="step1"
                      className={`transition-all duration-300 ease-in-out ${
                        isAnimating
                          ? 'opacity-0 -translate-x-full absolute inset-0'
                          : 'opacity-100 translate-x-0 relative'
                      }`}
                    >
                  {/* Role Selection - Segmented Control */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ik ben een
                    </label>
                    <div className="relative inline-flex w-full rounded-lg border border-[#163300] bg-gray-50 p-1">
                      {/* Sliding background indicator */}
                      <div
                        className={`absolute top-1 bottom-1 rounded-md bg-[#163300] transition-all duration-300 ease-in-out ${
                          role === 'employer' ? 'left-1 right-1/2' : 'left-1/2 right-1'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setRole('employer')}
                        className={`relative z-10 flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163300] focus-visible:ring-offset-0 ${
                          role === 'employer'
                            ? 'text-white'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Beheerder
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('employee')}
                        className={`relative z-10 flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163300] focus-visible:ring-offset-0 ${
                          role === 'employee'
                            ? 'text-white'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Bewoner
                      </button>
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-2 mt-4">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Naam
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Voer je naam in"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2 mt-4">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      E-mailadres
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Voer je e-mailadres in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                    </div>
                  )}
                  
                  {signupStep === 2 && (
                    <div
                      key="step2"
                      className={`transition-all duration-300 ease-in-out ${
                        isAnimating
                          ? 'opacity-0 translate-x-full absolute inset-0'
                          : 'opacity-100 translate-x-0 relative'
                      }`}
                    >
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="text-sm text-gray-600 hover:text-gray-900 mb-2"
                  >
                    ← Terug
                  </button>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Wachtwoord
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Voer je wachtwoord in"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bevestig wachtwoord
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Bevestig je wachtwoord"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                    </div>
                  )}
                </>
              </div>
            ) : (
              <>
                {mode === 'login' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        E-mailadres
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Voer je e-mailadres in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Wachtwoord
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Voer je wachtwoord in"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Onthoud mij voor 30 dagen
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-[#163300] hover:underline"
                  onClick={() => {
                    window.location.href = '/forgot-password'
                  }}
                >
                  Wachtwoord vergeten?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              className={`w-full h-12 rounded-full mt-auto ${
                mode === 'login'
                  ? 'bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90'
                  : mode === 'signup' && signupStep === 1
                  ? 'bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90'
                  : mode === 'signup' && signupStep === 2
                  ? 'bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90'
                  : ''
              } font-semibold text-base border-0 shadow-sm`}
              disabled={loading}
            >
              {loading
                ? mode === 'login'
                  ? 'Inloggen...'
                  : 'Registreren...'
                : mode === 'signup' && signupStep === 1
                  ? 'Volgende stap'
                  : mode === 'signup' && signupStep === 2
                  ? 'Registreren'
                  : 'Inloggen'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  Of ga verder met
                </span>
              </div>
            </div>

            <SocialButton
              type="button"
              variant="google"
              className="w-full h-12 rounded-xl"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {mode === 'login' ? 'Inloggen met Google' : 'Registreren met Google'}
            </SocialButton>
          </form>

          {/* Switch Mode */}
          <div className="mt-4 sm:mt-6 text-center text-sm pb-4 sm:pb-0">
            <span className="text-gray-600 dark:text-gray-400">
              {mode === 'login' ? 'Nog geen account? ' : 'Al een account? '}
            </span>
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="font-medium text-[#163300] hover:underline"
            >
              {mode === 'login' ? 'Registreren' : 'Inloggen'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
