"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Check, Sparkles, Building2, FileText, FileSpreadsheet, Image as ImageIcon, ShieldCheck,
  ReceiptText, FileSignature, Download, Link2, Trash2, Upload, FolderOpen, Clock,
} from "lucide-react";
import {
  PageHeader, Toolbar, ToolbarSearch, ToolbarToggle, StatusDot, ListShell, ListHead,
  HeadCell, ListGroup, ListRow, CellMain, Avatar, EmptyState, BulkBar, BulkAction,
  DetailPanel, DetailVeld, DetailVelden, type SorteerRichting,
} from "../_ui";
import { KpiRow, KpiCard, KpiPill, MiniBars, MiniRing, useCountUp, getal } from "../_kpi";

/* ─────────────────────────── model ─────────────────────────── */

type Soort = "Contract" | "Factuur" | "Offerte" | "Keuring" | "Foto" | "Overig";

type Doc = {
  id: string;
  naam: string;
  soort: Soort;
  pand: string | null;
  bron: string | null;      // waar het document vandaan komt, bijvoorbeeld een melding
  datum: string;
  maand: string;
  grootte: string;
  agent: boolean;           // door een agent binnengehaald en opgeborgen
  omschrijving: string;
};

const SOORT_ICOON: Record<Soort, React.ElementType> = {
  Contract: FileSignature,
  Factuur: ReceiptText,
  Offerte: FileText,
  Keuring: ShieldCheck,
  Foto: ImageIcon,
  Overig: FileSpreadsheet,
};

const DOCUMENTEN: Doc[] = [
  {
    id: "DOC-812", naam: "Factuur Loodgietersbedrijf Jansen 2026-0442.pdf", soort: "Factuur",
    pand: "Kade 12", bron: "Melding M-2401", datum: "24 jul 2026", maand: "Juli 2026", grootte: "88 KB",
    agent: true, omschrijving: "Binnengekomen per mail en automatisch gekoppeld aan de melding over de lekkage op de derde verdieping.",
  },
  {
    id: "DOC-809", naam: "Offerte CV-ketels Installatiebedrijf Kroon.pdf", soort: "Offerte",
    pand: "Kade 12", bron: "MJOP MJ-118", datum: "22 jul 2026", maand: "Juli 2026", grootte: "312 KB",
    agent: true, omschrijving: "Eén van de drie offertes die de agent heeft opgevraagd voor de vervanging van de ketels.",
  },
  {
    id: "DOC-806", naam: "Foto lekkage keuken 3-hoog.jpg", soort: "Foto",
    pand: "Kade 12", bron: "Melding M-2401", datum: "21 jul 2026", maand: "Juli 2026", grootte: "2,1 MB",
    agent: false, omschrijving: "Door de huurder meegestuurd via WhatsApp bij de melding.",
  },
  {
    id: "DOC-803", naam: "Keuringsrapport elektra Molenstraat 5.pdf", soort: "Keuring",
    pand: "Molenstraat 5", bron: "Compliance CP-204", datum: "18 jul 2026", maand: "Juli 2026", grootte: "1,2 MB",
    agent: true, omschrijving: "Rapport van de NEN 3140-inspectie. Twee aandachtspunten in de meterkast.",
  },
  {
    id: "DOC-800", naam: "Scan onbekend document.pdf", soort: "Overig",
    pand: null, bron: null, datum: "17 jul 2026", maand: "Juli 2026", grootte: "440 KB",
    agent: false, omschrijving: "Nog niet aan een pand gekoppeld. Handmatig geüpload zonder toelichting.",
  },
  {
    id: "DOC-794", naam: "Onderhoudscontract Otis liften.pdf", soort: "Contract",
    pand: "Kade 12", bron: null, datum: "28 jun 2026", maand: "Juni 2026", grootte: "268 KB",
    agent: false, omschrijving: "Doorlopend contract met een opzegtermijn van drie maanden.",
  },
  {
    id: "DOC-791", naam: "Factuur Ajax Brandbeveiliging 88213.pdf", soort: "Factuur",
    pand: "Lindenlaan 21", bron: "Melding M-2388", datum: "24 jun 2026", maand: "Juni 2026", grootte: "96 KB",
    agent: true, omschrijving: "Automatisch gecontroleerd tegen de offerte, geen afwijking gevonden.",
  },
  {
    id: "DOC-788", naam: "Bouwtekening Prinsengracht 42.pdf", soort: "Overig",
    pand: "Prinsengracht 42", bron: null, datum: "19 jun 2026", maand: "Juni 2026", grootte: "4,6 MB",
    agent: false, omschrijving: "Originele tekening uit het gemeentearchief, nuttig voor het schilderwerk.",
  },
  {
    id: "DOC-782", naam: "Factuur Elektra Vermeer 2026-119.pdf", soort: "Factuur",
    pand: "Molenstraat 5", bron: "Melding M-2377", datum: "02 jun 2026", maand: "Juni 2026", grootte: "74 KB",
    agent: true, omschrijving: "Betaald op 12 juni, verwerkt in de kostenpagina.",
  },
  {
    id: "DOC-776", naam: "Losse bon bouwmarkt.jpg", soort: "Foto",
    pand: null, bron: null, datum: "27 mei 2026", maand: "Mei 2026", grootte: "1,4 MB",
    agent: false, omschrijving: "Nog te ordenen. Bedrag en pand zijn niet af te leiden uit de bon.",
  },
  {
    id: "DOC-771", naam: "Servicekostenoverzicht 2025.xlsx", soort: "Overig",
    pand: null, bron: null, datum: "14 mei 2026", maand: "Mei 2026", grootte: "56 KB",
    agent: false, omschrijving: "Overzicht over alle panden, hoort niet bij één specifiek pand.",
  },
  {
    id: "DOC-765", naam: "Keuringsrapport liften Kade 12.pdf", soort: "Keuring",
    pand: "Kade 12", bron: "Compliance CP-201", datum: "22 mei 2026", maand: "Mei 2026", grootte: "980 KB",
    agent: true, omschrijving: "Laatste geldige liftkeuring. De vervaldatum is inmiddels verstreken.",
  },
];

