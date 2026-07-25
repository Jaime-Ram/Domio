import { PageHeader, Badge, DataTable, Th, Td, Tr, Card } from "../_ui";

const kpis = [
  { label: "Ontvangen deze maand", value: "€ 44.120" },
  { label: "Openstaand", value: "€ 4.380" },
  { label: "Achterstallig", value: "€ 1.340" },
  { label: "Incasso-ratio", value: "96%" },
];

const betalingen = [
  { huurder: "Lisa de Groot", pand: "Prinsengracht 42-1", bedrag: "€ 1.450", datum: "01-12", status: "Betaald" },
  { huurder: "Youssef El Amrani", pand: "Kade 12-3", bedrag: "€ 1.620", datum: "01-12", status: "Betaald" },
  { huurder: "Sander Bakker", pand: "Havenweg 8-2", bedrag: "€ 1.280", datum: "03-12", status: "Open" },
  { huurder: "Emma Visser", pand: "Lindenlaan 21-4", bedrag: "€ 1.510", datum: "01-12", status: "Betaald" },
  { huurder: "David Chen", pand: "Molenstraat 5-1", bedrag: "€ 1.190", datum: "05-12", status: "Open" },
  { huurder: "Fatima Yılmaz", pand: "Parkzicht 3-2", bedrag: "€ 1.340", datum: "—", status: "Achterstallig" },
];

function statusTone(s: string) {
  if (s === "Betaald") return "green";
  if (s === "Achterstallig") return "red";
  return "amber";
}

export default function BetalingenPage() {
  return (
    <>
      <PageHeader title="Betalingen" subtitle="Huurincasso en openstaande posten." action={{ label: "Betaling boeken" }} />

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
            <Th>Datum</Th>
            <Th>Status</Th>
            <Th right>Bedrag</Th>
          </>
        }
      >
        {betalingen.map((b, i) => (
          <Tr key={i}>
            <Td className="font-medium text-ink">{b.huurder}</Td>
            <Td className="text-grey">{b.pand}</Td>
            <Td className="text-grey">{b.datum}</Td>
            <Td><Badge tone={statusTone(b.status)}>{b.status}</Badge></Td>
            <Td right className="font-medium text-ink">{b.bedrag}</Td>
          </Tr>
        ))}
      </DataTable>
    </>
  );
}
