'use client'

import React, { useState, lazy, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { HeroSection } from '@/components/marketing/hero-section'
import { AuthModal } from '@/components/auth/auth-modal'
import { ArrowRight, Menu, X, ArrowUpRight, User } from 'lucide-react'

// Lazy load heavy sections for better initial load
const PricingSection = lazy(() => import('@/components/marketing/pricing-section').then(m => ({ default: m.PricingSection })))
const ContactSection = lazy(() => import('@/components/marketing/contact-section').then(m => ({ default: m.ContactSection })))
const FooterSection = lazy(() => import('@/components/marketing/footer-section').then(m => ({ default: m.FooterSection })))
const FunctiesSection = lazy(() => import('@/components/marketing/functies-section').then(m => ({ default: m.FunctiesSection })))

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')

  // Removed mockup height calculation for better performance

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Content - Above background */}
      <div className="relative z-10">
        {/* Header */}
        <header
          className={`sticky top-0 z-50 w-full transition-colors duration-200 relative ${
            mobileMenuOpen ? 'bg-[#002A1F] border-b border-white/10' : 'bg-transparent'
          }`}
        >
          <div className="container mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
            {/* Mobile: Hamburger Menu (Left) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10 hover:text-white flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Mobile: Logo (Center) - Desktop: Logo (Left) */}
            <div className="flex-1 flex justify-center md:justify-start md:flex-none">
              <Logo width={100} height={28} variant="white" />
            </div>

            {/* Desktop Navigation */}
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

            {/* Desktop: Auth Buttons */}
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

            {/* Mobile: Account Icon (Right) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10 hover:text-white flex-shrink-0"
              onClick={() => {
                setAuthModalMode('login')
                setAuthModalOpen(true)
              }}
              aria-label="Account"
            >
              <User className="h-6 w-6" />
            </Button>
          </div>

          {/* Mobile Sidebar - Slides from left like dashboard */}
          <>
            {/* Overlay */}
            <div
              className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
                mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar */}
            <div
              className={`fixed inset-y-0 start-0 z-[60] bg-[#002A1F] border-r border-white/10 transition-all duration-300 transform md:hidden w-64 h-full ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
                <div className="flex flex-col h-full">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <Logo width={100} height={28} variant="white" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Sidebar Navigation */}
                  <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <Link
                      href="#features"
                      className="block py-3 px-4 text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C] hover:bg-white/5 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Functies
                    </Link>
                    <Link
                      href="#pricing"
                      className="block py-3 px-4 text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C] hover:bg-white/5 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Prijzen
                    </Link>
                    <Link
                      href="#contact"
                      className="block py-3 px-4 text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C] hover:bg-white/5 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>

                    <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
                        onClick={() => {
                          setAuthModalMode('login')
                          setAuthModalOpen(true)
                          setMobileMenuOpen(false)
                        }}
                      >
                        Inloggen
                      </Button>
                      <Button
                        className="w-full justify-start bg-transparent text-white hover:bg-white/10 border border-white rounded-xl"
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
              </div>
          </>
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
              <Image
                src="/images/mobile mockup.png"
                alt="Domio op mobiel"
                width={400}
                height={800}
                className="h-auto w-full max-w-[85%] object-contain drop-shadow-2xl md:hidden mx-auto"
                priority={false}
                loading="lazy"
                quality={85}
              />
              {/* Desktop Mockup */}
              <Image
                src="/images/Desktopmockup.png"
                alt="Domio op desktop"
                width={1000}
                height={600}
                className="hidden md:block h-auto w-full max-w-[560px] object-contain drop-shadow-2xl lg:max-w-none lg:w-[700px] xl:w-[850px] 2xl:w-[1000px] mx-auto"
                priority={false}
                loading="lazy"
                quality={85}
              />
            </div>
          </div>
        </div>

        {/* Functies Section */}
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <FunctiesSection />
        </Suspense>

        {/* Pricing Section */}
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <PricingSection 
            onSignupClick={() => {
              setAuthModalMode('signup')
              setAuthModalOpen(true)
            }}
          />
        </Suspense>

        {/* Contact Section */}
        <Suspense fallback={<div className="min-h-[300px]" />}>
          <ContactSection />
        </Suspense>

        {/* Footer */}
        <Suspense fallback={<div className="min-h-[200px]" />}>
          <FooterSection />
        </Suspense>
      </div>

      {/* Auth Modal - Direct loaded for instant response */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultMode={authModalMode}
      />
    </div>
  )
}
