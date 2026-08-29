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
            <span className="font-medium text-ink">Agents voor je onderhoud</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-grey">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Al je onderhoud geregeld onder een dak
          </h1>
          <p className="mt-5 max-w-lg text-lg text-grey md:text-xl">
            Beheer meldingen, huurders, compliance en financiën vanuit een platform. Domio-agents pakken het onderhoud van begin tot eind voor je op.
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
              className="h-12 shrink-0 rounded-xl bg-lime px-6 font-semibold text-forest transition hover:brightness-95"
            >
              Aan de slag
            </button>
          </form>
          <p className="mt-3 text-sm text-grey">Wij gaan zorgvuldig met je gegevens om.</p>
        </div>
      </div>

      {/* Rechterkant: foto + dashboard-mockup */}
      <div className="relative mt-16 w-full px-4 md:px-8 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-full lg:w-1/2 lg:overflow-hidden lg:px-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="absolute inset-0 size-full object-cover" src="/images/hero/hero-bg.webp" alt="" />
        <div className="relative mx-auto w-full max-w-xl lg:absolute lg:inset-x-0 lg:bottom-0 lg:h-[32rem] lg:max-w-none">
          <div className="w-full max-w-5xl rounded-2xl bg-white p-1 shadow-2xl ring-1 ring-line lg:absolute lg:-top-24 lg:left-16 lg:w-max">
            <div className="overflow-hidden rounded-xl ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Domio dashboard"
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
