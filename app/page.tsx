'use client'

import React, { useState, useRef, useEffect, lazy, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { HeroSection } from '@/components/marketing/hero-section'
import { SupportSection } from '@/components/marketing/support-section'
import { FAQSection } from '@/components/marketing/faq-section'
import { AuthModal } from '@/components/auth/auth-modal'
import { ArrowRight, Menu, X, ArrowUpRight, User, ChevronDown, Mail, Phone, Copy, Search, Building2, Users, FileText, Percent, Euro, Calculator, BarChart3, Wrench, ClipboardCheck, Scan, Home as HomeIcon, Briefcase, HelpCircle, MessageCircle, Ticket } from 'lucide-react'
import { AppStoreButton, GooglePlayButton } from '@/components/base/buttons/app-store-buttons'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'
import { CONTACT_EMAIL } from '@/lib/site-config'
import { supabase } from '@/lib/supabase/client'
import { getUser } from '@/lib/supabase/auth'
import { getProfile } from '@/lib/supabase/profile'

// Lazy load heavy sections for better initial load
const PricingSection = lazy(() => import('@/components/marketing/pricing-section').then(m => ({ default: m.PricingSection })))
const FooterSection = lazy(() => import('@/components/marketing/footer-section').then(m => ({ default: m.FooterSection })))
const FunctiesSection = lazy(() => import('@/components/marketing/functies-section').then(m => ({ default: m.FunctiesSection })))

export default function Home() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')
  const [functionsMenuOpen, setFunctionsMenuOpen] = useState(false)
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<'kvk' | 'btw' | null>(null)

  const handleCopy = (text: string, field: 'kvk' | 'btw') => {
    void navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }
  const [isClosing, setIsClosing] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [headerVisible, setHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)
  const scrollThreshold = 80
  const [userName, setUserName] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { user } = await getUser()
      if (user) {
        const profile = await getProfile(user.id)
        const name = profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0] ?? 'daar'
        setUserName(name)
      } else {
        setUserName(null)
      }
      setAuthLoading(false)
    }
    void fetchUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void fetchUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      if (y <= scrollThreshold) {
        setHeaderVisible(true)
      } else if (y > lastScrollY.current) {
        setHeaderVisible(false)
      } else {
        setHeaderVisible(true)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleHeaderMouseLeave = () => {
    if (!functionsMenuOpen && !helpMenuOpen) return
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setIsClosing(true)
    closeTimeoutRef.current = setTimeout(() => {
      setIsClosing(false)
      setFunctionsMenuOpen(false)
      setHelpMenuOpen(false)
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
      {/* Header – fixed top, verschijnt bij omhoog scrollen */}
      <header 
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full bg-white flex-shrink-0 shadow-sm transition-transform duration-300 ease-out',
          !headerVisible && '-translate-y-full'
        )}
        onMouseLeave={handleHeaderMouseLeave}
        onMouseEnter={handleHeaderMouseEnter}
      >
          <div className="container mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-8">
            {/* Mobile: Hamburger Menu (Left) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[#163300] hover:bg-gray-100 hover:text-[#163300] flex-shrink-0"
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
                onMouseEnter={() => { setFunctionsMenuOpen(true); setHelpMenuOpen(false); }}
              >
                <button type="button" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300] flex items-center gap-1 py-2">
                  Functies
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${functionsMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <Link href="#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300]">
                Prijzen
              </Link>
              <Link href="/blog" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300]">
                Kennisbank
              </Link>
              {/* Hulp & Contact - ondersteuning + contact gegevens */}
              <div
                className="relative"
                onMouseEnter={() => { setHelpMenuOpen(true); setFunctionsMenuOpen(false); }}
              >
                <button type="button" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300] flex items-center gap-1 py-2">
                  Hulp & Contact
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${helpMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </nav>

            {/* Desktop: Auth / User (Right) */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              {!authLoading && userName ? (
                <>
                  <span className="text-sm font-medium text-gray-700">Hallo, {userName}</span>
                  <Button asChild variant="secondary" className="rounded-full !bg-[#9FE870] !text-[#163300] hover:!bg-[#9FE870]/90 border-0 px-4 py-2 text-sm font-semibold shadow-sm">
                    <Link href="/mijn-domio">Mijn Domio</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#163300] rounded-full px-4 py-2">
                    <Link href="/login">Inloggen</Link>
                  </Button>
                  <Button asChild variant="secondary" className="rounded-full !bg-[#9FE870] !text-[#163300] hover:!bg-[#9FE870]/90 border-0 px-4 py-2 text-sm font-semibold shadow-sm">
                    <Link href="/registreren">Registreren</Link>
                  </Button>
                </>
              )}
          </div>
          
            {/* Mobile: Account / User (Right) */}
          {!authLoading && userName ? (
            <Button asChild variant="secondary" size="sm" className="md:hidden rounded-full !bg-[#9FE870] !text-[#163300] hover:!bg-[#9FE870]/90 border-0 px-4 py-2 text-sm font-semibold">
              <Link href="/mijn-domio">Mijn Domio</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" className="md:hidden text-[#163300] hover:bg-gray-100 hover:text-[#163300] flex-shrink-0" aria-label="Account">
              <Link href="/login"><User className="h-6 w-6" /></Link>
            </Button>
          )}
          </div>

          {/* Blur backdrop wanneer dropdown open – alleen onder de header, lichte blur */}
          <div
            className={cn(
              'hidden md:block fixed top-16 left-0 right-0 bottom-0 z-40 pointer-events-none transition-opacity duration-350 backdrop-blur-sm bg-white/20',
              (functionsMenuOpen || helpMenuOpen) && !isClosing ? 'opacity-100' : 'opacity-0'
            )}
            aria-hidden="true"
          />

          {/* Dropdown overlay - soepele animatie; height animeert ook bij wisselen van menu */}
          <div
            className="hidden md:block absolute left-0 right-0 top-full z-50 overflow-hidden bg-white shadow-lg origin-top"
            style={{
              height: (functionsMenuOpen || helpMenuOpen) && !isClosing ? (functionsMenuOpen ? 290 : 260) : 0,
              opacity: (functionsMenuOpen || helpMenuOpen) && !isClosing ? 1 : 0,
              transform: (functionsMenuOpen || helpMenuOpen) && !isClosing ? 'translateY(0)' : 'translateY(-12px)',
              pointerEvents: (functionsMenuOpen || helpMenuOpen) && !isClosing ? 'auto' : 'none',
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
                    { title: 'Ticketsysteem voor Onderhoud', desc: 'Meldingen en onderhoud plannen', icon: Ticket },
                    { title: 'Inspectiemodule', desc: 'Inspecties vastleggen en rapporteren', icon: ClipboardCheck },
                    { title: 'Scan & Herken Functie', desc: 'Documenten scannen en herkennen', icon: Scan },
                  ].map((item, i) => (
                    <Link key={item.title} href="/functies" className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors group dropdown-item-in flex gap-3 items-start" style={{ animationDelay: `${25 + i * 35}ms` }}>
                      <item.icon className="size-5 text-[#163300] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#163300] group-hover:text-[#163300]">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href="/functies"
                    className="col-start-3 row-start-4 py-2.5 px-3 flex items-center justify-end dropdown-item-in"
                  >
                    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9FE870] text-[#163300] px-5 py-2 text-sm font-semibold shadow-sm hover:bg-[#9FE870]/90 transition-colors">
                      Meer info
                      <ArrowUpRight className="h-4 w-4 shrink-0" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            {/* Hulp & Contact – ondersteuning + contact gegevens + nog vragen */}
            <div
              className="absolute inset-x-0 top-0 bg-white"
              style={{
                opacity: helpMenuOpen ? 1 : 0,
                pointerEvents: helpMenuOpen ? 'auto' : 'none',
                transition: 'opacity 200ms ease-out',
              }}
              aria-hidden={!helpMenuOpen}
            >
              <div key={helpMenuOpen ? 'h-open' : 'h-closed'} className="mx-auto w-full max-w-7xl px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-2 gap-6 md:items-stretch">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 place-content-start md:min-h-[200px]">
                  <Link href="/hulp" className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start" style={{ animationDelay: '0ms' }}>
                    <MessageCircle className="size-5 text-[#163300] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#163300]">Klantenservice</p>
                      <p className="text-xs text-gray-500 mt-0.5">Live chat, telefoon &amp; e-mail</p>
                    </div>
                  </Link>
                  <Link href="/faq" className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors group dropdown-item-in flex gap-3 items-start" style={{ animationDelay: '25ms' }}>
                    <HelpCircle className="size-5 text-[#163300] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#163300]">Veelgestelde vragen</p>
                      <p className="text-xs text-gray-500 mt-0.5">Antwoord op veelgestelde vragen</p>
                    </div>
                  </Link>
                  <a
                    href="tel:+31646231696"
                    className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors group dropdown-item-in flex gap-3 items-start"
                    style={{ animationDelay: '100ms' }}
                    aria-label="Telefoon — opent de bel-app"
                  >
                    <Phone className="size-5 text-[#163300] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#163300]">Telefoon</p>
                      <p className="text-xs text-gray-500 mt-0.5">+31 6 46 23 16 96</p>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-[#163300] mt-0.5"
                      aria-hidden
                    />
                  </a>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors group dropdown-item-in flex gap-3 items-start"
                    style={{ animationDelay: '125ms' }}
                    aria-label={`E-mail — opent je mailapp (${CONTACT_EMAIL})`}
                  >
                    <Mail className="size-5 text-[#163300] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#163300]">E-mail</p>
                      <p className="text-xs text-gray-500 mt-0.5">{CONTACT_EMAIL}</p>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-[#163300] mt-0.5"
                      aria-hidden
                    />
                  </a>
                  <button type="button" onClick={() => handleCopy('92211542', 'kvk')} className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start text-left w-full" style={{ animationDelay: '150ms' }}>
                    <Copy className="size-5 text-[#163300] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#163300]">KVK</p>
                      <p className="text-xs text-gray-500 mt-0.5 tabular-nums">{copiedField === 'kvk' ? 'Gekopieerd!' : '92211542'}</p>
                    </div>
                  </button>
                  <button type="button" onClick={() => handleCopy('NL003830384B29', 'btw')} className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start text-left w-full" style={{ animationDelay: '175ms' }}>
                    <Copy className="size-5 text-[#163300] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#163300]">BTW</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">{copiedField === 'btw' ? 'Gekopieerd!' : 'NL003830384B29'}</p>
                    </div>
                  </button>
                </div>
                <div className="dropdown-item-in flex md:min-h-[200px]" style={{ animationDelay: '150ms' }}>
                  <Link href="/demo" className="rounded-2xl bg-[#163300] text-white px-6 py-5 flex flex-col justify-center min-h-[200px] w-full relative overflow-hidden group">
                    <GeometricShapes variant="trapezoid" className="right-0 bottom-0 w-32 h-32" color="#9FE870" opacity={0.18} layers={2} />
                    <div className="relative z-10 flex flex-col items-start gap-3">
                      <h3 className="text-2xl font-semibold tracking-tight leading-snug text-white">Overstappen binnen een uur</h3>
                      <p className="text-sm text-white/90 leading-6">Met OCR lezen we je contracten en documenten in en zetten we alles in één keer over. Geen handmatig werk.</p>
                      <span className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9FE870] text-[#163300] px-4 py-2.5 text-sm font-semibold shadow-sm group-hover:bg-[#9FE870]/90 transition-colors">
                        Bekijk hoe overstappen werkt
                        <ArrowUpRight className="h-4 w-4 shrink-0" />
                      </span>
                    </div>
                  </Link>
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
                    {/* Proefperiode Card of Welkom - Smaller */}
                    <div className="bg-[#163300] rounded-xl p-4 mb-4 relative overflow-hidden">
                      <div className="relative z-10">
                        {userName ? (
                          <>
                            <h3 className="text-lg font-semibold text-white mb-1">Hallo, {userName}</h3>
                            <p className="text-xs text-white/90 mb-3">Ga direct naar je dashboard</p>
                            <Button asChild className="bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 rounded-xl w-full text-sm">
                              <Link href="/mijn-domio" onClick={() => setMobileMenuOpen(false)}>Mijn Domio</Link>
                            </Button>
                          </>
                        ) : (
                          <>
                            <h3 className="text-lg font-semibold text-white mb-1">Probeer Domio</h3>
                            <p className="text-base font-semibold text-white mb-2">30 dagen gratis</p>
                            <p className="text-xs text-white/90 mb-3">Geen creditcard nodig, op elk moment opzegbaar.</p>
                            <Button asChild className="bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 rounded-xl w-full text-sm">
                              <Link href="/registreren" onClick={() => setMobileMenuOpen(false)}>Registreren</Link>
                            </Button>
                          </>
                        )}
                      </div>
                      {/* Geometric decorative element - same style as 30 dagen gratis section, subtle in quiet corner */}
                      <GeometricShapes 
                        variant="trapezoid" 
                        className="right-0 bottom-0 w-40 h-40"
                        color="#9FE870"
                        opacity={0.12}
                        layers={2}
                      />
                    </div>

                    {/* Header Navigation Items - Larger with color */}
                    <div className="space-y-1 mb-4">
            <Link
              href="#features"
                        className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Functies
            </Link>
            <Link
              href="#pricing"
                        className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Prijzen
            </Link>
            <Link
              href="/blog"
                        className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Kennisbank
            </Link>
            <Link
              href="/contact"
              className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg !text-[#163300]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hulp & Contact
            </Link>
                     </div>

                    {/* Inloggen / Mijn Domio Button */}
                    <div className="pt-2 mb-4">
                      {userName ? (
                        <Button asChild variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50 hover:text-[#163300]">
                          <Link href="/mijn-domio" onClick={() => setMobileMenuOpen(false)}>Mijn Domio</Link>
                        </Button>
                      ) : (
                        <Button asChild variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50 hover:text-[#163300]">
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Inloggen</Link>
                        </Button>
                      )}
                    </div>

                    {/* Footer Links - Light gray */}
                    <div className="pt-4 mt-auto pb-4 border-t border-gray-200">
                      <div className="flex flex-col gap-2 px-4">
                        <Link
                          href="/privacy"
                          className="text-xs text-gray-500 hover:text-[#163300] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Privacy
                        </Link>
                        <Link
                          href="/terms"
                          className="text-xs text-gray-500 hover:text-[#163300] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                >
                          Algemene voorwaarden
                        </Link>
                        <Link
                          href="/faq"
                          className="text-xs text-gray-500 hover:text-[#163300] transition-colors"
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

      {/* Inhoud begint onder de vaste header (h-16 = 4rem) */}
      <div className="pt-16 flex flex-col flex-1">
      <HeroSection onSignupClick={() => router.push('/registreren')} />

      <div className="relative z-10 overflow-x-hidden">
      {/* Functies Section */}
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <FunctiesSection />
        </Suspense>

      {/* Beheerder Types Section – Wise-achtige layout: headline + CTA links, drie componenten met icoon + tekst eronder */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Boven: headline + tekst + CTA (geen illustratie) */}
          <div className="max-w-2xl">
            <h2 className="text-base font-semibold leading-7 text-[#163300] mb-2">Beheerder types</h2>
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-[#163300] sm:text-5xl md:text-6xl">
              Voor elke soort beheerder
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-xl">
              Duizenden verhuurders en beheerders vertrouwen op Domio om hun vastgoedportefeuille te beheren. Of je nu een VvE, particuliere eigenaar of professioneel beheerder bent.
            </p>
            <Button asChild variant="secondary" className="mt-6 rounded-full !bg-[#9FE870] !text-[#163300] hover:!bg-[#9FE870]/90 border-0 px-8 py-6 text-base font-semibold shadow-sm">
              <Link href="/registreren">Bekijk hoe Domio jou ondersteunt</Link>
            </Button>
          </div>

          {/* Drie componenten: link naar functies-pagina, icoon wordt pijl rechtsboven bij hover */}
          <div className="mt-16 grid grid-cols-1 gap-10 sm:gap-8 md:grid-cols-3">
            <Link href="/functies" className="group cursor-pointer transition-colors block">
              <div className="mb-4 relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors group-hover:bg-[#9FE870] group-hover:text-[#163300] dark:bg-neutral-700 dark:text-gray-400 dark:group-hover:bg-[#9FE870] dark:group-hover:text-[#163300]">
                <Building2 className="h-8 w-8 transition-all duration-300 group-hover:opacity-0 group-hover:scale-90 absolute" />
                <ArrowUpRight className="h-8 w-8 opacity-0 scale-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 absolute" />
              </div>
              <h3 className="text-lg font-semibold text-[#163300] dark:text-white mb-1 transition-colors group-hover:text-[#163300]">VvE&apos;s</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors group-hover:text-[#163300] dark:group-hover:text-[#163300]">
                Perfect voor verenigingen van eigenaren die hun gebouwen efficiënt willen beheren.
              </p>
            </Link>
            <Link href="/functies" className="group cursor-pointer transition-colors block">
              <div className="mb-4 relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors group-hover:bg-[#9FE870] group-hover:text-[#163300] dark:bg-neutral-700 dark:text-gray-400 dark:group-hover:bg-[#9FE870] dark:group-hover:text-[#163300]">
                <HomeIcon className="h-8 w-8 transition-all duration-300 group-hover:opacity-0 group-hover:scale-90 absolute" />
                <ArrowUpRight className="h-8 w-8 opacity-0 scale-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 absolute" />
              </div>
              <h3 className="text-lg font-semibold text-[#163300] dark:text-white mb-1 transition-colors group-hover:text-[#163300]">Eigen vastgoed</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors group-hover:text-[#163300] dark:group-hover:text-[#163300]">
                Ideaal voor particuliere vastgoedeigenaren die hun portefeuille zelf beheren.
              </p>
            </Link>
            <Link href="/functies" className="group cursor-pointer transition-colors block">
              <div className="mb-4 relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors group-hover:bg-[#9FE870] group-hover:text-[#163300] dark:bg-neutral-700 dark:text-gray-400 dark:group-hover:bg-[#9FE870] dark:group-hover:text-[#163300]">
                <Briefcase className="h-8 w-8 transition-all duration-300 group-hover:opacity-0 group-hover:scale-90 absolute" />
                <ArrowUpRight className="h-8 w-8 opacity-0 scale-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 absolute" />
              </div>
              <h3 className="text-lg font-semibold text-[#163300] dark:text-white mb-1 transition-colors group-hover:text-[#163300]">Vastgoedbeheerder</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors group-hover:text-[#163300] dark:group-hover:text-[#163300]">
                Gemaakt voor professionele vastgoedbeheerders die meerdere portefeuilles beheren.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* App Section */}
      <section className="relative z-20 pt-24 pb-12">
        <div className="container mx-auto w-full max-w-7xl px-6 md:px-8 relative z-10">
          <div className="rounded-3xl bg-[#163300] pt-8 px-8 pb-0 md:pt-12 md:px-12 md:pb-0 lg:pt-16 lg:px-8 lg:pb-0 relative z-10 overflow-hidden">
            {/* Geometric decorative element - same style as 30 dagen gratis section, 2x larger, bottom right */}
            <GeometricShapes 
              variant="trapezoid" 
              className="right-0 bottom-0 w-[112px] h-[112px] lg:w-[144px] lg:h-[144px]"
              color="#9FE870"
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
                  Beheer je vastgoed <span className="text-[#9FE870]">waar je ook bent</span>
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
      <PricingSection onSignupClick={() => router.push('/registreren')} />
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
                  <h2 className="text-base font-semibold leading-7 text-[#163300] whitespace-nowrap mb-4 w-fit">Over ons</h2>
                  
                  {/* Main heading */}
                  <h2 className="text-4xl font-semibold tracking-tight text-balance text-[#163300] sm:text-5xl md:text-6xl mb-6 w-fit">
                    Domio is meer dan software
                  </h2>
                  
                  {/* Description */}
                  <p className="text-base text-gray-700 sm:text-lg leading-7 mb-8 w-fit">
                    Domio denkt mee<br />
                    Luister naar wat nodig is<br />
                    Altijd op de hoogte van het laatste nieuws
                  </p>
                  
                  {/* CTA Button */}
                  <Button asChild variant="secondary" className="w-fit rounded-full !bg-[#9FE870] !text-[#163300] hover:!bg-[#9FE870]/90 border-0 px-8 py-6 text-base font-semibold shadow-sm">
                    <Link href="/registreren">Meer over ons</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Klantenservice / Contact sectie */}
      <SupportSection />

      {/* CTA Section - Eerst zien, dan geloven */}
      <section className="relative z-20 pt-24 pb-12">
        {/* Background that extends from middle of CTA into footer */}
        <div className="absolute inset-x-0 top-1/2 bottom-0 bg-white dark:bg-gray-900" />
        <div className="container mx-auto w-full max-w-7xl px-6 md:px-8 relative z-10">
          <div className="rounded-3xl bg-[#163300] p-8 md:p-12 lg:p-16 relative z-10 overflow-hidden">
            {/* Geometric decorative element - positioned where no text (bottom right, shifted more right/bottom on mobile) */}
            <GeometricShapes 
              variant="trapezoid" 
              className="right-0 bottom-0 translate-x-4 translate-y-4 lg:translate-x-0 lg:translate-y-0 w-56 h-56 lg:w-72 lg:h-72"
              color="#9FE870"
              opacity={0.18}
              layers={2}
            />
            <div className="flex flex-col gap-8 items-start justify-start relative z-10 text-left">
              <div className="flex flex-col gap-6 max-w-2xl">
                <h2 className="text-base font-semibold leading-7 text-white/90">Proefperiode</h2>
                <h2 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
                  Eerst zien, dan geloven?
                </h2>
                <p className="text-base text-white/90 sm:text-lg leading-7">
                  Probeer Domio 30 dagen volledig gratis. Geen creditcard nodig, nergens aan vast en op elk moment opzegbaar. Ontdek hoe Domio jouw vastgoedbeheer kan verbeteren.
                </p>
                <div className="flex flex-row flex-wrap items-center justify-start gap-4">
                  <Button asChild className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 border-0 px-8 py-6 text-base font-semibold shadow-sm">
                    <Link href="/registreren">Registreren</Link>
                  </Button>
                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <span className="md:hidden">Demo</span>
                    <span className="hidden md:inline">Bekijk demo</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ sectie */}
      <FAQSection />

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
