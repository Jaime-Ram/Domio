'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserPlus, CheckCircle2 } from 'lucide-react'

interface InviteEmployeeFormProps {
  onSuccess?: () => void
}

export function InviteEmployeeForm({ onSuccess }: InviteEmployeeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!formData.email) {
        setError('E-mailadres is verplicht')
        setLoading(false)
        return
      }

      const response = await fetch('/api/employees/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name || null,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
        setFormData({ email: '', full_name: '' })
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
            setSuccess(false)
          }, 2000)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Werknemer Uitnodigen</CardTitle>
        <CardDescription>
          Nodig een werknemer uit om zich aan te sluiten bij je team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mailadres *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="werknemer@voorbeeld.nl"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-medium">
              Volledige naam (optioneel)
            </label>
            <Input
              id="full_name"
              type="text"
              placeholder="Jan Jansen"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <AlertDescription>
                <CheckCircle2 className="h-4 w-4 inline mr-2" />
                Uitnodiging verstuurd! De werknemer kan zich nu aanmelden.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            <UserPlus className="mr-2 h-4 w-4" />
            {loading ? 'Bezig met versturen...' : 'Uitnodigen'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}




