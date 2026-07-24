'use client'

import { useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

/**
 * De hero-achtergrondvideo als losse banner onder de tekst-hero. Afgerond,
 * uitgelijnd op dezelfde marge als de content (max-w-7xl), met play/pause.
 */
export function AgenticHeroVideo() {
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
    <section className="pb-4">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="relative h-[68vh] min-h-[440px] w-full overflow-hidden rounded-lg bg-gray-900">
          <video
            ref={videoRef}
            src="/videos/hero-bg.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={toggle}
            className="absolute bottom-5 right-5 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label={playing ? 'Video pauzeren' : 'Video afspelen'}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </section>
  )
}
