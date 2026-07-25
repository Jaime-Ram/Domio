import { FileText, Image as ImageIcon, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { PageHeader, Badge, DataTable, Th, Td, Tr, Card } from "../_ui";

const mappen = [
  { label: "Contracten", count: 24 },
  { label: "Facturen", count: 68 },
  { label: "Keuringen", count: 12 },
  { label: "Overig", count: 31 },
];

const iconFor = (type: string) =>
  type === "Contract" ? FileText : type === "Foto" ? ImageIcon : type === "Keuring" ? ShieldCheck : FileSpreadsheet;

const docs = [
  { naam: "Huurcontract Prinsengracht 42-1.pdf", type: "Contract", pand: "Prinsengracht 42", datum: "12 nov 2025", grootte: "240 KB" },
  { naam: "Factuur Loodgieter Jansen.pdf", type: "Factuur", pand: "Kade 12", datum: "28 nov 2025", grootte: "88 KB" },
  { naam: "EPC-keuring Havenweg 8.pdf", type: "Keuring", pand: "Havenweg 8", datum: "03 okt 2025", grootte: "1,2 MB" },
  { naam: "Foto lekkage keuken.jpg", type: "Foto", pand: "Prinsengracht 42", datum: "zojuist", grootte: "2,1 MB" },
  { naam: "Servicekostenoverzicht 2025.xlsx", type: "Overig", pand: "Alle panden", datum: "01 dec 2025", grootte: "56 KB" },
  { naam: "Huurcontract Kade 12-3.pdf", type: "Contract", pand: "Kade 12", datum: "09 sep 2023", grootte: "232 KB" },
];

export default function DocumentenPage() {
  return (
    <>
      <PageHeader title="Documenten" subtitle="Contracten, facturen en keuringen op één plek." action={{ label: "Uploaden" }} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {mappen.map((m) => (
          <Card key={m.label}>
            <div className="text-[12px] uppercase tracking-wide text-grey-2">{m.label}</div>
            <div className="mt-2 text-[28px] font-medium leading-none text-ink">{m.count}</div>
          </Card>
        ))}
      </div>

      <DataTable
        head={
          <>
            <Th>Document</Th>
            <Th>Pand</Th>
            <Th>Datum</Th>
            <Th right>Grootte</Th>
          </>
        }
      >
        {docs.map((d) => {
          const Icon = iconFor(d.type);
          return (
            <Tr key={d.naam}>
              <Td>
                <span className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-panel text-forest">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-medium text-ink">{d.naam}</span>
                    <span className="block text-[12px] text-grey-2">{d.type}</span>
                  </span>
                </span>
              </Td>
              <Td className="text-grey">{d.pand}</Td>
              <Td className="text-grey">{d.datum}</Td>
              <Td right className="text-grey">{d.grootte}</Td>
            </Tr>
          );
        })}
      </DataTable>
    </>
  );
}
