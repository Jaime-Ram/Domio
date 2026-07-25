"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Pencil, Check, X, Plus } from "lucide-react";
import { BudgetCard, ResolvedCard, SlaCard, ReactietijdCard } from "./_kpis";
import { AgentsAtWork, UpcomingTimeline } from "./_widgets";

const kpi = { panden: 8, eenheden: 42, huurders: 38, bezetting: 90 };
const verwacht = 48500;
const history = [
  { month: "jul", income: 46200, uitgaven: 9800 },
  { month: "aug", income: 47100, uitgaven: 8600 },
  { month: "sep", income: 46800, uitgaven: 11200 },
  { month: "okt", income: 48000, uitgaven: 9100 },
  { month: "nov", income: 48200, uitgaven: 10400 },
  { month: "dec", income: 48500, uitgaven: 8900 },
];

const FOREST = "#161f13";
const GREY = "#97978f";

function fmt(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-medium text-grey">{children}</p>;
}

function TrendBadge({ value }: { value: number }) {
  if (!value) return null;
  const up = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {up
          ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>
          : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></>}
      </svg>
      {Math.abs(value)}%
    </span>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="space-y-1 rounded-xl border border-line bg-paper px-3 py-2.5 text-[12px] shadow-sm">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.name === "income" ? FOREST : GREY }} />
          <span className="text-grey">{p.name === "income" ? "Huurinkomsten" : "Uitgaven"}</span>
          <span className="ml-auto font-medium text-ink">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] leading-none text-grey-2">{label}</p>
      <p className="text-2xl font-medium leading-none text-forest">{value}</p>
    </div>
  );
}

