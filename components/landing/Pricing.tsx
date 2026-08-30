const tiers = [
  {
    name: "Preview",
    price: "Gratis",
    per: "",
    desc: "Zie je MJOP voordat je betaalt.",
    features: [
      "Volledige preview van je plan",
      "Bouwdelen en conditie in beeld",
      "Kostenraming op hoofdlijnen",
      "Geen creditcard nodig",
    ],
    cta: "Maak gratis preview",
    featured: false,
  },
  {
    name: "Per MJOP",
    price: "€299",
    per: "per plan",
    desc: "Eén compleet MJOP, klaar voor de vergadering.",
    features: [
      "Volledig MJOP als PDF",
      "NEN 2767-conditie per bouwdeel",
      "Kostenraming met indexering",
      "Reservefonds-berekening",
      "Wettelijk kloppend (art. 5:126 BW)",
    ],
    cta: "Maak je MJOP",
    featured: true,
  },
  {
    name: "Abonnement",
    price: "Op maat",
    per: "",
    desc: "Voor beheerders met meerdere panden of VvE's.",
    features: [
      "Meerdere panden en VvE's",
      "MJOP altijd actueel houden",
      "DMJOP met verduurzaming",
      "Dedicated onboarding",
    ],
    cta: "Neem contact op",
    featured: false,
  },
];

function Check() {
  return (
    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-lime-2 text-forest">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="M2 5.2 4.2 7.4 8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function Pricing() {
  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-grey-2">
            Prijzen
          </span>
          <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.5rem)] text-ink">
            Een fractie van wat een adviseur vraagt.
          </h2>
          <p className="mt-4 text-[clamp(1rem,1.5vw,1.15rem)] text-grey">
            Een adviseur rekent al snel 750 tot 2.500 euro. Bij Domio maak je
            gratis een preview en betaal je pas bij de PDF-export.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-2xl p-8 ${
                t.featured
                  ? "bg-forest text-paper ring-1 ring-forest"
                  : "bg-panel text-ink ring-1 ring-line"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium">{t.name}</span>
                {t.featured && (
                  <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-medium text-forest">
                    Populair
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="display text-[2.5rem]">{t.price}</span>
                {t.per && (
                  <span className={t.featured ? "text-[14px] text-white/60" : "text-[14px] text-grey"}>
                    {t.per}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-[14px] ${t.featured ? "text-white/70" : "text-grey"}`}>
                {t.desc}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px]">
                    <Check />
                    <span className={t.featured ? "text-white/85" : "text-ink"}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`mt-8 rounded-lg px-4 py-3 text-center text-[15px] font-medium transition-colors ${
                  t.featured
                    ? "bg-lime text-forest hover:bg-lime-2"
                    : "bg-forest text-paper hover:bg-forest-2"
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
