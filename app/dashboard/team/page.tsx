'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Users, 
  Plus, 
  Search, 
  Eye,
  Edit,
  X,
  Building2,
  Settings,
  LogOut,
  MessageCircle,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  BarChart3,
  DollarSign
} from 'lucide-react'
import type { NavItemType, NavItemDividerType, NavItemSectionHeaderType } from "@/components/application/app-navigation/config"
import { SidebarNavigationSectionDividers } from "@/components/application/app-navigation/sidebar-navigation/sidebar-section-dividers"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getAvatarUrl } from '@/lib/avatar-utils'
import { InviteEmployeeForm } from '@/components/invite-employee-form'
import { EmployeeDetailModal } from '@/components/employee-detail-modal'

const employerNavItemsWithDividers: (NavItemType | NavItemDividerType | NavItemSectionHeaderType)[] = [
  { sectionHeader: true, label: "Overzicht & Activiteit" },
  {
    label: "Dashboard",
    href: "/dashboard/employer",
    icon: BarChart3,
  },
  {
    label: "Rapporten",
    href: "/dashboard/reports",
    icon: FileText,
  },
  { divider: true },
  { sectionHeader: true, label: "Personeelsbeheer" },
  {
    label: "Teamleden",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    label: "Rooster",
    href: "/dashboard/employer/schedule",
    icon: Calendar,
  },
  {
    label: "Urenregistraties",
    href: "/dashboard/time",
    icon: Clock,
  },
  { divider: true },
  { sectionHeader: true, label: "Financiën" },
  {
    label: "Betalingen",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  { divider: true },
  { sectionHeader: true, label: "Organisatie" },
  {
    label: "Mijn Restaurant",
    href: "/dashboard/restaurant",
    icon: Building2,
  },
]

export default function TeamPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [restaurantSettings, setRestaurantSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
      }

      // Fetch restaurant (first active membership)
      const { data: membership } = await supabase
        .from('restaurant_members')
        .select('restaurant_id, restaurants(*)')
        .eq('profile_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (membership?.restaurants) {
        setRestaurant(membership.restaurants)
        
        // Fetch restaurant settings
        const { data: settings } = await supabase
          .from('restaurant_settings')
          .select('*')
          .eq('restaurant_id', membership.restaurant_id)
          .single()

        if (settings) {
          setRestaurantSettings(settings)
        }

        // Fetch team members
        await fetchMembers(membership.restaurant_id)
      }

      setLoading(false)
    }

    fetchData()
  }, [router, supabase])

  const fetchMembers = async (restaurantId: string) => {
    const { data: membersData, error } = await supabase
      .from('restaurant_members')
      .select(`
        *,
        user_profiles!inner(
          id,
          full_name,
          email,
          avatar_url,
          phone_number
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching members:', error)
      return
    }

    setMembers(membersData || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const filteredMembers = members.filter(member => {
    const profile = member.user_profiles
    const matchesSearch = !searchQuery || 
      profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

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
        items={employerNavItemsWithDividers}
        activeUrl="/dashboard/team"
        footerItems={[
          {
            label: "Instellingen",
            href: "/dashboard/settings",
            icon: Settings,
          },
          {
            label: "Support",
            href: "/dashboard/employer/support",
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
              <h1 className="text-xl font-semibold">
                {restaurantSettings?.restaurant_name || restaurant?.name || 'Teamleden'}
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 mt-16 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Teamleden</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Beheer je teamleden en hun contractgegevens
                </p>
              </div>
              <Button onClick={() => setShowInviteForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Teamlid Uitnodigen
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Zoek op naam of email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="all">Alle rollen</option>
                      <option value="owner">Eigenaar</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Werknemer</option>
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="all">Alle statussen</option>
                      <option value="active">Actief</option>
                      <option value="inactive">Inactief</option>
                      <option value="invited">Uitgenodigd</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members Table */}
            <Card>
              <CardHeader>
                <CardTitle>Teamleden ({filteredMembers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                        ? 'Geen teamleden gevonden met deze filters'
                        : 'Nog geen teamleden. Nodig er een uit!'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Naam</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uurloon</TableHead>
                        <TableHead>Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member) => {
                        const profile = member.user_profiles
                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={getAvatarUrl(
                                    profile?.avatar_url,
                                    profile?.profile_picture,
                                    profile?.id,
                                    profile?.full_name || profile?.email
                                  )} />
                                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700" />
                                </Avatar>
                                <span className="font-medium">{profile?.full_name || 'Geen naam'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{profile?.email}</TableCell>
                            <TableCell>
                              <Badge variant={
                                member.role === 'owner' ? 'default' :
                                member.role === 'manager' ? 'secondary' : 'outline'
                              }>
                                {member.role === 'owner' ? 'Eigenaar' :
                                 member.role === 'manager' ? 'Manager' : 'Werknemer'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                member.status === 'active' ? 'default' :
                                member.status === 'inactive' ? 'destructive' : 'secondary'
                              }>
                                {member.status === 'active' ? 'Actief' :
                                 member.status === 'inactive' ? 'Inactief' : 'Uitgenodigd'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {member.hourly_rate ? `€${member.hourly_rate.toFixed(2)}` : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedMember(member.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedMember(member.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showInviteForm && (
        <InviteEmployeeForm
          onClose={() => setShowInviteForm(false)}
          onSuccess={() => {
            setShowInviteForm(false)
            if (restaurant?.id) {
              fetchMembers(restaurant.id)
            }
          }}
        />
      )}

      {selectedMember && (
        <EmployeeDetailModal
          employeeId={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={() => {
            if (restaurant?.id) {
              fetchMembers(restaurant.id)
            }
          }}
        />
      )}
    </div>
  )
}

