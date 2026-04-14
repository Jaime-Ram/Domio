import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Huurder Portal — Domio',
  description: 'Jouw huurdersinformatie',
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <span className="text-lg font-bold text-[#163300]">Domio</span>
          <span className="ml-2 text-xs text-gray-400 font-medium tracking-wide uppercase">Huurderportal</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
