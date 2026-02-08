'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'

interface HeroSectionProps {
  onSignupClick?: () => void
}

export function HeroSection({ onSignupClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white flex items-center min-h-[calc(82vh-4rem)] pt-16 pb-10 md:pt-20 md:pb-12">
      {/* Decoratieve hoek rechtsonder – twee kleuren */}
      <GeometricShapes
        variant="trapezoid"
        className="right-0 bottom-0 w-[20rem] h-[20rem] md:w-[26rem] md:h-[26rem] lg:w-[32rem] lg:h-[32rem]"
        color="#9AFF7C"
        opacity={0.3}
        layers={1}
      />
      <GeometricShapes
        variant="trapezoid"
        className="right-0 bottom-0 w-[18rem] h-[18rem] md:w-[22rem] md:h-[22rem] lg:w-[28rem] lg:h-[28rem] translate-x-8 translate-y-4"
        color="#002A1F"
        opacity={0.25}
        layers={1}
      />
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-8">
        {/* Left: Title + CTA */}
        <div className="flex-shrink-0 max-w-2xl">
          <div className="mb-6 md:mb-8">
            <h1 className="md:hidden text-[2.875rem] font-semibold tracking-tight text-[#002A1F] leading-tight text-left">
              Één centraal platform voor vastgoedbeheer
            </h1>
            <h1 className="hidden md:block text-[2.75rem] font-semibold tracking-tight text-balance text-[#002A1F] sm:text-6xl md:text-7xl leading-tight text-left">
              Één centraal platform voor vastgoedbeheer
            </h1>
            <p className="mt-2 text-base font-medium text-pretty text-gray-600 sm:text-lg leading-8 max-w-xl text-left">
              <span className="md:hidden">Het alles-in-een platform voor efficiënt vastgoedbeheer</span>
              <span className="hidden md:inline">Ontworpen door vastgoedprofessionals. Domio helpt je om je portefeuille efficiënt te beheren.</span>
            </p>
          </div>
          <div className="flex flex-row items-center gap-3 justify-start">
            <Button
              onClick={onSignupClick}
              className="bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 border border-[#9AFF7C]/20 rounded-2xl"
            >
              Gratis aanmelden
            </Button>
            <Button
              asChild
              className="bg-transparent text-[#002A1F] hover:bg-gray-100 border border-gray-300 rounded-2xl"
            >
              <Link href="/demo" className="flex items-center gap-2">
                Bekijk demo
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right: Foto (zonder mockup) */}
        <div className="flex justify-end items-center flex-shrink-0 lg:max-w-[55%]">
          <div className="relative w-[300px] h-[340px] md:w-[390px] md:h-[430px] lg:w-[500px] lg:h-[540px]">
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl -translate-x-6 -translate-y-3 md:-translate-x-8 md:-translate-y-4 lg:-translate-x-12 lg:-translate-y-5" aria-hidden>
              <Image
                src="/images/Achtergrond11.jpg"
                alt=""
                fill
                className="object-cover"
                priority={false}
                loading="lazy"
                quality={80}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
