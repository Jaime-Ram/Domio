'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Send, 
  Settings,
  LogOut,
  Clock,
  CreditCard,
  User,
  BarChart3,
  Calendar,
  MessageCircle
} from 'lucide-react'
import type { NavItemType, NavItemDividerType } from "@/components/application/app-navigation/config"
import { SidebarNavigationSectionDividers } from "@/components/application/app-navigation/sidebar-navigation/sidebar-section-dividers"
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

export default function SupportPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'support'; timestamp: Date }>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
      }

      setLoading(false)
    }

    fetchUser()
  }, [router, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate support response (in production, this would connect to a real chat service)
    setTimeout(() => {
      const supportMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Bedankt voor je bericht! Ons support team zal zo snel mogelijk reageren. Hoe kunnen we je helpen?',
        sender: 'support' as const,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, supportMessage])
      setIsTyping(false)
    }, 1500)
  }

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
        activeUrl="/dashboard/employee/support"
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
            <AvatarLabelGroup
              size="md"
              src={userProfile?.avatar_url || userProfile?.profile_picture || undefined}
              alt={userProfile?.full_name || user?.email || 'User'}
              title={userProfile?.full_name || user?.email || 'User'}
              subtitle="Werknemer"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 mt-16">
          <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <CardTitle>Live Chat Support</CardTitle>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  We zijn online en klaar om je te helpen
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Start een gesprek met ons support team
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        We reageren meestal binnen een paar minuten
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.sender === 'user'
                              ? 'bg-[#002A1F] text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === 'user'
                                ? 'text-white/70'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString('nl-NL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Typ je bericht..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!inputMessage.trim() || isTyping}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

