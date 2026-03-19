'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDown, Euro, Percent, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const SLIDESHOW_IMAGES = [
  { src: '/images/Achtergrond5.jpg', alt: 'Vastgoed en huurbeheer' },
  { src: '/images/Achtergrond11.jpg', alt: 'Domio vastgoed' },
  { src: '/images/Achtergrond5.jpg', alt: 'Portefeuille' },
  { src: '/images/Achtergrond11.jpg', alt: 'Contractbeheer' },
].map((img, i) => ({ ...img, id: `slide-${i}` }))

const PILL_ITEMS = [
  { icon: ArrowDown, label: 'Huur', value: '+1.450,00 EUR' },
  { icon: Euro, label: 'Servicekosten', value: '+2.180,50 EUR' },
  { icon: Percent, label: 'Indexatie', value: '+3,2%' },
  { icon: FileText, label: 'Contracten', value: '12 actief' },
]

const HEADLINE_WORDS = [
  'Huurinkomsten',
  'Puntentelling',
  'Indexatie',
  'Servicekosten',
  'Contractbeheer',
  'Huurdersbeheer',
  'Onderhoud',
  'Financieën',
]

interface HeroSectionProps {
  onSignupClick?: () => void
}

export function HeroSection({ onSignupClick }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const [managedTenants, setManagedTenants] = useState(10000)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SLIDESHOW_IMAGES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((i) => (i + 1) % HEADLINE_WORDS.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const scheduleNext = () => {
      // Willekeurige momenten tussen ~3 en ~12 seconden.
      const nextInMs = 3000 + Math.floor(Math.random() * 9000)
      timeoutId = setTimeout(() => {
        // Kleine willekeurige groei per stap.
        const increment = 1 + Math.floor(Math.random() * 9)
        setManagedTenants((current) => current + increment)
        scheduleNext()
      }, nextInMs)
    }

    scheduleNext()
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-white flex items-center min-h-[calc(88vh-4rem)] pt-16 pb-10 md:pt-20 md:pb-12">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12">
        {/* Carousel – eerst in DOM = boven op mobiel; lg:order-2 = rechts op desktop */}
        <div className="flex justify-center lg:justify-end items-center w-full lg:w-auto lg:flex-shrink-0 order-1 lg:order-2">
          <div className="relative w-full aspect-[3/2] lg:w-[500px] lg:h-[560px] lg:aspect-auto overflow-hidden rounded-[1.75rem] shadow-xl lg:-translate-x-4 lg:-translate-y-2">
            {SLIDESHOW_IMAGES.map((img, i) => (
              <div
                key={img.id}
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
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-full bg-white/95 backdrop-blur-sm pl-2 pr-4 py-2 shadow-xl border border-gray-100 z-20">
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#9FE870] overflow-hidden">
                  <AnimatePresence mode="wait">
                    {(() => {
                      const item = PILL_ITEMS[activeIndex]
                      if (!item) return null
                      const Icon = item.icon
                      return (
                        <motion.div
                          key={activeIndex}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.35, ease: 'easeOut', delay: 0 }}
                          className="flex items-center justify-center absolute inset-0"
                        >
                          <Icon className="h-5 w-5 text-[#163300]" strokeWidth={2.5} />
                        </motion.div>
                      )
                    })()}
                  </AnimatePresence>
                </div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeIndex}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.35, ease: 'easeOut', delay: 0.06 }}
                    className="text-base font-bold text-gray-900 truncate flex-1 min-w-0"
                  >
                    {PILL_ITEMS[activeIndex]?.label}
                  </motion.span>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeIndex}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35, ease: 'easeOut', delay: 0.12 }}
                  className="text-base font-bold text-[#163300] whitespace-nowrap shrink-0"
                >
                  {PILL_ITEMS[activeIndex].value}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Titel – tweede op mobiel (onder carousel); lg:order-1 = links op desktop */}
        <div className="flex-shrink-0 max-w-2xl order-2 lg:order-1">
          <div className="mb-6 md:mb-8">
            <h1 className="md:hidden flex flex-col text-[2.5rem] font-bold tracking-tight text-[#163300] leading-none text-left">
              <span className="block h-[1em] min-h-[1em] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={headlineIndex}
                    initial={{ opacity: 0, y: '0.5em' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '-0.5em' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="block"
                  >
                    {HEADLINE_WORDS[headlineIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="block -mt-1">op één plek</span>
            </h1>
            <h1 className="hidden md:flex md:flex-col text-[2.75rem] font-bold tracking-tight text-balance text-[#163300] sm:text-6xl md:text-7xl leading-none text-left">
              <span className="block h-[1em] min-h-[1em] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={headlineIndex}
                    initial={{ opacity: 0, y: '0.5em' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '-0.5em' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="block"
                  >
                    {HEADLINE_WORDS[headlineIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="block -mt-1">op één plek</span>
            </h1>
            <p className="mt-2 text-base font-medium text-pretty text-gray-600 sm:text-lg leading-8 max-w-xl text-left">
              Alles wat je nodig hebt voor vastgoedbeheer, en nog veel meer. Domio brengt je portefeuille tot leven.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 justify-start">
            <Button
              onClick={onSignupClick}
              className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 border-0 px-8 py-6 text-base font-semibold shadow-sm"
            >
              Aan de slag
            </Button>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 text-base font-semibold text-[#163300] underline underline-offset-4 hover:text-[#163300]/80 transition-colors"
            >
              Bekijk demo
              <ArrowUpRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=96&h=96&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face',
              ].map((src, i) => (
                <div
                  key={i}
                  className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm ring-2 ring-white"
                >
                  <Image
                    src={src}
                    alt=""
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-600">
              Momenteel worden{' '}
              <span className="inline-flex min-w-[5.5ch] justify-end tabular-nums text-[#163300] font-semibold">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={managedTenants}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className="inline-block"
                  >
                    {managedTenants.toLocaleString('nl-NL')}
                  </motion.span>
                </AnimatePresence>
              </span>{' '}
              huurders beheerd via Domio
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
