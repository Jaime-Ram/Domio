"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { TrendingUp, ArrowDownRight } from "lucide-react";

/* tel-omhoog animatie */
function useCountUp(target: number, duration = 1200) {
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

const euro = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const num = (n: number) => new Intl.NumberFormat("nl-NL").format(Math.round(n));
const nl1 = (n: number) => new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(n);

/* 1 — onderhoudsbudget met groeiende balken */
export function BudgetCard() {
  const v = useCountUp(84250);
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-paper p-5 ring-1 ring-line">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] uppercase tracking-wide text-grey-2">Onderhoudsbudget</span>
        <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink">68% besteed</span>
      </div>
      <div className="mt-2 text-[28px] font-medium leading-none tabular-nums text-ink">{euro(v)}</div>
      <div className="mt-4 flex h-8 items-end gap-1">
        {[40, 52, 48, 63, 70, 66, 82, 90].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 overflow-hidden rounded-t bg-forest/10"
            initial={{ height: "8%" }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.06 }}
          >
            <div className="h-full w-full rounded-t bg-lime-2" style={{ opacity: i > 4 ? 1 : 0 }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* 2 — meldingen opgelost, tel-cijfer + trend */
export function ResolvedCard() {
  const v = useCountUp(1284);
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-paper p-5 ring-1 ring-line">
      <div className="flex items-start justify-between">
        <span className="text-[12px] uppercase tracking-wide text-grey-2">Meldingen opgelost</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
          <TrendingUp className="h-3 w-3" /> +8%
        </span>
      </div>
      <div className="mt-2 text-[28px] font-medium leading-none tabular-nums text-ink">{num(v)}</div>
      <div className="mt-4 flex h-8 items-end gap-1">
        {[30, 44, 40, 58, 52, 70, 66, 88].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t bg-lime-2"
            initial={{ height: "8%" }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.06 }}
          />
        ))}
      </div>
    </div>
  );
}

/* 3 — SLA gehaald, vullende ring (witte kaart) */
export function SlaCard() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPct(96), 100);
    return () => clearTimeout(t);
  }, []);
  const v = useCountUp(96);
  return (
    <div className="flex h-full items-center gap-4 rounded-2xl bg-paper p-5 ring-1 ring-line">
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ebebe7" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.5" fill="none" stroke="#161f13" strokeWidth="3" strokeLinecap="round"
            strokeDasharray="97.4" strokeDashoffset={97.4 - (97.4 * pct) / 100}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[14px] font-medium tabular-nums text-forest">
          {Math.round(v)}%
        </div>
      </div>
      <div>
        <div className="text-[12px] uppercase tracking-wide text-grey-2">SLA gehaald</div>
        <div className="mt-1 text-[15px] font-medium text-ink">Binnen de afgesproken tijd</div>
        <div className="mt-1 text-[12px] text-grey-2">laatste 30 dagen</div>
      </div>
    </div>
  );
}

/* 4 — gem. reactietijd, tel-cijfer + sparkline (witte kaart) */
const reactieData = [
  { d: 1, v: 4.1 }, { d: 2, v: 3.8 }, { d: 3, v: 3.9 }, { d: 4, v: 3.2 },
  { d: 5, v: 2.9 }, { d: 6, v: 3.0 }, { d: 7, v: 2.4 }, { d: 8, v: 2.2 },
  { d: 9, v: 2.3 }, { d: 10, v: 1.9 }, { d: 11, v: 2.0 }, { d: 12, v: 1.8 },
];

export function ReactietijdCard() {
  const v = useCountUp(1.8);
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-paper p-5 ring-1 ring-line">
      <div className="flex items-start justify-between">
        <span className="text-[12px] uppercase tracking-wide text-grey-2">Gem. reactietijd</span>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
          <ArrowDownRight className="h-3 w-3" /> 56%
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[28px] font-medium leading-none tabular-nums text-ink">{nl1(v)}</span>
        <span className="text-[13px] text-grey">dagen</span>
      </div>
      <div className="mt-3 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={reactieData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
            <YAxis hide domain={["dataMin - 0.4", "dataMax + 0.4"]} />
            <Line type="monotone" dataKey="v" stroke="#161f13" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function KpiRow() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <BudgetCard />
      <ResolvedCard />
      <SlaCard />
      <ReactietijdCard />
    </div>
  );
}
