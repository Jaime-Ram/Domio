"use client";

/**
 * Hero overgenomen uit de /site-omgeving (split-image): tekst + e-mail/CTA links,
 * foto met dashboard-mockup rechts. Zelfstandig nagebouwd in de Domio-brandtokens
 * (forest/lime), zonder externe UI-afhankelijkheden. Main's <Nav /> blijft erboven.
 */
export default function Hero() {
  return (
    <section className="relative bg-paper py-16 lg:flex lg:min-h-[44rem] lg:items-center lg:py-24">
      <div className="mx-auto flex w-full max-w-7xl items-center px-4 md:px-8">
        <div className="flex flex-col items-start md:max-w-3xl lg:w-1/2 lg:pr-8">
          {/* Badge */}
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pr-3 pl-1 text-sm shadow-sm transition hover:bg-panel"
          >
            <span className="rounded-full bg-forest px-2 py-0.5 text-xs font-semibold text-white">Nieuw</span>
            <span className="font-medium text-ink">AI die je MJOP opstelt</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-grey">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>

          <h1 className="display mt-5 text-[clamp(2.5rem,5vw,4.25rem)] text-ink">
            Jouw MJOP schrijft zichzelf
          </h1>
          <p className="mt-5 max-w-lg text-lg text-grey md:text-xl">
            Vul je adres in en Domio stelt een volledig MJOP op: bouwdelen, conditie, planning, kostenraming en reservefonds. Wettelijk kloppend en klaar binnen 24 uur, voor een fractie van de kosten van een adviseur.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex w-full max-w-lg flex-col gap-3 md:mt-10 md:flex-row md:items-center">
            <input
              type="email"
              required
              placeholder="Vul je e-mailadres in"
              className="h-12 w-full rounded-xl border border-line bg-white px-4 text-ink outline-none transition placeholder:text-grey/70 focus:border-forest focus:ring-2 focus:ring-forest/20"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-xl bg-lime px-6 font-medium text-forest transition hover:bg-lime-2"
            >
              Maak je MJOP
            </button>
          </form>
          <p className="mt-3 text-sm text-grey">Gratis preview van je plan. Je betaalt pas bij de PDF-export.</p>
        </div>
      </div>

      {/* Rechterkant: foto + dashboard-mockup */}
      <div className="relative mt-16 w-full px-4 md:px-8 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-full lg:w-1/2 lg:px-0">
        <div className="absolute inset-0 overflow-hidden rounded-l-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="absolute inset-0 size-full object-cover" src="/images/hero/hero-bg.webp" alt="" />
        </div>
        <div className="relative mx-auto w-full max-w-xl lg:absolute lg:inset-x-0 lg:bottom-0 lg:h-[32rem] lg:max-w-none">
          <div className="w-full max-w-5xl rounded-2xl bg-white p-1 shadow-2xl ring-1 ring-line lg:absolute lg:-top-24 lg:left-16 lg:w-max">
            <div className="overflow-hidden rounded-xl ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Domio MJOP-generator in beeld"
                src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-light-01.webp"
                className="object-cover object-left-top"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
