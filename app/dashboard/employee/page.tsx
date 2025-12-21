'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DollarSign, 
  Clock, 
  Calendar, 
  CreditCard, 
  LogOut,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  BarChart3,
  Settings,
  User,
  MessageCircle
} from 'lucide-react'
import type { NavItemType, NavItemDividerType } from "@/components/application/app-navigation/config"
import { SidebarNavigationSectionDividers } from "@/components/application/app-navigation/sidebar-navigation/sidebar-section-dividers"
import { Logo } from '@/components/Logo'
import { AddWorkHoursForm } from '@/components/add-work-hours-form'
import { cn } from '@/lib/utils'
import { AvatarLabelGroup } from '@/components/base/avatar/avatar-label-group'

const employeeNavItemsWithDividers: (NavItemType | NavItemDividerType)[] = [
  {
    label: "Dashboard",
    href: "/dashboard/employee",
    icon: BarChart3,
  },
  { divider: true },
  {
    label: "Beschikbaarheid",
    href: "/dashboard/employee#availability",
    icon: Calendar,
  },
  { divider: true },
  {
    label: "Urenregistraties",
    href: "/dashboard/employee#hours",
    icon: Clock,
  },
  {
    label: "Betalingen",
    href: "/dashboard/employee#payments",
    icon: CreditCard,
  },
  {
    label: "Rekeninggegevens",
    href: "/dashboard/employee#bank",
    icon: User,
  },
]

const DAYS_OF_WEEK = [
  { value: 0, label: 'Zondag' },
  { value: 1, label: 'Maandag' },
  { value: 2, label: 'Dinsdag' },
  { value: 3, label: 'Woensdag' },
  { value: 4, label: 'Donderdag' },
  { value: 5, label: 'Vrijdag' },
  { value: 6, label: 'Zaterdag' },
]

