"use client";

import { useState } from "react";

const items = [
  {
    q: "Wat doet Domio precies?",
    a: "Domio vangt onderhoudsmeldingen op, trieert ze automatisch, stelt de juiste vakman voor en houdt werkbon en factuur bij. Jij keurt de acties goed die er echt toe doen.",
  },
  {
    q: "Blijf ik zelf de regie houden?",
    a: "Ja. Agents bereiden het werk voor, maar handelingen die iets versturen of betalen gaan altijd via jouw goedkeuring. Alles is transparant en terug te zien.",
  },
  {
    q: "Werkt Domio met mijn bestaande tools?",
    a: "Domio koppelt met je boekhouding, bank en andere tools. Facturen en betalingen worden automatisch gematcht aan de juiste werkbon.",
  },
  {
    q: "Voor wie is Domio geschikt?",
    a: "Van particuliere verhuurders met een paar panden tot professionele beheerders, VvE's en corporaties. Het platform groeit met je mee.",
  },
  {
    q: "Hoe snel ben ik live?",
    a: "Binnen enkele minuten. Je maakt een account aan, voegt je panden toe en kunt direct meldingen laten binnenkomen.",
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
