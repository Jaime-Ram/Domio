import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { MarketingLayout } from '@/components/marketing/marketing-layout'
import { FooterSection } from '@/components/marketing/footer-section'

export const metadata: Metadata = {
  title: 'Beveiliging & Privacy | Domio',
  description:
    'Zo beschermen wij uw vastgoed- en persoonsgegevens. Domio werkt AVG-conform met versleutelde verbindingen, strikte toegangscontrole en veilige opslag binnen de EU.',
  alternates: { canonical: 'https://domiovastgoedbeheer.nl/privacy-en-beveiliging' },
  openGraph: {
    title: 'Beveiliging & Privacy | Domio',
    description: 'Zo beschermen wij uw gegevens. AVG-conform, HTTPS/TLS, rolgebaseerde toegang, EU-opslag.',
    url: 'https://domiovastgoedbeheer.nl/privacy-en-beveiliging',
  },
}

const MAATREGELEN = [
  {
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    titel: 'Versleutelde verbinding',
    tekst: 'Alle communicatie tussen uw browser en onze servers verloopt via HTTPS met TLS. Geüploade documenten en gegevens worden versleuteld opgeslagen.',
  },
  {
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    titel: 'Toegangscontrole',
    tekst: 'Gegevens zijn uitsluitend toegankelijk voor geautoriseerde gebruikers. Toegang is afgeschermd via rolgebaseerde rechten (RLS), zodat elke verhuurder en huurder alleen de eigen gegevens ziet.',
  },
  {
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
      </svg>
    ),
    titel: 'Europese dataopslag',
    tekst: 'Uw gegevens worden opgeslagen binnen de Europese Economische Ruimte (EER). Wij werken met Supabase (EU-regio) en Vercel (EU-regio) als infrastructuurpartners.',
  },
  {
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    titel: 'Bewaartermijnen',
    tekst: 'Gegevens worden niet langer bewaard dan noodzakelijk. Voor financiële en fiscale gegevens hanteren wij de wettelijke bewaarplicht van 7 jaar; overige persoonsgegevens verwijderen wij wanneer ze niet meer nodig zijn.',
  },
  {
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    titel: 'Verwerkersovereenkomsten',
    tekst: 'Met alle derde partijen die namens ons persoonsgegevens verwerken, sluiten wij schriftelijke verwerkersovereenkomsten conform AVG artikel 28.',
  },
  {
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
    titel: 'Datalekprocedure',
    tekst: 'Wij hanteren een interne procedure voor het signaleren en melden van datalekken. Bij een datalek dat rechten en vrijheden van betrokkenen riskeert, melden wij dit binnen 72 uur bij de Autoriteit Persoonsgegevens.',
  },
]

const RECHTEN = [
  { recht: 'Inzage', uitleg: 'U kunt opvragen welke persoonsgegevens wij van u verwerken.' },
  { recht: 'Rectificatie', uitleg: 'U kunt onjuiste gegevens laten corrigeren.' },
  { recht: 'Verwijdering', uitleg: 'U kunt verzoeken uw gegevens te wissen, tenzij wij een wettelijke bewaarplicht hebben.' },
  { recht: 'Beperking', uitleg: 'U kunt de verwerking van uw gegevens (tijdelijk) laten beperken.' },
  { recht: 'Overdraagbaarheid', uitleg: 'U kunt uw gegevens in een gangbaar formaat ontvangen om door te geven aan een andere partij.' },
  { recht: 'Bezwaar', uitleg: 'U kunt bezwaar maken tegen de verwerking van uw gegevens op basis van gerechtvaardigde belangen.' },
]

const SUBVERWERKERS = [
  { naam: 'Supabase', doel: 'Database, opslag en authenticatie', locatie: 'EU (Frankfurt)' },
  { naam: 'Vercel', doel: 'Hosting en infrastructuur', locatie: 'EU' },
  { naam: 'Resend', doel: 'Transactionele e-mail', locatie: 'EU' },
  { naam: 'Stripe', doel: 'Betalingsverwerking', locatie: 'EU (Ierland)' },
  { naam: 'Tink', doel: 'Open banking / rekeninginformatie', locatie: 'EU' },
]

