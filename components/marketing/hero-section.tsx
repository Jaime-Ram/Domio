'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowUpRight } from 'lucide-react'

interface HeroSectionProps {
  onSignupClick?: () => void
}

export function HeroSection({ onSignupClick }: HeroSectionProps) {
  // Background images from Achtergrond6.jpg to Achtergrond14.jpg (9 images)
  const backgrounds = Array.from({ length: 9 }, (_, i) => `/images/Achtergrond${i + 6}.jpg`)
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0)

  // Rotate background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [backgrounds.length])

  return (
    <section className="relative -mt-16 overflow-visible pt-10 pb-0 md:pt-12 md:pb-0">
      {/* Background Image */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden -top-32 md:top-0">
        <div className="absolute inset-0">
          <Image
            key={currentBackgroundIndex}
            src={backgrounds[currentBackgroundIndex]}
            alt=""
            fill
            className="object-cover object-[25%] md:object-center transition-opacity duration-1000"
            priority={currentBackgroundIndex === 0}
            quality={90}
          />
        </div>
        
        {/* Black fade from top to bottom for header visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/10" />
      </div>
      
      <div className="mx-auto max-w-2xl px-6 lg:max-w-4xl lg:px-8 relative z-10 pt-28 pb-12 md:pt-24 md:pb-16">
        {/* Title Section - Same styling as Functies section */}
        <div className="mb-6 text-center md:mb-8">
          <div className="inline-block max-w-full lg:max-w-2xl">
            <h1 className="text-[2.5rem] font-semibold tracking-tight text-balance text-white sm:text-5xl md:text-6xl leading-tight">
              Het platform voor vastgoedbeheer
            </h1>
            <p className="mt-2 text-lg font-medium text-pretty text-white/80 sm:text-xl leading-8 w-full">
              <span className="hidden sm:inline">Ontworpen door vastgoedprofessionals. Domio helpt je om je portefeuille efficiënt te beheren.</span>
              <span className="sm:hidden">Domio helpt je portefeuille efficiënt te beheren.</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pb-[25vh]">
          {/* Email input with "Open Account" button - integrated pill shape */}
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              if (onSignupClick) {
                onSignupClick()
              }
            }}
            className="flex items-stretch w-full max-w-md sm:w-auto"
          >
            <div className="flex items-stretch rounded-full border border-white/20 bg-white/10 backdrop-blur-sm overflow-hidden flex-1">
              <Input
                type="email"
                name="account-email"
                placeholder="Enter your email"
                required
                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-full rounded-r-none px-4 py-6"
              />
              <Button
                type="submit"
                className="bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 border-0 rounded-r-full rounded-l-none px-6 font-medium py-6"
              >
                Open Account
              </Button>
            </div>
          </form>
          
          {/* Launch Demo button - separate pill shape in light/white */}
          <Button
            asChild
            className="bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-full px-6 py-6"
          >
            <Link href="/demo" className="flex items-center gap-2">
              Launch Demo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

    </section>
  )
}
