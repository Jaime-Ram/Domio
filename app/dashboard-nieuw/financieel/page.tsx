import { ArrowUpRight } from "lucide-react";
import { PageHeader, Badge, DataTable, Th, Td, Tr, Card } from "../_ui";

const kpis = [
  { label: "Huurinkomsten (mnd)", value: "€ 48.500", sub: "+2%" },
  { label: "Uitgaven (mnd)", value: "€ 8.900", sub: "−6%" },
  { label: "Netto resultaat", value: "€ 39.600", sub: "+4%" },
  { label: "Openstaand", value: "€ 4.380", sub: "" },
];

const maanden = [
  ["jul", 78], ["aug", 82], ["sep", 74], ["okt", 88], ["nov", 90], ["dec", 95],
] as const;

const transacties = [
  { oms: "Huur Prinsengracht 42-1", cat: "Huurinkomsten", datum: "01 dec", bedrag: "+ € 1.450" },
  { oms: "Factuur Loodgieter Jansen", cat: "Onderhoud", datum: "28 nov", bedrag: "− € 84" },
  { oms: "Huur Kade 12-3", cat: "Huurinkomsten", datum: "01 dec", bedrag: "+ € 1.620" },
  { oms: "VvE-bijdrage Lindenlaan", cat: "VvE", datum: "26 nov", bedrag: "− € 320" },
  { oms: "Materiaal Gamma", cat: "Onderhoud", datum: "24 nov", bedrag: "− € 84" },
];

export default function FinancieelPage() {
  return (
    <>
      <PageHeader title="Financieel" subtitle="Inkomsten, uitgaven en resultaat." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className="flex items-start justify-between">
              <span className="text-[12px] uppercase tracking-wide text-grey-2">{k.label}</span>
              <ArrowUpRight className="h-4 w-4 text-grey-2" />
            </div>
            <div className="mt-3 text-[24px] font-medium leading-none text-ink">{k.value}</div>
            {k.sub && <div className="mt-2 text-[12px] font-medium text-forest">{k.sub}</div>}
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] uppercase tracking-wide text-grey-2">Netto resultaat per maand</span>
            <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink">2025</span>
          </div>
          <div className="mt-5">
            <div className="flex h-40 items-end gap-2">
              {maanden.map(([m, h]) => (
                <div key={m} className="flex-1 overflow-hidden rounded-t bg-forest/10" style={{ height: `${h}%` }}>
                  <div className="h-full w-full rounded-t bg-lime-2" />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              {maanden.map(([m]) => (
                <div key={m} className="flex-1 text-center text-[11px] text-grey-2">{m}</div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="px-5 py-4 text-[15px] font-medium text-ink">Recente transacties</div>
          <ul className="divide-y divide-line">
            {transacties.map((t, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-3 text-[13px]">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{t.oms}</span>
                  <span className="block text-[12px] text-grey-2">{t.cat} · {t.datum}</span>
                </span>
                <span className={`shrink-0 font-medium ${t.bedrag.startsWith("+") ? "text-forest" : "text-ink"}`}>
                  {t.bedrag}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
