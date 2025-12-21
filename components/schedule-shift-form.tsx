'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Clock, User } from 'lucide-react'

interface ScheduleShiftFormProps {
  employerId: string
  employees: any[]
  preselectedEmployeeId?: string
  onSuccess?: () => void
}

export function ScheduleShiftForm({ employerId, employees, preselectedEmployeeId, onSuccess }: ScheduleShiftFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    employee_id: preselectedEmployeeId || '',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    break_duration_minutes: '0',
    position: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!formData.employee_id || !formData.date || !formData.start_time || !formData.end_time) {
        setError('Vul alle verplichte velden in')
        setLoading(false)
        return
      }

      console.log('Submitting shift form:', {
        employer_id: employerId,
        employee_id: formData.employee_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_duration_minutes: formData.break_duration_minutes,
        position: formData.position,
        notes: formData.notes,
      })

      const response = await fetch('/api/shifts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Zorg ervoor dat cookies worden meegestuurd
        cache: 'no-store', // Voorkom caching
        body: JSON.stringify({
          employer_id: employerId,
          employee_id: formData.employee_id,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          break_duration_minutes: parseInt(formData.break_duration_minutes) || 0,
          position: formData.position || null,
          notes: formData.notes || null,
        }),
      })

      console.log('Response status:', response.status, response.statusText)

      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok || data.error) {
        // Show more detailed error message
        let errorMessage = data.error || 'Er is een fout opgetreden bij het aanmaken van de shift'
        if (data.details) {
          errorMessage += `: ${data.details}`
        }
        if (data.hint) {
          errorMessage += `\n\nTip: ${data.hint}`
        }
        if (data.postgresError) {
          console.error('PostgreSQL error:', data.postgresError)
        }
        setError(errorMessage)
        console.error('Shift creation error:', data)
      } else {
        setSuccess(true)
        setFormData({
          employee_id: '',
          date: new Date().toISOString().split('T')[0],
          start_time: '',
          end_time: '',
          break_duration_minutes: '0',
          position: '',
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
        <CardTitle>Shift Inplannen</CardTitle>
        <CardDescription>
          Plan een nieuwe shift voor een werknemer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="employee" className="text-sm font-medium">
                Werknemer *
              </label>
              <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer werknemer" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name || employee.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                Pauze (min)
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="position" className="text-sm font-medium">
                Functie (optioneel)
              </label>
              <Input
                id="position"
                type="text"
                placeholder="Bijv. Server, Kok"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notities (optioneel)
              </label>
              <Input
                id="notes"
                type="text"
                placeholder="Extra informatie"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <AlertDescription>
                Shift succesvol ingepland!
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Bezig met opslaan...' : 'Shift Inplannen'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}



