'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Pause, Play } from 'lucide-react'

interface HeroSectionProps {
  onSignupClick?: () => void
}


export function HeroSection({ onSignupClick }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {})
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (playing) { v.pause(); setPlaying(false) }
    else { v.play().catch(() => {}); setPlaying(true) }
  }

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

      {/* ── Eén container voor alles — zelfde marge links ─────────────── */}
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 md:px-5">

        {/* Titel + knop — verticaal gecentreerd */}
        <div className="flex flex-col flex-1 justify-center pt-24 pb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-5xl sm:text-6xl md:text-7xl font-light text-white leading-[1.05] tracking-tight max-w-3xl"
          >
            Eén platform voor<br />
            <span className="font-semibold text-[#9FE870]">heel</span> je vastgoed.
          </motion.h1>

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
        </div>

        {/* Trusted by — onderkant, zelfde linkermarge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center gap-8 flex-wrap pb-6"
        >
          <span className="text-white text-sm font-normal shrink-0">Trusted by:</span>
          {['Vesteda', 'Bouwinvest', 'Amvest', 'Heimstaden', 'NSI', 'CBRE'].map((name) => (
            <span key={name} className="text-white text-sm font-semibold tracking-wide">
              {name}
            </span>
          ))}
        </motion.div>

      </div>

      {/* ── Play / pause knop rechtsonder ─────────────────────────────── */}
      <button
        type="button"
        onClick={togglePlay}
        className="absolute bottom-5 right-5 z-20 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label={playing ? 'Video pauzeren' : 'Video afspelen'}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

    </section>
  )
}
