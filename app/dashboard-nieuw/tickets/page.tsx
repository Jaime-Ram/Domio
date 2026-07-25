import { Clock } from "lucide-react";
import { PageHeader, Badge, DataTable, Th, Td, Tr, Card } from "../_ui";

const kolommen = [
  { label: "Open", count: 3 },
  { label: "Ingepland", count: 2 },
  { label: "In uitvoering", count: 1 },
  { label: "Afgerond", count: 8 },
];

const tickets = [
  { titel: "Lekkage keukenkraan", pand: "Prinsengracht 42", cat: "Loodgieter", prio: "Hoog", status: "Getrieerd", sla: "22 u" },
  { titel: "CV valt uit", pand: "Kade 12-3", cat: "CV-monteur", prio: "Hoog", status: "Vakman", sla: "4 u" },
  { titel: "Kapotte ruit", pand: "Havenweg 8", cat: "Glaszetter", prio: "Middel", status: "Nieuw", sla: "48 u" },
  { titel: "Verstopte afvoer", pand: "Lindenlaan 21", cat: "Loodgieter", prio: "Middel", status: "Werkbon", sla: "12 u" },
  { titel: "Schilderwerk kozijn", pand: "Prinsengracht 42", cat: "Schilder", prio: "Laag", status: "Afgerond", sla: "—" },
  { titel: "Deurslot vervangen", pand: "Molenstraat 5", cat: "Slotenmaker", prio: "Middel", status: "Nieuw", sla: "36 u" },
];

function statusTone(s: string) {
  if (s === "Afgerond" || s === "Nieuw") return "grey";
  return "green";
}
function prioTone(p: string) {
  if (p === "Hoog") return "red";
  if (p === "Middel") return "amber";
  return "grey";
}

export default function TicketsPage() {
  return (
    <>
      <PageHeader title="Tickets" subtitle="Onderhoudsmeldingen van intake tot factuur." action={{ label: "Nieuwe melding" }} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kolommen.map((k) => (
          <Card key={k.label}>
            <div className="text-[12px] uppercase tracking-wide text-grey-2">{k.label}</div>
            <div className="mt-2 text-[28px] font-medium leading-none text-ink">{k.count}</div>
          </Card>
        ))}
      </div>

      <DataTable
        head={
          <>
            <Th>Melding</Th>
            <Th>Pand</Th>
            <Th>Prioriteit</Th>
            <Th>Status</Th>
            <Th right>SLA</Th>
          </>
        }
      >
        {tickets.map((t) => (
          <Tr key={t.titel}>
            <Td>
              <div className="font-medium text-ink">{t.titel}</div>
              <div className="text-[12px] text-grey-2">{t.cat}</div>
            </Td>
            <Td className="text-grey">{t.pand}</Td>
            <Td><Badge tone={prioTone(t.prio)}>{t.prio}</Badge></Td>
            <Td><Badge tone={statusTone(t.status)}>{t.status}</Badge></Td>
            <Td right>
              <span className="inline-flex items-center gap-1 text-grey">
                <Clock className="h-3 w-3 text-grey-2" />
                {t.sla}
              </span>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </>
  );
}
