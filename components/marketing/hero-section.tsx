'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'

interface HeroSectionProps {
  onSignupClick?: () => void
}

export function HeroSection({ onSignupClick }: HeroSectionProps) {

  return (
    <section className="relative -mt-16 overflow-visible bg-[#002A1F] pt-10 pb-0 md:pt-12 md:pb-0">
      {/* Background blur spots - hidden on mobile, visible on desktop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Blur spots - only on desktop */}
        <div className="hidden md:block absolute -top-24 -left-24 h-[32rem] w-[40rem] rounded-[60%] bg-[#9AFF7C]/30 blur-3xl" />
        <div className="hidden md:block absolute top-1/4 -right-24 h-[36rem] w-[44rem] rounded-[50%] bg-[#9AFF7C]/25 blur-3xl" />
        <div className="hidden md:block absolute -bottom-28 left-1/3 h-[40rem] w-[48rem] rounded-[55%] bg-[#9AFF7C]/20 blur-3xl" />
        <div className="hidden md:block absolute top-1/2 left-1/4 h-[28rem] w-[36rem] rounded-[45%] bg-[#9AFF7C]/25 blur-3xl" />
        <div className="hidden md:block absolute top-3/4 right-1/3 h-[32rem] w-[38rem] rounded-[65%] bg-[#9AFF7C]/20 blur-3xl" />
        {/* Lighter fade so content stays readable - darker on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/20 md:from-black/0 md:via-black/10 md:to-black/20" />
        {/* Mobile: solid dark background, Desktop: transparent */}
        <div className="absolute inset-0 bg-[#002A1F] md:bg-transparent" />
      </div>
      
      <div className="container relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 pt-20 pb-12 md:px-8 md:pt-16 md:pb-16 text-center">
        {/* Centered Marketing Message */}
        <div className="relative z-30 max-w-3xl w-full">
          <h1 className="text-[2.5rem] font-semibold tracking-tight text-balance text-white sm:text-5xl md:text-6xl leading-tight">
            <span className="whitespace-nowrap">Het <span className="text-[#9AFF7C]">platform</span> voor</span>
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
              className="bg-transparent text-white hover:bg-white/10 border border-white rounded-xl"
            >
              <Link href="/dashboard/employer" className="flex items-center gap-2">
                Bekijk demo
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              className="bg-white text-[#002A1F] hover:bg-white/90 border border-white/20 rounded-xl"
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
