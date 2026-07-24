import Logo from "./Logo";

const columns = [
  {
    title: "Product",
    links: [
      "Onderhoudsmeldingen",
      "Werkbonnen",
      "Vaklieden aansturen",
      "Facturen matchen",
      "Domio Assist",
      "Compliance en keuringen",
      "Portefeuille",
      "Koppelingen",
    ],
  },
  {
    title: "Voor wie",
    links: [
      "Particuliere verhuurders",
      "Vastgoedbeheerders",
      "Beleggers",
      "VvE's",
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
              Van melding tot factuur. Agents doen het onderhoudswerk, jij houdt
              de regie.
            </p>
            <a
              href="#"
              className="mt-6 inline-block rounded-lg bg-lime px-4 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-lime-2"
            >
              Gratis starten
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
