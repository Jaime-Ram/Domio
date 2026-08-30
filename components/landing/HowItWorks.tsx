const steps = [
  {
    n: "01",
    title: "Vul je adres in",
    desc: "De pandgegevens laden automatisch via de BAG. Bouwjaar, oppervlakte en type pand staan er meteen bij.",
  },
  {
    n: "02",
    title: "De AI stelt je plan op",
    desc: "Domio herkent de bouwdelen, bepaalt de conditie volgens NEN 2767, en berekent cycli en kosten.",
  },
  {
    n: "03",
    title: "Download je MJOP",
    desc: "Je krijgt een nette PDF: wettelijk kloppend, met kostenraming en reservefonds, klaar voor de vergadering.",
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
            Van adres tot MJOP in drie stappen.
          </h2>
          <p className="mt-4 text-[clamp(1rem,1.5vw,1.15rem)] text-grey">
            Geen weken wachten op een adviseur. Je plan staat er in minuten,
            onderbouwd en klaar om te delen.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
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
