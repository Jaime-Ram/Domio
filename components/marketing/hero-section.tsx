'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowUpRight } from 'lucide-react'

interface HeroSectionProps {
  onSignupClick?: () => void
}

export function HeroSection({ onSignupClick }: HeroSectionProps) {
  // Use Achtergrond13.jpg as fixed background, mirrored

  return (
    <section className="relative -mt-16 overflow-visible pt-10 pb-0 md:pt-12 md:pb-0 flex flex-col">
      {/* Background Image */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden -top-32 md:top-0">
        <div className="absolute inset-0">
          <Image
            src="/images/Achtergrond13.jpg"
            alt=""
            fill
            className="object-cover object-[30%_60%] md:object-[20%_50%]"
            style={{ transform: 'scaleX(-1)' }}
            priority
            quality={90}
          />
        </div>
        
        {/* Black fade from top to bottom for header visibility - darker at top, faster fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
      </div>
      
      {/* Content Section */}
      <div className="mx-auto max-w-2xl px-6 lg:max-w-4xl lg:px-8 relative z-10 pt-28 pb-12 md:pt-24 md:pb-16 flex-shrink-0">
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
        <div className="flex flex-row items-center gap-3 justify-center pb-8 md:pb-12">
          {/* Desktop: Email input with "Start direct" button - integrated rounded-2xl shape */}
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              if (onSignupClick) {
                onSignupClick()
              }
            }}
            className="hidden md:flex items-stretch w-full max-w-md"
          >
            <div className="flex items-stretch rounded-2xl border border-white/40 bg-white/40 overflow-hidden flex-1">
              <Input
                type="email"
                name="account-email"
                placeholder="Vul je email in"
                required
                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/80 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-2xl rounded-r-none px-4 py-3"
              />
              <Button
                type="submit"
                className="bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 border-0 rounded-r-2xl rounded-l-none px-6 font-medium"
              >
                Start direct
              </Button>
            </div>
          </form>
          
          {/* Mobile: Start direct button */}
          <Button
            onClick={onSignupClick}
            className="md:hidden bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 border border-[#9AFF7C]/20 rounded-2xl"
          >
            Start direct
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

      {/* Device Mockup - positioned at bottom of hero section, aligned to bottom edge */}
      <div className="relative w-full flex justify-center items-end flex-shrink-0 mt-auto">
        <div className="relative w-full max-w-7xl px-6 md:px-8">
          <Image
            src="/images/device-mockup_1.5x_postspark_2026-01-09_15-30-09.png"
            alt="Domio app mockup"
            width={1200}
            height={800}
            className="h-auto w-full max-w-full object-contain mx-auto"
            priority
            quality={90}
          />
        </div>
      </div>

    </section>
  )
}
