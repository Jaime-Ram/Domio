"use client";

/* Klein kaartje van Nederland met de locaties van de panden.
   Zelfgetekend in SVG, dus geen externe kaartendienst nodig. */

import { useState } from "react";
import { motion } from "motion/react";

/* vereenvoudigde omtrek van Nederland als lengte- en breedtegraden */
const OMTREK: [number, number][] = [
  [4.72, 52.93], [5.05, 52.93], [5.35, 53.06], [5.42, 53.20], [5.60, 53.30],
  [5.95, 53.40], [6.20, 53.41], [6.55, 53.44], [6.87, 53.42], [7.03, 53.32],
  [7.21, 53.20], [7.09, 53.00], [7.05, 52.85], [6.97, 52.64], [6.71, 52.63],
  [6.75, 52.45], [7.06, 52.42], [7.03, 52.23], [6.83, 52.11], [6.69, 52.05],
  [6.83, 51.99], [6.72, 51.90], [6.41, 51.86], [6.16, 51.84], [6.22, 51.72],
  [6.09, 51.60], [6.23, 51.50], [6.13, 51.37], [6.07, 51.24], [5.95, 51.16],
  [6.02, 51.05], [5.90, 50.98], [6.02, 50.75], [5.85, 50.76], [5.64, 50.85],
  [5.74, 51.03], [5.55, 51.22], [5.24, 51.27], [5.08, 51.43], [4.76, 51.50],
  [4.53, 51.43], [4.22, 51.38], [3.93, 51.44], [3.58, 51.30], [3.36, 51.37],
  [3.55, 51.52], [3.85, 51.60], [3.68, 51.66], [3.98, 51.75], [4.12, 51.86],
  [4.02, 51.99], [4.22, 52.10], [4.42, 52.24], [4.58, 52.46], [4.63, 52.70],
];

/* het IJsselmeer, zodat de vorm herkenbaar blijft */
const IJSSELMEER: [number, number][] = [
  [5.05, 52.92], [5.32, 53.02], [5.48, 52.88], [5.62, 52.78], [5.72, 52.64],
  [5.62, 52.52], [5.42, 52.40], [5.22, 52.38], [5.08, 52.46], [5.02, 52.62],
  [5.01, 52.78],
];

/* projectie: graden naar tekengebied */
const MIN_LNG = 3.30, MAX_LNG = 7.25, MIN_LAT = 50.70, MAX_LAT = 53.50;
const B = 100;                                            // breedte van het tekengebied
const H = Math.round(B * ((MAX_LAT - MIN_LAT) * 111) / ((MAX_LNG - MIN_LNG) * 68.5));

function naarXY([lng, lat]: [number, number]): [number, number] {
  return [
    ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * B,
    ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * H,
  ];
}

const pad = (punten: [number, number][]) =>
  punten.map(naarXY).map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ") + " Z";

export type Locatie = { plaats: string; lng: number; lat: number; panden: number; eenheden: number };

/* plaatsen waar Domio panden heeft */
export const STANDAARD_LOCATIES: Locatie[] = [
  { plaats: "Amsterdam", lng: 4.90, lat: 52.37, panden: 2, eenheden: 14 },
  { plaats: "Rotterdam", lng: 4.48, lat: 51.92, panden: 2, eenheden: 16 },
  { plaats: "Utrecht", lng: 5.12, lat: 52.09, panden: 2, eenheden: 7 },
  { plaats: "Den Haag", lng: 4.30, lat: 52.08, panden: 2, eenheden: 5 },
];

export function PandenKaart({ locaties = STANDAARD_LOCATIES }: { locaties?: Locatie[] }) {
  const [actief, setActief] = useState<string | null>(null);

  const totPanden = locaties.reduce((s, l) => s + l.panden, 0);
  const totEenheden = locaties.reduce((s, l) => s + l.eenheden, 0);
  const maxEenheden = Math.max(1, ...locaties.map((l) => l.eenheden));
  const gekozen = locaties.find((l) => l.plaats === actief) ?? null;

  return (
    <div className="flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-line">
      <p className="text-[13px] font-medium text-grey">Panden op de kaart</p>
      <p className="mt-1 text-[12px] text-grey-2">
        {totPanden} panden in {locaties.length} plaatsen
      </p>

      <div className="flex flex-1 items-center justify-center py-3">
        <div className="relative w-full max-w-[230px]">
          <svg viewBox={`0 0 ${B} ${H}`} className="w-full" role="img" aria-label="Kaart van Nederland met de locaties van de panden">
            {/* land in een zachte forest-tint */}
            <path
              d={pad(OMTREK)}
              fill="#161f13" fillOpacity="0.07"
              stroke="#161f13" strokeOpacity="0.16"
              strokeWidth="0.7" strokeLinejoin="round"
            />
            {/* IJsselmeer als uitsparing */}
            <path
              d={pad(IJSSELMEER)}
              fill="#ffffff"
              stroke="#161f13" strokeOpacity="0.12"
              strokeWidth="0.5" strokeLinejoin="round"
            />

            {/* locaties */}
            {locaties.map((l, i) => {
              const [x, y] = naarXY([l.lng, l.lat]);
              const r = 2.4 + (l.eenheden / maxEenheden) * 2.4;
              const aan = actief === l.plaats;
              return (
                <g
                  key={l.plaats}
                  onMouseEnter={() => setActief(l.plaats)}
                  onMouseLeave={() => setActief(null)}
                  className="cursor-pointer"
                >
                  {/* zachte lime gloed */}
                  <motion.circle
                    cx={x} cy={y} r={r * 2.3} fill="#94f477"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: aan ? 0.4 : 0.18 }}
                    transition={{ duration: 0.25 }}
                  />
                  {/* lime ring, zoals de accenten in de rest van het dashboard */}
                  <motion.circle
                    cx={x} cy={y}
                    fill="none" stroke="#7ee85c" strokeWidth="1.1"
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: r + 1.6, opacity: aan ? 1 : 0.75 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.09, ease: "easeOut" }}
                  />
                  {/* kern in forest, wordt lime bij hover */}
                  <motion.circle
                    cx={x} cy={y}
                    fill={aan ? "#7ee85c" : "#161f13"}
                    initial={{ r: 0 }}
                    animate={{ r }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.09, ease: "easeOut" }}
                  />
                  {/* groter, onzichtbaar doelgebied voor de muis */}
                  <circle cx={x} cy={y} r={r * 2.6} fill="transparent" />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="space-y-1 border-t border-line pt-3">
        {locaties.map((l) => {
          const aan = actief === l.plaats;
          return (
            <button
              key={l.plaats}
              type="button"
              onMouseEnter={() => setActief(l.plaats)}
              onMouseLeave={() => setActief(null)}
              className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-[12px] transition-colors ${
                aan ? "bg-panel" : "hover:bg-panel/60"
              }`}
            >
              <span className={`block h-2 w-2 shrink-0 rounded-full ${aan ? "bg-lime-2" : "bg-forest"}`} />
              <span className={aan ? "font-medium text-ink" : "text-grey"}>{l.plaats}</span>
              <span className="ml-auto tabular-nums text-grey-2">{l.eenheden}</span>
            </button>
          );
        })}
        <div className="flex items-center gap-2 border-t border-line px-1.5 pt-2 text-[12px]">
          <span className="text-grey-2">Totaal</span>
          <span className="ml-auto font-semibold tabular-nums text-ink">{totEenheden} eenheden</span>
        </div>
      </div>
    </div>
  );
}