export default function EmployeeDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [availability, setAvailability] = useState<any[]>([])
  const [workHours, setWorkHours] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  
  // UI states
  const [editingAvailability, setEditingAvailability] = useState<number | null>(null)
  const [editingBankAccount, setEditingBankAccount] = useState<string | null>(null)
  const [showAddBankAccount, setShowAddBankAccount] = useState(false)
  
  // Form states
  const [availabilityForm, setAvailabilityForm] = useState<any>({})
  const [bankAccountForm, setBankAccountForm] = useState({
    account_holder_name: '',
    iban: '',
    bank_name: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'employee') {
        router.push('/dashboard')
        return
      }

      setUser(user)
      setUserProfile(profile)

      // Fetch employer ID if employee has employer_email
      let employerId = null
      if (profile?.employer_email) {
        const { data: employerProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', profile.employer_email)
          .eq('role', 'employer')
          .single()
        
        if (employerProfile) {
          employerId = employerProfile.id
        }
      }

      // Store employer ID for later use
      if (employerId) {
        (user as any).employerId = employerId
      }

      // Fetch all data
      await Promise.all([
        fetchAvailability(user.id),
        fetchWorkHours(user.id),
        fetchPayments(user.id),
        fetchBankAccounts(user.id),
      ])

      setLoading(false)
    }

    fetchData()
  }, [router, supabase])

  const fetchAvailability = async (employeeId: string) => {
    const { data } = await supabase
      .from('employee_availability')
      .select('*')
      .eq('employee_id', employeeId)
      .order('day_of_week')

    if (data) {
      setAvailability(data)
    }
  }

  const fetchWorkHours = async (employeeId: string) => {
    const { data } = await supabase
      .from('work_hours')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false })
      .limit(50)

    if (data) {
      setWorkHours(data)
    }
  }

  const fetchPayments = async (employeeId: string) => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false })

    if (data) {
      setPayments(data)
    }
  }

  const fetchBankAccounts = async (employeeId: string) => {
    const { data } = await supabase
      .from('employee_bank_accounts')
      .select('*')
      .eq('employee_id', employeeId)
      .order('is_primary', { ascending: false })

    if (data) {
      setBankAccounts(data)
    }
  }

  const handleSaveAvailability = async (dayOfWeek: number) => {
    const formData = availabilityForm[dayOfWeek] || {}
    const { error } = await supabase
      .from('employee_availability')
      .upsert({
        employee_id: user.id,
        day_of_week: dayOfWeek,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        is_available: formData.is_available !== false,
        notes: formData.notes || null,
      })

    if (!error) {
      await fetchAvailability(user.id)
      setEditingAvailability(null)
      setAvailabilityForm({})
    }
  }

  const handleSaveBankAccount = async () => {
    if (!bankAccountForm.account_holder_name || !bankAccountForm.iban) {
      return
    }

    const { error } = await supabase
      .from('employee_bank_accounts')
      .insert({
        employee_id: user.id,
        ...bankAccountForm,
        is_primary: bankAccounts.length === 0,
      })

    if (!error) {
      await fetchBankAccounts(user.id)
      setShowAddBankAccount(false)
      setBankAccountForm({ account_holder_name: '', iban: '', bank_name: '' })
    }
  }

  const handleDeleteBankAccount = async (accountId: string) => {
    const { error } = await supabase
      .from('employee_bank_accounts')
      .delete()
      .eq('id', accountId)

    if (!error) {
      await fetchBankAccounts(user.id)
    }
  }

  const handleSetPrimary = async (accountId: string) => {
    // Set all to false first
    await supabase
      .from('employee_bank_accounts')
      .update({ is_primary: false })
      .eq('employee_id', user.id)

    // Set selected to primary
    const { error } = await supabase
      .from('employee_bank_accounts')
      .update({ is_primary: true })
      .eq('id', accountId)

    if (!error) {
      await fetchBankAccounts(user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Calculate totals
  const totalEarned = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0) / 100 // Convert cents to euros

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0) / 100

  const totalHours = workHours
    .filter(wh => wh.status === 'approved' || wh.status === 'paid')
    .reduce((sum, wh) => sum + parseFloat(wh.total_hours || 0), 0)

  const thisMonthHours = workHours
    .filter(wh => {
      const date = new Date(wh.date)
      const now = new Date()
      return date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear() &&
             (wh.status === 'approved' || wh.status === 'paid')
    })
    .reduce((sum, wh) => sum + parseFloat(wh.total_hours || 0), 0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002A1F] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SidebarNavigationSectionDividers
        items={employeeNavItemsWithDividers}
        activeUrl="/dashboard/employee"
        footerItems={[
          {
            label: "Instellingen",
            href: "/dashboard/employee#settings",
            icon: Settings,
          },
          {
            label: "Support",
            href: "/dashboard/employee/support",
            icon: MessageCircle,
          },
          {
            label: "Uitloggen",
            href: "#",
            icon: LogOut,
            onClick: handleLogout,
          },
        ]}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 z-50 w-auto border-b bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold">Mijn Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <AvatarLabelGroup
                size="md"
                src={userProfile?.avatar_url || userProfile?.profile_picture || undefined}
                alt={userProfile?.full_name || user?.email || 'User'}
                title={userProfile?.full_name || user?.email || 'User'}
                subtitle="Werknemer"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 mt-16">
          <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mijn Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welkom terug, {userProfile?.full_name || user?.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Verdiend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalEarned.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3" /> Totaal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Openstaand</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{pendingAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Wachtend op uitbetaling</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gewerkte Uren</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Totaal uren</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deze Maand</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisMonthHours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Uren deze maand</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="availability" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="availability">Beschikbaarheid</TabsTrigger>
            <TabsTrigger value="hours">Gewerkte Uren</TabsTrigger>
            <TabsTrigger value="payments">Uitbetalingen</TabsTrigger>
            <TabsTrigger value="bank">Rekeninggegevens</TabsTrigger>
          </TabsList>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mijn Beschikbaarheid</CardTitle>
                <CardDescription>
                  Geef aan wanneer je beschikbaar bent om te werken
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayAvailability = availability.find(a => a.day_of_week === day.value)
                    const isEditing = editingAvailability === day.value
                    const formData = availabilityForm[day.value] || {
                      start_time: dayAvailability?.start_time || '',
                      end_time: dayAvailability?.end_time || '',
                      is_available: dayAvailability?.is_available !== false,
                      notes: dayAvailability?.notes || '',
                    }

                    return (
                      <div
                        key={day.value}
                        className="flex items-center gap-4 rounded-lg border p-4"
                      >
                        <div className="w-24 font-medium">{day.label}</div>
                        {isEditing ? (
                          <div className="flex-1 grid grid-cols-4 gap-2">
                            <Input
                              type="time"
                              value={formData.start_time}
                              onChange={(e) =>
                                setAvailabilityForm({
                                  ...availabilityForm,
                                  [day.value]: { ...formData, start_time: e.target.value },
                                })
                              }
                              placeholder="Start"
                            />
                            <Input
                              type="time"
                              value={formData.end_time}
                              onChange={(e) =>
                                setAvailabilityForm({
                                  ...availabilityForm,
                                  [day.value]: { ...formData, end_time: e.target.value },
                                })
                              }
                              placeholder="Eind"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.is_available}
                                onChange={(e) =>
                                  setAvailabilityForm({
                                    ...availabilityForm,
                                    [day.value]: { ...formData, is_available: e.target.checked },
                                  })
                                }
                                className="h-4 w-4"
                              />
                              <span className="text-sm">Beschikbaar</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveAvailability(day.value)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingAvailability(null)
                                  setAvailabilityForm({})
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              {dayAvailability?.is_available ? (
                                <span className="text-sm">
                                  {dayAvailability.start_time || '--'} - {dayAvailability.end_time || '--'}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">Niet beschikbaar</span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingAvailability(day.value)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Bewerken
                            </Button>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Hours Tab */}
          <TabsContent value="hours" className="space-y-4">
            <AddWorkHoursForm
              employeeId={user.id}
              employerId={(user as any).employerId || user.id}
              onSuccess={() => fetchWorkHours(user.id)}
            />
            <Card>
              <CardHeader>
                <CardTitle>Gewerkte Uren</CardTitle>
                <CardDescription>
                  Overzicht van alle gewerkte uren
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>Eind</TableHead>
                      <TableHead>Uren</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workHours.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          Nog geen uren geregistreerd
                        </TableCell>
                      </TableRow>
                    ) : (
                      workHours.map((hours) => (
                        <TableRow key={hours.id}>
                          <TableCell>
                            {new Date(hours.date).toLocaleDateString('nl-NL')}
                          </TableCell>
                          <TableCell>
                            {hours.start_time
                              ? new Date(hours.start_time).toLocaleTimeString('nl-NL', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '--'}
                          </TableCell>
                          <TableCell>
                            {hours.end_time
                              ? new Date(hours.end_time).toLocaleTimeString('nl-NL', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '--'}
                          </TableCell>
                          <TableCell>{parseFloat(hours.total_hours || 0).toFixed(2)}</TableCell>
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
                                : hours.status === 'rejected'
                                ? 'Afgewezen'
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
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Uitbetalingsgeschiedenis</CardTitle>
                <CardDescription>
                  Alle uitbetalingen die je hebt ontvangen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Beschrijving</TableHead>
                      <TableHead>Bedrag</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          Nog geen uitbetalingen ontvangen
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.created_at).toLocaleDateString('nl-NL')}
                          </TableCell>
                          <TableCell>{payment.description || 'Uitbetaling'}</TableCell>
                          <TableCell className="font-semibold">
                            €{((payment.amount || 0) / 100).toLocaleString('nl-NL', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
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
                              {payment.status === 'completed' ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Betaald
                                </>
                              ) : payment.status === 'failed' ? (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Mislukt
                                </>
                              ) : (
                                'In behandeling'
                              )}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Accounts Tab */}
          <TabsContent value="bank" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rekeninggegevens</CardTitle>
                    <CardDescription>
                      Beheer je bankrekeninggegevens voor uitbetalingen
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddBankAccount(!showAddBankAccount)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Rekening Toevoegen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddBankAccount && (
                  <div className="mb-6 rounded-lg border p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Rekeninghouder
                        </label>
                        <Input
                          value={bankAccountForm.account_holder_name}
                          onChange={(e) =>
                            setBankAccountForm({
                              ...bankAccountForm,
                              account_holder_name: e.target.value,
                            })
                          }
                          placeholder="Naam op rekening"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">IBAN</label>
                        <Input
                          value={bankAccountForm.iban}
                          onChange={(e) =>
                            setBankAccountForm({
                              ...bankAccountForm,
                              iban: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="NL91 ABNA 0417 1643 00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Banknaam (optioneel)
                      </label>
                      <Input
                        value={bankAccountForm.bank_name}
                        onChange={(e) =>
                          setBankAccountForm({
                            ...bankAccountForm,
                            bank_name: e.target.value,
                          })
                        }
                        placeholder="Bijv. ING, Rabobank"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveBankAccount}>Opslaan</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddBankAccount(false)
                          setBankAccountForm({ account_holder_name: '', iban: '', bank_name: '' })
                        }}
                      >
                        Annuleren
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {bankAccounts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Nog geen rekeninggegevens toegevoegd
                    </p>
                  ) : (
                    bankAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{account.account_holder_name}</p>
                            {account.is_primary && (
                              <Badge variant="default" className="text-xs">
                                Primair
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {account.iban}
                          </p>
                          {account.bank_name && (
                            <p className="text-xs text-gray-500 mt-1">{account.bank_name}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!account.is_primary && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetPrimary(account.id)}
                            >
                              Primair maken
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBankAccount(account.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
