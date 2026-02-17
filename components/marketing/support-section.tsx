'use client'

import Link from 'next/link'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

const OPTIONS = [
  {
    icon: Mail,
    label: 'E-mail',
    href: 'mailto:contact@domiovastgoedbeheer.nl',
  },
  {
    icon: MessageCircle,
    label: 'Live chat',
    href: '/contact',
  },
  {
    icon: Phone,
    label: 'Telefoon',
    href: 'tel:+31646231696',
  },
]

export function SupportSection() {
  return (
    <section className="bg-white py-20 sm:py-24 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-[#163300] sm:text-5xl md:text-6xl">
          We helpen graag
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          Bij vragen staat ons team voor je klaar.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
          {OPTIONS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-3 transition-colors"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors group-hover:bg-[#9FE870] group-hover:text-[#163300] dark:bg-neutral-700 dark:text-gray-400 dark:group-hover:bg-[#9FE870] dark:group-hover:text-[#163300]">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <span className="text-base font-medium text-gray-700 dark:text-gray-300 transition-colors group-hover:text-[#163300] dark:group-hover:text-[#163300]">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="mt-10">
          <Button
            asChild
            variant="secondary"
            className="rounded-full !bg-[#9FE870] !text-[#163300] hover:!bg-[#9FE870]/90 border-0 px-8 py-6 text-base font-semibold shadow-sm"
          >
            <Link href="/contact">Neem contact op</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
