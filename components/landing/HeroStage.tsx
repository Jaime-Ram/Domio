"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const actions = [
  { label: "Melding getrieerd", detail: "Lekkage · loodgieter · prioriteit hoog" },
  { label: "Vakman toegewezen", detail: "Loodgieter Jansen · kan morgen langs" },
  { label: "Werkbon verstuurd", detail: "WB-2043 · naar de vakman" },
  { label: "Factuur gematcht", detail: "€ 84,20 · gekoppeld aan de werkbon" },
  { label: "Opgelost binnen SLA", detail: "Doorlooptijd 22 uur · geboekt" },
] as const;

const stats = [
  { label: "Meldingen", base: 142 },
  { label: "Vaklieden", base: 38 },
  { label: "Facturen", base: 96 },
];

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 5.2 4.2 7.4 8 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroStage() {
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState(stats.map((s) => s.base));
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    const t = setInterval(() => setStep((v) => (v + 1) % actions.length), 2400);
    const c = setInterval(
      () => setCounts((cs) => cs.map((n) => n + (Math.random() < 0.7 ? 1 : 0))),
      1100
    );
    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, []);

  // nieuwe bar-hoogtes bij elke stap (her-animeren)
  useEffect(() => {
    setBars(Array.from({ length: 9 }, () => 30 + Math.round(Math.random() * 70)));
  }, [step]);

  return (
    <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-panel p-6 ring-1 ring-line" style={{ minHeight: 540 }}>
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-40" />

      <div className="relative w-full max-w-lg rounded-2xl bg-paper p-6 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.32)] ring-1 ring-line">
        {/* header met pulserend bolletje */}
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium text-ink">Domio Assist</span>
          <span className="flex items-center gap-1.5 rounded-full bg-panel px-2.5 py-1 text-[11px] font-medium text-ink">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-2" />
            live
          </span>
        </div>

        {/* huidige actie: fade + slide crossfade */}
        <div className="mt-5 h-14 overflow-hidden rounded-xl bg-panel/70 px-4 ring-1 ring-line">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-14 items-center gap-3"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.1 }}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime-2 text-forest"
              >
                <CheckIcon />
              </motion.span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium text-ink">
                  {actions[step].label}
                </span>
                <span className="block truncate text-[12px] text-grey">
                  {actions[step].detail}
                </span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* pijplijn: segmenten vullen */}
        <div className="mt-4 flex gap-1.5">
          {actions.map((_, k) => (
            <div key={k} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-lime-2"
                initial={false}
                animate={{ width: k <= step ? "100%" : "0%" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>

        {/* tellende stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <div key={s.label} className="rounded-xl bg-panel/70 p-3 ring-1 ring-line">
              <div className="font-mono text-[22px] tabular-nums text-ink">
                {counts[i]}
              </div>
              <div className="mt-0.5 text-[12px] text-grey">{s.label}</div>
            </div>
          ))}
        </div>

        {/* mini bar-chart: staggered groeien, her-animeert per stap */}
        <div className="mt-6 flex h-16 items-end gap-1.5">
          {bars.map((h, k) => (
            <motion.div
              key={`${step}-${k}`}
              className="flex-1 rounded-t bg-forest/10"
              initial={{ height: 4 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: k * 0.04 }}
            >
              <motion.div
                className="h-full w-full rounded-t bg-lime-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: k % 3 === 0 ? 1 : 0.25 }}
                transition={{ delay: k * 0.04 + 0.2 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
