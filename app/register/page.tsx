'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Logo } from '@/components/Logo'
import { AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'employer' | 'employee'>('employer')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Demo mode - simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('🎯 Demo Modus\n\nRegistratie functionaliteit is uitgeschakeld.\nGa naar /dashboard/employer voor de demo.')
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#163300] to-[#004d3d] p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo width={120} height={34} variant="white" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account aanmaken</CardTitle>
            <CardDescription>
              Maak een gratis account aan om te starten
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                🎯 Demo modus - Registratie functionaliteit is uitgeschakeld
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Volledige naam</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jan Jansen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

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
                <Label htmlFor="password">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimaal 8 karakters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Ik ben een</Label>
                <Select value={role} onValueChange={(value: 'employer' | 'employee') => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employer">Vastgoedbeheerder</SelectItem>
                    <SelectItem value="employee">Medewerker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Account aanmaken...' : 'Account aanmaken'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Door te registreren ga je akkoord met onze{' '}
                <Link href="/terms" className="underline hover:text-foreground">
                  voorwaarden
                </Link>{' '}
                en{' '}
                <Link href="/privacy" className="underline hover:text-foreground">
                  privacybeleid
                </Link>
              </p>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Al een account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Log hier in
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
