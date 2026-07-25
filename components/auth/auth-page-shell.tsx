'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Logo } from '@/components/Logo'

type Variant = 'centered' | 'split' | 'marketing'

interface AuthPageShellProps {
  children: React.ReactNode
  variant?: Variant
}

const marketingLogos = [
  'Vesteda',
  'Bouwinvest',
  'MVGM',
  'Pararius',
  'Rotsvast',
  'Interhouse',
  '123Wonen',
  'Nederwoon',
  'Rebo Groep',
]

/**
 * Auth-layouts:
 * - centered:  gecentreerd formulier op wit (default, voor reset/onboarding/2fa)
 * - split:     formulier links, vastgoedfoto rechts (login)
 * - marketing: links uitgelijnd met klantlogo's eronder (sign-up)
 */
export function AuthPageShell({ children, variant = 'centered' }: AuthPageShellProps) {
  useEffect(() => {
    const isMobile = () => window.innerWidth < 768
    if (!isMobile()) return
    const meta = document.querySelector('meta[name="viewport"]')
    const prev = meta?.getAttribute('content') ?? ''
    const next = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    if (meta) meta.setAttribute('content', next)
    return () => {
      if (meta) meta.setAttribute('content', prev)
    }
  }, [])

  const LogoTopLeft = (
    <div className="absolute left-6 top-6 z-10 sm:left-10 sm:top-8">
      {/* Logo bevat zelf al een link naar home, dus geen extra <Link> eromheen */}
      <Logo height={20} href="/" />
    </div>
  )

  if (variant === 'split') {
    return (
      <div className="relative flex min-h-screen bg-white dark:bg-neutral-950">
        {/* Formulier links */}
        <div className="relative flex w-full flex-col lg:w-1/2 xl:w-[46%]">
          {LogoTopLeft}
          <main className="flex flex-1 items-center justify-center px-6 py-24">
            <div className="w-full max-w-[420px]">{children}</div>
          </main>
        </div>
        {/* Foto rechts */}
        <div className="relative hidden lg:block lg:w-1/2 xl:w-[54%] p-3">
          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            <Image
              src="/images/Achtergrond1.jpg"
              alt="Vastgoed"
              fill
              priority
              sizes="(min-width: 1280px) 54vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'marketing') {
    return (
      <div className="relative min-h-screen bg-white dark:bg-neutral-950">
        {LogoTopLeft}
        <main className="mx-auto flex min-h-screen max-w-[1180px] flex-col justify-center px-6 pt-28 pb-16 sm:px-10 lg:px-14">
          <div className="w-full max-w-[560px]">{children}</div>
          {/* Klantlogo's eronder */}
          <div className="mt-14 grid max-w-[560px] grid-cols-3 gap-x-8 gap-y-6">
            {marketingLogos.map((name) => (
              <span
                key={name}
                className="text-[15px] font-medium text-gray-300 dark:text-gray-600"
              >
                {name}
              </span>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-neutral-950">
      {LogoTopLeft}
      <main className="flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
    </div>
  )
}
