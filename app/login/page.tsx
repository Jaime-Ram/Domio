'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { SocialButton } from '@/components/ui/social-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/Logo'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Fetch user profile to determine role and redirect to correct dashboard
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()
          
          if (profile?.role === 'employer') {
            router.push('/dashboard/employer')
          } else if (profile?.role === 'employee') {
            router.push('/dashboard/employee')
          } else {
            // Fallback to generic dashboard
            router.push('/dashboard')
          }
        } catch (err) {
          // If we can't fetch profile, go to generic dashboard
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Google inloggen mislukt')
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Column - Sign In Form */}
      <div className="flex w-full flex-col justify-center bg-white p-8 dark:bg-gray-900 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 py-2">
            <Logo width={150} height={40} />
          </div>

              {/* Title */}
              <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
                Inloggen
              </h1>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Onthoud mij
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#002A1F] hover:underline"
              >
                Wachtwoord vergeten?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Inloggen...' : 'Inloggen'}
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
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Inloggen met Google
            </SocialButton>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Nog geen account?{' '}
            </span>
            <Link
              href="/signup"
              className="font-medium text-[#002A1F] hover:underline"
            >
              Registreren
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-12 text-xs text-gray-500 dark:text-gray-400">
            <p>© Domio {new Date().getFullYear()}</p>
            <p className="mt-1">help@domio.com</p>
          </div>
        </div>
      </div>

      {/* Right Column - Testimonial & Dashboard Preview */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-center overflow-hidden">
        {/* Blurred Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/chef-cooking-kitchen-while-wearing-professional-attire.jpg)',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-2xl w-full p-12">
          {/* Testimonial */}
          <div className="mb-12">
            <blockquote className="mb-6 text-2xl font-semibold leading-relaxed text-white">
              &quot;Domio heeft mijn vastgoedbeheer volledig getransformeerd. Eindelijk een platform dat echt werkt voor vastgoedbeheerders.&quot;
            </blockquote>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">
                  — Jan de Vries
                </p>
                <p className="text-sm text-white/80">
                  Vastgoedbeheerder, Portefeuille van 50+ objecten
                </p>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 fill-white"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          {/* Property Image */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              src="/images/chef-cooking-kitchen-while-wearing-professional-attire.jpg"
              alt="Vastgoedbeheer"
              className="w-full h-auto object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
