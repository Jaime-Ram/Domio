import { Wrench } from "lucide-react";

const titels: Record<string, string> = {
  taken: "Taken",
  tickets: "Meldingen",
  mjop: "MJOP",
  kosten: "Onderhoudskosten",
  compliance: "Compliance",
  portefeuille: "Panden",
  contactboek: "Partners",
  documenten: "Documenten",
  app: "App",
  instellingen: "Accountinstellingen",
};

export default async function PlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug?.[0] ?? "";
  const titel = titels[key] ?? key.charAt(0).toUpperCase() + key.slice(1);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[24px] font-medium tracking-tight text-ink">{titel}</h1>
        <p className="text-[14px] text-grey">Deze pagina wordt in de nieuwe stijl gebouwd.</p>
      </div>

      <div className="grid min-h-[320px] place-items-center rounded-2xl bg-paper ring-1 ring-line">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-panel text-forest">
            <Wrench className="h-5 w-5" />
          </span>
          <p className="mt-4 text-[15px] font-medium text-ink">{titel} komt eraan</p>
          <p className="mt-1 text-[14px] text-grey">We bouwen dit onderdeel netjes uit in het nieuwe dashboard.</p>
        </div>
      </div>
    </>
  );
}