export default function PrivacyEnBeveiligingPage() {
  return (
    <MarketingLayout>
      <main className="bg-white">

        {/* Hero */}
        <section className="bg-gray-50">
          <div className="mx-auto max-w-4xl px-6 md:px-8 py-16 lg:py-20">
            <div className="flex items-center gap-4 mb-6">
              <Image
                src="/images/gdpr-compliant.webp"
                alt="GDPR compliant"
                width={64}
                height={64}
                className="rounded-full shrink-0"
              />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] px-3 py-1 text-sm font-medium text-white">
                <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                AVG-conform
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#163300] md:text-5xl md:leading-[1.12]">
              Privacy en beveiliging
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-600 max-w-2xl">
              Wij beheren gevoelige gegevens van verhuurders en huurders. Transparantie over hoe wij die beschermen is voor ons geen bijzaak maar een kernverantwoordelijkheid.
            </p>
          </div>
        </section>

        {/* Technische maatregelen */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 md:px-8 py-14 lg:py-20">
            <h2 className="text-2xl font-semibold text-[#163300] mb-8">
              Technische en organisatorische maatregelen
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {MAATREGELEN.map((m) => (
                <div key={m.titel} className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center size-9 rounded-lg bg-[#163300]/8 text-[#163300] shrink-0">
                      {m.icon}
                    </span>
                    <h3 className="font-semibold text-[#163300]">{m.titel}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-500">{m.tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wat verwerken wij */}
        <section className="bg-gray-50">
          <div className="mx-auto max-w-4xl px-6 md:px-8 py-14 lg:py-20">
            <h2 className="text-2xl font-semibold text-[#163300] mb-4">
              Welke gegevens verwerken wij?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Wij verwerken uitsluitend gegevens die noodzakelijk zijn om uw vastgoedportefeuille te kunnen beheren:
            </p>
            <ul className="space-y-2 text-gray-600">
              {[
                'NAW-gegevens van verhuurders en huurders (naam, adres, e-mailadres, telefoonnummer)',
                'Vastgoedgegevens (panden, units, WOZ-waarde, energielabel)',
                'Huurcontracten, huurdersdossiers en correspondentie',
                'KvK-nummer en rechtsvorm van uw organisatie',
                'Betaal- en bankgegevens voor huurincasso en afrekeningen',
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <svg className="size-4 mt-0.5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-gray-500">
              Wij verkopen uw gegevens nooit aan derden en gebruiken ze uitsluitend voor de uitvoering van onze dienstverlening.
            </p>
          </div>
        </section>

        {/* Subverwerkers */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 md:px-8 py-14 lg:py-20">
            <h2 className="text-2xl font-semibold text-[#163300] mb-4">
              Subverwerkers
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Wij maken gebruik van de volgende derde partijen voor de verwerking van persoonsgegevens. Met elk van hen is een verwerkersovereenkomst gesloten.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-gray-700">Partij</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-700">Doel</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-700">Locatie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {SUBVERWERKERS.map((s) => (
                    <tr key={s.naam}>
                      <td className="px-5 py-3.5 font-medium text-gray-800">{s.naam}</td>
                      <td className="px-5 py-3.5 text-gray-600">{s.doel}</td>
                      <td className="px-5 py-3.5 text-gray-600">{s.locatie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Uw rechten */}
        <section className="bg-gray-50">
          <div className="mx-auto max-w-4xl px-6 md:px-8 py-14 lg:py-20">
            <h2 className="text-2xl font-semibold text-[#163300] mb-4">
              Uw rechten onder de AVG
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Als betrokkene heeft u de volgende rechten. U kunt deze uitoefenen door contact op te nemen via{' '}
              <a href="mailto:privacy@domiovastgoedbeheer.nl" className="text-[#163300] font-medium hover:underline">
                privacy@domiovastgoedbeheer.nl
              </a>.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {RECHTEN.map((r) => (
                <div key={r.recht} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
                  <p className="font-semibold text-[#163300] text-sm">{r.recht}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{r.uitleg}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-gray-500">
              U heeft ook het recht om een klacht in te dienen bij de{' '}
              <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-[#163300] font-medium hover:underline">
                Autoriteit Persoonsgegevens
              </a>.
              Wij geven altijd de voorkeur aan het eerst intern oplossen van eventuele bezwaren.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 md:px-8 py-14 lg:py-20">
            <h2 className="text-2xl font-semibold text-[#163300] mb-4">
              Contact over privacy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Heeft u vragen over de verwerking van uw persoonsgegevens of wilt u een recht uitoefenen? Neem dan contact op:
            </p>
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-6 py-5 text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">Domio Vastgoedbeheer</p>
              <p>KVK: 92211542</p>
              <p>
                E-mail:{' '}
                <a href="mailto:privacy@domiovastgoedbeheer.nl" className="text-[#163300] font-medium hover:underline">
                  privacy@domiovastgoedbeheer.nl
                </a>
              </p>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              Laatste update: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long' })}. Wij behouden het recht deze pagina te wijzigen. Raadpleeg regelmatig de meest actuele versie. Zie ook onze{' '}
              <Link href="/privacy" className="text-[#163300] hover:underline">volledige privacyverklaring</Link>.
            </p>
          </div>
        </section>

      </main>
      <FooterSection />
    </MarketingLayout>
  )
}
