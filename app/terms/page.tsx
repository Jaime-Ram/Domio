import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95 dark:border-gray-800">
        <div className="container mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <Link href="/">
            <div className="py-2">
              <Logo width={150} height={40} />
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-[#002A1F] dark:text-gray-400 dark:hover:text-[#002A1F]"
          >
            Terug naar home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-12 text-4xl font-bold text-gray-900 dark:text-gray-100">
          Algemene Voorwaarden
        </h1>

        <div className="space-y-8">
          {/* Verantwoordelijkheid van Gebruikers */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Verantwoordelijkheid van Gebruikers
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Door gebruik te maken van Domio, stemt u in met deze algemene voorwaarden. U bent verantwoordelijk voor het correct gebruik van het platform en voor alle activiteiten die plaatsvinden onder uw account. U moet ervoor zorgen dat alle informatie die u verstrekt accuraat en up-to-date is.
              </p>
              <p>
                U mag het platform niet gebruiken voor illegale doeleinden of op een manier die de rechten van anderen schendt. U bent verantwoordelijk voor het beveiligen van uw account en voor alle activiteiten die plaatsvinden onder uw account.
              </p>
            </div>
          </section>

          {/* Gebruik van de Dienst */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gebruik van de Dienst
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Domio biedt een alles-in-één platform voor het beheren van vastgoedportefeuilles, huurovereenkomsten, huurders, financiën en onderhoud. U krijgt een licentie om de dienst te gebruiken in overeenstemming met deze voorwaarden. Deze licentie is niet-exclusief, niet-overdraagbaar en kan door ons worden ingetrokken als u deze voorwaarden schendt.
              </p>
            </div>
          </section>

          {/* Betalingen en Abonnementen */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Betalingen en Abonnementen
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Voor betaalde abonnementen gelden de prijzen zoals vermeld op onze website. Betalingen worden maandelijks of jaarlijks geïncasseerd, afhankelijk van uw gekozen abonnement. U kunt uw abonnement op elk moment opzeggen, maar er worden geen restituties verleend voor reeds betaalde periodes.
              </p>
              <p>
                Wij behouden ons het recht voor om prijzen te wijzigen met 30 dagen voorafgaande kennisgeving. Als u niet akkoord gaat met de nieuwe prijzen, kunt u uw abonnement opzeggen voordat de nieuwe prijzen van kracht worden.
              </p>
            </div>
          </section>

          {/* Wijzigingen in de Voorwaarden */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Wijzigingen in de Voorwaarden
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Wij behouden ons het recht voor om deze algemene voorwaarden op elk moment te wijzigen. Wijzigingen worden van kracht zodra ze op onze website worden gepubliceerd. Het is uw verantwoordelijkheid om regelmatig de voorwaarden te controleren op wijzigingen.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}




