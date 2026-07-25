import { PageHeader, Badge, DataTable, Th, Td, Tr, Card } from "../_ui";

const kpis = [
  { label: "Totaal openstaand", value: "€ 4.380" },
  { label: "Huurders met achterstand", value: "3" },
  { label: "Gem. dagen te laat", value: "18" },
  { label: "In betalingsregeling", value: "1" },
];

const rijen = [
  { huurder: "Fatima Yılmaz", pand: "Parkzicht 3-2", bedrag: "€ 1.340", dagen: 42, status: "Aanmaning verstuurd" },
  { huurder: "Sander Bakker", pand: "Havenweg 8-2", bedrag: "€ 1.280", dagen: 12, status: "Herinnering" },
  { huurder: "David Chen", pand: "Molenstraat 5-1", bedrag: "€ 1.190", dagen: 8, status: "Betalingsregeling" },
];

function tone(s: string) {
  if (s === "Aanmaning verstuurd") return "red";
  if (s === "Betalingsregeling") return "green";
  return "amber";
}

export default function AchterstandenPage() {
  return (
    <>
      <PageHeader title="Achterstanden" subtitle="Openstaande huur en incasso-status." action={{ label: "Herinnering sturen" }} />

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
            <Th>Eenheid</Th>
            <Th>Dagen te laat</Th>
            <Th>Status</Th>
            <Th right>Bedrag</Th>
          </>
        }
      >
        {rijen.map((r) => (
          <Tr key={r.huurder}>
            <Td className="font-medium text-ink">{r.huurder}</Td>
            <Td className="text-grey">{r.pand}</Td>
            <Td className="text-grey">{r.dagen} dagen</Td>
            <Td><Badge tone={tone(r.status)}>{r.status}</Badge></Td>
            <Td right className="font-medium text-ink">{r.bedrag}</Td>
          </Tr>
        ))}
      </DataTable>
    </>
  );
}
