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
    <div className="flex h-full flex-col justify-between rounded-2xl bg-paper p-5 ring-1 ring-line">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] uppercase tracking-wide text-grey-2">{label}</span>
        {badge}
      </div>
      <div className={`mt-2 text-[28px] font-medium leading-none tabular-nums ${kleur}`}>{waarde}</div>
      {sub && <div className="mt-1.5 text-[12px] text-grey-2">{sub}</div>}
      {children && <div className="mt-4">{children}</div>}
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
    <div className="flex h-8 items-end gap-1">
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
  pct, formaat = 64, kleur = "#161f13", dik = 3, tekstKlasse = "text-[13px] text-forest",
}: {
  pct: number;
  formaat?: number;
  kleur?: string;
  dik?: number;
  tekstKlasse?: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);
  const omtrek = 97.4;
  return (
    <div className="relative shrink-0" style={{ width: formaat, height: formaat }}>
      <svg viewBox="0 0 36 36" className="-rotate-90" style={{ width: formaat, height: formaat }}>
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

/* rij met kaarten */
export function KpiRow({ children, kolommen = 4 }: { children: React.ReactNode; kolommen?: 3 | 4 }) {
  return (
    <div className={`mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 ${kolommen === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>
      {children}
    </div>
  );
}
