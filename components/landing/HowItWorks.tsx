const steps = [
  {
    n: "01",
    title: "Melding komt binnen",
    desc: "Via het huurdersportaal, e-mail of WhatsApp. Alles komt samen op één plek.",
  },
  {
    n: "02",
    title: "Assist trieert",
    desc: "Categorie, prioriteit en pand worden automatisch bepaald en gekoppeld.",
  },
  {
    n: "03",
    title: "De juiste vakman",
    desc: "Domio stelt de juiste vakman voor en stuurt de werkbon, jij keurt goed.",
  },
  {
    n: "04",
    title: "Bewaken en opvolgen",
    desc: "SLA's, status en communicatie worden bijgehouden tot de klus klaar is.",
  },
  {
    n: "05",
    title: "Factuur gematcht",
    desc: "De factuur wordt uitgelezen, aan de werkbon gekoppeld en klaargezet om te boeken.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-panel py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-grey-2">
            Zo werkt het
          </span>
          <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.5rem)] text-ink">
            Van melding tot factuur in vijf stappen.
          </h2>
          <p className="mt-4 text-[clamp(1rem,1.5vw,1.15rem)] text-grey">
            Elke stap draait automatisch. Jij keurt alleen de acties goed die er
            echt toe doen.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3 lg:grid-cols-5">
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col bg-panel p-6">
              <span className="font-mono text-[13px] text-lime-2">{s.n}</span>
              <span className="mt-8 text-[16px] font-medium text-ink">
                {s.title}
              </span>
              <span className="mt-2 text-[14px] leading-relaxed text-grey">
                {s.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
