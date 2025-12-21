'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

interface PayEmployeeFormProps {
  employerAccountId: string
  employees?: any[]
  onPaymentSuccess?: () => void
}

export function PayEmployeeForm({ employerAccountId, employees = [], onPaymentSuccess }: PayEmployeeFormProps) {
  const supabase = createClient()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [employeeStripeAccounts, setEmployeeStripeAccounts] = useState<any[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    if (employees.length > 0) {
      fetchEmployeeStripeAccounts()
    }
  }, [employees])

  const fetchEmployeeStripeAccounts = async () => {
    const employeeIds = employees.map(e => e.id)
    const { data } = await supabase
      .from('stripe_connect_accounts')
      .select('user_id, stripe_account_id')
      .in('user_id', employeeIds)
      .eq('is_active', true)

    if (data) {
      setEmployeeStripeAccounts(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      if (!selectedEmployeeId) {
        setResult({ error: 'Selecteer een werknemer' })
        setLoading(false)
        return
      }

      const amountInCents = Math.round(parseFloat(amount) * 100)

      if (isNaN(amountInCents) || amountInCents <= 0) {
        setResult({ error: 'Voer een geldig bedrag in' })
        setLoading(false)
        return
      }

      // Get employee's Stripe account if available
      const employeeStripeAccount = employeeStripeAccounts.find(
        acc => acc.user_id === selectedEmployeeId
      )

      // Create payment via API
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: selectedEmployeeId,
          amount: amountInCents,
          currency: 'eur',
          description: description || 'Betaling aan werknemer',
          stripe_transfer_id: null, // Will be created if Stripe account exists
        }),
      })

      const data = await response.json()

      if (data.error) {
        setResult({ error: data.error })
      } else {
        setResult({ success: true, ...data })
        // Reset form
        setSelectedEmployeeId('')
        setAmount('')
        setDescription('')
        if (onPaymentSuccess) {
          onPaymentSuccess()
        }
      }
    } catch (error) {
      console.error('Error paying employee:', error)
      setResult({ error: 'Betaling verwerken mislukt' })
    } finally {
      setLoading(false)
    }
  }

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId)
  const hasStripeAccount = employeeStripeAccounts.some(
    acc => acc.user_id === selectedEmployeeId
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Werknemer Betalen</CardTitle>
        <CardDescription>
          Betaal een werknemer direct via Stripe Connect
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="employee" className="text-sm font-medium">
              Werknemer *
            </label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een werknemer" />
              </SelectTrigger>
              <SelectContent>
                {employees.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Geen werknemers beschikbaar
                  </SelectItem>
                ) : (
                  employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name || employee.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedEmployee && (
              <p className="text-xs text-muted-foreground">
                {hasStripeAccount 
                  ? '✓ Stripe account verbonden - directe betaling mogelijk'
                  : '⚠ Geen Stripe account - betaling wordt geregistreerd maar niet direct uitgevoerd'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Bedrag (€) *
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Beschrijving (optioneel)
            </label>
            <Input
              id="description"
              type="text"
              placeholder="Bijv. Loon week 1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {result && (
            <Alert
              variant={result.error ? 'destructive' : 'default'}
              className={result.error ? '' : 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'}
            >
              <AlertDescription>
                {result.error ? (
                  result.error
                ) : (
                  <div>
                    <CheckCircle2 className="h-4 w-4 inline mr-2" />
                    <span className="font-semibold">Betaling succesvol!</span>
                    {result.data?.stripe_transfer_id && (
                      <p className="text-xs mt-1">
                        Transfer ID: {result.data.stripe_transfer_id}
                      </p>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading || !selectedEmployeeId}>
            {loading ? 'Bezig met verwerken...' : 'Betalen'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

