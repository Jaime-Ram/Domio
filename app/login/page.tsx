'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/Logo'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Demo mode - simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('🎯 Demo Modus\n\nAuth functionaliteit is uitgeschakeld.\nGa naar /dashboard/employer voor de demo.')
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#002A1F] to-[#004d3d] p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo width={120} height={34} variant="white" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inloggen</CardTitle>
            <CardDescription>
              Log in om toegang te krijgen tot je dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                🎯 Demo modus - Auth functionaliteit is uitgeschakeld
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="naam@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Vergeten?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Bezig met inloggen...' : 'Inloggen'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Nog geen account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Registreer hier
              </Link>
            </div>

            <div className="text-sm text-center">
              <Link href="/" className="text-muted-foreground hover:underline">
                ← Terug naar home
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-4 text-center">
          <Button asChild variant="outline" className="text-white border-white hover:bg-white/10">
            <Link href="/dashboard/employer">
              Direct naar demo dashboard →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
