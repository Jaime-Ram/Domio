'use client'

import { useEffect, useRef, useState } from 'react'

const DOMIO_FADE_MS = 280
const PHASE_1_END = 600
const FADE_START = 400
const MOVE_DURATION_MS = 2000
const PHASE_2_END = PHASE_1_END + MOVE_DURATION_MS + 300
const TOTAL_DURATION = PHASE_2_END + 500
const FADE_DURATION = 2000
const FADE_REVEAL_END = 120
const FADE_ZONE = 28
const FADEOUT_DURATION_MS = 350

/**
 * Wise-principe: langzaam start → steeds sneller → piek → enorme vertraging aan het eind.
 * Ease-in-out expo: zeer traag begin en eind, snelle midden (niet lineair).
 */
function easeInOutExpo(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return t < 0.5
    ? 0.5 * Math.pow(2, 28 * t - 14)
    : 1 - 0.5 * Math.pow(2, -28 * t + 14)
}

/** CSS: sterke deceleratie aan het eind (Wise “enorme vertraging”) */
const EASE_CURVE = 'cubic-bezier(0.4, 0, 0.08, 1)'

interface AuthLoadingScreenProps {
  onAnimationComplete?: () => void
}

export function AuthLoadingScreen({ onAnimationComplete }: AuthLoadingScreenProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0)
  const [fadeStarted, setFadeStarted] = useState(false)
  const [fadeProgress, setFadeProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const completedRef = useRef(false)

  useEffect(() => {
    const t0 = setTimeout(() => setPhase(1), DOMIO_FADE_MS)
    const tFade = setTimeout(() => setFadeStarted(true), FADE_START)
    const t2 = setTimeout(() => setPhase(2), PHASE_1_END)
    const t3 = setTimeout(() => setPhase(3), PHASE_2_END)
    return () => {
      clearTimeout(t0)
      clearTimeout(tFade)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  useEffect(() => {
    if (!fadeStarted) return
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const linear = Math.min(elapsed / FADE_DURATION, 1)
      const p = easeInOutExpo(linear)
      setFadeProgress(p)
      if (linear < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [fadeStarted])

  const revealPctValue = fadeStarted ? fadeProgress * FADE_REVEAL_END : 0

  useEffect(() => {
    if (phase !== 3 || completedRef.current) return
    const t = setTimeout(() => setFadeOut(true), TOTAL_DURATION - PHASE_2_END)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (!fadeOut || !onAnimationComplete || completedRef.current) return
    const t = setTimeout(() => {
      completedRef.current = true
      onAnimationComplete()
    }, FADEOUT_DURATION_MS)
    return () => clearTimeout(t)
  }, [fadeOut, onAnimationComplete])

  return (
    <div
      className="fixed inset-0 z-[9999] min-h-screen flex items-center justify-center bg-[#9FE870] px-4 sm:px-6 overflow-hidden"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: `opacity ${FADEOUT_DURATION_MS}ms ${EASE_CURVE}`,
      }}
    >
      <div className="flex items-center justify-center w-full min-w-0 max-w-full overflow-hidden">
        <LogoReveal
          phase={phase}
          revealPctValue={revealPctValue}
          fadeZone={FADE_ZONE}
          moveDurationMs={MOVE_DURATION_MS}
        />
      </div>
    </div>
  )
}

interface LogoRevealProps {
  phase: 0 | 1 | 2 | 3
  revealPctValue: number
  fadeZone: number
  moveDurationMs: number
}

function LogoReveal({ phase, revealPctValue, fadeZone, moveDurationMs }: LogoRevealProps) {
  const subtitleCollapsed = phase <= 1
  const scaleTransition =
    phase <= 1 ? `transform ${DOMIO_FADE_MS}ms ${EASE_CURVE}` : `transform ${moveDurationMs}ms ${EASE_CURVE}`
  const transitionWidth = `max-width ${moveDurationMs}ms ${EASE_CURVE}`
  const scale =
    phase === 0 ? 'scale(0.97)' : phase === 1 ? 'scale(1.18)' : 'scale(1)'
  return (
    <div
      className="flex items-baseline min-w-0 max-w-full text-[#163300] text-2xl sm:text-4xl md:text-5xl tracking-tight pb-[0.15em]"
      style={{
        fontFamily: 'var(--font-body)',
        transform: scale,
        transformOrigin: 'left center',
        transition: scaleTransition,
      }}
    >
      <span
        className="font-bold shrink-0"
        style={{
          fontFamily: "'Codec Pro', sans-serif",
          opacity: phase === 0 ? 0 : 1,
          transition: `opacity ${DOMIO_FADE_MS}ms ${EASE_CURVE}`,
        }}
      >
        Domio
      </span>
      <span
        className="pl-1.5 sm:pl-3 font-normal min-w-0 pb-[0.2em]"
        style={{
          maxWidth: subtitleCollapsed ? 0 : 'min(28rem, calc(100vw - 7rem))',
          overflowX: 'hidden',
          overflowY: 'visible',
          transition: transitionWidth,
          ...(revealPctValue >= 100
            ? { maskImage: 'linear-gradient(90deg, black 0%, black 100%)', WebkitMaskImage: 'linear-gradient(90deg, black 0%, black 100%)' }
            : {
                maskImage: `linear-gradient(90deg, black 0%, black ${Math.max(0, revealPctValue - fadeZone)}%, transparent ${revealPctValue}%)`,
                WebkitMaskImage: `linear-gradient(90deg, black 0%, black ${Math.max(0, revealPctValue - fadeZone)}%, transparent ${revealPctValue}%)`,
              }),
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }}
      >
        Vastgoedsoftware
      </span>
    </div>
  )
}
