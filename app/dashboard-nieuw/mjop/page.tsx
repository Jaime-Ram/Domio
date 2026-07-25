import { PageHeader, Badge, DataTable, Th, Td, Tr, Card } from "../_ui";

const kpis = [
  { label: "Geplande posten", value: "24" },
  { label: "Begroot 2026", value: "€ 68.000" },
  { label: "Gereserveerd", value: "€ 41.200" },
  { label: "Komend jaar", value: "6" },
];

const posten = [
  { taak: "Gevel schilderen", pand: "Prinsengracht 42", jaar: 2026, kosten: "€ 12.500", status: "Gepland" },
  { taak: "Dak vervangen", pand: "Havenweg 8", jaar: 2027, kosten: "€ 28.000", status: "Gepland" },
  { taak: "CV-ketels vervangen", pand: "Kade 12", jaar: 2026, kosten: "€ 9.800", status: "Offerte" },
  { taak: "Voegwerk herstellen", pand: "Lindenlaan 21", jaar: 2028, kosten: "€ 6.400", status: "Gepland" },
  { taak: "Liftmodernisering", pand: "Kade 12", jaar: 2029, kosten: "€ 22.000", status: "Verkennend" },
  { taak: "Kozijnen vervangen", pand: "Molenstraat 5", jaar: 2026, kosten: "€ 8.900", status: "Offerte" },
];

function tone(s: string) {
  if (s === "Offerte") return "amber";
  if (s === "Verkennend") return "grey";
  return "green";
}

export default function MjopPage() {
  return (
    <>
      <PageHeader title="MJOP" subtitle="Meerjaren onderhoudsplanning per pand." action={{ label: "Post toevoegen" }} />

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
            <Th>Onderhoudspost</Th>
            <Th>Pand</Th>
            <Th>Jaar</Th>
            <Th>Status</Th>
            <Th right>Kosten</Th>
          </>
        }
      >
        {posten.map((p) => (
          <Tr key={p.taak + p.pand}>
            <Td className="font-medium text-ink">{p.taak}</Td>
            <Td className="text-grey">{p.pand}</Td>
            <Td className="text-grey">{p.jaar}</Td>
            <Td><Badge tone={tone(p.status)}>{p.status}</Badge></Td>
            <Td right className="font-medium text-ink">{p.kosten}</Td>
          </Tr>
        ))}
      </DataTable>
    </>
  );
}
