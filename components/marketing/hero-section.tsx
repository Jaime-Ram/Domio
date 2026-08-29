'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Pause, Play } from 'lucide-react'

const PARTNER_LOGOS = [1, 2, 3, 4, 5]

const SLIDES = [
  '/images/Achtergrond1.jpg',
  '/images/Achtergrond2.jpg',
  '/images/Achtergrond3.jpg',
  '/images/Achtergrond4.jpg',
  '/images/Achtergrond5.jpg',
  '/images/achtergrond6.jpg',
  '/images/Achtergrond7.jpg',
  '/images/Achtergrond8.jpg',
  '/images/Achtergrond9.jpg',
  '/images/Achtergrond10.jpg',
  '/images/Achtergrond11.jpg',
  '/images/Achtergrond12.jpg',
  '/images/Achtergrond13.jpg',
  '/images/Achtergrond14.jpg',
  '/images/AchtergrondX.jpg',
  '/images/AchtergrondY.jpg',
]

const INTERVAL = 5000

interface HeroSectionProps {
  onSignupClick?: () => void
}

export function HeroSection({ onSignupClick }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [playing, setPlaying] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = () => {
    setCurrent((c) => {
      setPrev(c)
      return (c + 1) % SLIDES.length
    })
  }

  useEffect(() => {
    if (!playing) return
    timerRef.current = setInterval(advance, INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing])

  const togglePlay = () => {
    if (playing && timerRef.current) clearInterval(timerRef.current)
    setPlaying((p) => !p)
  }

  return (
    <section className="relative w-full min-h-[72vh] flex flex-col overflow-hidden bg-black">

      {/* Slideshow */}
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 2 : i === prev ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            priority={i === 0}
            quality={85}
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55 z-10" />

      {/* Vignette onderaan */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col flex-1 w-full max-w-7xl mx-auto px-5 md:px-6">

        <div className="flex flex-col flex-1 justify-center pt-24 pb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-5xl sm:text-6xl md:text-7xl font-light text-white leading-[1.05] tracking-tight max-w-3xl"
          >
            Een nieuwe standaard<br />
            voor <span className="font-semibold text-[#c8e957]">vastgoedbeheer.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="mt-10 flex items-center gap-4"
          >
            <button
              type="button"
              onClick={onSignupClick}
              className="rounded-full bg-white text-[#1d3014] px-8 py-3.5 text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              Start direct
            </button>
            <button
              type="button"
              className="rounded-full bg-transparent border border-white text-white px-8 py-3.5 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Ontdek meer
            </button>
          </motion.div>
        </div>

        {/* Partners — tijdelijk verborgen (placeholder-logo's) tot we echte partners hebben */}
        <div className="pb-12" />

      </div>

      {/* Play / pause */}
      <button
        type="button"
        onClick={togglePlay}
        className="absolute bottom-5 right-5 z-30 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label={playing ? 'Slideshow pauzeren' : 'Slideshow afspelen'}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

    </section>
  )
}
