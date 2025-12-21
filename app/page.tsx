'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { PricingSection } from '@/components/marketing/pricing-section'
import { HeroSection } from '@/components/marketing/hero-section'
import { ContactSection } from '@/components/marketing/contact-section'
import { FooterSection } from '@/components/marketing/footer-section'
import { CookieBanner } from '@/components/marketing/cookie-banner'
import { FunctiesSection } from '@/components/marketing/functies-section'
import { AuthModal } from '@/components/auth/auth-modal'
import { ArrowRight, Menu, X, ArrowUpRight } from 'lucide-react'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')
  const [mockupHeight, setMockupHeight] = useState<number>(0)
  const mockupRef = useRef<HTMLImageElement>(null)

  // Calculate mockup height and set white section height to 70% of mockup
  useEffect(() => {
    const updateMockupHeight = () => {
      if (mockupRef.current) {
        const height = mockupRef.current.offsetHeight
        setMockupHeight(height)
      }
    }

    // Initial calculation
    updateMockupHeight()

    // Recalculate on resize
    window.addEventListener('resize', updateMockupHeight)
    
    // Also check after images load
    const images = document.querySelectorAll('img[src*="mockup"]')
    images.forEach(img => {
      img.addEventListener('load', updateMockupHeight)
    })

    return () => {
      window.removeEventListener('resize', updateMockupHeight)
      images.forEach(img => {
        img.removeEventListener('load', updateMockupHeight)
      })
    }
  }, [])

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Content - Above background */}
      <div className="relative z-10">
        {/* Header */}
        <header
          className={`sticky top-0 z-50 w-full transition-colors relative ${
            mobileMenuOpen ? 'bg-[#002A1F] border-b border-white/10' : 'bg-transparent'
          }`}
        >
          <div className="container mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-8">
            <div className="py-2 flex-1">
              <Logo width={100} height={28} variant="white" />
            </div>
            <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
              <Link href="#features" className="text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C]">
                Functies
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C]">
                Prijzen
              </Link>
              <Link href="#contact" className="text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C]">
                Contact
              </Link>
            </nav>
            <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setAuthModalMode('login')
                  setAuthModalOpen(true)
                }}
              >
                Inloggen
              </Button>
              <Button
                className="bg-transparent text-white hover:bg-white/10 border border-white rounded-xl"
                onClick={() => {
                  setAuthModalMode('signup')
                  setAuthModalOpen(true)
                }}
              >
                Aan de slag
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden absolute top-full left-0 right-0 border-t border-white/10 bg-[#002A1F] transition-all duration-300 ease-in-out overflow-hidden shadow-lg ${
              mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
            }`}
          >
            <nav className="container mx-auto flex flex-col px-4 py-4 space-y-3">
              <Link
                href="#features"
                className="py-2 px-4 text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Functies
              </Link>
              <Link
                href="#pricing"
                className="py-2 px-4 text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prijzen
              </Link>
              <Link
                href="#contact"
                className="py-2 px-4 text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Button 
                  variant="ghost" 
                  className="justify-start w-full px-4 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setAuthModalMode('login')
                    setAuthModalOpen(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  Inloggen
                </Button>
                <Button
                  className="justify-start w-full px-4 bg-transparent text-white hover:bg-white/10 border border-white rounded-xl"
                  onClick={() => {
                    setAuthModalMode('signup')
                    setAuthModalOpen(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  Aan de slag
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <HeroSection 
          onSignupClick={() => {
            setAuthModalMode('signup')
            setAuthModalOpen(true)
          }}
        />

        {/* Floating Mockup */}
        <div className="relative w-full pointer-events-none z-40" style={{ marginTop: '-30vh' }}>
          <div className="container relative mx-auto w-full max-w-7xl px-6 md:px-8">
            <div className="relative w-full flex justify-center">
              {/* Mobile Mockup */}
              <img
                ref={mockupRef}
                src="/images/mobile mockup.png"
                alt="Domio op mobiel"
                className="h-auto w-full max-w-[85%] object-contain drop-shadow-2xl md:hidden mx-auto"
              />
              {/* Desktop Mockup */}
              <img
                ref={mockupRef}
                src="/images/Desktopmockup.png"
                alt="Domio op desktop"
                className="hidden md:block h-auto w-full max-w-[560px] object-contain drop-shadow-2xl lg:max-w-none lg:w-[700px] xl:w-[850px] 2xl:w-[1000px] mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Functies Section */}
        <FunctiesSection />

        {/* Pricing Section */}
        <PricingSection 
          onSignupClick={() => {
            setAuthModalMode('signup')
            setAuthModalOpen(true)
          }}
        />

        {/* Contact Section */}
        <ContactSection />

        {/* CTA Section */}
        <section className="relative z-20 pt-24 pb-12">
          <div className="absolute inset-x-0 top-1/2 bottom-0 bg-white dark:bg-gray-900" />
          <div className="container mx-auto w-full max-w-7xl px-6 md:px-8 relative z-10">
            <div className="rounded-3xl bg-[#002A1F] p-8 md:p-12 lg:p-16 relative z-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-6 lg:max-w-2xl">
                  <h2 className="text-base font-semibold leading-7 text-white/90">Proefperiode</h2>
                  <h2 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
                    Eerst zien, dan geloven?
                  </h2>
                  <p className="text-lg text-white/90">
                    Probeer Domio 30 dagen volledig gratis. Geen creditcard nodig, nergens aan vast en op elk moment opzegbaar.
                  </p>
                  <div className="flex flex-row items-center gap-3 justify-start">
                    <Button
                      size="default"
                      className="w-fit bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 border-[#9AFF7C] rounded-xl"
                      onClick={() => {
                        setAuthModalMode('signup')
                        setAuthModalOpen(true)
                      }}
                    >
                      Start 30 dagen gratis
                    </Button>
                    <Button
                      asChild
                      className="bg-transparent text-white hover:bg-white/10 border border-white rounded-xl"
                    >
                      <Link href="/dashboard/employer" className="flex items-center gap-2">
                        <span className="md:hidden">Demo</span>
                        <span className="hidden md:inline">Bekijk demo</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <FooterSection />
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultMode={authModalMode}
      />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  )
}
