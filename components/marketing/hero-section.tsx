'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'

interface HeroSectionProps {
  onSignupClick?: () => void
}

export function HeroSection({ onSignupClick }: HeroSectionProps) {

  return (
    <section className="relative -mt-16 overflow-visible pt-10 pb-0 md:pt-12 md:pb-0">
      {/* Background Image */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden -top-16 md:top-0">
        <div className="absolute inset-0">
          <Image
            src="/images/Achtergrond2.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
        </div>
        
        {/* Black fade from top to bottom for header visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/10" />
      </div>
      
      <div className="container relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 pt-28 pb-12 md:px-8 md:pt-24 md:pb-16 text-center">
        {/* Centered Marketing Message */}
        <div className="relative z-30 max-w-3xl w-full px-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl md:text-6xl leading-tight">
            <span className="block sm:whitespace-nowrap">Het <span className="text-white">platform</span> voor</span>
            <span className="block">vastgoedbeheer</span>
          </h1>
          <p className="mt-2 text-lg font-medium text-pretty text-white/80 sm:text-xl leading-8">
            <span className="hidden sm:inline">Ontworpen door vastgoedprofessionals. Domio helpt je om je portefeuille efficiënt te beheren.</span>
            <span className="sm:hidden">Domio helpt je portefeuille efficiënt te beheren.</span>
          </p>

          {/* CTA */}
          <div className="flex flex-row items-center gap-3 justify-center mt-6 pb-[30vh]">
            <Button
              asChild
              className="bg-transparent text-white hover:bg-white/10 border border-white rounded-2xl"
            >
              <Link href="/demo" className="flex items-center gap-2">
                Bekijk demo
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              className="bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 border border-[#9AFF7C]/20 rounded-2xl"
              onClick={onSignupClick}
            >
              Start direct
            </Button>
          </div>
          </div>
        </div>

    </section>
  )
}
