'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'

interface HeroSectionProps {
  onSignupClick?: () => void
}

export function HeroSection({ onSignupClick }: HeroSectionProps) {
  // Use Achtergrond13.jpg as fixed background, mirrored

  return (
    <section className="relative overflow-visible pt-16 pb-0 md:pt-16 md:pb-0">
      {/* Background Image */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Achtergrond13.jpg"
            alt=""
            fill
            className="object-cover object-[10%_60%] md:object-[0%_50%]"
            style={{ transform: 'scaleX(-1)' }}
            priority
            quality={90}
          />
        </div>
        
        {/* Black fade from top to bottom for header visibility - darker at top, faster fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
      </div>
      
      <div className="mx-auto max-w-2xl px-6 lg:max-w-4xl lg:px-8 relative z-10 pt-12 pb-12 md:pt-16 md:pb-16">
        {/* Title Section - Same styling as Functies section */}
        <div className="mb-6 text-center md:mb-8">
          <div className="inline-block max-w-full lg:max-w-2xl w-full">
            {/* Mobile: Larger title */}
            <h1 className="md:hidden text-[2.5rem] font-semibold tracking-tight text-white leading-tight text-center">
              Een centraal<br />
              platform voor<br />
              vastgoedbeheer
            </h1>
            {/* Desktop: Title */}
            <h1 className="hidden md:block text-[2.5rem] font-semibold tracking-tight text-balance text-white sm:text-5xl md:text-6xl leading-tight">
              Het beheerplatform voor vastgoed
          </h1>
            <p className="mt-2 text-base font-medium text-pretty text-white/80 sm:text-lg leading-8 max-w-[90%] mx-auto">
              <span className="md:hidden">Het alles-in-een platform voor efficiënt vastgoedbeheer</span>
              <span className="hidden md:inline">Ontworpen door vastgoedprofessionals. Domio helpt je om je portefeuille efficiënt te beheren.</span>
          </p>
          </div>
        </div>

          {/* CTA */}
        <div className="flex flex-row items-center gap-3 justify-center pb-[25vh]">
          {/* Registreren button - visible on all screen sizes */}
          <Button
            onClick={onSignupClick}
            className="bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 border border-[#9AFF7C]/20 rounded-2xl"
          >
            Registreren
          </Button>
          
          {/* Bekijk demo button - visible on all screen sizes */}
            <Button
              asChild
            className="bg-transparent text-white hover:bg-white/10 border border-white rounded-2xl"
            >
            <Link href="/demo" className="flex items-center gap-2">
                Bekijk demo
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

    </section>
  )
}
