const tiers = [
  {
    name: "Starter",
    price: "€29",
    per: "per maand",
    desc: "Voor particuliere verhuurders met een paar panden.",
    features: [
      "Tot 10 eenheden",
      "Onderhoudsmeldingen en werkbonnen",
      "Huurdersportaal",
      "E-mail support",
    ],
    cta: "Gratis starten",
    featured: false,
  },
  {
    name: "Groei",
    price: "€89",
    per: "per maand",
    desc: "Voor beheerders die willen opschalen met agents.",
    features: [
      "Tot 100 eenheden",
      "Domio Assist (agent)",
      "Facturen matchen en boekhouding",
      "Vaklieden aansturen",
      "Prioriteit support",
    ],
    cta: "Vraag demo aan",
    featured: true,
  },
  {
    name: "Pro",
    price: "Op maat",
    per: "",
    desc: "Voor professionele portefeuilles en corporaties.",
    features: [
      "Onbeperkt eenheden",
      "Koppelingen en API",
      "Compliance en WWS",
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
            Eén prijs voor je hele onderhoud.
          </h2>
          <p className="mt-4 text-[clamp(1rem,1.5vw,1.15rem)] text-grey">
            Geen setup-kosten. Maandelijks opzegbaar. Betaal per eenheid naarmate
            je groeit.
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
