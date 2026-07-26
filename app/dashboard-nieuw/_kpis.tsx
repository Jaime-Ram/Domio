"use client";

/* De KPI-rij van het overzicht, opgebouwd uit de gedeelde widgets. */

import {
  KpiRow, KpiCard, KpiPill, TrendBadge, MiniBars, MiniHeatmap, MiniRing,
  useCountUp, euro, getal,
} from "./_kpi";

export function BudgetCard() {
  const v = useCountUp(84250);
  return (
    <KpiCard label="Onderhoudsbudget" waarde={euro(v)} sub="van € 124.000 begroot" badge={<KpiPill>68% besteed</KpiPill>}>
      <MiniBars data={[40, 52, 48, 63, 70, 66, 82, 90]} vanaf={5} />
    </KpiCard>
  );
}

export function ResolvedCard() {
  const v = useCountUp(1284);
  return (
    <KpiCard label="Meldingen opgelost" waarde={getal(v)} sub="sinds januari" badge={<TrendBadge pct={8} />}>
      <MiniBars data={[30, 44, 40, 58, 52, 70, 66, 88]} vanaf={0} />
    </KpiCard>
  );
}

/* meldingen per dag van deze maand, -1 voor dagen die nog moeten komen */
const PER_DAG = [0, 2, 1, 0, 0, 3, 1, 2, 0, 1, 0, 0, 2, 1, 3, 0, 1, 0, 0, 2, 1, 0, 3, 2, 1];

export function MeldingenCard() {
  const nu = new Date();
  const dagenInMaand = new Date(nu.getFullYear(), nu.getMonth() + 1, 0).getDate();
  const vandaag = nu.getDate();
  /* maandag als eerste kolom */
  const offset = (new Date(nu.getFullYear(), nu.getMonth(), 1).getDay() + 6) % 7;
  const maand = nu.toLocaleDateString("nl-NL", { month: "long" });

  const data = Array.from({ length: dagenInMaand }, (_, i) =>
    i + 1 > vandaag ? -1 : PER_DAG[i] ?? 0,
  );
  const totaal = data.filter((n) => n > 0).reduce((s, n) => s + n, 0);
  const v = useCountUp(totaal);

  return (
    <KpiCard
      label="Nieuwe meldingen"
      waarde={getal(v)}
      sub={`in ${maand}`}
      badge={<TrendBadge pct={-19} />}
    >
      <MiniHeatmap data={data} offset={offset} maand={maand} />
    </KpiCard>
  );
}

export function AutomatischCard() {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-line">
      <span className="text-[12px] uppercase tracking-wide text-grey-2">Automatisch afgehandeld</span>
      <div className="mt-4 flex flex-1 items-center gap-4">
        <MiniRing pct={71} formaat={80} dik={3.4} kleur="#5cc93f" tekstKlasse="text-[16px] text-forest" />
        <div className="min-w-0">
          <div className="text-[20px] font-medium leading-tight text-ink">Door agents</div>
          <div className="mt-1.5 text-[12px] text-grey-2">zonder tussenkomst</div>
        </div>
      </div>
    </div>
  );
}

export { KpiRow };

export function DashboardKpis() {
  return (
    <KpiRow>
      <BudgetCard />
      <ResolvedCard />
      <MeldingenCard />
      <AutomatischCard />
    </KpiRow>
  );
}
