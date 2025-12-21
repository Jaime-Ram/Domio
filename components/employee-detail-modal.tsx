'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  User, 
  Mail, 
  Phone, 
  Clock, 
  DollarSign,
  Calendar,
  Edit2,
  Save,
  X
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface EmployeeDetailModalProps {
  employeeId: string | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function EmployeeDetailModal({ employeeId, isOpen, onClose, onUpdate }: EmployeeDetailModalProps) {
  const supabase = createClient()
  const [employee, setEmployee] = useState<any>(null)
  const [workHours, setWorkHours] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    hourly_rate: '',
    position: '',
    phone_number: '',
    is_active: true,
  })

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchEmployeeData()
    }
  }, [isOpen, employeeId])

  const fetchEmployeeData = async () => {
    if (!employeeId) return

    setLoading(true)
    try {
      // Fetch employee profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', employeeId)
        .single()

      if (profile) {
        setEmployee(profile)
        setFormData({
          hourly_rate: profile.hourly_rate || '',
          position: profile.position || '',
          phone_number: profile.phone_number || '',
          is_active: profile.is_active !== false,
        })
      }

      // Fetch work hours
      const { data: hours } = await supabase
        .from('work_hours')
        .select('*')
        .eq('employee_id', employeeId)
        .order('date', { ascending: false })
        .limit(20)

      if (hours) {
        setWorkHours(hours)
      }

      // Fetch payments
      const { data: pays } = await supabase
        .from('payments')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (pays) {
        setPayments(pays)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!employeeId) return

    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          position: formData.position || null,
          phone_number: formData.phone_number || null,
          is_active: formData.is_active,
        })
        .eq('id', employeeId)

      if (updateError) {
        setError(updateError.message)
      } else {
        setEditing(false)
        await fetchEmployeeData()
        if (onUpdate) {
          onUpdate()
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!employee) return null

  const totalHours = workHours
    .filter(wh => wh.status === 'approved' || wh.status === 'paid')
    .reduce((sum, wh) => sum + parseFloat(wh.total_hours || 0), 0)

  const totalEarned = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0) / 100

  const pendingAmount = workHours
    .filter(wh => wh.status === 'approved' && wh.status !== 'paid')
    .reduce((sum, wh) => sum + parseFloat(wh.total_earnings || 0), 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Werknemer Details</DialogTitle>
          <DialogDescription>
            Volledige informatie over {employee.full_name || employee.email}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Persoonlijke Informatie</CardTitle>
                {!editing ? (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Bewerken
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      Opslaan
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditing(false)
                      fetchEmployeeData()
                    }}>
                      <X className="h-4 w-4 mr-2" />
                      Annuleren
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    <User className="inline h-4 w-4 mr-1" />
                    Naam
                  </label>
                  <p className="text-lg">{employee.full_name || 'Niet ingevuld'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    <Mail className="inline h-4 w-4 mr-1" />
                    E-mail
                  </label>
                  <p className="text-lg">{employee.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Telefoon
                  </label>
                  {editing ? (
                    <Input
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="+31 6 12345678"
                    />
                  ) : (
                    <p className="text-lg">{employee.phone_number || 'Niet ingevuld'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Uurtarief
                  </label>
                  {editing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                      placeholder="15.00"
                    />
                  ) : (
                    <p className="text-lg">€{employee.hourly_rate ? parseFloat(employee.hourly_rate).toFixed(2) : 'Niet ingesteld'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Functie
                  </label>
                  {editing ? (
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Bijv. Server, Kok"
                    />
                  ) : (
                    <p className="text-lg">{employee.position || 'Niet ingevuld'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Status
                  </label>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{formData.is_active ? 'Actief' : 'Inactief'}</span>
                    </div>
                  ) : (
                    <Badge variant={employee.is_active !== false ? 'default' : 'secondary'}>
                      {employee.is_active !== false ? 'Actief' : 'Inactief'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Totaal Uren</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Totaal Verdiend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{totalEarned.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Openstaand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{pendingAmount.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Work Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Recente Urenregistraties</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Uren</TableHead>
                    <TableHead>Verdiensten</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workHours.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        Nog geen uren geregistreerd
                      </TableCell>
                    </TableRow>
                  ) : (
                    workHours.map((hours) => (
                      <TableRow key={hours.id}>
                        <TableCell>
                          {new Date(hours.date).toLocaleDateString('nl-NL')}
                        </TableCell>
                        <TableCell>{parseFloat(hours.total_hours || 0).toFixed(2)}</TableCell>
                        <TableCell>€{parseFloat(hours.total_earnings || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              hours.status === 'paid'
                                ? 'default'
                                : hours.status === 'approved'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {hours.status === 'paid'
                              ? 'Betaald'
                              : hours.status === 'approved'
                              ? 'Goedgekeurd'
                              : 'In behandeling'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recente Betalingen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Bedrag</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        Nog geen betalingen
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.created_at).toLocaleDateString('nl-NL')}
                        </TableCell>
                        <TableCell className="font-semibold">
                          €{((payment.amount || 0) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === 'completed'
                                ? 'default'
                                : payment.status === 'failed'
                                ? 'destructive'
                                : 'outline'
                            }
                          >
                            {payment.status === 'completed' ? 'Betaald' : payment.status === 'failed' ? 'Mislukt' : 'In behandeling'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}




