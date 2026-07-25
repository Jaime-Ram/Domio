import { PageHeader, Badge, DataTable, Th, Td, Tr, Card } from "../_ui";

const kpis = [
  { label: "In orde", value: "18" },
  { label: "Verloopt < 60 dagen", value: "4" },
  { label: "Verlopen", value: "2" },
  { label: "WWS-check", value: "OK" },
];

const items = [
  { keuring: "Gasketel-onderhoud", pand: "Prinsengracht 42", vervalt: "14 mrt 2026", status: "In orde" },
  { keuring: "EPC-label", pand: "Havenweg 8", vervalt: "02 jan 2026", status: "Verloopt binnenkort" },
  { keuring: "Liftkeuring", pand: "Kade 12", vervalt: "20 nov 2025", status: "Verlopen" },
  { keuring: "Brandveiligheid", pand: "Lindenlaan 21", vervalt: "08 aug 2026", status: "In orde" },
  { keuring: "Elektra (NEN 3140)", pand: "Molenstraat 5", vervalt: "11 dec 2025", status: "Verloopt binnenkort" },
  { keuring: "Legionella-beheer", pand: "Parkzicht 3", vervalt: "30 sep 2026", status: "In orde" },
];

function tone(s: string) {
  if (s === "In orde") return "green";
  if (s === "Verlopen") return "red";
  return "amber";
}

export default function CompliancePage() {
  return (
    <>
      <PageHeader title="Compliance" subtitle="Keuringen, certificaten en vervaldatums." action={{ label: "Keuring toevoegen" }} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className="text-[12px] uppercase tracking-wide text-grey-2">{k.label}</div>
            <div className="mt-2 text-[28px] font-medium leading-none text-ink">{k.value}</div>
          </Card>
        ))}
      </div>

      <DataTable
        head={
          <>
            <Th>Keuring</Th>
            <Th>Pand</Th>
            <Th>Status</Th>
            <Th right>Vervaldatum</Th>
          </>
        }
      >
        {items.map((it) => (
          <Tr key={it.keuring + it.pand}>
            <Td className="font-medium text-ink">{it.keuring}</Td>
            <Td className="text-grey">{it.pand}</Td>
            <Td><Badge tone={tone(it.status)}>{it.status}</Badge></Td>
            <Td right className="text-grey">{it.vervalt}</Td>
          </Tr>
        ))}
      </DataTable>
    </>
  );
}
