"use client";

import { useState } from "react";

const items = [
  {
    q: "Is een MJOP verplicht?",
    a: "Voor VvE's wel. Volgens art. 5:126 BW moet je reserveren voor onderhoud, en dat kan op basis van een MJOP of via een vast bedrag van 0,5% van de herbouwwaarde per jaar. Met een MJOP reserveer je gericht in plaats van een grove vuistregel.",
  },
  {
    q: "Hoe accuraat is de AI?",
    a: "De AI werkt met je pandgegevens uit de BAG en de NEN 2767-conditiesystematiek, en is getraind op duizenden bouwdelen en onderhoudscycli. Je ziet elke aanname terug in het plan en kunt bouwdelen, condities en kosten zelf bijstellen voordat je exporteert.",
  },
  {
    q: "Kan ik dit gebruiken voor mijn VvE en reservefonds?",
    a: "Ja. Domio stelt het MJOP op inclusief kostenraming en een reservefonds-berekening, zodat je onderbouwd kunt reserveren en het plan klaar is voor de vergadering.",
  },
  {
    q: "Wat kost het?",
    a: "Een preview is gratis. Een volledig MJOP als PDF kost vanaf 299 euro per plan. Beheer je meerdere panden of VvE's, dan is er een abonnement op maat. Een adviseur vraagt al snel 750 tot 2.500 euro.",
  },
  {
    q: "Hoe houd ik het plan actueel?",
    a: "Je MJOP blijft in Domio staan en je werkt het met een paar klikken bij zodra er iets verandert of onderhoud is uitgevoerd. Zo blijft je planning en reservefonds altijd kloppen.",
  },
  {
    q: "Zijn mijn gegevens veilig?",
    a: "Ja. Domio draait op Nederlandse hosting, is AVG-proof en deelt geen onnodige gegevens met derden.",
  },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M4 6 8 10 12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-panel py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="text-[13px] font-medium uppercase tracking-wide text-grey-2">
              Veelgestelde vragen
            </span>
            <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.5rem)] text-ink">
              Alles wat je wilt weten.
            </h2>
            <p className="mt-4 text-[15px] text-grey">
              Staat je vraag er niet bij?{" "}
              <a href="#" className="font-medium text-forest underline underline-offset-2">
                Neem contact op
              </a>
              .
            </p>
          </div>

          <div className="divide-y divide-line border-y border-line">
            {items.map((it, i) => {
              const isOpen = open === i;
              return (
                <div key={it.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left text-ink"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[16px] font-medium">{it.q}</span>
                    <Chevron open={isOpen} />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 pr-8 text-[15px] leading-relaxed text-grey">
                        {it.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
