import { Star, Phone } from "lucide-react";
import { PageHeader, Badge, DataTable, Th, Td, Tr } from "../_ui";

const contacten = [
  { naam: "Loodgieter Jansen", vak: "Loodgieter", regio: "Amsterdam", tel: "06 12 34 56 78", rating: 4.9, status: "Voorkeur" },
  { naam: "CV-service West", vak: "CV-monteur", regio: "Rotterdam", tel: "06 23 45 67 89", rating: 4.7, status: "Actief" },
  { naam: "Glaszetter Bright", vak: "Glaszetter", regio: "Utrecht", tel: "06 34 56 78 90", rating: 4.5, status: "Actief" },
  { naam: "Schildersbedrijf Vos", vak: "Schilder", regio: "Amsterdam", tel: "06 45 67 89 01", rating: 4.8, status: "Voorkeur" },
  { naam: "Dakdekker Noord", vak: "Dakdekker", regio: "Den Haag", tel: "06 56 78 90 12", rating: 4.2, status: "Actief" },
  { naam: "Slotenmaker 24/7", vak: "Slotenmaker", regio: "Landelijk", tel: "06 67 89 01 23", rating: 4.6, status: "Actief" },
];

export default function ContactboekPage() {
  return (
    <>
      <PageHeader title="Contactboek" subtitle="Je vaklieden en leveranciers." action={{ label: "Vakman toevoegen" }} />

      <DataTable
        head={
          <>
            <Th>Vakman</Th>
            <Th>Vak</Th>
            <Th>Regio</Th>
            <Th>Beoordeling</Th>
            <Th right>Telefoon</Th>
          </>
        }
      >
        {contacten.map((c) => (
          <Tr key={c.naam}>
            <Td>
              <span className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-[12px] font-medium text-paper">
                  {c.naam.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <span>
                  <span className="block font-medium text-ink">{c.naam}</span>
                  <span className="block"><Badge tone={c.status === "Voorkeur" ? "green" : "grey"}>{c.status}</Badge></span>
                </span>
              </span>
            </Td>
            <Td className="text-grey">{c.vak}</Td>
            <Td className="text-grey">{c.regio}</Td>
            <Td>
              <span className="inline-flex items-center gap-1 text-ink">
                <Star className="h-3.5 w-3.5 fill-lime-2 text-lime-2" />
                {c.rating}
              </span>
            </Td>
            <Td right>
              <span className="inline-flex items-center gap-1 text-grey">
                <Phone className="h-3 w-3 text-grey-2" />
                {c.tel}
              </span>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </>
  );
}
