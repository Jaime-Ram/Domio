import { Card, PageHeader, DataTable, Th, Td, Tr } from "../_ui";

const kpis = [
  { label: "Panden", value: "8" },
  { label: "Eenheden", value: "42" },
  { label: "Bezetting", value: "90%" },
  { label: "Maandhuur", value: "€ 48.500" },
];

const panden = [
  { naam: "Prinsengracht 42", plaats: "Amsterdam", eenheden: 6, bezet: 6, huur: "€ 9.200", type: "Woning" },
  { naam: "Kade 12", plaats: "Rotterdam", eenheden: 8, bezet: 7, huur: "€ 11.400", type: "Appartement" },
  { naam: "Havenweg 8", plaats: "Utrecht", eenheden: 4, bezet: 4, huur: "€ 5.600", type: "Woning" },
  { naam: "Lindenlaan 21", plaats: "Amsterdam", eenheden: 10, bezet: 9, huur: "€ 12.800", type: "Appartement" },
  { naam: "Molenstraat 5", plaats: "Den Haag", eenheden: 5, bezet: 5, huur: "€ 6.100", type: "Woning" },
  { naam: "Parkzicht 3", plaats: "Utrecht", eenheden: 9, bezet: 7, huur: "€ 10.200", type: "Appartement" },
];

export default function PortefeuillePage() {
  return (
    <>
      <PageHeader title="Portefeuille" subtitle="Al je panden en eenheden op één plek." action={{ label: "Pand toevoegen" }} />

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
            <Th>Pand</Th>
            <Th>Type</Th>
            <Th>Eenheden</Th>
            <Th>Bezetting</Th>
            <Th right>Maandhuur</Th>
          </>
        }
      >
        {panden.map((p) => {
          const pct = Math.round((p.bezet / p.eenheden) * 100);
          return (
            <Tr key={p.naam}>
              <Td>
                <div className="font-medium text-ink">{p.naam}</div>
                <div className="text-[12px] text-grey-2">{p.plaats}</div>
              </Td>
              <Td className="text-grey">{p.type}</Td>
              <Td className="text-grey">{p.eenheden}</Td>
              <Td>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-panel">
                    <span className="block h-full rounded-full bg-lime-2" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="text-grey">{pct}%</span>
                </span>
              </Td>
              <Td right className="font-medium text-ink">{p.huur}</Td>
            </Tr>
          );
        })}
      </DataTable>
    </>
  );
}
