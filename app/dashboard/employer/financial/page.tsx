'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Euro,
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Upload,
} from 'lucide-react'
import { mockPayments, mockExpenses, mockTenants, mockProperties } from '@/lib/mock-data/vastgoed'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'

export default function FinancialPage() {
  const router = useRouter()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    tenantId: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'betaald',
    notes: '',
  })

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    propertyId: '',
    invoice: null as File | null,
  })

  // Calculate totals for this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyIncome = mockPayments
    .filter(p => {
      const paymentDate = p.paidDate ? new Date(p.paidDate) : new Date(p.dueDate)
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear &&
             p.status === 'betaald'
    })
    .reduce((sum, p) => sum + p.amount, 0)

  const monthlyExpenses = mockExpenses
    .filter(e => {
      const expenseDate = new Date(e.date)
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear
    })
    .reduce((sum, e) => sum + e.amount, 0)

  const balance = monthlyIncome - monthlyExpenses

  const getPaymentStatusBadge = (status: string, dueDate: string, paidDate: string | null) => {
    if (status === 'betaald') {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Betaald</Badge>
    }
    const isOverdue = new Date(dueDate) < new Date()
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500"><AlertCircle className="h-3 w-3 mr-1" />Achterstallig</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500"><Clock className="h-3 w-3 mr-1" />Openstaand</Badge>
  }

  const handleRegisterPayment = () => {
    console.log('Registreer betaling:', paymentForm)
    setShowPaymentModal(false)
    // Reset form
    setPaymentForm({
      tenantId: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'betaald',
      notes: '',
    })
  }

  const handleAddExpense = () => {
    console.log('Voeg uitgave toe:', expenseForm)
    setShowExpenseModal(false)
    // Reset form
    setExpenseForm({
      description: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      propertyId: '',
      invoice: null,
    })
  }

  const exportToCSV = () => {
    console.log('Exporteer naar Excel/CSV')
    // Implementation for CSV export
  }

  return (
    <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Financiën
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Overzicht van inkomsten en uitgaven
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export naar Excel
              </Button>
            </div>

            {/* Totals Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className={dashboardCardClass()}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Totaal Inkomsten
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    €{monthlyIncome.toLocaleString('nl-NL')}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Deze maand
                  </p>
                </CardContent>
              </Card>

              <Card className={dashboardCardClass()}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Totaal Uitgaven
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    €{monthlyExpenses.toLocaleString('nl-NL')}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Deze maand
                  </p>
                </CardContent>
              </Card>

              <Card className={dashboardCardClass()}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Saldo
                  </CardTitle>
                  <Euro className="h-4 w-4 text-[#002A1F] dark:text-[#9AFF7C]" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${balance >= 0 ? 'text-[#002A1F] dark:text-[#9AFF7C]' : 'text-red-600'}`}>
                    €{balance.toLocaleString('nl-NL')}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Inkomsten - Uitgaven
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Inkomsten Section */}
            <Card className={dashboardCardClass('mb-6')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inkomsten (Deze Maand)</CardTitle>
                    <CardDescription>Huurinkomsten en overige ontvangsten</CardDescription>
                  </div>
                  <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#002A1F] hover:bg-[#356258] text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Registreer Betaling
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Registreer Betaling</DialogTitle>
                        <DialogDescription>
                          Voeg een nieuwe huurinkomst of betaling toe
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="tenant">Selecteer huurder</Label>
                          <Select value={paymentForm.tenantId} onValueChange={(value) => setPaymentForm({...paymentForm, tenantId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kies een huurder" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockTenants.map((tenant) => (
                                <SelectItem key={tenant.id} value={tenant.id}>
                                  {tenant.name} - {tenant.property?.address}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount">Bedrag (€)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="1200"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date">Datum</Label>
                          <Input
                            id="date"
                            type="date"
                            value={paymentForm.date}
                            onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={paymentForm.status} onValueChange={(value) => setPaymentForm({...paymentForm, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="betaald">Betaald</SelectItem>
                              <SelectItem value="verwacht">Verwacht</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Opmerking (optioneel)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Bijv: Huur januari 2024"
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                          Annuleren
                        </Button>
                        <Button onClick={handleRegisterPayment} className="bg-[#002A1F] hover:bg-[#356258]">
                          Opslaan
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-neutral-800">
                      <TableHead>Datum</TableHead>
                      <TableHead>Huurder</TableHead>
                      <TableHead>Bedrag</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayments
                      .filter(p => {
                        const paymentDate = p.paidDate ? new Date(p.paidDate) : new Date(p.dueDate)
                        return paymentDate.getMonth() === currentMonth && 
                               paymentDate.getFullYear() === currentYear
                      })
                      .map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              {payment.paidDate 
                                ? format(new Date(payment.paidDate), 'd MMM yyyy', { locale: nl })
                                : format(new Date(payment.dueDate), 'd MMM yyyy', { locale: nl })
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-gray-900 dark:text-white">{payment.tenant.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{payment.property.address}</p>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-green-600">€{payment.amount.toLocaleString('nl-NL')}</p>
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(payment.status, payment.dueDate, payment.paidDate)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Uitgaven Section */}
            <Card className={dashboardCardClass()}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Uitgaven (Deze Maand)</CardTitle>
                    <CardDescription>Onderhoud, verzekeringen en overige kosten</CardDescription>
                  </div>
                  <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#002A1F] hover:bg-[#356258] text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Voeg Uitgave Toe
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Voeg Uitgave Toe</DialogTitle>
                        <DialogDescription>
                          Registreer een nieuwe uitgave of kostenpost
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="description">Beschrijving</Label>
                          <Input
                            id="description"
                            placeholder="Bijv: Reparatie verwarming"
                            value={expenseForm.description}
                            onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expense-amount">Bedrag (€)</Label>
                          <Input
                            id="expense-amount"
                            type="number"
                            placeholder="350"
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expense-date">Datum</Label>
                          <Input
                            id="expense-date"
                            type="date"
                            value={expenseForm.date}
                            onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Categorie</Label>
                          <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({...expenseForm, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kies een categorie" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="onderhoud">Onderhoud</SelectItem>
                              <SelectItem value="verzekering">Verzekering</SelectItem>
                              <SelectItem value="belasting">Belasting</SelectItem>
                              <SelectItem value="vve">VvE</SelectItem>
                              <SelectItem value="overig">Overig</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="property">Pand (optioneel)</Label>
                          <Select value={expenseForm.propertyId} onValueChange={(value) => setExpenseForm({...expenseForm, propertyId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kies een pand" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">Algemeen</SelectItem>
                              {mockProperties.map((property) => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.address}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invoice">Upload factuur (optioneel)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="invoice"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setExpenseForm({...expenseForm, invoice: e.target.files?.[0] || null})}
                            />
                            <Upload className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowExpenseModal(false)}>
                          Annuleren
                        </Button>
                        <Button onClick={handleAddExpense} className="bg-[#002A1F] hover:bg-[#356258]">
                          Opslaan
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-neutral-800">
                      <TableHead>Datum</TableHead>
                      <TableHead>Beschrijving</TableHead>
                      <TableHead>Bedrag</TableHead>
                      <TableHead>Categorie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockExpenses
                      .filter(e => {
                        const expenseDate = new Date(e.date)
                        return expenseDate.getMonth() === currentMonth && 
                               expenseDate.getFullYear() === currentYear
                      })
                      .map((expense) => (
                        <TableRow key={expense.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              {format(new Date(expense.date), 'd MMM yyyy', { locale: nl })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                            {expense.property && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">{expense.property.address}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-red-600">-€{expense.amount.toLocaleString('nl-NL')}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{expense.category}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
    </>
  )
}



