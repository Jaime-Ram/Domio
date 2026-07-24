function Check() {
  return (
    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-lime-2 text-forest">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="M2 5.2 4.2 7.4 8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* --- mock visuals per rij --- */

function IntakeMock() {
  return (
    <div className="rounded-2xl bg-panel p-6 ring-1 ring-line">
      <div className="rounded-xl bg-paper p-4 ring-1 ring-line">
        <div className="text-[12px] uppercase tracking-wide text-grey-2">Nieuwe melding</div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink">
          De kraan in de keuken lekt en het water loopt op de vloer.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[["Loodgieter", true], ["Prioriteit hoog", true], ["Prinsengracht 42", true]].map(([t]) => (
            <span key={t as string} className="flex items-center gap-1.5 rounded-full bg-panel px-2.5 py-1 text-[12px] text-ink ring-1 ring-line">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-2" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DispatchMock() {
  return (
    <div className="rounded-2xl bg-panel p-6 ring-1 ring-line">
      <div className="rounded-xl bg-paper p-4 ring-1 ring-line">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-ink">Voorgestelde vakman</span>
          <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-medium text-forest">Beschikbaar</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-[13px] font-medium text-paper">LJ</span>
          <span>
            <span className="block text-[14px] font-medium text-ink">Loodgieter Jansen</span>
            <span className="block text-[12px] text-grey">Kan morgen langs · 4,9 ★</span>
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="flex-1 rounded-lg bg-forest py-2 text-center text-[13px] font-medium text-paper">Werkbon versturen</span>
          <span className="rounded-lg bg-panel px-3 py-2 text-[13px] font-medium text-ink ring-1 ring-line">Aanpassen</span>
        </div>
      </div>
    </div>
  );
}

function InvoiceMock() {
  return (
    <div className="rounded-2xl bg-panel p-6 ring-1 ring-line">
      <div className="overflow-hidden rounded-xl bg-paper ring-1 ring-line">
        <div className="flex items-center justify-between border-b border-line px-4 py-2 text-[11px] uppercase tracking-wide text-grey-2">
          <span>Factuur</span>
          <span className="text-grey">Gematcht</span>
        </div>
        {[["Loodgieter Jansen", "Werkbon WB-2043"], ["Materiaal", "€ 84,20"], ["Arbeid", "2 uur"]].map(([a, b]) => (
          <div key={a} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
            <span className="text-ink">{a}</span>
            <span className="flex items-center gap-2 text-grey">
              {b}
              <span className="grid h-4 w-4 place-items-center rounded-full bg-lime-2 text-forest">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M2 5.2 4.2 7.4 8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const rows = [
  {
    eyebrow: "Meldingen",
    title: "Elke melding automatisch getrieerd.",
    body: "Meldingen komen binnen via het portaal, e-mail of WhatsApp. Assist bepaalt categorie, prioriteit en pand, en koppelt alles aan het juiste dossier.",
    points: ["Eén inbox voor alle kanalen", "Automatische categorie en prioriteit", "Direct gekoppeld aan het pand"],
    Visual: IntakeMock,
  },
  {
    eyebrow: "Vaklieden",
    title: "De juiste vakman, zonder gebel.",
    body: "Domio stelt de best passende vakman voor op basis van categorie, regio en beschikbaarheid, stuurt de werkbon en houdt de planning bij. Jij keurt goed.",
    points: ["Slimme vakman-suggestie", "Werkbon met één klik", "Status en SLA bewaakt"],
    Visual: DispatchMock,
  },
  {
    eyebrow: "Facturen",
    title: "Facturen die zichzelf verwerken.",
    body: "De factuur wordt uitgelezen, gematcht aan de werkbon en klaargezet om te boeken. Geen handmatig overtypen, geen zoekgeraakte bonnen.",
    points: ["Automatisch uitlezen", "Gematcht aan de werkbon", "Klaar voor je boekhouding"],
    Visual: InvoiceMock,
  },
];

export default function FeatureRows() {
  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-grey-2">
            Het platform
          </span>
          <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.5rem)] text-ink">
            Alles voor onderhoud, van melding tot boeking.
          </h2>
        </div>

        <div className="mt-16 space-y-16 lg:space-y-24">
          {rows.map((r, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={r.eyebrow}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
              >
                <div className={flip ? "lg:order-2" : ""}>
                  <span className="text-[13px] font-medium uppercase tracking-wide text-lime-2">
                    {r.eyebrow}
                  </span>
                  <h3 className="display mt-3 text-[clamp(1.5rem,2.6vw,2rem)] text-ink">
                    {r.title}
                  </h3>
                  <p className="mt-4 text-[16px] leading-relaxed text-grey">
                    {r.body}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-[15px] text-ink">
                        <Check />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#"
                    className="mt-7 inline-flex items-center gap-2 text-[15px] font-medium text-ink hover:opacity-60"
                  >
                    Meer weten <span aria-hidden>&rarr;</span>
                  </a>
                </div>
                <div className={flip ? "lg:order-1" : ""}>
                  <r.Visual />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