/* wrapper die in wijzig-modus een verwijderknop toont */
function EditBlock({
  id, editing, onRemove, className = "", children,
}: {
  id: string; editing: boolean; onRemove: (id: string) => void; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`relative h-full ${className} ${editing ? "rounded-2xl outline-dashed outline-2 outline-offset-4 outline-line" : ""}`}>
      {editing && (
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label="Widget verwijderen"
          className="absolute -right-2.5 -top-2.5 z-20 grid h-6 w-6 place-items-center rounded-full bg-forest text-paper shadow-sm ring-2 ring-paper transition-colors hover:bg-red-500"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {children}
    </div>
  );
}

const ALL_BLOCKS: { id: string; label: string }[] = [
  { id: "budget", label: "Onderhoudsbudget" },
  { id: "resolved", label: "Meldingen opgelost" },
  { id: "sla", label: "SLA gehaald" },
  { id: "reactietijd", label: "Gem. reactietijd" },
  { id: "bezetting", label: "Bezetting" },
  { id: "agents", label: "Agents aan het werk" },
  { id: "planning", label: "Aankomende planning" },
];

const STORAGE_KEY = "domio-dash-hidden";

export default function OverzichtPage() {
  const lastIncome = history[history.length - 1].income;
  const prevIncome = history[history.length - 2].income;
  const incomeTrendPct = prevIncome ? Math.round(((lastIncome - prevIncome) / prevIncome) * 100) : 0;

  const bezet = Math.min(kpi.huurders, kpi.eenheden);
  const leeg = Math.max(0, kpi.eenheden - bezet);
  const bezettingData = [
    { name: "Bezet", value: bezet, color: FOREST },
    { name: "Leeg", value: leeg, color: "#e3e3de" },
  ];

  const [editing, setEditing] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHidden(JSON.parse(raw));
    } catch { /* leeg */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(hidden));
  }, [hidden, loaded]);

  const show = (id: string) => !hidden.includes(id);
  const remove = (id: string) => setHidden((h) => Array.from(new Set([...h, id])));
  const restore = (id: string) => setHidden((h) => h.filter((x) => x !== id));

  const kpis = [
    { id: "budget", node: <BudgetCard /> },
    { id: "resolved", node: <ResolvedCard /> },
    { id: "sla", node: <SlaCard /> },
    { id: "reactietijd", node: <ReactietijdCard /> },
  ].filter((k) => show(k.id));

  const hiddenBlocks = ALL_BLOCKS.filter((b) => hidden.includes(b.id));
  const showBezetting = show("bezetting");

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-medium tracking-tight text-ink">Overzicht</h1>
          <p className="text-[14px] text-grey">Welkom terug, Mark.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors ${
            editing
              ? "bg-forest text-paper hover:bg-forest/90"
              : "bg-lime-2 text-forest hover:bg-lime"
          }`}
        >
          {editing ? <><Check className="h-4 w-4" /> Klaar</> : <><Pencil className="h-4 w-4" /> Wijzig</>}
        </button>
      </div>

      {/* teruggezet-balk in wijzig-modus */}
      {editing && hiddenBlocks.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-paper p-3 ring-1 ring-line">
          <span className="px-1 text-[12px] uppercase tracking-wide text-grey-2">Toevoegen</span>
          {hiddenBlocks.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => restore(b.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-panel px-2.5 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-panel-2"
            >
              <Plus className="h-3.5 w-3.5 text-forest" /> {b.label}
            </button>
          ))}
        </div>
      )}

      {/* KPI-rij */}
      {kpis.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <EditBlock key={k.id} id={k.id} editing={editing} onRemove={remove}>
              {k.node}
            </EditBlock>
          ))}
        </div>
      )}

      <div className={`grid grid-cols-1 items-stretch gap-6 ${showBezetting ? "xl:grid-cols-[1fr_300px]" : ""}`}>
        {/* Links: huurinkomsten + kerncijfers */}
        <div className="flex flex-col rounded-2xl bg-paper ring-1 ring-line lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SectionLabel>Huurinkomsten</SectionLabel>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <p className="text-[26px] font-medium leading-none text-forest">{fmt(verwacht)}</p>
                  <TrendBadge value={incomeTrendPct} />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-[11px] text-grey-2">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-3 rounded-full bg-forest" /> Huurinkomsten
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-px w-3 border-t-2 border-dashed border-grey-2/60" /> Uitgaven
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={FOREST} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={FOREST} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="uit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GREY} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={GREY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecece8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: GREY }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: GREY }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} width={44} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="uitgaven" name="uitgaven" stroke={GREY} strokeWidth={1.5} strokeDasharray="4 3" fill="url(#uit)" dot={false} activeDot={{ r: 3, fill: GREY }} />
                <Area type="monotone" dataKey="income" name="income" stroke={FOREST} strokeWidth={2.5} fill="url(#inc)" dot={false} activeDot={{ r: 4, fill: FOREST }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="my-5 hidden w-px shrink-0 bg-line lg:block" />

          <div className="flex shrink-0 flex-row justify-around gap-4 border-t border-line px-5 py-4 lg:w-48 lg:flex-col lg:border-t-0 lg:px-6 lg:py-5">
            <MetricItem label="Panden" value={kpi.panden} />
            <MetricItem label="Eenheden" value={kpi.eenheden} />
            <MetricItem label="Huurders" value={kpi.huurders} />
            <MetricItem label="Bezetting" value={`${kpi.bezetting}%`} />
          </div>
        </div>

        {/* Rechts: bezetting-donut */}
        {showBezetting && (
          <EditBlock id="bezetting" editing={editing} onRemove={remove}>
            <div className="flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-line">
              <SectionLabel>Bezetting</SectionLabel>
              <div className="mt-1.5 flex items-baseline gap-2">
                <p className="text-[26px] font-medium leading-none text-forest">{kpi.bezetting}%</p>
                <span className="text-[12px] text-grey-2">{bezet} / {kpi.eenheden} eenheden</span>
              </div>

              <div className="flex min-h-[150px] flex-1 items-center justify-center py-4">
                <div className="relative h-[160px] w-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={bezettingData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={78} paddingAngle={2} stroke="none">
                        {bezettingData.map((c) => <Cell key={c.name} fill={c.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[28px] font-medium leading-none text-forest">{kpi.bezetting}%</span>
                    <span className="mt-1 text-[11px] text-grey-2">bezet</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-line pt-3">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-forest" />
                  <span className="text-grey">Bezet</span>
                  <span className="ml-auto font-semibold text-ink">{bezet}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-line" />
                  <span className="text-grey">Leeg</span>
                  <span className="ml-auto font-semibold text-ink">{leeg}</span>
                </div>
              </div>
            </div>
          </EditBlock>
        )}
      </div>

      {/* Widgets */}
      {(show("agents") || show("planning")) && (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {show("agents") && (
            <EditBlock id="agents" editing={editing} onRemove={remove} className="xl:col-span-2">
              <AgentsAtWork className="h-full" />
            </EditBlock>
          )}
          {show("planning") && (
            <EditBlock id="planning" editing={editing} onRemove={remove}>
              <UpcomingTimeline className="h-full" />
            </EditBlock>
          )}
        </div>
      )}

    </>
  );
}
