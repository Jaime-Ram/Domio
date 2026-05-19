'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'

interface HeroSectionProps {
  onSignupClick?: () => void
}

const TRUSTED_LOGOS = [
  { name: 'Vesteda', src: null },
  { name: 'Bouwinvest', src: null },
  { name: 'Amvest', src: null },
  { name: 'Syntrus Achmea', src: null },
  { name: 'NSI', src: null },
]

export function HeroSection({ onSignupClick }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {})
  }, [])

  return (
    <section className="relative w-full min-h-[100svh] flex flex-col overflow-hidden bg-black">

      {/* ── Achtergrond video ─────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src="/videos/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        onCanPlayThrough={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Fallback achtergrond terwijl video laadt */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
        <Image
          src="/images/Achtergrond5.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          quality={85}
        />
      </div>

      {/* Overlay — donker maar niet te zwaar */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Subtiele vignette onderaan voor soepele overgang */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col flex-1 justify-center px-6 pt-28 pb-0 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white/80 mb-8 tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9FE870] animate-pulse" />
            Vastgoedbeheer voor elk portfolio
          </span>
        </motion.div>

        {/* Headline — dun, groot, authentiek */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl font-light text-white leading-[1.0] tracking-tight max-w-4xl"
        >
          Eén platform voor{' '}
          <span className="font-semibold text-[#9FE870]">heel</span>{' '}
          <br className="hidden sm:block" />
          je vastgoed.
        </motion.h1>

        {/* Subtitel */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.22 }}
          className="mt-6 text-base sm:text-lg text-white/60 font-light max-w-xl leading-relaxed"
        >
          Van één woning tot duizenden eenheden. Domio beheert huurders,
          contracten, financiën en onderhoud — zonder gedoe.
        </motion.p>

        {/* CTA's */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row items-start gap-4"
        >
          <button
            type="button"
            onClick={onSignupClick}
            className="rounded-full bg-[#9FE870] text-[#163300] px-8 py-3.5 text-sm font-semibold hover:bg-[#8AD45F] transition-colors shadow-lg"
          >
            Gratis aan de slag
          </button>
          <Link
            href="/demo"
            className="rounded-full border border-white/30 text-white px-8 py-3.5 text-sm font-medium hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            Bekijk demo →
          </Link>
        </motion.div>

        {/* Sociale proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-xs text-white/40 font-light"
        >
          30 dagen gratis · Geen creditcard · Maandelijks opzegbaar
        </motion.p>
      </div>

      {/* ── Vertrouwd door strip ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-10 pt-14"
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-white/35 uppercase tracking-widest font-medium mb-6">
            Vertrouwd door verhuurders en beheerders in heel Nederland
          </p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            {TRUSTED_LOGOS.map((logo) => (
              <div
                key={logo.name}
                className="text-white/25 text-sm font-medium tracking-wide hover:text-white/50 transition-colors"
              >
                {logo.name}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </section>
  )
}
