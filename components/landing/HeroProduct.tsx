"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const steps = [
  {
    stage: "Ontvangen",
    status: "Nieuwe melding",
    body: "De kraan in de keuken lekt en het water loopt op de vloer. Kan hier snel iemand naar kijken?",
    meta: "Huurder · Prinsengracht 42 · zojuist",
  },
  {
    stage: "Getrieerd",
    status: "Automatisch getrieerd",
    body: "Assist herkent dit als een loodgietersklus met hoge prioriteit en koppelt het aan het juiste pand.",
    meta: "Categorie: Loodgieter · Prioriteit: Hoog",
  },
  {
    stage: "Vakman toegewezen",
    status: "Vakman voorgesteld",
    body: "Loodgieter Jansen is beschikbaar en kan morgen langskomen. Assist zet de opdracht klaar.",
    meta: "Loodgieter Jansen · 4,9 ★ · beschikbaar",
  },
  {
    stage: "Werkbon verstuurd",
    status: "Werkbon WB-2043",
    body: "De werkbon is opgesteld en verstuurd naar de vakman. Jij hebt alleen goedgekeurd.",
    meta: "Kraan keuken vervangen · 2 uur",
  },
  {
    stage: "Factuur gematcht",
    status: "Klaar om te boeken",
    body: "De factuur van € 84,20 is uitgelezen en automatisch gematcht aan de werkbon.",
    meta: "€ 84,20 · gematcht aan WB-2043",
  },
] as const;

function Check() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 5.2 4.2 7.4 8 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroProduct() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % steps.length), 2800);
    return () => clearInterval(t);
  }, []);

  const s = steps[i];
  const last = i === steps.length - 1;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-panel p-5 ring-1 ring-line sm:p-8" style={{ minHeight: 560 }}>
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-40" />

      <div className="relative mx-auto flex h-full max-w-2xl items-center">
        <div className="w-full overflow-hidden rounded-2xl bg-paper shadow-[0_30px_70px_-30px_rgba(0,0,0,0.32)] ring-1 ring-line">
          {/* venster-chrome */}
          <div className="flex items-center justify-between border-b border-line bg-panel/60 px-4 py-2.5">
            <span className="flex items-center gap-3">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-line" />
                <span className="h-2.5 w-2.5 rounded-full bg-line" />
                <span className="h-2.5 w-2.5 rounded-full bg-line" />
              </span>
              <span className="text-[12px] font-medium text-grey">Domio · Onderhoud</span>
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-line">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-2" />
              Assist actief
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[15px] font-medium text-ink">Melding #M-2043</div>
                <div className="text-[13px] text-grey">Lekkage keukenkraan</div>
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={s.stage}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-full bg-lime px-3 py-1 text-[12px] font-medium text-forest"
                >
                  {s.stage}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* stepper */}
            <div className="mt-6 flex items-center">
              {steps.map((st, k) => (
                <div key={st.stage} className="flex flex-1 items-center last:flex-none">
                  <div
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors duration-500 ${
                      k <= i ? "bg-lime-2 text-forest" : "bg-panel text-transparent ring-1 ring-line"
                    }`}
                  >
                    <motion.span
                      key={`${k}-${k <= i}`}
                      initial={k <= i ? { scale: 0 } : false}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    >
                      <Check />
                    </motion.span>
                  </div>
                  {k < steps.length - 1 && (
                    <div className="mx-1.5 h-0.5 flex-1 overflow-hidden rounded-full bg-line">
                      <motion.div
                        className="h-full rounded-full bg-lime-2"
                        initial={false}
                        animate={{ width: k < i ? "100%" : "0%" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* detail die crossfade't */}
            <div className="mt-6 min-h-[120px] rounded-xl bg-panel/60 p-5 ring-1 ring-line">
              <AnimatePresence mode="wait">
                <motion.div
                  key={s.stage}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="text-[12px] uppercase tracking-wide text-grey-2">
                    {s.status}
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink">{s.body}</p>
                  <div className="mt-3 text-[12px] font-medium text-grey">{s.meta}</div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* actiebalk */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-forest px-4 py-3 text-paper">
              <span className="flex items-center gap-2 text-[13px]">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-lime text-forest">
                  <Check />
                </span>
                {last ? "Loop afgerond, jij hield de regie" : "Assist bereidt de volgende stap voor"}
              </span>
              <span className="shrink-0 rounded-lg bg-lime px-3 py-1.5 text-[13px] font-medium text-forest">
                {last ? "Klaar" : "Keuren"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
