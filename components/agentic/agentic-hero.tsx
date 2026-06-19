'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Pause, Play } from 'lucide-react'

/**
 * Hero voor Domio Agentic: groot blok met achtergrondvideo, titel + CTA's
 * linksonder en een play/pause-knop rechtsonder (zelfde stijl als de hoofd-hero).
 */
export function AgenticHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <section className="px-2.5 pt-16 sm:px-3 lg:px-4">
      <div className="relative mx-auto h-[86vh] min-h-[560px] w-full max-w-[1500px] overflow-hidden rounded-lg bg-gray-900 shadow-xl">
        <video
          ref={videoRef}
          src="/videos/hero-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Verloop voor leesbaarheid linksonder */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        {/* Titel + CTA's linksonder */}
        <div className="absolute bottom-0 left-0 max-w-2xl p-8 sm:p-10 lg:p-14">
          <h1 className="text-[2.6rem] font-[550] leading-[1.05] tracking-tight text-white sm:text-[3.4rem] md:text-[4.1rem]">
            Onderhoud dat<br />
            zichzelf regelt.
          </h1>
          <p className="mt-5 text-lg font-medium text-white/80">Wij brengen agentic AI naar de vastgoedwereld.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/registreren"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#163300] shadow-sm transition-colors hover:bg-white/90"
            >
              Start direct
            </Link>
            <Link
              href="#hoe-het-werkt"
              className="rounded-xl border border-white/70 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Hoe het werkt
            </Link>
          </div>
        </div>

        {/* Play / pause rechtsonder */}
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-5 right-5 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label={playing ? 'Video pauzeren' : 'Video afspelen'}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>
    </section>
  )
}
