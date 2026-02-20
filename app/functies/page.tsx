'use client'

import Link from 'next/link'
import { MarketingLayout } from '@/components/marketing/marketing-layout'
import { FooterSection } from '@/components/marketing/footer-section'

export default function FunctiesPage() {
  return (
    <MarketingLayout>
      <main className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-[#163300] sm:text-5xl md:text-6xl">
            Functies en uitleg over Domio
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Deze pagina wordt binnenkort gevuld met alle functies en uitleg over het Domio platform.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-[#163300] underline underline-offset-4 hover:text-[#163300]/80"
          >
            Terug naar home
          </Link>
        </div>
      </main>
      <FooterSection />
    </MarketingLayout>
  )
}
