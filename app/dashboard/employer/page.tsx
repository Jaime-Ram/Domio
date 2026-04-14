'use client'

import { useDashboardUser } from '@/providers/dashboard-user-provider'

export default function EmployerDashboardPage() {
  const { profile, user } = useDashboardUser()
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'daar'
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Goedemorgen'
    if (h < 18) return 'Goedemiddag'
    return 'Goedenavond'
  })()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870] mb-2">
        {greeting}, {firstName}
      </h1>
      <p className="text-sm text-gray-400 dark:text-gray-500">
        Het dashboard wordt later ingevuld.
      </p>
    </div>
  )
}
