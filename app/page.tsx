'use client'

import React, { useState, useRef, lazy, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { HeroSection } from '@/components/marketing/hero-section'
import { AuthModal } from '@/components/auth/auth-modal'
import { ArrowRight, Menu, X, ArrowUpRight, User, ChevronDown, BookOpen, Mail, Headphones, Search, Building2, Users, FileText, Percent, Euro, Calculator, BarChart3, Wrench, ClipboardCheck, Scan } from 'lucide-react'
import { AppStoreButton, GooglePlayButton } from '@/components/base/buttons/app-store-buttons'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'

// Lazy load heavy sections for better initial load
const PricingSection = lazy(() => import('@/components/marketing/pricing-section').then(m => ({ default: m.PricingSection })))
const ContactSection = lazy(() => import('@/components/marketing/contact-section').then(m => ({ default: m.ContactSection })))
const FooterSection = lazy(() => import('@/components/marketing/footer-section').then(m => ({ default: m.FooterSection })))
const FunctiesSection = lazy(() => import('@/components/marketing/functies-section').then(m => ({ default: m.FunctiesSection })))

const GRAY_BAR_HEIGHT = 32 // 8 * 4px

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')
  const [functionsMenuOpen, setFunctionsMenuOpen] = useState(false)
  const [supportMenuOpen, setSupportMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  // Header beweegt vloeiend mee met scroll (1:1 tot grijze balk weg is)
  React.useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(typeof window !== 'undefined' ? window.scrollY : 0)
        rafRef.current = null
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleHeaderMouseLeave = () => {
    if (!functionsMenuOpen && !supportMenuOpen) return
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setIsClosing(true)
    closeTimeoutRef.current = setTimeout(() => {
      setIsClosing(false)
      setFunctionsMenuOpen(false)
      setSupportMenuOpen(false)
      closeTimeoutRef.current = null
    }, 350) //zelfde duur als transition voor soepele inklap-animatie
  }

  const handleHeaderMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsClosing(false)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* Grijze balk – in flow, scrollt mee; staat bovenaan zodat hij bij scroll 0 boven de header lijkt */}
      <div className="h-8 flex-shrink-0 bg-gray-100 z-[60] relative">
        <div className="container mx-auto flex h-full w-full max-w-7xl items-center justify-end gap-4 px-4 md:px-8">
          <Link href="/privacy" className="text-xs text-gray-600 hover:text-[#002A1F] transition-colors">
            Gegevensbescherming
          </Link>
          <div className="relative inline-flex items-center">
            <select
              className="text-xs text-gray-600 hover:text-[#002A1F] bg-transparent border-0 cursor-pointer focus:ring-0 focus:outline-none py-1 pl-0 pr-5 appearance-none"
              defaultValue="nl"
              aria-label="Taal"
            >
              <option value="nl">NL</option>
              <option value="en">EN</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Header – fixed top-8, vloeiend omhoog met translateY tot tegen plafond */}
      <header 
        className="fixed top-8 left-0 right-0 z-50 w-full bg-white flex-shrink-0 shadow-sm will-change-transform"
        style={{ transform: `translateY(-${Math.min(scrollY, GRAY_BAR_HEIGHT)}px)` }}
        onMouseLeave={handleHeaderMouseLeave}
        onMouseEnter={handleHeaderMouseEnter}
      >
          <div className="container mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-8">
            {/* Mobile: Hamburger Menu (Left) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[#002A1F] hover:bg-gray-100 hover:text-[#002A1F] flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Mobile: Logo (Center) - Desktop: Logo (Left) */}
            <div className="flex-1 flex justify-center md:justify-start md:flex-none md:flex-shrink-0">
            <Logo width={100} height={28} />
          </div>

            {/* Desktop Navigation - links uitgelijnd */}
            <nav className="hidden md:flex items-center gap-6 flex-1 justify-start pl-8">
              {/* Functies - opent header naar beneden */}
              <div
                className="relative"
                onMouseEnter={() => { setFunctionsMenuOpen(true); setSupportMenuOpen(false); }}
              >
                <button type="button" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#002A1F] flex items-center gap-1 py-2">
                  Functies
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${functionsMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {/* Ondersteuning - mega menu */}
              <div
                className="relative"
                onMouseEnter={() => { setSupportMenuOpen(true); setFunctionsMenuOpen(false); }}
              >
                <button type="button" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#002A1F] flex items-center gap-1 py-2">
                  Ondersteuning
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${supportMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <Link href="#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#002A1F]">
                Prijzen
              </Link>
              <Link href="#over-ons" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#002A1F]">
                Over ons
              </Link>
            </nav>

            {/* Desktop: Auth Buttons (Right) */}
            <div className="hidden md:flex items-center gap-4 ml-auto">
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:bg-gray-100 hover:text-[#002A1F]"
                  onClick={() => {
                    setAuthModalMode('login')
                    setAuthModalOpen(true)
                  }}
                >
                  Inloggen
                </Button>
                <Button
                  className="bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 border border-[#9AFF7C]/20 rounded-xl"
                  onClick={() => {
                    setAuthModalMode('signup')
                    setAuthModalOpen(true)
                  }}
                >
                  Registreren
                </Button>
          </div>
          
            {/* Mobile: Account Icon (Right) */}
          <Button
            variant="ghost"
            size="icon"
              className="md:hidden text-[#002A1F] hover:bg-gray-100 hover:text-[#002A1F] flex-shrink-0"
              onClick={() => {
                setAuthModalMode('login')
                setAuthModalOpen(true)
              }}
              aria-label="Account"
          >
              <User className="h-6 w-6" />
          </Button>
          </div>

          {/* Dropdown overlay - soepele animatie; height animeert ook bij wisselen van menu */}
          <div
            className="hidden md:block absolute left-0 right-0 top-full z-50 overflow-hidden bg-white shadow-lg origin-top"
            style={{
              height: (functionsMenuOpen || supportMenuOpen) && !isClosing ? (functionsMenuOpen ? 290 : 260) : 0,
              opacity: (functionsMenuOpen || supportMenuOpen) && !isClosing ? 1 : 0,
              transform: (functionsMenuOpen || supportMenuOpen) && !isClosing ? 'translateY(0)' : 'translateY(-12px)',
              pointerEvents: (functionsMenuOpen || supportMenuOpen) && !isClosing ? 'auto' : 'none',
              transition: 'height 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            <>
            {/* Functies-inhoud */}
            <div
              className="absolute inset-x-0 top-0 bg-white"
              style={{
                opacity: functionsMenuOpen ? 1 : 0,
                pointerEvents: functionsMenuOpen ? 'auto' : 'none',
                transition: 'opacity 200ms ease-out',
              }}
              aria-hidden={!functionsMenuOpen}
            >
              <div key={functionsMenuOpen ? 'f-open' : 'f-closed'}>
                <div className="mx-auto w-full max-w-7xl px-6 pt-4 pb-2 grid grid-cols-3 gap-x-8 gap-y-1">
                  {[
                    { title: 'Object- en Portfoliobeheer', desc: 'Beheer al je panden en portefeuilles', icon: Building2 },
                    { title: 'Huurdersbeheer', desc: 'Huurders en contracten inzichtelijk', icon: Users },
                    { title: 'Contractbeheer', desc: 'Contracten en verlengingen beheren', icon: FileText },
                    { title: 'Automatische Huurindexatie', desc: 'Indexatie berekenen en toepassen', icon: Percent },
                    { title: 'Facturatie & Betalingsverwerking', desc: 'Facturen aanmaken en incasseren', icon: Euro },
                    { title: 'Servicekostenafrekening', desc: 'Servicekosten verrekenen met huurders', icon: Calculator },
                    { title: 'Rapportages & Financieel Beheer', desc: 'Inzicht en rapportages op maat', icon: BarChart3 },
                    { title: 'Ticketsysteem voor Onderhoud', desc: 'Meldingen en onderhoud plannen', icon: Wrench },
                    { title: 'Inspectiemodule', desc: 'Inspecties vastleggen en rapporteren', icon: ClipboardCheck },
                    { title: 'Scan & Herken Functie', desc: 'Documenten scannen en herkennen', icon: Scan },
                  ].map((item, i) => (
                    <div key={item.title} className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start" style={{ animationDelay: `${25 + i * 35}ms` }}>
                      <item.icon className="size-5 text-[#002A1F] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#002A1F] group-hover:text-[#002A1F]">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="absolute inset-x-0 top-0 bg-white"
              style={{
                opacity: supportMenuOpen ? 1 : 0,
                pointerEvents: supportMenuOpen ? 'auto' : 'none',
                transition: 'opacity 200ms ease-out',
              }}
              aria-hidden={!supportMenuOpen}
            >
                <div key={supportMenuOpen ? 's-open' : 's-closed'} className="mx-auto w-full max-w-7xl px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-5 grid grid-cols-2 gap-x-8 gap-y-1 self-start">
                    {[
                      { title: 'Kennisbank', desc: 'Antwoord op je vragen', icon: BookOpen },
                      { title: 'Support', desc: 'Stel je vragen', icon: Mail },
                      { title: 'Livesessies', desc: 'Leer meer over Domio', icon: Headphones },
                      { title: 'Vind je Expert', desc: 'Ondersteuning bij boekhouden', icon: Search },
                    ].map((item, i) => (
                      <div key={item.title} className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start" style={{ animationDelay: `${i * 35}ms` }}>
                        <item.icon className="size-5 text-[#002A1F] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#002A1F] group-hover:text-[#002A1F]">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="md:col-span-7 dropdown-item-in flex" style={{ animationDelay: '100ms' }}>
                    <div className="rounded-2xl bg-[#002A1F] text-white px-7 py-6 flex flex-col justify-center min-h-[200px] w-full relative overflow-hidden">
                      {/* Geometric decorative element - same style as "Eerst zien dan geloven" section */}
                      <GeometricShapes 
                        variant="trapezoid" 
                        className="right-0 bottom-0 w-40 h-40"
                        color="#9AFF7C"
                        opacity={0.18}
                        layers={2}
                      />
                      <div className="relative z-10 flex flex-col items-start gap-4">
                        <h3 className="text-3xl font-semibold tracking-tight leading-snug text-white">
                          Overstappen naar <span className="text-[#9AFF7C]">Domio</span>
                        </h3>
                        <p className="text-sm text-white/90 leading-6">Een nieuw platform? Geen gedoe, maar een slimme stap vooruit. Meer overzicht, minder gedoe.</p>
                        <Button size="default" className="bg-transparent border border-white text-white hover:bg-white/10 rounded-2xl font-semibold">
                          Bekijk hoe je snel overstapt
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </div>
          <>
            {/* Mobile Sidebar - Overlay */}
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
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Probeer Domio
                        </h3>
                        <p className="text-base font-semibold text-white mb-2">
                          30 dagen gratis
                        </p>
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
                          Registreren
                        </Button>
                      </div>
                      {/* Geometric decorative element - same style as 30 dagen gratis section, subtle in quiet corner */}
                      <GeometricShapes 
                        variant="trapezoid" 
                        className="right-0 bottom-0 w-40 h-40"
                        color="#9AFF7C"
                        opacity={0.12}
                        layers={2}
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
              className="block py-3.5 px-4 text-base font-medium text-[#002A1F] transition-colors hover:bg-gray-50 rounded-lg !text-[#002A1F]"
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
                          href="/faq"
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

      {/* Inhoud begint onder de vaste header (top-8 + h-16 = 6rem) */}
      <div className="pt-24 flex flex-col flex-1">
      <HeroSection
        onSignupClick={() => {
          setAuthModalMode('signup')
          setAuthModalOpen(true)
        }}
      />

      <div className="relative z-10 overflow-x-hidden">
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
                Voor elke soort beheerder, de juiste oplossing
              </h2>
              <p className="mt-4 text-lg font-medium text-pretty text-gray-600 max-w-3xl">
                Domio past zich aan aan jouw specifieke behoeften.
              </p>
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
            {/* Geometric decorative element - same style as 30 dagen gratis section, 2x larger, bottom right */}
            <GeometricShapes 
              variant="trapezoid" 
              className="right-0 bottom-0 w-[112px] h-[112px] lg:w-[144px] lg:h-[144px]"
              color="#9AFF7C"
              opacity={0.18}
              layers={2}
            />
            <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-center relative z-10">
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
              <div className="flex flex-col gap-6 lg:max-w-2xl lg:flex-1 lg:pl-[80px] lg:-mt-16">
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
                    Domio is meer dan software
                  </h2>
                  
                  {/* Description */}
                  <p className="text-base text-gray-700 sm:text-lg leading-7 mb-8 w-fit">
                    Domio denkt mee<br />
                    Luister naar wat nodig is<br />
                    Altijd op de hoogte van het laatste nieuws
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
            {/* Geometric decorative element - positioned where no text (bottom right, shifted more right/bottom on mobile) */}
            <GeometricShapes 
              variant="trapezoid" 
              className="right-0 bottom-0 translate-x-4 translate-y-4 lg:translate-x-0 lg:translate-y-0 w-56 h-56 lg:w-72 lg:h-72"
              color="#9AFF7C"
              opacity={0.18}
              layers={2}
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
                    Registreren
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
