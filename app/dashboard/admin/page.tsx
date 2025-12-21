'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  TrendingUp, 
  TrendingDown,
  HelpCircle,
  Plus,
  Edit,
  Menu
} from 'lucide-react'
import Link from 'next/link'

// Mock data for users table
const mockUsers = [
  {
    id: 1,
    name: 'Christina Bersh',
    email: 'christina@site.com',
    avatar: 'https://images.unsplash.com/photo-1531927557220-a9e23c1e4794?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80',
    position: 'Director',
    department: 'Human resources',
    status: 'active',
    portfolio: { current: 1, total: 5 },
    created: '28 Dec, 12:12',
  },
  {
    id: 2,
    name: 'David Harrison',
    email: 'david@site.com',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80',
    position: 'Seller',
    department: 'Branding products',
    status: 'warning',
    portfolio: { current: 3, total: 5 },
    created: '20 Dec, 09:27',
  },
  {
    id: 3,
    name: 'Anne Richard',
    email: 'anne@site.com',
    avatar: null,
    position: 'Designer',
    department: 'IT department',
    status: 'active',
    portfolio: { current: 5, total: 5 },
    created: '18 Dec, 15:20',
  },
  {
    id: 4,
    name: 'Samia Kartoon',
    email: 'samia@site.com',
    avatar: 'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&&auto=format&fit=facearea&facepad=3&w=320&h=320&q=80',
    position: 'Executive director',
    department: 'Marketing',
    status: 'active',
    portfolio: { current: 0, total: 5 },
    created: '18 Dec, 15:20',
  },
  {
    id: 5,
    name: 'David Harrison',
    email: 'david@site.com',
    avatar: null,
    position: 'Developer',
    department: 'Mobile app',
    status: 'danger',
    portfolio: { current: 3, total: 5 },
    created: '15 Dec, 14:41',
  },
  {
    id: 6,
    name: 'Brian Halligan',
    email: 'brian@site.com',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80',
    position: 'Accountant',
    department: 'Finance',
    status: 'active',
    portfolio: { current: 2, total: 5 },
    created: '11 Dec, 18:51',
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500">
          <svg className="size-2.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          Active
        </Badge>
      )
    case 'warning':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500">
          <svg className="size-2.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          Warning
        </Badge>
      )
    case 'danger':
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500">
          <svg className="size-2.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          Danger
        </Badge>
      )
    default:
      return null
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/dashboard/employee')
        return
      }

      setUser(profile)
      setLoading(false)
    }

    fetchUser()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="w-full lg:ps-64">
        {/* Header */}
        <DashboardHeader />

        {/* Breadcrumb for mobile */}
        <div className="sticky top-[57px] inset-x-0 z-20 bg-white border-y border-gray-200 px-4 sm:px-6 lg:px-8 lg:hidden dark:bg-neutral-800 dark:border-neutral-700">
          <div className="flex items-center py-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="shrink-0 size-4" />
              <span className="sr-only">Toggle Navigation</span>
            </Button>
            <ol className="ms-3 flex items-center whitespace-nowrap">
              <li className="flex items-center text-sm text-gray-800 dark:text-neutral-400">
                Application Layout
                <svg className="shrink-0 mx-3 overflow-visible size-2.5 text-gray-400 dark:text-neutral-500" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </li>
              <li className="text-sm font-semibold text-gray-800 truncate dark:text-neutral-400" aria-current="page">
                Dashboard
              </li>
            </ol>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Users Card */}
            <Card className="border border-gray-200 dark:border-neutral-700">
              <CardHeader className="p-4 md:p-5">
                <div className="flex items-center gap-x-2">
                  <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                    Total users
                  </p>
                  <div className="relative group">
                    <HelpCircle className="shrink-0 size-4 text-gray-500 dark:text-neutral-500 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      The number of daily users
                    </div>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
                    72,540
                  </h3>
                  <span className="flex items-center gap-x-1 text-green-600">
                    <TrendingUp className="inline-block size-4 self-center" />
                    <span className="inline-block text-sm">1.7%</span>
                  </span>
                </div>
              </CardHeader>
            </Card>

            {/* Sessions Card */}
            <Card className="border border-gray-200 dark:border-neutral-700">
              <CardHeader className="p-4 md:p-5">
                <div className="flex items-center gap-x-2">
                  <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                    Sessions
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
                    29.4%
                  </h3>
                </div>
              </CardHeader>
            </Card>

            {/* Avg. Click Rate Card */}
            <Card className="border border-gray-200 dark:border-neutral-700">
              <CardHeader className="p-4 md:p-5">
                <div className="flex items-center gap-x-2">
                  <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                    Avg. Click Rate
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
                    56.8%
                  </h3>
                  <span className="flex items-center gap-x-1 text-red-600">
                    <TrendingDown className="inline-block size-4 self-center" />
                    <span className="inline-block text-sm">1.7%</span>
                  </span>
                </div>
              </CardHeader>
            </Card>

            {/* Pageviews Card */}
            <Card className="border border-gray-200 dark:border-neutral-700">
              <CardHeader className="p-4 md:p-5">
                <div className="flex items-center gap-x-2">
                  <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                    Pageviews
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
                    92,913
                  </h3>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Income Card */}
            <Card className="min-h-[410px] flex flex-col border border-gray-200 dark:border-neutral-700">
              <CardHeader className="p-4 md:p-5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <h2 className="text-sm text-gray-500 dark:text-neutral-500">Income</h2>
                    <p className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
                      $126,238.49
                    </p>
                  </div>
                  <div>
                    <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500">
                      <TrendingUp className="inline-block size-3.5 mr-1" />
                      25%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-neutral-400">
                  <p className="text-sm">Chart placeholder</p>
                  <p className="text-xs mt-1">Chart will be implemented here</p>
                </div>
              </CardContent>
            </Card>

            {/* Visitors Card */}
            <Card className="min-h-[410px] flex flex-col border border-gray-200 dark:border-neutral-700">
              <CardHeader className="p-4 md:p-5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <h2 className="text-sm text-gray-500 dark:text-neutral-500">Visitors</h2>
                    <p className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
                      80.3k
                    </p>
                  </div>
                  <div>
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500">
                      <TrendingDown className="inline-block size-3.5 mr-1" />
                      2%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-neutral-400">
                  <p className="text-sm">Chart placeholder</p>
                  <p className="text-xs mt-1">Chart will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="border border-gray-200 dark:border-neutral-700">
            <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-neutral-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                  Users
                </h2>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Add users, edit and more.
                </p>
              </div>
              <div>
                <div className="inline-flex gap-x-2">
                  <Button variant="outline" asChild>
                    <Link href="#">View all</Link>
                  </Button>
                  <Button asChild>
                    <Link href="#">
                      <Plus className="shrink-0 size-4 mr-2" />
                      Add user
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-neutral-800">
                    <TableHead className="ps-6">
                      <Checkbox id="select-all" />
                    </TableHead>
                    <TableHead className="ps-6 lg:ps-3 xl:ps-0 pe-6">
                      <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                        Name
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                        Position
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                        Status
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                        Portfolio
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                        Created
                      </span>
                    </TableHead>
                    <TableHead className="text-end"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="ps-6">
                        <Checkbox id={`user-${user.id}`} />
                      </TableCell>
                      <TableCell className="ps-6 lg:ps-3 xl:ps-0 pe-6">
                        <div className="flex items-center gap-x-3">
                          {user.avatar ? (
                            <Avatar className="size-9.5">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="inline-flex items-center justify-center size-9.5 rounded-full bg-white border border-gray-300 dark:bg-neutral-800 dark:border-neutral-700">
                              <span className="font-medium text-sm text-gray-800 dark:text-neutral-200">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="grow">
                            <span className="block text-sm font-semibold text-gray-800 dark:text-neutral-200">
                              {user.name}
                            </span>
                            <span className="block text-sm text-gray-500 dark:text-neutral-500">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="block text-sm font-semibold text-gray-800 dark:text-neutral-200">
                          {user.position}
                        </span>
                        <span className="block text-sm text-gray-500 dark:text-neutral-500">
                          {user.department}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-x-3">
                          <span className="text-xs text-gray-500 dark:text-neutral-500">
                            {user.portfolio.current}/{user.portfolio.total}
                          </span>
                          <div className="flex w-full h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700">
                            <div
                              className="flex flex-col justify-center overflow-hidden bg-gray-800 dark:bg-neutral-200"
                              style={{ width: `${(user.portfolio.current / user.portfolio.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500 dark:text-neutral-500">
                          {user.created}
                        </span>
                      </TableCell>
                      <TableCell className="text-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="#">
                            <Edit className="shrink-0 size-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-neutral-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  <span className="font-semibold text-gray-800 dark:text-neutral-200">
                    {mockUsers.length}
                  </span>{' '}
                  results
                </p>
              </div>
              <div>
                <div className="inline-flex gap-x-2">
                  <Button variant="outline" size="sm">
                    Prev
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
