'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/Logo'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { resetPassword } from '@/lib/supabase/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await resetPassword(email)
      if (authError) throw authError
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij het versturen van de reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#163300] to-[#004d3d] p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo width={120} height={34} variant="white" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wachtwoord vergeten</CardTitle>
            <CardDescription>
              Voer je e-mailadres in en we&apos;ll sturen je een reset link
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Reset link verstuurd naar {email}. Check je inbox.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    🎯 Demo modus - Wachtwoord reset is uitgeschakeld
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

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Bezig...' : 'Reset link versturen'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <Link href="/login" className="text-primary hover:underline">
                ← Terug naar inloggen
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
