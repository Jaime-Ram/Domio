import { PageHeader, Badge, DataTable, Th, Td, Tr } from "../_ui";

const huurders = [
  { naam: "Lisa de Groot", pand: "Prinsengracht 42-1", huur: "€ 1.450", start: "01-2024", status: "Actief" },
  { naam: "Youssef El Amrani", pand: "Kade 12-3", huur: "€ 1.620", start: "09-2023", status: "Actief" },
  { naam: "Sander Bakker", pand: "Havenweg 8-2", huur: "€ 1.280", start: "03-2025", status: "Actief" },
  { naam: "Emma Visser", pand: "Lindenlaan 21-4", huur: "€ 1.510", start: "07-2022", status: "Opzegging" },
  { naam: "David Chen", pand: "Molenstraat 5-1", huur: "€ 1.190", start: "11-2024", status: "Actief" },
  { naam: "Fatima Yılmaz", pand: "Parkzicht 3-2", huur: "€ 1.340", start: "05-2023", status: "Achterstand" },
];

function statusTone(s: string) {
  if (s === "Actief") return "green";
  if (s === "Achterstand") return "red";
  return "amber";
}

export default function HuurdersPage() {
  return (
    <>
      <PageHeader title="Huurders" subtitle="Alle huurders, contracten en status." action={{ label: "Huurder uitnodigen" }} />

      <DataTable
        head={
          <>
            <Th>Huurder</Th>
            <Th>Eenheid</Th>
            <Th>Ingangsdatum</Th>
            <Th>Status</Th>
            <Th right>Maandhuur</Th>
          </>
        }
      >
        {huurders.map((h) => (
          <Tr key={h.naam}>
            <Td>
              <span className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-[12px] font-medium text-paper">
                  {h.naam.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <span className="font-medium text-ink">{h.naam}</span>
              </span>
            </Td>
            <Td className="text-grey">{h.pand}</Td>
            <Td className="text-grey">{h.start}</Td>
            <Td><Badge tone={statusTone(h.status)}>{h.status}</Badge></Td>
            <Td right className="font-medium text-ink">{h.huur}</Td>
          </Tr>
        ))}
      </DataTable>
    </>
  );
}
