const quotes = [
  {
    q: "Sinds Domio komt geen enkele melding meer tussen wal en schip. De juiste vakman staat klaar voordat ik er zelf aan denk.",
    name: "Mark de Vries",
    role: "Directeur",
    company: "Vastgoedbeheer West",
  },
  {
    q: "We beheren nu twee keer zoveel panden met hetzelfde team. Het routinewerk is gewoon weg.",
    name: "Sanne Bakker",
    role: "Vastgoedbeheerder",
    company: "Bakker Vastgoed",
  },
  {
    q: "Facturen die zichzelf matchen aan de werkbon, dat scheelt ons dagen per maand aan administratie.",
    name: "Youssef El Amrani",
    role: "Financieel manager",
    company: "Rotsvast Amsterdam",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-grey-2">
            Klanten
          </span>
          <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.5rem)] text-ink">
            Beheerders die de regie terugkregen.
          </h2>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {quotes.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-2xl bg-panel p-8 ring-1 ring-line"
            >
              <blockquote className="text-[17px] leading-snug text-ink">
                &ldquo;{t.q}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-forest text-[14px] font-medium text-paper">
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span>
                  <span className="block text-[14px] font-medium text-ink">
                    {t.name}
                  </span>
                  <span className="block text-[13px] text-grey">
                    {t.role}, {t.company}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
