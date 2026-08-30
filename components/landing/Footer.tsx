import Logo from "./Logo";

const columns = [
  {
    title: "Product",
    links: [
      "MJOP-generator",
      "Bouwdeel-herkenning",
      "NEN 2767-conditie",
      "Kostenraming",
      "Reservefonds-berekening",
      "DMJOP en verduurzaming",
      "PDF-export",
      "Domio Assist",
    ],
  },
  {
    title: "Voor wie",
    links: [
      "VvE's",
      "VvE-beheerders",
      "Vastgoedbeheerders",
      "Beleggers",
      "Makelaars",
      "Woningcorporaties",
    ],
  },
  {
    title: "Kennisbank",
    links: [
      "Blog",
      "Klantverhalen",
      "Handleidingen",
      "Helpcentrum",
      "Overzicht koppelingen",
      "Voor ontwikkelaars",
    ],
  },
  {
    title: "Bedrijf",
    links: ["Over Domio", "Klanten", "Vacatures", "Nieuws", "Beveiliging", "Contact"],
  },
];

export default function Footer() {
  return (
    <footer className="rounded-t-[40px] bg-forest px-6 pt-20 pb-10 text-paper lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 border-b border-white/10 pb-14 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-[14px] text-white/55">
              Dé AI-MJOP-tool van Nederland. Van adres tot meerjarenonderhoudsplan,
              wettelijk kloppend en klaar binnen 24 uur.
            </p>
            <a
              href="#"
              className="mt-6 inline-block rounded-lg bg-lime px-4 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-lime-2"
            >
              Maak je MJOP
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[13px] font-medium uppercase tracking-wide text-white/40">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[14px] text-white/70 transition-colors hover:text-lime"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-8 text-[13px] text-white/45 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Domio. Alle rechten voorbehouden.
          </p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Voorwaarden</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
