'use client'

import React, { useState, lazy, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { HeroSection } from '@/components/marketing/hero-section'
import { AuthModal } from '@/components/auth/auth-modal'
import { ArrowRight, Menu, X, ArrowUpRight, User, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AppStoreButton, GooglePlayButton } from '@/components/base/buttons/app-store-buttons'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'

// Lazy load heavy sections for better initial load
const PricingSection = lazy(() => import('@/components/marketing/pricing-section').then(m => ({ default: m.PricingSection })))
const ContactSection = lazy(() => import('@/components/marketing/contact-section').then(m => ({ default: m.ContactSection })))
const FooterSection = lazy(() => import('@/components/marketing/footer-section').then(m => ({ default: m.FooterSection })))
const FunctiesSection = lazy(() => import('@/components/marketing/functies-section').then(m => ({ default: m.FunctiesSection })))

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')
  const [functionsMenuOpen, setFunctionsMenuOpen] = useState(false)

  // Removed mockup height calculation for better performance

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Content - Above background */}
      <div className="relative z-10">
      {/* Header */}
      <header
          className="sticky top-0 z-50 w-full transition-colors duration-200 relative bg-transparent"
      >
          <div className="container mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-8">
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
            <div className="flex-1 flex justify-center md:justify-start md:flex-none md:flex-shrink-0">
            <Logo width={100} height={28} variant="white" />
          </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center gap-6 flex-1 justify-center absolute left-1/2 -translate-x-1/2">
            <div 
              className="relative"
              onMouseEnter={() => setFunctionsMenuOpen(true)}
              onMouseLeave={() => setFunctionsMenuOpen(false)}
            >
              <DropdownMenu open={functionsMenuOpen} onOpenChange={setFunctionsMenuOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C] flex items-center gap-1 group py-2">
              Functies
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${functionsMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </DropdownMenuTrigger>
              {/* Invisible bridge to prevent gap hover issue */}
              {functionsMenuOpen && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 w-full h-2 bg-transparent"
                  onMouseEnter={() => setFunctionsMenuOpen(true)}
                />
              )}
              <DropdownMenuContent 
                align="center" 
                sideOffset={0}
                className="w-[650px] p-6 bg-white shadow-2xl rounded-3xl border border-gray-100"
                onMouseEnter={() => setFunctionsMenuOpen(true)}
                onMouseLeave={() => setFunctionsMenuOpen(false)}
              >
                <div className="grid grid-cols-3 gap-6">
                  {/* Column 1 */}
                  <div className="space-y-1">
                    <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-0 mb-4">Kernfunctionaliteiten</DropdownMenuLabel>
                    <div className="space-y-1">
                      <div className="py-2.5 px-3 rounded-xl hover:bg-[#f4f4f4] transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-[#002A1F] group-hover:text-[#002A1F]">Object- en Portfoliobeheer</p>
                      </div>
                      <div className="py-2.5 px-3 rounded-xl hover:bg-[#f4f4f4] transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-[#002A1F] group-hover:text-[#002A1F]">Huurdersbeheer</p>
                      </div>
                      <div className="py-2.5 px-3 rounded-xl hover:bg-[#f4f4f4] transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-[#002A1F] group-hover:text-[#002A1F]">Contractbeheer</p>
                      </div>
                      <div className="py-2.5 px-3 rounded-xl hover:bg-[#f4f4f4] transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-[#002A1F] group-hover:text-[#002A1F]">Automatische Huurindexatie</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Column 2 */}
                  <div className="space-y-1">
                    <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-0 mb-4">Financieel</DropdownMenuLabel>
                    <div className="space-y-1">
                      <div className="py-2.5 px-3 rounded-xl hover:bg-[#f4f4f4] transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-[#002A1F] group-hover:text-[#002A1F]">Facturatie & Betalingsverwerking</p>
                      </div>
                      <div className="py-2.5 px-3 rounded-xl hover:bg-[#f4f4f4] transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-[#002A1F] group-hover:text-[#002A1F]">Servicekostenafrekening</p>
                      </div>
                      <div className="py-2.5 px-3 rounded-xl hover:bg-[#f4f4f4] transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-[#002A1F] group-hover:text-[#002A1F]">Rapportages & Financieel Beheer</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Column 3 */}
                  <div className="space-y-1">
                    <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-0 mb-4">Onderhoud & Inspectie</DropdownMenuLabel>
                    <div className="space-y-1">
                      <div className="py-2.5 px-3 rounded-xl hover:bg-[#f4f4f4] transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-[#002A1F] group-hover:text-[#002A1F]">Ticketsysteem voor Onderhoud</p>
                      </div>
                      <div className="py-2.5 px-3 rounded-xl hover:bg-[#f4f4f4] transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-[#002A1F] group-hover:text-[#002A1F]">Inspectiemodule</p>
                      </div>
                      <div className="py-2.5 px-3 rounded-xl hover:bg-[#f4f4f4] transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-[#002A1F] group-hover:text-[#002A1F]">Scan & Herken Functie</p>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Link href="#over-ons" className="text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C]">
              Over ons
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C]">
              Prijzen
            </Link>
            <Link href="#contact" className="text-sm font-medium text-white/80 transition-colors hover:text-[#9AFF7C]">
              Contact
            </Link>
          </nav>

            {/* Desktop: Auth Buttons (Right) */}
            <div className="hidden md:flex items-center gap-4 ml-auto">
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
              className={`fixed inset-y-0 start-0 z-[60] bg-white border-r border-gray-200 transition-all duration-300 transform md:hidden w-64 h-full ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
                <div className="flex flex-col h-full">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <Logo width={100} height={28} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Sidebar Navigation */}
                  <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* Proefperiode Card - Smaller */}
                    <div className="bg-[#002A1F] rounded-xl p-4 mb-4 relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="text-lg font-semibold text-white mb-1.5">
                          Probeer Domio 30 dagen gratis
                        </h3>
                        <p className="text-xs text-white/90 mb-3">
                          Geen creditcard nodig, op elk moment opzegbaar.
                        </p>
                        <Button
                          className="bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 rounded-xl w-full text-sm"
                          onClick={() => {
                            setAuthModalMode('signup')
                            setAuthModalOpen(true)
                            setMobileMenuOpen(false)
                          }}
                        >
                          Start 30 dagen gratis
                        </Button>
                      </div>
                      {/* Geometric decorative element - positioned where no text */}
                      <GeometricShapes 
                        variant="corner" 
                        className="right-0 top-0 w-32 h-32"
                        color="#9AFF7C"
                        opacity={0.15}
                      />
                    </div>

                    {/* Header Navigation Items - Larger with color */}
                    <div className="space-y-1 mb-4">
            <Link
              href="#features"
                        className="block py-3.5 px-4 text-base font-medium text-[#002A1F] transition-colors hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Functies
            </Link>
                      <Link
                        href="#over-ons"
                        className="block py-3.5 px-4 text-base font-medium text-[#002A1F] transition-colors hover:bg-gray-50 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Over ons
            </Link>
            <Link
              href="#pricing"
                        className="block py-3.5 px-4 text-base font-medium text-[#002A1F] transition-colors hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Prijzen
            </Link>
            <Link
              href="#contact"
                        className="block py-3.5 px-4 text-base font-medium text-[#002A1F] transition-colors hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
                     </div>

                    {/* Inloggen Button */}
                    <div className="pt-2 mb-4">
                <Button 
                  variant="ghost" 
                        className="w-full justify-start text-gray-700 hover:bg-gray-50 hover:text-[#002A1F]"
                  onClick={() => {
                    setAuthModalMode('login')
                    setAuthModalOpen(true)
                    setMobileMenuOpen(false)
                  }}
                >
                    Inloggen
                </Button>
                    </div>

                    {/* Footer Links - Light gray */}
                    <div className="pt-4 mt-auto pb-4 border-t border-gray-200">
                      <div className="flex flex-col gap-2 px-4">
                        <Link
                          href="/privacy"
                          className="text-xs text-gray-500 hover:text-[#002A1F] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Privacy
                        </Link>
                        <Link
                          href="/terms"
                          className="text-xs text-gray-500 hover:text-[#002A1F] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Algemene voorwaarden
                        </Link>
                        <Link
                          href="#"
                          className="text-xs text-gray-500 hover:text-[#002A1F] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          FAQ
                        </Link>
                      </div>
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

      {/* Geometric decorative element between hero and next section */}
      <div className="relative w-full h-24 -mt-12 overflow-hidden pointer-events-none">
        <GeometricShapes 
          variant="diagonal-stripes" 
          className="inset-0 w-full h-full"
          color="#002A1F"
          opacity={0.05}
        />
      </div>

        {/* Floating Mockup */}
      <div className="relative w-full pointer-events-none z-40" style={{ marginTop: '-25vh' }}>
        <div className="container relative mx-auto w-full max-w-7xl px-6 md:px-8">
          <div className="relative w-full flex justify-center">
              {/* Mobile Mockup */}
              <Image
              src="/images/mobile mockup.png"
              alt="Domio op mobiel"
                width={400}
                height={800}
              className="h-auto w-full max-w-[70%] object-contain drop-shadow-2xl md:hidden mx-auto"
                priority={false}
                loading="lazy"
                quality={85}
                style={{ filter: 'hue-rotate(180deg) saturate(1.2)' }}
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
                style={{ filter: 'hue-rotate(180deg) saturate(1.2)' }}
            />
          </div>
        </div>
      </div>

      {/* Functies Section */}
        <Suspense fallback={<div className="min-h-[400px]" />}>
      <FunctiesSection />
        </Suspense>

      {/* Beheerder Types Section */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Side - Title */}
            <div className="pl-0 md:pl-28">
              <h2 className="text-base font-semibold leading-7 text-[#002A1F] mb-2">Beheerder Types</h2>
              <h2 className="text-4xl font-semibold tracking-tight text-balance text-[#002A1F] sm:text-5xl md:text-6xl">
                Voor <span className="text-[#002A1F]">elke</span> soort beheerder
              </h2>
            </div>

            {/* Right Side - Three Cards */}
            <div className="flex flex-col gap-4">
              {/* VvE's Card */}
              <div className="rounded-2xl bg-[#f4f4f4] p-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#002A1F] mb-1">VvE's</h3>
                  <p className="text-sm text-gray-600">Perfect voor verenigingen van eigenaren die hun gebouwen efficiënt willen beheren.</p>
                </div>
              </div>

              {/* Eigen Vastgoed Card */}
              <div className="rounded-2xl bg-[#f4f4f4] p-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#002A1F] mb-1">Eigen vastgoed</h3>
                  <p className="text-sm text-gray-600">Ideal voor particuliere vastgoedeigenaren die hun portefeuille zelf beheren.</p>
                </div>
              </div>

              {/* Beheerder Vastgoed Card */}
              <div className="rounded-2xl bg-[#f4f4f4] p-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#002A1F] mb-1">Beheerder vastgoed</h3>
                  <p className="text-sm text-gray-600">Gemaakt voor professionele vastgoedbeheerders die meerdere portefeuilles beheren.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Section */}
      <section className="relative z-20 pt-24 pb-12">
        <div className="container mx-auto w-full max-w-7xl px-6 md:px-8 relative z-10">
          <div className="rounded-3xl bg-[#002A1F] pt-8 px-8 pb-0 md:pt-12 md:px-12 md:pb-0 lg:pt-16 lg:px-8 lg:pb-0 relative z-10 overflow-hidden">
            {/* Geometric decorative element - positioned where no text (top right) */}
            <GeometricShapes 
              variant="diagonal-stripes" 
              className="right-0 top-0 w-48 h-48 lg:w-64 lg:h-64"
              color="#9AFF7C"
              opacity={0.12}
            />
            <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-end relative z-10">
              {/* Left Side - Mobile Mockup (Half, aligned to bottom of block) */}
              <div className="flex justify-center items-end lg:justify-start lg:flex-[0_0_auto] relative w-full lg:w-auto">
                <div className="relative lg:ml-12" style={{ maxWidth: '100%' }}>
                  <Image
                    src="/images/mobilemockuphalf.png"
                    alt="Domio app op mobiel"
                    width={400}
                    height={400}
                    className="drop-shadow-2xl w-full max-w-[250px] mx-auto lg:mx-0 lg:max-w-none lg:w-[320px] h-auto"
                    priority={false}
                    loading="lazy"
                    quality={85}
                    unoptimized
                    style={{ filter: 'hue-rotate(180deg) saturate(1.2)', display: 'block' }}
                  />
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="flex flex-col gap-6 lg:max-w-2xl lg:flex-1 lg:pl-[80px] pb-0">
                <h2 className="text-base font-semibold leading-7 text-white/90">App</h2>
                <h2 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
                  Beheer je vastgoed <span className="text-[#9AFF7C]">waar je ook bent</span>
                </h2>
                <p className="text-lg text-white/90">
                  Met de Domio app heb je altijd en overal toegang tot je portefeuille. Bekijk panden, beheer huurders en volg financiën direct vanaf je telefoon.
                </p>
                {/* App Store & Google Play Buttons - Smaller on mobile to fit side by side */}
                <div className="flex flex-row gap-2 sm:gap-3 mt-4 flex-nowrap justify-center lg:justify-start">
                  <GooglePlayButton
                    size="sm"
                    href="https://play.google.com/store/apps/details?id=com.domio"
                    className="bg-transparent border-white text-white hover:bg-white/10 flex-shrink-0 scale-90 sm:scale-100 !px-2 !py-1.5 sm:!px-3 sm:!py-2"
                  />
                  <AppStoreButton
                    size="sm"
                    href="https://apps.apple.com/app/domio"
                    className="bg-transparent border-white text-white hover:bg-white/10 flex-shrink-0 scale-90 sm:scale-100 !px-2 !py-1.5 sm:!px-3 sm:!py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
        <Suspense fallback={<div className="min-h-[400px]" />}>
      <PricingSection 
        onSignupClick={() => {
          setAuthModalMode('signup')
          setAuthModalOpen(true)
        }}
      />
        </Suspense>

        {/* Over Ons Section - Large section with building background and fade overlay */}
        <section id="over-ons" className="relative z-20 pt-16 pb-16 md:pt-24 md:pb-24">
          <div className="container mx-auto w-full max-w-7xl px-6 md:px-8">
            <div className="rounded-3xl relative overflow-hidden min-h-[650px] md:min-h-[600px]">
              {/* Background Image with buildings */}
              <div className="absolute inset-0">
                <Image
                  src="/images/Achtergrond5.jpg"
                  alt=""
                  fill
                  className="object-cover object-center"
                  quality={90}
                />
              </div>
              
              {/* Gradient fade overlay - solid for long time, then quick fade */}
              {/* Mobile: fade from bottom to top, Desktop: fade from left to right */}
              <div 
                className="absolute inset-0 md:hidden" 
                style={{
                  background: 'linear-gradient(to top, rgb(243 244 246) 0%, rgb(243 244 246) 30%, rgb(243 244 246 / 0.8) 40%, rgb(243 244 246 / 0.4) 50%, rgb(243 244 246 / 0.1) 60%, transparent 75%)'
                }}
              />
              <div 
                className="absolute inset-0 hidden md:block" 
                style={{
                  background: 'linear-gradient(to right, rgb(243 244 246) 0%, rgb(243 244 246) 30%, rgb(243 244 246 / 0.8) 40%, rgb(243 244 246 / 0.4) 50%, rgb(243 244 246 / 0.1) 60%, transparent 75%)'
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-end md:justify-center min-h-[650px] md:min-h-[600px]">
                <div className="max-w-xl">
                  {/* Small label */}
                  <div className="flex items-center gap-2 mb-4" style={{ width: 'fit-content' }}>
                    <div className="w-4 h-4 text-[#9AFF7C] flex-shrink-0">
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0L10.5 5.5L16 8L10.5 10.5L8 16L5.5 10.5L0 8L5.5 5.5L8 0Z"/>
                      </svg>
                    </div>
                    <h2 className="text-base font-semibold leading-7 text-[#002A1F] whitespace-nowrap">Over ons</h2>
                  </div>
                  
                  {/* Main heading */}
                  <h2 className="text-4xl font-semibold tracking-tight text-balance text-[#002A1F] sm:text-5xl md:text-6xl mb-6 w-fit">
                    Wie zijn wij?
                  </h2>
                  
                  {/* Description */}
                  <p className="text-base text-gray-700 sm:text-lg leading-7 mb-8 w-fit">
                    <span className="md:hidden">Domio is ontwikkeld door<br />vastgoedprofessionals. Wij combineren jarenlange ervaring met moderne technologie.</span>
                    <span className="hidden md:inline">Domio is ontwikkeld door<br />vastgoedprofessionals. Wij combineren jarenlange ervaring<br />met moderne technologie.</span>
                  </p>
                  
                  {/* CTA Button */}
                  <Button
                    size="default"
                    className="w-fit bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 border-[#9AFF7C] rounded-2xl"
                    onClick={() => {
                      setAuthModalMode('signup')
                      setAuthModalOpen(true)
                    }}
                  >
                    Meer over ons
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Contact Section */}
        <Suspense fallback={<div className="min-h-[300px]" />}>
      <ContactSection />
        </Suspense>

      {/* CTA Section - Overlapping Footer */}
      <section className="relative z-20 pt-24 pb-12">
        {/* Background that extends from middle of CTA into footer */}
        <div className="absolute inset-x-0 top-1/2 bottom-0 bg-white dark:bg-gray-900" />
        <div className="container mx-auto w-full max-w-7xl px-6 md:px-8 relative z-10">
          <div className="rounded-3xl bg-[#002A1F] p-8 md:p-12 lg:p-16 relative z-10 overflow-hidden">
            {/* Geometric decorative element - positioned where no text (bottom right) */}
            <GeometricShapes 
              variant="trapezoid" 
              className="right-0 bottom-0 w-56 h-56 lg:w-72 lg:h-72"
              color="#9AFF7C"
              opacity={0.15}
            />
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between relative z-10">
              {/* Left Side - Content */}
              <div className="flex flex-col gap-6 lg:max-w-2xl">
                <h2 className="text-base font-semibold leading-7 text-white/90">Proefperiode</h2>
                <h2 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
                  Eerst zien, dan geloven?
                </h2>
                <p className="text-base text-white/90 sm:text-lg leading-7">
                  Probeer Domio 30 dagen volledig gratis. Geen creditcard nodig, nergens aan vast en op elk moment opzegbaar. Ontdek hoe Domio jouw vastgoedbeheer kan verbeteren.
                </p>
                <div className="flex flex-row items-center gap-3 justify-start">
                  <Button
                    size="default"
                    className="w-fit bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 border-[#9AFF7C] rounded-2xl"
                    onClick={() => {
                      setAuthModalMode('signup')
                      setAuthModalOpen(true)
                    }}
                  >
                    Start 30 dagen gratis
                  </Button>
                  <Button
                    asChild
                    className="bg-transparent text-white hover:bg-white/10 border border-white rounded-2xl"
                  >
                      <Link href="/demo" className="flex items-center gap-2">
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
