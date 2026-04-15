import type { Metadata } from 'next'
import { PortalNav } from '@/components/portal/portal-nav'

export const metadata: Metadata = {
  title: 'Huurderportal — Domio',
  description: 'Jouw huurdersinformatie',
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNav />
      <main className="lg:ml-52 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
