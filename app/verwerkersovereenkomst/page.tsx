import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingLayout } from '@/components/marketing/marketing-layout'
import { FooterSection } from '@/components/marketing/footer-section'

export const metadata: Metadata = {
  title: 'Verwerkersovereenkomst | Domio',
  description:
    'De verwerkersovereenkomst (DPA) van Domio conform AVG artikel 28: rollen, verplichtingen, beveiliging, subverwerkers en bewaartermijnen.',
  alternates: { canonical: 'https://domiovastgoedbeheer.nl/verwerkersovereenkomst' },
}

const SUBVERWERKERS = [
  { naam: 'Supabase', doel: 'Database, opslag en authenticatie', locatie: 'EU (Frankfurt)' },
  { naam: 'Vercel', doel: 'Hosting en infrastructuur', locatie: 'EU' },
  { naam: 'Resend', doel: 'Transactionele e-mail', locatie: 'EU' },
  { naam: 'Stripe', doel: 'Betalingsverwerking', locatie: 'EU (Ierland)' },
  { naam: 'Tink', doel: 'Open banking / rekeninginformatie', locatie: 'EU' },
]

const ARTIKELEN: { titel: string; alineas: string[] }[] = [
  {
    titel: '1. Definities en rolverdeling',
    alineas: [
      'In deze overeenkomst is de klant (de verhuurder of vastgoedbeheerder) de verwerkingsverantwoordelijke en is Domio Vastgoedbeheer de verwerker, zoals bedoeld in de Algemene Verordening Gegevensbescherming (AVG).',
      'Domio verwerkt persoonsgegevens uitsluitend in opdracht en volgens de schriftelijke instructies van de klant, behalve wanneer een wettelijke verplichting anders bepaalt.',
    ],
  },
  {
    titel: '2. Onderwerp, aard en duur',
    alineas: [
      'De verwerking betreft het beheer van een vastgoedportefeuille via het Domio-platform: het vastleggen en beheren van panden, huurders, huurcontracten, documenten, financiën en communicatie.',
      'Deze overeenkomst geldt voor de duur van de dienstverleningsovereenkomst tussen de klant en Domio en eindigt automatisch bij beëindiging daarvan.',
    ],
  },
  {
    titel: '3. Soorten persoonsgegevens en betrokkenen',
    alineas: [
      'Categorieën betrokkenen: verhuurders, huurders en contactpersonen.',
      'Categorieën gegevens: NAW-gegevens, contactgegevens, vastgoedgegevens, huurcontracten en -dossiers, betaal- en bankgegevens, en correspondentie.',
    ],
  },
  {
    titel: '4. Verplichtingen van Domio als verwerker',
    alineas: [
      'Domio verwerkt de gegevens uitsluitend op instructie van de klant en voor de in artikel 2 genoemde doeleinden.',
      'Domio waarborgt dat personen die toegang hebben tot de gegevens tot geheimhouding zijn verplicht.',
      'Domio treft passende technische en organisatorische maatregelen conform AVG artikel 32 (zie onze pagina Beveiliging & Privacy).',
      'Domio verleent de klant redelijke bijstand bij het beantwoorden van verzoeken van betrokkenen en bij beoordelingen zoals een DPIA.',
    ],
  },
  {
    titel: '5. Subverwerkers',
    alineas: [
      'De klant geeft Domio algemene toestemming om de onderstaande subverwerkers in te schakelen. Domio sluit met elke subverwerker een verwerkersovereenkomst met ten minste dezelfde verplichtingen.',
      'Domio informeert de klant bij voorgenomen wijzigingen in de subverwerkers, zodat de klant hiertegen bezwaar kan maken.',
    ],
  },
  {
    titel: '6. Doorgifte buiten de EER',
    alineas: [
      'Persoonsgegevens worden in beginsel verwerkt binnen de Europese Economische Ruimte (EER). Vindt doorgifte naar een derde land plaats, dan gebeurt dit uitsluitend met passende waarborgen, zoals de standaardcontractbepalingen van de Europese Commissie.',
    ],
  },
  {
    titel: '7. Datalekken',
    alineas: [
      'Domio informeert de klant zonder onredelijke vertraging na kennisname van een inbreuk in verband met persoonsgegevens, met de informatie die de klant nodig heeft om aan zijn meldplicht te voldoen.',
    ],
  },
  {
    titel: '8. Bewaartermijnen, teruggave en verwijdering',
    alineas: [
      'Na beëindiging van de overeenkomst verwijdert of retourneert Domio op verzoek van de klant alle persoonsgegevens, tenzij een wettelijke bewaarplicht (zoals de fiscale bewaartermijn van 7 jaar) anders vereist.',
      'De klant kan de gegevens te allen tijde zelf exporteren via de exportfunctie in het platform.',
    ],
  },
  {
    titel: '9. Audits',
    alineas: [
      'Domio stelt de klant op redelijk verzoek de informatie ter beschikking die nodig is om naleving van deze overeenkomst aan te tonen, en werkt mee aan audits binnen redelijke grenzen.',
    ],
  },
]

export default function VerwerkersovereenkomstPage() {
  return (
    <MarketingLayout>
      <main className="bg-white">

        {/* Hero */}
        <section className="bg-gray-50">
          <div className="mx-auto max-w-4xl px-6 md:px-8 py-16 lg:py-20">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1d3014] px-3 py-1 text-sm font-medium text-white mb-6">
              AVG artikel 28
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-[#1d3014] md:text-5xl md:leading-[1.12]">
              Verwerkersovereenkomst
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-600 max-w-2xl">
              Wanneer u Domio gebruikt om uw vastgoedportefeuille te beheren, verwerken wij namens u persoonsgegevens van onder meer uw huurders. Deze verwerkersovereenkomst legt vast hoe wij dat doen.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 md:px-8 pt-10">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              <strong>Concept.</strong> Deze tekst is een modelovereenkomst en nog niet juridisch gecontroleerd. Laat de definitieve versie toetsen door een jurist voordat u deze met klanten gebruikt.
            </div>
          </div>
        </section>

        {/* Artikelen */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 md:px-8 py-12 lg:py-16 space-y-10">
            {ARTIKELEN.map((art) => (
              <div key={art.titel}>
                <h2 className="text-xl font-semibold text-[#1d3014] mb-3">{art.titel}</h2>
                <div className="space-y-3">
                  {art.alineas.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-gray-600">{p}</p>
                  ))}
                </div>

                {art.titel.startsWith('5.') && (
                  <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
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
                )}
              </div>
            ))}

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-5 text-sm text-gray-600">
              <p>
                Vragen over deze overeenkomst? Mail naar{' '}
                <a href="mailto:privacy@domiovastgoedbeheer.nl" className="text-[#1d3014] font-medium hover:underline">
                  privacy@domiovastgoedbeheer.nl
                </a>. Zie ook onze{' '}
                <Link href="/privacy-en-beveiliging" className="text-[#1d3014] font-medium hover:underline">
                  pagina Beveiliging &amp; Privacy
                </Link>.
              </p>
            </div>
          </div>
        </section>

      </main>
      <FooterSection />
    </MarketingLayout>
  )
}
