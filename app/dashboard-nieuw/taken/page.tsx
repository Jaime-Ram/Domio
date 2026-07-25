import { PageHeader, Badge, DataTable, Th, Td, Tr, Card } from "../_ui";

const kpis = [
  { label: "Open taken", value: "7" },
  { label: "Vandaag", value: "3" },
  { label: "Te laat", value: "1" },
  { label: "Afgerond deze week", value: "14" },
];

const taken = [
  { taak: "Huurcontract verlengen", pand: "Prinsengracht 42-1", deadline: "Vandaag", prio: "Hoog", status: "Open" },
  { taak: "Eindinspectie inplannen", pand: "Lindenlaan 21-4", deadline: "Morgen", prio: "Middel", status: "Open" },
  { taak: "Meterstanden doorgeven", pand: "Kade 12", deadline: "3 dec", prio: "Laag", status: "Open" },
  { taak: "Offerte dakreparatie beoordelen", pand: "Havenweg 8", deadline: "Gisteren", prio: "Hoog", status: "Te laat" },
  { taak: "Servicekosten afrekenen", pand: "Molenstraat 5", deadline: "10 dec", prio: "Middel", status: "Open" },
  { taak: "Sleuteloverdracht bevestigen", pand: "Parkzicht 3-2", deadline: "12 dec", prio: "Laag", status: "Open" },
];

function statusTone(s: string) {
  return s === "Te laat" ? "red" : "grey";
}
function prioTone(p: string) {
  if (p === "Hoog") return "red";
  if (p === "Middel") return "amber";
  return "grey";
}

export default function TakenPage() {
  return (
    <>
      <PageHeader title="Taken" subtitle="Wat er vandaag op je lijst staat." action={{ label: "Taak toevoegen" }} />

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
            <Th>Taak</Th>
            <Th>Pand</Th>
            <Th>Prioriteit</Th>
            <Th>Status</Th>
            <Th right>Deadline</Th>
          </>
        }
      >
        {taken.map((t) => (
          <Tr key={t.taak}>
            <Td className="font-medium text-ink">{t.taak}</Td>
            <Td className="text-grey">{t.pand}</Td>
            <Td><Badge tone={prioTone(t.prio)}>{t.prio}</Badge></Td>
            <Td><Badge tone={statusTone(t.status)}>{t.status}</Badge></Td>
            <Td right className="text-grey">{t.deadline}</Td>
          </Tr>
        ))}
      </DataTable>
    </>
  );
}