/* uploads per maand, voor het staafje in de eerste kaart */
const PER_MAAND = [22, 30, 26, 41, 38, 52, 47, 64];

/* ─────────────────────────── hulpjes ─────────────────────────── */

const COL = {
  status: "w-4 shrink-0",
  icoon: "w-4 shrink-0",
  pand: "hidden w-[148px] shrink-0 lg:block",
  bron: "hidden w-[148px] shrink-0 xl:flex",
  datum: "w-[92px] shrink-0 text-right",
  actie: "hidden w-[64px] shrink-0 lg:block",
  avatar: "w-6 shrink-0",
};

/* het signaal hier: hoort dit document ergens bij, of ligt het los */
function gezondheid(d: Doc): { toon: "goed" | "let-op" | "slecht"; titel: string } {
  if (!d.pand) return { toon: "let-op", titel: "Nog niet aan een pand gekoppeld" };
  if (!d.bron && d.soort === "Factuur") return { toon: "let-op", titel: "Geen melding gekoppeld" };
  return { toon: "goed", titel: "Gekoppeld en geordend" };
}

const KOLOM_WAARDE: Record<string, (d: Doc) => string> = {
  soort: (d) => d.soort,
  pand: (d) => d.pand ?? "Geen pand",
  maand: (d) => d.maand,
};

const KOLOM_OPTIES: Record<string, string[]> = {
  soort: Object.keys(SOORT_ICOON),
  pand: Array.from(new Set(DOCUMENTEN.map((d) => d.pand ?? "Geen pand"))).sort(),
};

const SORTEER: Record<string, (d: Doc) => number | string> = {
  document: (d) => d.naam.toLowerCase(),
  datum: (d) => -Number(d.id.replace("DOC-", "")),
};

/* ─────────────────────────── pagina ─────────────────────────── */

type GroepOp = "maand" | "soort" | "pand" | "geen";

