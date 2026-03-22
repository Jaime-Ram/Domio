'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { ArrowUpRight, Menu, X, User, ChevronDown, Mail, Phone, Copy, Search, Building2, Users, FileText, Percent, Euro, Calculator, BarChart3, Wrench, ClipboardCheck, Scan, HelpCircle, MessageCircle } from 'lucide-react'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'
import { CONTACT_EMAIL } from '@/lib/site-config'

interface MarketingLayoutProps {
  children: React.ReactNode
}

function MarketingLayoutInner({ children }: MarketingLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [functionsMenuOpen, setFunctionsMenuOpen] = useState(false)
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<'kvk' | 'btw' | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const handleCopy = (text: string, field: 'kvk' | 'btw') => {
    void navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleHeaderMouseLeave = () => {
    if (!functionsMenuOpen && !helpMenuOpen) return
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setIsClosing(true)
    closeTimeoutRef.current = setTimeout(() => {
      setIsClosing(false)
      setFunctionsMenuOpen(false)
      setHelpMenuOpen(false)
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
            <Logo width={100} height={28} />
          </div>
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-start pl-8">
            <div
              className="relative"
              onMouseEnter={() => { setFunctionsMenuOpen(true); setHelpMenuOpen(false); }}
            >
              <button type="button" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300] flex items-center gap-1 py-2">
                Functies
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${functionsMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <Link href="/#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300]">
              Prijzen
            </Link>
            <Link href="/blog" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#163300]">
              Kennisbank
            </Link>
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
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#163300] rounded-full px-4 py-2">
              <Link href="/login">Inloggen</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full !bg-[#9FE870] !text-[#163300] hover:!bg-[#9FE870]/90 border-0 px-4 py-2 text-sm font-semibold shadow-sm">
              <Link href="/registreren">Registreren</Link>
            </Button>
          </div>
          <Button asChild variant="ghost" size="icon" className="md:hidden text-[#163300] hover:bg-gray-100 hover:text-[#163300] flex-shrink-0" aria-label="Account">
            <Link href="/login"><User className="h-6 w-6" /></Link>
          </Button>
        </div>

        <div
          className={cn(
            'hidden md:block fixed top-16 left-0 right-0 bottom-0 z-40 pointer-events-none transition-opacity duration-350 backdrop-blur-sm bg-white/20',
            (functionsMenuOpen || helpMenuOpen) && !isClosing ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        />
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
                <Link key={item.title} href="/functies" className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors group dropdown-item-in flex gap-3 items-start">
                  <item.icon className="size-5 text-[#163300] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#163300]">{item.title}</p>
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
          <div className="absolute inset-x-0 top-0 bg-white" style={{ opacity: helpMenuOpen ? 1 : 0, pointerEvents: helpMenuOpen ? 'auto' : 'none', transition: 'opacity 200ms ease-out' }} aria-hidden={!helpMenuOpen}>
            <div className="mx-auto w-full max-w-7xl px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-2 gap-6 md:items-stretch">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 place-content-start md:min-h-[200px]">
                <Link href="/hulp" className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start">
                  <MessageCircle className="size-5 text-[#163300] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#163300]">Klantenservice</p>
                    <p className="text-xs text-gray-500 mt-0.5">Live chat, telefoon &amp; e-mail</p>
                  </div>
                </Link>
                <Link href="/faq" className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors group dropdown-item-in flex gap-3 items-start">
                  <HelpCircle className="size-5 text-[#163300] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#163300]">Veelgestelde vragen</p>
                    <p className="text-xs text-gray-500 mt-0.5">Antwoord op veelgestelde vragen</p>
                  </div>
                </Link>
                <a
                  href="tel:+31646231696"
                  className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors group dropdown-item-in flex gap-3 items-start"
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
                <button type="button" onClick={() => handleCopy('92211542', 'kvk')} className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start text-left w-full">
                  <Copy className="size-5 text-[#163300] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#163300]">KVK</p>
                    <p className="text-xs text-gray-500 mt-0.5 tabular-nums">{copiedField === 'kvk' ? 'Gekopieerd!' : '92211542'}</p>
                  </div>
                </button>
                <button type="button" onClick={() => handleCopy('NL003830384B29', 'btw')} className="py-2.5 px-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group dropdown-item-in flex gap-3 items-start text-left w-full">
                  <Copy className="size-5 text-[#163300] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#163300]">BTW</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">{copiedField === 'btw' ? 'Gekopieerd!' : 'NL003830384B29'}</p>
                  </div>
                </button>
              </div>
              <div className="dropdown-item-in flex md:min-h-[200px]">
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
                  <Button asChild className="bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 rounded-xl w-full text-sm">
                    <Link href="/registreren" onClick={() => setMobileMenuOpen(false)}>Registreren</Link>
                  </Button>
                </div>
                <GeometricShapes variant="trapezoid" className="right-0 bottom-0 w-40 h-40" color="#9FE870" opacity={0.12} layers={2} />
              </div>
              <div className="space-y-1 mb-4">
                <Link href="/functies" className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Functies</Link>
                <Link href="/#pricing" className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Prijzen</Link>
                <Link href="/blog" className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Kennisbank</Link>
                <Link href="/hulp" className="block py-3.5 px-4 text-base font-medium text-[#163300] transition-colors hover:bg-gray-50 rounded-lg !text-[#163300]" onClick={() => setMobileMenuOpen(false)}>Hulp & Contact</Link>
              </div>
              <div className="pt-2 mb-4">
                <Button asChild variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50 hover:text-[#163300]">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Inloggen</Link>
                </Button>
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
  return <MarketingLayoutInner>{children}</MarketingLayoutInner>
}
