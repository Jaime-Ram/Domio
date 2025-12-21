'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, X } from 'lucide-react'

interface AddWorkHoursFormProps {
  employeeId: string
  employerId: string
  onSuccess?: () => void
}

export function AddWorkHoursForm({ employeeId, employerId, onSuccess }: AddWorkHoursFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    break_duration_minutes: '0',
    hourly_rate: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!formData.start_time || !formData.end_time) {
        setError('Vul start- en eindtijd in')
        setLoading(false)
        return
      }

      // Combine date with time
      const startDateTime = new Date(`${formData.date}T${formData.start_time}`)
      const endDateTime = new Date(`${formData.date}T${formData.end_time}`)

      if (endDateTime <= startDateTime) {
        setError('Eindtijd moet na starttijd zijn')
        setLoading(false)
        return
      }

      const response = await fetch('/api/work-hours/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId,
          employer_id: employerId,
          date: formData.date,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          break_duration_minutes: parseInt(formData.break_duration_minutes) || 0,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          notes: formData.notes || null,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          start_time: '',
          end_time: '',
          break_duration_minutes: '0',
          hourly_rate: '',
          notes: '',
        })
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
        <CardTitle>Uren Toevoegen</CardTitle>
        <CardDescription>
          Registreer je gewerkte uren voor goedkeuring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Datum *
              </label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="hourly_rate" className="text-sm font-medium">
                Uurtarief (€)
              </label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="15.00"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="start_time" className="text-sm font-medium">
                Starttijd *
              </label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="end_time" className="text-sm font-medium">
                Eindtijd *
              </label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="break_duration" className="text-sm font-medium">
                Pauze (minuten)
              </label>
              <Input
                id="break_duration"
                type="number"
                min="0"
                value={formData.break_duration_minutes}
                onChange={(e) => setFormData({ ...formData, break_duration_minutes: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notities (optioneel)
            </label>
            <Input
              id="notes"
              type="text"
              placeholder="Bijv. Extra taken uitgevoerd"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                Uren succesvol toegevoegd! Wachtend op goedkeuring.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Bezig met opslaan...' : 'Uren Toevoegen'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}




