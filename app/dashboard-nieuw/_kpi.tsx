"use client";

/* Herbruikbare KPI-widgets in de stijl van het dashboard-overzicht:
   witte kaart, tellend cijfer en een kleine visualisatie. */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

/* tel-omhoog animatie */
export function useCountUp(target: number, duration = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export const euro = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const getal = (n: number) => new Intl.NumberFormat("nl-NL").format(Math.round(n));
export const procent = (n: number) => `${Math.round(n)}%`;

/* ── de kaart ──────────────────────────────────────────── */
export function KpiCard({
  label, waarde, sub, badge, toon = "neutraal", children,
}: {
  label: string;
  waarde: string;
  sub?: string;
  badge?: React.ReactNode;
  toon?: "neutraal" | "goed" | "let-op" | "slecht";
  children?: React.ReactNode;   // de visualisatie onderin
}) {
  const kleur = {
    neutraal: "text-ink",
    goed: "text-forest",
    "let-op": "text-[#c99a1f]",
    slecht: "text-red-500",
  }[toon];
  return (
    <div className="flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-line">
      {/* kop en cijfer horen bij elkaar en staan dus strak onder elkaar */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] uppercase tracking-wide text-grey-2">{label}</span>
        {badge}
      </div>
      <div className={`mt-2.5 text-[28px] font-medium leading-none tabular-nums ${kleur}`}>{waarde}</div>
      {sub && <div className="mt-1.5 text-[12px] text-grey-2">{sub}</div>}
      {/* de visualisatie zakt naar de onderkant van de kaart */}
      {children && <div className="mt-4 flex flex-1 items-end">{children}</div>}
    </div>
  );
}

/* trendlabel rechtsboven in de kaart, zelfde ontwerp als KpiPill */
export function TrendBadge({ pct }: { pct: number; omlaagIsGoed?: boolean }) {
  const Icon = pct > 0 ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink">
      <Icon className="h-3 w-3" /> {Math.abs(pct)}%
    </span>
  );
}

/* pill rechtsboven, bijvoorbeeld "68% besteed" */
export function KpiPill({ children }: { children: React.ReactNode }) {
  return <span className="shrink-0 rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink">{children}</span>;
}

/* ── visualisaties ─────────────────────────────────────── */

/* groeiende staafjes; `vanaf` kleurt de laatste staven lime */
export function MiniBars({ data, vanaf }: { data: number[]; vanaf?: number }) {
  const grens = vanaf ?? 0;
  return (
    <div className="flex h-full min-h-[44px] w-full items-end gap-1">
      {data.map((h, i) => (
        <motion.div
          key={i}
          className={`flex-1 rounded-t ${i >= grens ? "bg-lime-2" : "bg-forest/10"}`}
          initial={{ height: "8%" }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.06 }}
        />
      ))}
    </div>
  );
}

/* horizontale voortgangsbalk */
export function MiniProgress({ pct }: { pct: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-panel-2">
      <motion.div
        className="h-full rounded-full bg-lime-2"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

/* vullende ring */
export function MiniRing({
  pct, formaat = 64, kleur = "#161f13", dik = 3, tekstKlasse = "text-[13px] text-forest", vol = false,
}: {
  pct: number;
  formaat?: number;
  kleur?: string;
  dik?: number;
  tekstKlasse?: string;
  vol?: boolean;   // vult de hoogte van de container
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);
  const omtrek = 97.4;
  return (
    <div
      className={vol ? "relative aspect-square h-full" : "relative shrink-0"}
      style={vol ? undefined : { width: formaat, height: formaat }}
    >
      <svg
        viewBox="0 0 36 36"
        className={vol ? "h-full w-full -rotate-90" : "-rotate-90"}
        style={vol ? undefined : { width: formaat, height: formaat }}
      >
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ebebe7" strokeWidth={dik} />
        <circle
          cx="18" cy="18" r="15.5" fill="none" stroke={kleur} strokeWidth={dik} strokeLinecap="round"
          strokeDasharray={omtrek} strokeDashoffset={omtrek - (omtrek * v) / 100}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className={`absolute inset-0 grid place-items-center font-medium tabular-nums ${tekstKlasse}`}>
        {Math.round(v)}%
      </div>
    </div>
  );
}

/* kleine lijngrafiek */
export function MiniSpark({ data, omlaag = false }: { data: number[]; omlaag?: boolean }) {
  const punten = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={punten} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
          <YAxis hide domain={["dataMin - 0.4", "dataMax + 0.4"]} />
          <Line type="monotone" dataKey="v" stroke={omlaag ? "#161f13" : "#161f13"} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* maand-heatmap: één vakje per dag, donkerder bij meer meldingen.
   `data` bevat één waarde per dag van de maand, -1 voor dagen die nog moeten komen.
   `offset` is de weekdag waarop de eerste van de maand valt (0 = maandag). */
const HEAT = ["#ebebe7", "#d7f3cb", "#a9e894", "#7ee85c", "#4bb52f"];
const DAGEN = ["m", "d", "w", "d", "v", "z", "z"];

export function MiniHeatmap({
  data, offset = 0, maand,
}: {
  data: number[];
  offset?: number;
  maand?: string;
}) {
  const max = Math.max(1, ...data);
  const cellen: (number | null)[] = [...Array(offset).fill(null), ...data];
  while (cellen.length % 7 !== 0) cellen.push(null);
  const weken = cellen.length / 7;

  const kleur = (n: number) => {
    if (n <= 0) return HEAT[0];
    return HEAT[Math.min(HEAT.length - 1, Math.ceil((n / max) * (HEAT.length - 1)))];
  };

  return (
    <div className="w-full">
      <div className="mb-1.5 grid w-full grid-cols-7 gap-[5px]">
        {DAGEN.map((d, i) => (
          <span key={i} className="text-center text-[10px] uppercase leading-none text-grey-2">{d}</span>
        ))}
      </div>

      <div className="grid w-full grid-cols-7 gap-[5px]">
        {cellen.map((n, i) => {
          if (n === null) return <span key={i} className="aspect-square w-full" />;
          if (n < 0) {
            return (
              <span
                key={i}
                className="aspect-square w-full rounded-[4px] border border-dashed border-line"
                title={`${i - offset + 1} ${maand ?? ""}, nog te gaan`}
              />
            );
          }
          return (
            <motion.span
              key={i}
              className="aspect-square w-full rounded-[4px]"
              style={{ background: kleur(n) }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.1 + i * 0.008 }}
              title={`${i - offset + 1} ${maand ?? ""} · ${n} ${n === 1 ? "melding" : "meldingen"}`}
            />
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center gap-1 text-[10px] text-grey-2">
        minder
        {HEAT.map((c) => (
          <span key={c} className="h-[7px] w-[7px] rounded-[2px]" style={{ background: c }} />
        ))}
        meer
      </div>
    </div>
  );
}

/* rij met kaarten */
export function KpiRow({ children, kolommen = 4 }: { children: React.ReactNode; kolommen?: 3 | 4 }) {
  return (
    <div className={`mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 ${kolommen === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>
      {children}
    </div>
  );
}
