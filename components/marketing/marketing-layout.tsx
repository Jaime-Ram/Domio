'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { AuthModalProvider, useAuthModal } from '@/providers/auth-modal-provider'
import { ArrowUpRight, Menu, X, User, ChevronDown, BookOpen, Mail, Phone, Copy, Headphones, Search, Building2, Users, FileText, Percent, Euro, Calculator, BarChart3, Wrench, ClipboardCheck, Scan } from 'lucide-react'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'

interface MarketingLayoutProps {
  children: React.ReactNode
}

function MarketingLayoutInner({ children }: MarketingLayoutProps) {
  const { openLogin, openSignup } = useAuthModal()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [functionsMenuOpen, setFunctionsMenuOpen] = useState(false)
  const [supportMenuOpen, setSupportMenuOpen] = useState(false)
  const [contactMenuOpen, setContactMenuOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<'kvk' | 'btw' | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const handleCopy = (text: string, field: 'kvk' | 'btw') => {
    void navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleHeaderMouseLeave = () => {
    if (!functionsMenuOpen && !supportMenuOpen && !contactMenuOpen) return
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setIsClosing(true)
    closeTimeoutRef.current = setTimeout(() => {
      setIsClosing(false)
      setFunctionsMenuOpen(false)
      setSupportMenuOpen(false)
      setContactMenuOpen(false)
      closeTimeoutRef.current = null
    }, 350)
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
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full bg-white flex-shrink-0 shadow-sm"
        onMouseLeave={handleHeaderMouseLeave}
        onMouseEnter={handleHeaderMouseEnter}
      >
        <div className="container mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#163300] hover:bg-gray-100 hover:text-[#163300] flex-shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1 flex justify-center md:justify-start md:flex-none md:flex-shrink-0">
            <Link href="/">
              <Logo width={100} height={28} />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-start pl-8">
            <div
              className="relative"
              onMouseEnter={() => { setFunctionsMenuOpen(true); setSupportMenuOpen(false); setContactMenuOpen(false); }}
            >
              <button type="button" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300] flex items-center gap-1 py-2">
                Functies
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${functionsMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div
              className="relative"
              onMouseEnter={() => { setSupportMenuOpen(true); setFunctionsMenuOpen(false); setContactMenuOpen(false); }}
            >
              <button type="button" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300] flex items-center gap-1 py-2">
                Ondersteuning
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${supportMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <Link href="/#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300]">
              Prijzen
            </Link>
            <div
              className="relative"
              onMouseEnter={() => { setContactMenuOpen(true); setFunctionsMenuOpen(false); setSupportMenuOpen(false); }}
            >
              <button type="button" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300] flex items-center gap-1 py-2">
                Contact
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${contactMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </nav>
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <Button
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 hover:text-[#163300]"
              onClick={openLogin}
            >
              Inloggen
            </Button>
            <Button
              className="bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 border border-[#9FE870]/20 rounded-xl"
              onClick={openSignup}
            >
              Registreren
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#163300] hover:bg-gray-100 hover:text-[#163300] flex-shrink-0"
            onClick={openLogin}
            aria-label="Account"
          >
            <User className="h-6 w-6" />
          </Button>
        </div>

        <div
          className={cn(
            'hidden md:block fixed top-16 left-0 right-0 bottom-0 z-40 pointer-events-none transition-opacity duration-350 backdrop-blur-sm bg-white/20',
            (functionsMenuOpen || supportMenuOpen || contactMenuOpen) && !isClosing ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        />
        <div
          className="hidden md:block absolute left-0 right-0 top-full z-50 overflow-hidden bg-white shadow-lg origin-top"
          style={{
            height: (functionsMenuOpen || supportMenuOpen || contactMenuOpen) && !isClosing ? (contactMenuOpen ? 260 : functionsMenuOpen ? 290 : 260) : 0,
            opacity: (functionsMenuOpen || supportMenuOpen || contactMenuOpen) && !isClosing ? 1 : 0,
            transform: (functionsMenuOpen || supportMenuOpen || contactMenuOpen) && !isClosing ? 'translateY(0)' : 'translateY(-12px)',
            pointerEvents: (functionsMenuOpen || supportMenuOpen || contactMenuOpen) && !isClosing ? 'auto' : 'none',
            transition: 'height 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <div className="absolute inset-x-0 top-0 bg-white" style={{ opacity: functionsMenuOpen ? 1 : 0, pointerEvents: functionsMenuOpen ? 'auto' : 'none', transition: 'opacity 200ms ease-out' }} aria-hidden={!functionsMenuOpen}>
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
                <Link key={item.title} href="/#features" className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors group dropdown-item-in flex gap-3 items-start">
                  <item.icon className="size-5 text-[#163300] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#163300]">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="absolute inset-x-0 top-0 bg-white" style={{ opacity: supportMenuOpen ? 1 : 0, pointerEvents: supportMenuOpen ? 'auto' : 'none', transition: 'opacity 200ms ease-out' }} aria-hidden={!supportMenuOpen}>
            <div className="mx-auto w-full max-w-7xl px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-12 gap-4 md:items-stretch">
              <div className="md:col-span-5 grid grid-cols-2 gap-x-8 gap-y-4 place-content-start md:min-h-[200px]">
                {[
                  { title: 'Kennisbank', desc: 'Antwoord op je vragen', icon: BookOpen },
                  { title: 'Support', desc: 'Stel je vragen', icon: Mail },
                  { title: 'Livesessies', desc: 'Leer meer over Domio', icon: Headphones },
                  { title: 'Vind je Expert', desc: 'Ondersteuning bij boekhouden', icon: Search },
                ].map((item, i) => (
                  <div key={item.title} className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start">
                    <item.icon className="size-5 text-[#163300] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#163300]">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="md:col-span-7 dropdown-item-in flex md:min-h-[200px]">
                <div className="rounded-2xl bg-[#163300] text-white px-7 py-6 flex flex-col justify-center min-h-[200px] w-full relative overflow-hidden">
                  <GeometricShapes variant="trapezoid" className="right-0 bottom-0 w-40 h-40" color="#9FE870" opacity={0.18} layers={2} />
                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <h3 className="text-3xl font-semibold tracking-tight leading-snug text-white">
                      Overstappen naar <span className="text-[#9FE870]">Domio</span>
                    </h3>
                    <p className="text-sm text-white/90 leading-6">Een nieuw platform? Geen gedoe, maar een slimme stap vooruit. Meer overzicht, minder gedoe.</p>
                    <Button size="default" className="bg-transparent border border-white text-white hover:bg-white/10 rounded-2xl font-semibold" asChild>
                      <Link href="/">Bekijk hoe je snel overstapt</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 top-0 bg-white" style={{ opacity: contactMenuOpen ? 1 : 0, pointerEvents: contactMenuOpen ? 'auto' : 'none', transition: 'opacity 200ms ease-out' }} aria-hidden={!contactMenuOpen}>
            <div className="mx-auto w-full max-w-7xl px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-12 gap-4 md:items-stretch">
              <div className="md:col-span-5 grid grid-cols-2 gap-x-8 gap-y-4 place-content-start md:min-h-[200px]">
                <a href="tel:+31646231696" className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors group dropdown-item-in flex gap-3 items-start">
                  <Phone className="size-5 text-[#163300] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#163300]">Telefoon</p>
                    <p className="text-xs text-gray-500 mt-0.5">+31 6 46 23 16 96</p>
                  </div>
                </a>
                <a href="mailto:contact@domiovastgoedbeheer.nl" className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors group dropdown-item-in flex gap-3 items-start">
                  <Mail className="size-5 text-[#163300] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#163300]">E-mail</p>
                    <p className="text-xs text-gray-500 mt-0.5">contact@domiovastgoedbeheer.nl</p>
                  </div>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy('92211542', 'kvk')}
                  className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start text-left w-full"
                >
                  <Copy className="size-5 text-[#163300] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#163300]">KVK</p>
                    <p className="text-xs text-gray-500 mt-0.5 tabular-nums">{copiedField === 'kvk' ? 'Gekopieerd!' : '92211542'}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy('NL003830384B29', 'btw')}
                  className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start text-left w-full"
                >
                  <Copy className="size-5 text-[#163300] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#163300]">BTW</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">{copiedField === 'btw' ? 'Gekopieerd!' : 'NL003830384B29'}</p>
                  </div>
                </button>
              </div>
              <div className="md:col-span-7 dropdown-item-in flex md:min-h-[200px]">
                <Link href="/contact" className="rounded-2xl bg-[#163300] text-white px-7 py-6 flex flex-col justify-center min-h-[200px] w-full relative overflow-hidden group">
                  <GeometricShapes variant="trapezoid" className="right-0 bottom-0 w-40 h-40" color="#9FE870" opacity={0.18} layers={2} />
                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <h3 className="text-3xl font-semibold tracking-tight leading-snug text-white">
                      Nog vragen?
                    </h3>
                    <p className="text-sm text-white/90 leading-6">Stel je vraag via het contactformulier. We helpen je graag verder.</p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#9FE870] group-hover:gap-3 transition-all">
                      Ga naar contactformulier
                      <ArrowUpRight className="h-4 w-4 shrink-0" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)} />
        <div className={`fixed inset-y-0 start-0 z-[60] bg-white border-r border-gray-200 transition-all duration-300 transform md:hidden w-64 h-full ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Logo width={100} height={28} />
              <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="bg-[#163300] rounded-xl p-4 mb-4 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-white mb-1">Probeer Domio</h3>
                  <p className="text-base font-semibold text-white mb-2">30 dagen gratis</p>
                  <p className="text-xs text-white/90 mb-3">Geen creditcard nodig, op elk moment opzegbaar.</p>
                  <Button className="bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 rounded-xl w-full text-sm" onClick={() => { openSignup(); setMobileMenuOpen(false) }}>
                    Registreren
                  </Button>
                </div>
                <GeometricShapes variant="trapezoid" className="right-0 bottom-0 w-40 h-40" color="#9FE870" opacity={0.12} layers={2} />
              </div>
              <div className="space-y-1 mb-4">
                <Link href="/#features" className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Functies</Link>
                <Link href="/#pricing" className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Prijzen</Link>
                <Link href="/contact" className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg !text-[#163300]" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </div>
              <div className="pt-2 mb-4">
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50 hover:text-[#163300]" onClick={() => { openLogin(); setMobileMenuOpen(false) }}>Inloggen</Button>
              </div>
              <div className="pt-4 mt-auto pb-4 border-t border-gray-200">
                <div className="flex flex-col gap-2 px-4">
                  <Link href="/privacy" className="text-xs text-gray-500 hover:text-[#163300] transition-colors" onClick={() => setMobileMenuOpen(false)}>Privacy</Link>
                  <Link href="/terms" className="text-xs text-gray-500 hover:text-[#163300] transition-colors" onClick={() => setMobileMenuOpen(false)}>Algemene voorwaarden</Link>
                  <Link href="/faq" className="text-xs text-gray-500 hover:text-[#163300] transition-colors" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="pt-16 flex flex-col flex-1">
        {children}
      </div>

    </div>
  )
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <AuthModalProvider>
      <MarketingLayoutInner>{children}</MarketingLayoutInner>
    </AuthModalProvider>
  )
}
