"use client";

import { useEffect, useState } from "react";

const stages = [
  "Ontvangen",
  "Getrieerd",
  "Vakman toegewezen",
  "Werkbon verstuurd",
  "Factuur gematcht",
];

const fields = [
  ["Categorie", "Loodgieter", 1],
  ["Prioriteit", "Hoog", 1],
  ["Pand", "Prinsengracht 42", 1],
  ["Vakman", "Loodgieter Jansen", 2],
  ["Werkbon", "WB-2043 verstuurd", 3],
  ["Factuur", "Gematcht aan werkbon", 4],
] as const;

const nav = ["Meldingen", "Werkbonnen", "Vaklieden", "Facturen", "Panden"];

export default function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0..5 vult de pijplijn, 6 en 7 houden het afgeronde resultaat even vast, dan opnieuw
    const t = setInterval(() => {
      setStep((s) => (s >= stages.length + 2 ? 0 : s + 1));
    }, 1300);
    return () => clearInterval(t);
  }, []);

  const activeStage = Math.min(step, stages.length - 1);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_24px_60px_-24px_rgba(15,23,42,0.25)]">
      {/* window chrome */}
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

      <div className="grid sm:grid-cols-[172px_1fr]">
        {/* sidebar */}
        <div className="hidden flex-col gap-0.5 border-r border-line p-3 sm:flex">
          {nav.map((n, i) => (
            <span
              key={n}
              className={`flex items-center gap-2 rounded-lg px-3 py-[7px] text-[13px] ${
                i === 0 ? "bg-panel font-medium text-ink" : "text-grey"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  i === 0 ? "bg-lime-2" : "bg-line"
                }`}
              />
              {n}
            </span>
          ))}
        </div>

        {/* main */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-medium text-ink">
                Melding #M-2043
              </div>
              <div className="text-[13px] text-grey">
                Lekkage keukenkraan · Prinsengracht 42
              </div>
            </div>
            <span className="rounded-full bg-lime px-3 py-1 text-[12px] font-medium text-forest">
              {stages[activeStage]}
            </span>
          </div>

          {/* pipeline */}
          <div className="mt-5 flex items-center gap-1.5">
            {stages.map((s, i) => (
              <div key={s} className="flex-1">
                <div className="h-1 overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full rounded-full bg-lime-2 transition-all duration-700 ease-out ${
                      i < activeStage
                        ? "w-full"
                        : i === activeStage
                          ? "w-full animate-pulse"
                          : "w-0"
                    }`}
                  />
                </div>
                <div
                  className={`mt-1.5 hidden text-[10px] transition-colors duration-500 lg:block ${
                    i <= activeStage ? "text-ink" : "text-grey-2"
                  }`}
                >
                  {s}
                </div>
              </div>
            ))}
          </div>

          {/* detail: report + extracted fields */}
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-xl bg-panel/60 p-4 ring-1 ring-line">
              <div className="text-[12px] uppercase tracking-wide text-grey-2">
                Melding
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink">
                De kraan in de keuken lekt en het water loopt op de vloer. Kan
                hier snel iemand naar kijken?
              </p>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-grey-2">
                <span className="h-5 w-5 rounded-full bg-paper ring-1 ring-line" />
                Huurder · zojuist
              </div>
            </div>

            <ul className="divide-y divide-line rounded-xl ring-1 ring-line">
              {fields.map(([label, value, at]) => {
                const filled = step >= at;
                return (
                  <li
                    key={label}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <span className="text-[13px] text-grey">{label}</span>
                    <span className="flex items-center gap-2">
                      {/* skeleton dat overgaat in de waarde */}
                      <span className="relative flex h-4 min-w-[96px] items-center justify-end">
                        <span
                          className={`absolute inset-y-0 right-0 my-auto h-2.5 w-16 rounded bg-panel transition-opacity duration-500 ${
                            filled ? "opacity-0" : "opacity-100"
                          }`}
                        />
                        <span
                          className={`text-[13px] font-medium text-ink transition-all duration-500 ease-out ${
                            filled
                              ? "translate-y-0 opacity-100"
                              : "translate-y-1 opacity-0"
                          }`}
                        >
                          {value}
                        </span>
                      </span>
                      <span
                        className={`grid h-4 w-4 place-items-center rounded-full bg-lime-2 text-forest transition-all duration-300 ease-out ${
                          filled ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        }`}
                      >
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                          <path d="M2 5.2 4.2 7.4 8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* action bar */}
          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl bg-forest p-4 text-paper sm:flex-row sm:items-center">
            <span className="text-[13px]">
              Assist stelt voor: werkbon versturen naar Loodgieter Jansen
            </span>
            <span className="flex shrink-0 gap-2">
              <span className="rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-medium">
                Aanpassen
              </span>
              <span className="rounded-lg bg-lime px-3 py-1.5 text-[13px] font-medium text-forest">
                Keuren
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
