import { PageHeader, Badge, DataTable, Th, Td, Tr, Card } from "../_ui";

const kpis = [
  { label: "Afrekeningen 2025", value: "38" },
  { label: "Te verrekenen", value: "€ 2.140" },
  { label: "Terug te betalen", value: "€ 1.760" },
  { label: "Concept", value: "6" },
];

const rijen = [
  { huurder: "Lisa de Groot", periode: "2025", bedrag: "+ € 120", type: "Bij te betalen", status: "Verstuurd" },
  { huurder: "Youssef El Amrani", periode: "2025", bedrag: "− € 85", type: "Terug te betalen", status: "Verstuurd" },
  { huurder: "Emma Visser", periode: "2025", bedrag: "+ € 210", type: "Bij te betalen", status: "Concept" },
  { huurder: "David Chen", periode: "2025", bedrag: "− € 45", type: "Terug te betalen", status: "Concept" },
  { huurder: "Sander Bakker", periode: "2025", bedrag: "+ € 60", type: "Bij te betalen", status: "Verstuurd" },
];

function tone(s: string) {
  return s === "Verstuurd" ? "green" : "grey";
}

export default function HuurafrekeningenPage() {
  return (
    <>
      <PageHeader title="Huurafrekeningen" subtitle="Servicekosten verrekenen per huurder." action={{ label: "Afrekening maken" }} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className="text-[12px] uppercase tracking-wide text-grey-2">{k.label}</div>
            <div className="mt-2 text-[24px] font-medium leading-none text-ink">{k.value}</div>
          </Card>
        ))}
      </div>

      <DataTable
        head={
          <>
            <Th>Huurder</Th>
            <Th>Periode</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th right>Bedrag</Th>
          </>
        }
      >
        {rijen.map((r) => (
          <Tr key={r.huurder}>
            <Td className="font-medium text-ink">{r.huurder}</Td>
            <Td className="text-grey">{r.periode}</Td>
            <Td className="text-grey">{r.type}</Td>
            <Td><Badge tone={tone(r.status)}>{r.status}</Badge></Td>
            <Td right className="font-medium text-ink">{r.bedrag}</Td>
          </Tr>
        ))}
      </DataTable>
    </>
  );
}