export default function DocumentenPage() {
  const [docs, setDocs] = useState(DOCUMENTEN);
  const [groepOp, setGroepOp] = useState<GroepOp>("maand");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sorteer, setSorteer] = useState<{ kolom: string; richting: SorteerRichting } | null>(null);
  const [query, setQuery] = useState("");
  const [alleenLos, setAlleenLos] = useState(false);
  const [dicht, setDicht] = useState<string[]>([]);
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);

  const zetFilter = (k: string, v: string[]) => setFilters((f) => ({ ...f, [k]: v }));
  const zetSorteer = (kolom: string, richting: SorteerRichting) =>
    setSorteer((s) => (s?.kolom === kolom && s.richting === richting ? null : { kolom, richting }));

  const q = query.trim().toLowerCase();
  const zichtbaar = useMemo(() => {
    const lijst = docs.filter((d) => {
      const mq = !q || d.naam.toLowerCase().includes(q) || (d.pand ?? "").toLowerCase().includes(q) || (d.bron ?? "").toLowerCase().includes(q);
      const mf = Object.entries(filters).every(([k, v]) => !v.length || v.includes(KOLOM_WAARDE[k](d)));
      return mq && mf && (!alleenLos || gezondheid(d).toon !== "goed");
    });
    if (!sorteer) return lijst;
    const w = SORTEER[sorteer.kolom];
    return [...lijst].sort((a, b) => {
      const va = w(a), vb = w(b);
      const vgl = typeof va === "string" ? va.localeCompare(String(vb)) : Number(va) - Number(vb);
      return sorteer.richting === "hoog" ? -vgl : vgl;
    });
  }, [docs, q, filters, alleenLos, sorteer]);

  const groepen = useMemo(() => {
    if (groepOp === "geen") return [{ key: "alles", label: "", items: zichtbaar }];
    const sleutel = KOLOM_WAARDE[groepOp];
    /* de maanden staan al op volgorde in de lijst, die houden we aan */
    const namen = groepOp === "maand"
      ? Array.from(new Set(zichtbaar.map(sleutel)))
      : Array.from(new Set(zichtbaar.map(sleutel))).sort();
    return namen.map((n) => ({ key: n, label: n, items: zichtbaar.filter((d) => sleutel(d) === n) }));
  }, [zichtbaar, groepOp]);

  const toggleKies = useCallback((id: string) => {
    setGekozen((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);
  const laatOrdenen = useCallback((ids: string[]) => {
    setDocs((p) => p.map((d) => (ids.includes(d.id) && !d.pand ? { ...d, pand: "Kade 12", agent: true } : d)));
    setGekozen([]);
  }, []);
  const verwijder = useCallback((ids: string[]) => {
    setDocs((p) => p.filter((d) => !ids.includes(d.id)));
    setGekozen([]);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [detail]);

  /* cijfers */
  const losseDocs = docs.filter((d) => gezondheid(d).toon !== "goed");
  const dezeMaand = docs.filter((d) => d.maand === "Juli 2026");
  const doorAgents = docs.filter((d) => d.agent);
  const agentPct = docs.length ? (doorAgents.length / docs.length) * 100 : 0;
  const detailDoc = docs.find((d) => d.id === detail) || null;

  const totaalTeller = useCountUp(docs.length);
  const maandTeller = useCountUp(dezeMaand.length);

  /* mappenrij: aantal per soort, klikbaar als filter */
  const mappen = useMemo(
    () => (Object.keys(SOORT_ICOON) as Soort[]).map((s) => ({
      soort: s,
      aantal: docs.filter((d) => d.soort === s).length,
    })),
    [docs],
  );
  const soortFilter = filters.soort ?? [];

  return (
    <>
      <PageHeader
        title="Documenten"
        subtitle={
          <>
            {docs.length} bestanden in het dossier
            {losseDocs.length > 0 && <> · <span className="font-medium text-[#c99a1f]">{losseDocs.length} nog te ordenen</span></>}
          </>
        }
        action={{ label: "Uploaden" }}
      />

      <KpiRow kolommen={3}>
        <KpiCard
          label="In het dossier"
          waarde={getal(totaalTeller)}
          sub={`${getal(maandTeller)} deze maand toegevoegd`}
          badge={<KpiPill>{mappen.filter((m) => m.aantal).length} soorten</KpiPill>}
        >
          <MiniBars data={PER_MAAND} vanaf={5} />
        </KpiCard>

        <KpiCard
          label="Te ordenen"
          waarde={String(losseDocs.length)}
          toon={losseDocs.length ? "let-op" : "goed"}
          sub={losseDocs.length ? "zonder pand of koppeling" : "alles netjes gekoppeld"}
        >
          {losseDocs.length ? (
            <div className="w-full space-y-1">
              {losseDocs.slice(0, 3).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDetail(d.id)}
                  className="flex w-full items-center gap-2 rounded-md px-1 py-[3px] text-left transition-colors hover:bg-panel"
                >
                  <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-[#f4c04f]" />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-grey">{d.naam}</span>
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[12px] text-grey-2">niets open</span>
          )}
        </KpiCard>

        <div className="flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-line">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[12px] uppercase tracking-wide text-grey-2">Door agents</span>
            <KpiPill>opgeborgen</KpiPill>
          </div>
          <div className="mt-4 flex flex-1 items-center justify-center">
            <MiniRing vol pct={agentPct} dik={3.4} kleur="#5cc93f" tekstKlasse="text-[22px] text-forest" />
          </div>
        </div>
      </KpiRow>

      {/* mappen: snelle ingang per soort */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {mappen.map((m) => {
          const Icoon = SOORT_ICOON[m.soort];
          const aan = soortFilter.includes(m.soort);
          return (
            <button
              key={m.soort}
              type="button"
              onClick={() => zetFilter("soort", aan ? soortFilter.filter((s) => s !== m.soort) : [...soortFilter, m.soort])}
              className={`flex items-center gap-3 rounded-2xl p-3.5 text-left transition-colors ${
                aan ? "bg-forest text-paper ring-1 ring-forest" : "bg-paper ring-1 ring-line hover:bg-panel/50"
              }`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                aan ? "bg-white/10 text-lime-2" : "bg-panel text-forest"
              }`}>
                <Icoon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className={`block truncate text-[13px] ${aan ? "text-paper" : "text-ink"}`}>{m.soort}</span>
                <span className={`block text-[12px] tabular-nums ${aan ? "text-lime-2" : "text-grey-2"}`}>{m.aantal}</span>
              </span>
            </button>
          );
        })}
      </div>

      <Toolbar>
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Zoek op naam, pand of koppeling..." />
        <ToolbarToggle actief={alleenLos} onClick={() => setAlleenLos((v) => !v)} icon={FolderOpen}>
          Te ordenen
        </ToolbarToggle>
      </Toolbar>

      <ListShell>
        {zichtbaar.length === 0 ? (
          <EmptyState icon={Upload} titel="Geen documenten gevonden" tekst="Pas je zoekopdracht of filter aan, of upload een bestand." />
        ) : (
          <>
            <ListHead>
              <span className={COL.status} />
              <span className={COL.icoon} />
              <HeadCell
                label="Document" className="min-w-0 flex-1"
                sorteerbaar sorteerId="document" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Z naar A", laag: "A naar Z" }}
                groep={groepOp} onGroep={(id) => setGroepOp(id as GroepOp)}
                groepeerOpties={[
                  { id: "maand", label: "Maand" },
                  { id: "soort", label: "Soort" },
                  { id: "pand", label: "Pand" },
                  { id: "geen", label: "Geen groepering" },
                ]}
                opties={KOLOM_OPTIES.soort} actief={soortFilter}
                onWijzig={(v) => zetFilter("soort", v)}
              />
              <HeadCell
                label="Pand" className={COL.pand}
                opties={KOLOM_OPTIES.pand} actief={filters.pand ?? []}
                onWijzig={(v) => zetFilter("pand", v)}
              />
              <HeadCell label="Hoort bij" className={COL.bron} />
              <span className={COL.actie} />
              <HeadCell
                label="Datum" className={COL.datum} rechts
                sorteerbaar sorteerId="datum" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Oudste eerst", laag: "Nieuwste eerst" }}
              />
              <span className={COL.avatar} />
            </ListHead>

            {groepen.map((g) => {
              if (g.items.length === 0) return null;
              const isDicht = dicht.includes(g.key);
              return (
                <ListGroup
                  key={g.key} label={g.label} aantal={g.items.length} dicht={isDicht}
                  onToggle={() => setDicht((d) => (isDicht ? d.filter((x) => x !== g.key) : [...d, g.key]))}
                >
                  {g.items.map((d) => {
                    const isGekozen = gekozen.includes(d.id);
                    const gz = gezondheid(d);
                    const Icoon = SOORT_ICOON[d.soort];
                    return (
                      <ListRow key={d.id} gekozen={isGekozen} onClick={() => setDetail(d.id)}>
                        <span className={`${COL.status} relative grid h-4 place-items-center`}>
                          <span className={isGekozen ? "hidden" : "group-hover:hidden"}>
                            <StatusDot toon={gz.toon} titel={gz.titel} />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleKies(d.id); }}
                            aria-label="Selecteren"
                            className={`grid h-4 w-4 place-items-center rounded border transition-colors ${
                              isGekozen ? "border-forest bg-forest text-paper" : "hidden border-grey-2 text-transparent group-hover:grid"
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </button>
                        </span>

                        <span className={`${COL.icoon} grid place-items-center text-grey-2`}>
                          <Icoon className="h-4 w-4" />
                        </span>

                        <CellMain titel={d.naam} sub={`${d.soort} · ${d.grootte}`} />

                        <span className={`${COL.pand} truncate text-[13px] ${d.pand ? "text-grey-2" : "text-[#c99a1f]"}`}>
                          {d.pand ?? "niet gekoppeld"}
                        </span>

                        <span className={`${COL.bron} items-center gap-1.5 text-[12px] text-grey-2`}>
                          {d.bron ? (
                            <>
                              <Link2 className="h-3 w-3 shrink-0" />
                              <span className="truncate">{d.bron}</span>
                            </>
                          ) : (
                            <span className="truncate">losstaand</span>
                          )}
                        </span>

                        <span className={COL.actie}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); }}
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-grey opacity-0 transition-opacity hover:bg-panel-2 hover:text-forest group-hover:opacity-100"
                            title="Downloaden"
                          >
                            <Download className="h-3 w-3" /> Open
                          </button>
                        </span>

                        <span className={`${COL.datum} text-[13px] tabular-nums text-grey`}>{d.datum}</span>

                        <span className={COL.avatar}>
                          <Avatar naam="MB" agent={d.agent} />
                        </span>
                      </ListRow>
                    );
                  })}
                </ListGroup>
              );
            })}
          </>
        )}
      </ListShell>

      <BulkBar aantal={gekozen.length} onSluit={() => setGekozen([])}>
        <BulkAction onClick={() => laatOrdenen(gekozen)} icon={Sparkles}>Laat ordenen</BulkAction>
        <BulkAction onClick={() => setGekozen([])} icon={Download}>Downloaden</BulkAction>
        <BulkAction onClick={() => verwijder(gekozen)} icon={Trash2} gevaar>Verwijder</BulkAction>
      </BulkBar>

      <DetailPanel
        open={!!detailDoc}
        onClose={() => setDetail(null)}
        kop={
          detailDoc && (
            <>
              <span className="text-[12px] tabular-nums text-grey-2">{detailDoc.id}</span>
              <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink">{detailDoc.soort}</span>
              {detailDoc.agent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
                  <Sparkles className="h-3 w-3" /> Agent
                </span>
              )}
            </>
          )
        }
        voet={
          detailDoc && (
            <>
              {!detailDoc.pand && (
                <button
                  type="button"
                  onClick={() => laatOrdenen([detailDoc.id])}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-forest/90"
                >
                  <Sparkles className="h-4 w-4" /> Laat ordenen
                </button>
              )}
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-lime-2 px-3 py-2 text-[13px] font-medium text-forest transition-colors hover:bg-lime"
              >
                <Download className="h-4 w-4" /> Downloaden
              </button>
            </>
          )
        }
      >
        {detailDoc && (() => {
          const Icoon = SOORT_ICOON[detailDoc.soort];
          const gz = gezondheid(detailDoc);
          return (
            <>
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-panel text-forest">
                  <Icoon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusDot toon={gz.toon} titel={gz.titel} />
                    <h2 className="break-words text-[16px] font-medium leading-snug text-ink">{detailDoc.naam}</h2>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-[13px] text-grey">
                    <Building2 className="h-3.5 w-3.5 text-grey-2" /> {detailDoc.pand ?? "nog geen pand gekoppeld"}
                  </p>
                </div>
              </div>

              {/* voorbeeldvlak, staat klaar voor de echte weergave */}
              <div className="grid h-40 place-items-center rounded-xl bg-panel/70 text-grey-2">
                <div className="text-center">
                  <Icoon className="mx-auto h-6 w-6" />
                  <p className="mt-2 text-[12px]">Voorbeeld van {detailDoc.grootte}</p>
                </div>
              </div>

              <p className="rounded-xl bg-panel/70 p-3 text-[13px] leading-relaxed text-grey">{detailDoc.omschrijving}</p>

              <DetailVelden>
                <DetailVeld label="Soort">
                  <Icoon className="h-3.5 w-3.5 text-grey-2" /> {detailDoc.soort}
                </DetailVeld>
                <DetailVeld label="Hoort bij">
                  {detailDoc.bron ? (
                    <>
                      <Link2 className="h-3.5 w-3.5 text-grey-2" /> {detailDoc.bron}
                    </>
                  ) : (
                    <span className="text-grey-2">losstaand</span>
                  )}
                </DetailVeld>
                <DetailVeld label="Datum">
                  <Clock className="h-3.5 w-3.5 text-grey-2" /> {detailDoc.datum}
                </DetailVeld>
                <DetailVeld label="Grootte">{detailDoc.grootte}</DetailVeld>
                <DetailVeld label="Toegevoegd">
                  <Avatar naam="MB" agent={detailDoc.agent} />
                  {detailDoc.agent ? "Domio Agent" : "Mark Bakker"}
                </DetailVeld>
              </DetailVelden>
            </>
          );
        })()}
      </DetailPanel>
    </>
  );
}
