'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'

interface HeroSectionProps {
  onSignupClick?: () => void
}


export function HeroSection({ onSignupClick }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {})
  }, [])

  return (
    <section className="relative w-full min-h-[72vh] flex flex-col overflow-hidden bg-black">

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
      <div className="relative z-10 flex flex-col flex-1 justify-center px-4 pt-24 pb-10 md:px-8 max-w-7xl mx-auto w-full">

        {/* Headline — dun, authentiek */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-5xl sm:text-6xl md:text-7xl font-light text-white leading-[1.05] tracking-tight max-w-3xl"
        >
          Eén platform voor<br />
          <span className="font-semibold text-[#9FE870]">heel</span> je vastgoed.
        </motion.h1>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="mt-10"
        >
          <button
            type="button"
            onClick={onSignupClick}
            className="rounded-full bg-white text-[#163300] px-8 py-3.5 text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
          >
            Start direct
          </button>
        </motion.div>

        {/* Trusted by */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-10"
        >
          <p className="text-[11px] uppercase tracking-widest text-white/30 font-medium mb-4">
            Trusted by
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {['Vesteda', 'Bouwinvest', 'Amvest', 'Heimstaden', 'NSI', 'CBRE'].map((name) => (
              <span
                key={name}
                className="text-white/40 text-sm font-semibold tracking-wide"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

    </section>
  )
}
