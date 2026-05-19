'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const SLIDESHOW_IMAGES = [
  { src: '/images/Achtergrond5.jpg', alt: 'Vastgoed en huurbeheer' },
  { src: '/images/Achtergrond11.jpg', alt: 'Domio vastgoed' },
  { src: '/images/Achtergrond5.jpg', alt: 'Portefeuille' },
]

const HUUR_BEDRAGEN = ['+1.450,00 EUR', '+2.180,50 EUR', '+1.890,00 EUR']

interface HuurSectionProps {
  onSignupClick?: () => void
}

export function HuurSection({ onSignupClick }: HuurSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SLIDESHOW_IMAGES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative z-20 bg-white py-20 sm:py-24 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 lg:items-center">
          {/* Left: Slideshow met alle hoeken rond */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative aspect-[4/5] lg:aspect-[3/4] max-h-[500px] lg:max-h-[560px] rounded-[1.75rem] overflow-hidden shadow-xl">
              {SLIDESHOW_IMAGES.map((img, i) => (
                <div
                  key={img.src}
                  className={cn(
                    'absolute inset-0 transition-opacity duration-700 ease-in-out',
                    i === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  )}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    priority={i === 0}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    quality={85}
                  />
                </div>
              ))}
              {/* Slide-indicatoren */}
              <div className="absolute top-4 left-4 flex gap-2 z-20">
                {SLIDESHOW_IMAGES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      'h-2 w-2 rounded-full transition-all duration-300',
                      i === activeIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                    )}
                    aria-label={`Ga naar afbeelding ${i + 1}`}
                  />
                ))}
              </div>
              {/* Overlay: transactiekaart – pill-vorm, zoals referentie */}
              <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:min-w-[280px] flex items-center justify-between gap-4 rounded-full bg-white/95 backdrop-blur-sm px-5 py-4 shadow-xl border border-gray-100 z-20">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#9FE870]">
                    <ArrowDown className="h-5 w-5 text-[#163300]" strokeWidth={2.5} />
                  </div>
                  <span className="text-base font-bold text-gray-900">Huur</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="text-base font-bold text-[#163300] whitespace-nowrap shrink-0"
                  >
                    {HUUR_BEDRAGEN[activeIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right: Tekst en call-to-action */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#163300] sm:text-5xl md:text-6xl">
              Huurinkomsten op één plek
            </h2>
            <p className="mt-5 text-lg text-gray-600 leading-7 max-w-2xl">
              Ontvang en volg huurbetalingen eenvoudig. Domio houdt alle huurcontracten, indexaties en servicekosten
              overzichtelijk bij. Alles wat je nodig hebt voor je portefeuille, waar je het ook nodig hebt.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                onClick={onSignupClick}
                className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 border-0 px-8 py-6 text-base font-semibold shadow-sm"
              >
                Aan de slag
              </Button>
              <Link
                href="/#features"
                className="inline-flex items-center gap-1.5 text-base font-semibold text-[#163300] underline underline-offset-4 hover:text-[#163300]/80 transition-colors"
              >
                Ontdek huurbeheer
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
