/* Data-driven mega-menu panels in Ramp's stijl, met Domio-content. */

type Item = { title: string; desc: string };
type Group = { label: string; items: Item[] };
export type Menu = {
  columns: Group[];
  platform?: Group;
  featured?: { label: string; title: string; desc: string; word: string };
};

export const menus: Record<string, Menu> = {
  Product: {
    columns: [
      {
        label: "Onderhoud",
        items: [
          { title: "Meldingen", desc: "Automatisch getrieerd" },
          { title: "Werkbonnen", desc: "Van melding tot klaar" },
          { title: "Vaklieden aansturen", desc: "De juiste, automatisch" },
        ],
      },
      {
        label: "Facturen & budget",
        items: [
          { title: "Facturen matchen", desc: "Aan de werkbon gekoppeld" },
          { title: "Onderhoudsbudget", desc: "Bewaakt per pand" },
          { title: "Boekhouding", desc: "Automatisch geboekt" },
        ],
      },
      {
        label: "Beheer",
        items: [
          { title: "Portefeuille", desc: "Al je panden op orde" },
          { title: "Huurders", desc: "Portaal en tickets" },
          { title: "Compliance", desc: "Keuringen en WWS" },
        ],
      },
    ],
    platform: {
      label: "Platform",
      items: [
        { title: "Domio Assist", desc: "De agent die handelt" },
        { title: "WWS puntencheck", desc: "Punten in seconden" },
        { title: "Koppelingen", desc: "Sluit aan op je stack" },
        { title: "Rapportages", desc: "Inzicht in je onderhoud" },
        { title: "BAG koppeling", desc: "Adres en pandinfo" },
        { title: "Mobiele app", desc: "Beheer onderweg" },
      ],
    },
    featured: {
      label: "Uitgelicht",
      title: "Maak kennis met Domio Assist.",
      desc: "De agent die je meldingen opvangt, de vakman aanstuurt en de werkbon bijhoudt.",
      word: "Assist",
    },
  },
  "Voor wie": {
    columns: [
      {
        label: "Voor eigenaren",
        items: [
          { title: "Particuliere verhuurders", desc: "Een paar panden, moeiteloos" },
          { title: "Beleggers", desc: "Grip op je rendement" },
          { title: "VvE's", desc: "Beheer en communicatie" },
        ],
      },
      {
        label: "Voor professionals",
        items: [
          { title: "Vastgoedbeheerders", desc: "Beheer op schaal" },
          { title: "Makelaars", desc: "Verhuur en beheer" },
          { title: "Woningcorporaties", desc: "Compliance en WWS" },
        ],
      },
    ],
    featured: {
      label: "Uitgelicht",
      title: "Van 5 tot 5.000 panden.",
      desc: "Domio groeit met je mee, van particulier tot professioneel beheer.",
      word: "Domio",
    },
  },
  Oplossingen: {
    columns: [
      {
        label: "Per taak",
        items: [
          { title: "Melding afhandelen", desc: "Van intake tot vakman" },
          { title: "Vakman inplannen", desc: "Automatisch de juiste" },
          { title: "Factuur verwerken", desc: "Uitlezen en matchen" },
        ],
      },
      {
        label: "Per doel",
        items: [
          { title: "Tijd besparen", desc: "Minder handwerk" },
          { title: "Grip houden", desc: "Alles op één plek" },
          { title: "Compliance", desc: "Keuringen op tijd" },
        ],
      },
    ],
  },
  Kennisbank: {
    columns: [
      {
        label: "Leren",
        items: [
          { title: "Blog", desc: "Tips en updates" },
          { title: "Klantverhalen", desc: "Hoe anderen het doen" },
          { title: "Handleidingen", desc: "Aan de slag" },
        ],
      },
      {
        label: "Support",
        items: [
          { title: "Helpcentrum", desc: "Antwoorden en gidsen" },
          { title: "Webinars", desc: "Live en on-demand" },
          { title: "Voor ontwikkelaars", desc: "API en documentatie" },
        ],
      },
    ],
  },
};

/* A small rotating set of simple line icons */
const iconPaths = [
  "M3 7h14v8H3z M3 10h14", // card
  "M6 3h5l3 3v11H6z M11 3v3h3", // doc
  "M4 10a4 4 0 0 1 6-3l6 6-2 2-6-6a4 4 0 0 1-4 1z", // wrench-ish
  "M3 8l7-4 7 4M4 8v8h12V8", // bank
  "M4 15V9M9 15V5M14 15v-4", // chart
  "M7 4v5a3 3 0 0 0 6 0V4M10 12v4", // plug
  "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M3 10h14M10 3c2 2 2 12 0 14", // globe
  "M7 7l-3 3 3 3M13 7l3 3-3 3", // code
];

function MenuIcon({ i }: { i: number }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-panel text-ink">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d={iconPaths[i % iconPaths.length]}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ItemRow({ item, i }: { item: Item; i: number }) {
  return (
    <a
      href="#"
      className="dropdown-item-in group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-panel"
      style={{ animationDelay: `${40 + i * 22}ms` }}
    >
      <MenuIcon i={i} />
      <span>
        <span className="block text-[14px] font-medium text-ink">{item.title}</span>
        <span className="block text-[13px] text-grey">{item.desc}</span>
      </span>
    </a>
  );
}

export function MegaPanel({ menu }: { menu: Menu }) {
  let idx = 0;
  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
      <div
        className={`grid rounded-b-2xl border border-t-0 border-line bg-paper shadow-xl ${
          menu.featured ? "lg:grid-cols-[1fr_300px]" : "lg:grid-cols-1"
        }`}
      >
        {/* main area */}
        <div className="p-8">
          <div
            className="grid gap-x-8 gap-y-2"
            style={{ gridTemplateColumns: `repeat(${menu.columns.length}, minmax(0, 1fr))` }}
          >
            {menu.columns.map((col) => (
              <div key={col.label}>
                <div className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wide text-grey-2">
                  {col.label}
                </div>
                {col.items.map((it) => (
                  <ItemRow key={it.title} item={it} i={idx++} />
                ))}
              </div>
            ))}
          </div>

          {menu.platform && (
            <div className="mt-6 border-t border-line pt-6">
              <div className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wide text-grey-2">
                {menu.platform.label}
              </div>
              <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {menu.platform.items.map((it) => (
                  <ItemRow key={it.title} item={it} i={idx++} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* featured sidebar */}
        {menu.featured && (
          <div className="border-l border-line bg-panel/40 p-8">
            <div className="mb-4 text-[11px] font-medium uppercase tracking-wide text-grey-2">
              {menu.featured.label}
            </div>
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-panel-2">
              <span
                className="select-none text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-0.03em]"
                style={{
                  background: "linear-gradient(180deg, #161f13 55%, #94f477 125%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {menu.featured.word}
              </span>
            </div>
            <div className="mt-4 text-[15px] font-medium text-ink">
              {menu.featured.title}
            </div>
            <p className="mt-1 text-[14px] text-grey">{menu.featured.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
