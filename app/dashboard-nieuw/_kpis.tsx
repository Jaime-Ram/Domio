"use client";

/* De KPI-rij van het overzicht, opgebouwd uit de gedeelde widgets. */

import {
  KpiRow, KpiCard, KpiPill, TrendBadge, MiniBars, MiniSpark, MiniRing,
  useCountUp, euro, getal,
} from "./_kpi";

export function BudgetCard() {
  const v = useCountUp(84250);
  return (
    <KpiCard label="Onderhoudsbudget" waarde={euro(v)} badge={<KpiPill>68% besteed</KpiPill>}>
      <MiniBars data={[40, 52, 48, 63, 70, 66, 82, 90]} vanaf={5} />
    </KpiCard>
  );
}

export function ResolvedCard() {
  const v = useCountUp(1284);
  return (
    <KpiCard label="Meldingen opgelost" waarde={getal(v)} badge={<TrendBadge pct={8} />}>
      <MiniBars data={[30, 44, 40, 58, 52, 70, 66, 88]} vanaf={0} />
    </KpiCard>
  );
}

export function MeldingenCard() {
  const v = useCountUp(26);
  return (
    <KpiCard
      label="Nieuwe meldingen"
      waarde={getal(v)}
      sub="deze maand"
      badge={<TrendBadge pct={-19} omlaagIsGoed />}
    >
      <MiniSpark data={[42, 38, 45, 40, 36, 41, 33, 35, 30, 32, 28, 26]} />
    </KpiCard>
  );
}

export function AutomatischCard() {
  return (
    <div className="flex h-full items-center gap-4 rounded-2xl bg-paper p-5 ring-1 ring-line">
      <MiniRing pct={71} formaat={76} dik={3.4} kleur="#5cc93f" tekstKlasse="text-[15px] text-forest" />
      <div className="min-w-0">
        <div className="text-[20px] font-medium leading-tight text-ink">Door agents</div>
        <div className="mt-1.5 text-[12px] text-grey-2">afgehandeld zonder tussenkomst</div>
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
