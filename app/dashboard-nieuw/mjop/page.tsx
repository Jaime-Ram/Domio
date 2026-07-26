"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Check, Sparkles, Building2, CalendarRange, AlertTriangle, Trash2, Euro,
  Droplets, Flame, Zap, PaintRoller, Home, Wrench, TrendingUp, FileText,
} from "lucide-react";
import {
  PageHeader, Toolbar, ToolbarSearch, ToolbarToggle, StatusDot, ListShell, ListHead,
  HeadCell, ListGroup, ListRow, CellMain, Avatar, EmptyState, BulkBar, BulkAction,
  DetailPanel, DetailVeld, DetailVelden, Progress, type SorteerRichting,
} from "../_ui";
import { KpiRow, KpiCard, KpiPill, MiniProgress, useCountUp, euro, procent } from "../_kpi";

/* ─────────────────────────── model ─────────────────────────── */

type Status = "verkennend" | "offerte" | "gepland" | "uitgevoerd";

type Post = {
  id: string;
  taak: string;
  pand: string;
  categorie: string;
  jaar: number;
  bedrag: number;
  gereserveerd: number;
  status: Status;
  agent: boolean;
  levensduur: number;        // resterende levensduur in procenten
  laatstUitgevoerd: string;
  toelichting: string;
};

const STATUSSEN: Record<Status, string> = {
  verkennend: "Verkennend",
  offerte: "Offerte aangevraagd",
  gepland: "Gepland",
  uitgevoerd: "Uitgevoerd",
};

const CATEGORIE_ICOON: Record<string, React.ElementType> = {
  "CV en verwarming": Flame,
  "Dak en gevel": Home,
  Elektra: Zap,
  Loodgieterswerk: Droplets,
  Schilderwerk: PaintRoller,
  Overig: Wrench,
};

const HUIDIG_JAAR = 2026;

const POSTEN: Post[] = [
  {
    id: "MJ-118", taak: "CV-ketels vervangen", pand: "Kade 12", categorie: "CV en verwarming",
    jaar: 2026, bedrag: 9800, gereserveerd: 9800, status: "offerte", agent: true, levensduur: 8,
    laatstUitgevoerd: "2011",
    toelichting: "Twaalf ketels uit 2011, de gemiddelde levensduur is vijftien jaar. Vervangen voor het stookseizoen voorkomt storingen in de winter.",
  },
  {
    id: "MJ-121", taak: "Gevel schilderen", pand: "Prinsengracht 42", categorie: "Schilderwerk",
    jaar: 2026, bedrag: 12500, gereserveerd: 12500, status: "gepland", agent: true, levensduur: 12,
    laatstUitgevoerd: "2019",
    toelichting: "Zevenjaarlijkse schilderbeurt aan de grachtzijde. De vergunning voor de steiger loopt via de gemeente.",
  },
  {
    id: "MJ-124", taak: "Kozijnen vervangen", pand: "Molenstraat 5", categorie: "Dak en gevel",
    jaar: 2026, bedrag: 8900, gereserveerd: 4200, status: "verkennend", agent: false, levensduur: 5,
    laatstUitgevoerd: "1998",
    toelichting: "Houten kozijnen aan de straatzijde zijn aan vervanging toe. Goede kandidaat om meteen naar HR++ te gaan.",
  },
  {
    id: "MJ-127", taak: "Liftkeuring en besturing", pand: "Kade 12", categorie: "Overig",
    jaar: 2026, bedrag: 3400, gereserveerd: 3400, status: "gepland", agent: true, levensduur: 45,
    laatstUitgevoerd: "2025",
    toelichting: "Wettelijk verplichte keuring, gecombineerd met vervanging van de besturingsprint.",
  },
  {
    id: "MJ-130", taak: "Isolatie aanbrengen", pand: "Zuiderpad 17", categorie: "Dak en gevel",
    jaar: 2026, bedrag: 6200, gereserveerd: 0, status: "verkennend", agent: false, levensduur: 20,
    laatstUitgevoerd: "nooit",
    toelichting: "Nodig om van energielabel D naar B te komen. De subsidiemogelijkheden zijn nog niet uitgezocht.",
  },
  {
    id: "MJ-133", taak: "Dak vervangen", pand: "Havenweg 8", categorie: "Dak en gevel",
    jaar: 2027, bedrag: 28000, gereserveerd: 11000, status: "verkennend", agent: false, levensduur: 22,
    laatstUitgevoerd: "1996",
    toelichting: "Bitumen dak uit 1996. De inspectie van vorig jaar gaf aan dat het nog twee jaar meekan.",
  },
  {
    id: "MJ-136", taak: "Groepenkasten vernieuwen", pand: "Lindenlaan 21", categorie: "Elektra",
    jaar: 2027, bedrag: 5600, gereserveerd: 2800, status: "verkennend", agent: false, levensduur: 30,
    laatstUitgevoerd: "2004",
    toelichting: "Zes groepenkasten voldoen niet meer aan de huidige norm voor aardlekbeveiliging.",
  },
  {
    id: "MJ-139", taak: "Voegwerk herstellen", pand: "Lindenlaan 21", categorie: "Dak en gevel",
    jaar: 2028, bedrag: 6400, gereserveerd: 0, status: "verkennend", agent: false, levensduur: 35,
    laatstUitgevoerd: "2008",
    toelichting: "Het voegwerk aan de noordgevel verweert sneller door slagregen.",
  },
  {
    id: "MJ-142", taak: "Riolering vervangen", pand: "Prinsengracht 42", categorie: "Loodgieterswerk",
    jaar: 2029, bedrag: 18500, gereserveerd: 0, status: "verkennend", agent: false, levensduur: 40,
    laatstUitgevoerd: "1985",
    toelichting: "Gietijzeren standleidingen uit 1985. Camera-inspectie staat gepland voor 2027.",
  },
  {
    id: "MJ-112", taak: "Gevelreiniging", pand: "Vaartweg 90", categorie: "Dak en gevel",
    jaar: 2026, bedrag: 4100, gereserveerd: 4100, status: "uitgevoerd", agent: true, levensduur: 90,
    laatstUitgevoerd: "2026",
    toelichting: "In april uitgevoerd door Schildersbedrijf De Vries, binnen budget opgeleverd.",
  },
];

/* ─────────────────────────── hulpjes ─────────────────────────── */

const COL = {
  status: "w-4 shrink-0",
  categorie: "hidden w-[136px] shrink-0 lg:flex",
  pand: "hidden w-[124px] shrink-0 xl:block",
  jaar: "w-[52px] shrink-0 text-right",
  dekking: "hidden w-[110px] shrink-0 md:block",
  actie: "hidden w-[68px] shrink-0 lg:block",
  bedrag: "w-[88px] shrink-0 text-right",
  avatar: "w-6 shrink-0",
};

const dekkingPct = (p: Post) => (p.bedrag ? (p.gereserveerd / p.bedrag) * 100 : 100);

/* het signaal op deze pagina is de reservering: staat het geld er wel op tijd? */
function gezondheid(p: Post): { toon: "goed" | "let-op" | "slecht"; titel: string } {
  if (p.status === "uitgevoerd") return { toon: "goed", titel: "Uitgevoerd" };
  const dek = Math.round(dekkingPct(p));
  if (p.jaar <= HUIDIG_JAAR && dek < 50) return { toon: "slecht", titel: `Dit jaar aan de beurt, pas ${dek}% gereserveerd` };
  if (dek < 100) return { toon: "let-op", titel: `${dek}% gereserveerd` };
  return { toon: "goed", titel: "Volledig gereserveerd" };
}

const KOLOM_WAARDE: Record<string, (p: Post) => string> = {
  categorie: (p) => p.categorie,
  pand: (p) => p.pand,
  jaar: (p) => String(p.jaar),
};

const KOLOM_OPTIES: Record<string, string[]> = {
  categorie: Object.keys(CATEGORIE_ICOON).sort(),
  pand: Array.from(new Set(POSTEN.map((p) => p.pand))).sort(),
  jaar: Array.from(new Set(POSTEN.map((p) => String(p.jaar)))).sort(),
};

const SORTEER: Record<string, (p: Post) => number | string> = {
  post: (p) => p.taak.toLowerCase(),
  jaar: (p) => p.jaar,
  bedrag: (p) => p.bedrag,
};

/* ─────────────────────────── pagina ─────────────────────────── */

type GroepOp = "jaar" | "pand" | "categorie" | "geen";

export default function MjopPage() {
  const [posten, setPosten] = useState(POSTEN);
  const [groepOp, setGroepOp] = useState<GroepOp>("jaar");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sorteer, setSorteer] = useState<{ kolom: string; richting: SorteerRichting } | null>(null);
  const [query, setQuery] = useState("");
  const [alleenTekort, setAlleenTekort] = useState(false);
  const [dicht, setDicht] = useState<string[]>([]);
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);

  const zetFilter = (k: string, v: string[]) => setFilters((f) => ({ ...f, [k]: v }));
  const zetSorteer = (kolom: string, richting: SorteerRichting) =>
    setSorteer((s) => (s?.kolom === kolom && s.richting === richting ? null : { kolom, richting }));

  const q = query.trim().toLowerCase();
  const zichtbaar = useMemo(() => {
    const lijst = posten.filter((p) => {
      const mq = !q || p.taak.toLowerCase().includes(q) || p.pand.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      const mf = Object.entries(filters).every(([k, v]) => !v.length || v.includes(KOLOM_WAARDE[k](p)));
      return mq && mf && (!alleenTekort || gezondheid(p).toon !== "goed");
    });
    if (!sorteer) return lijst;
    const w = SORTEER[sorteer.kolom];
    return [...lijst].sort((a, b) => {
      const va = w(a), vb = w(b);
      const vgl = typeof va === "string" ? va.localeCompare(String(vb)) : Number(va) - Number(vb);
      return sorteer.richting === "hoog" ? -vgl : vgl;
    });
  }, [posten, q, filters, alleenTekort, sorteer]);

  const groepen = useMemo(() => {
    if (groepOp === "geen") return [{ key: "alles", label: "", items: zichtbaar }];
    const sleutel = KOLOM_WAARDE[groepOp];
    const namen = Array.from(new Set(zichtbaar.map(sleutel))).sort();
    return namen.map((n) => ({ key: n, label: n, items: zichtbaar.filter((p) => sleutel(p) === n) }));
  }, [zichtbaar, groepOp]);

  const toggleKies = useCallback((id: string) => {
    setGekozen((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);
  const offerteAanvragen = useCallback((ids: string[]) => {
    setPosten((p) => p.map((x) => (ids.includes(x.id) ? { ...x, status: "offerte" as Status, agent: true } : x)));
    setGekozen([]);
  }, []);
  const naarAgent = useCallback((ids: string[]) => {
    setPosten((p) => p.map((x) => (ids.includes(x.id) ? { ...x, agent: true } : x)));
    setGekozen([]);
  }, []);
  const verwijder = useCallback((ids: string[]) => {
    setPosten((p) => p.filter((x) => !ids.includes(x.id)));
    setGekozen([]);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [detail]);

  /* cijfers */
  const open = posten.filter((p) => p.status !== "uitgevoerd");
  const ditJaar = open.filter((p) => p.jaar === HUIDIG_JAAR);
  const ditJaarBedrag = ditJaar.reduce((s, p) => s + p.bedrag, 0);
  const totaal = open.reduce((s, p) => s + p.bedrag, 0);
  const gereserveerd = open.reduce((s, p) => s + p.gereserveerd, 0);
  const dekking = totaal ? (gereserveerd / totaal) * 100 : 100;
  const tekort = open.filter((p) => gezondheid(p).toon !== "goed").length;
  const detailPost = posten.find((p) => p.id === detail) || null;

  const totaalTeller = useCountUp(totaal);
  const ditJaarTeller = useCountUp(ditJaarBedrag);
  const gereserveerdTeller = useCountUp(gereserveerd);

  /* verdeling over de jaren, voor de staafjes */
  const perJaar = useMemo(() => {
    const jaren = Array.from(new Set(open.map((p) => p.jaar))).sort();
    const max = Math.max(1, ...jaren.map((j) => open.filter((p) => p.jaar === j).reduce((s, p) => s + p.bedrag, 0)));
    return jaren.map((j) => {
      const items = open.filter((p) => p.jaar === j);
      const bedrag = items.reduce((s, p) => s + p.bedrag, 0);
      const res = items.reduce((s, p) => s + p.gereserveerd, 0);
      return { jaar: j, bedrag, gereserveerd: res, aantal: items.length, pct: (bedrag / max) * 100 };
    });
  }, [open]);

  return (
    <>
      <PageHeader
        title="MJOP"
        subtitle={
          <>
            {open.length} posten · {euro(totaal)} begroot
            {tekort > 0 && <> · <span className="font-medium text-[#c99a1f]">{tekort} onvoldoende gereserveerd</span></>}
          </>
        }
        action={{ label: "Post toevoegen" }}
      />

      <KpiRow>
        <KpiCard
          label="Begroot totaal"
          waarde={euro(totaalTeller)}
          sub={`verdeeld over ${perJaar.length} jaar`}
          badge={<KpiPill>{open.length} posten</KpiPill>}
        />

        <KpiCard
          label={`Aan de beurt in ${HUIDIG_JAAR}`}
          waarde={euro(ditJaarTeller)}
          sub={`${ditJaar.length} posten dit jaar`}
          toon={ditJaar.some((p) => gezondheid(p).toon === "slecht") ? "slecht" : "neutraal"}
        />

        <KpiCard
          label="Gereserveerd"
          waarde={euro(gereserveerdTeller)}
          toon={dekking < 60 ? "let-op" : "goed"}
          sub={`${euro(totaal - gereserveerd)} nog te reserveren`}
          badge={<KpiPill>{procent(dekking)} gedekt</KpiPill>}
        >
          <div className="w-full">
            <MiniProgress pct={dekking} />
          </div>
        </KpiCard>

        <KpiCard
          label="Onvoldoende gedekt"
          waarde={String(tekort)}
          toon={tekort > 0 ? "let-op" : "goed"}
          sub={tekort > 0 ? "posten met te weinig reservering" : "alle posten volledig gereserveerd"}
        />
      </KpiRow>

      {/* meerjarenverdeling */}
      <div className="mb-6 rounded-2xl bg-paper p-5 ring-1 ring-line">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[13px] font-medium text-grey">Verdeling over de jaren</p>
          <span className="flex items-center gap-3 text-[11px] text-grey-2">
            <span className="flex items-center gap-1.5"><span className="block h-2 w-3 rounded-full bg-lime-2" /> Gereserveerd</span>
            <span className="flex items-center gap-1.5"><span className="block h-2 w-3 rounded-full bg-panel-2" /> Nog te reserveren</span>
          </span>
        </div>
        <div className="flex items-end gap-4">
          {perJaar.map((j) => (
            <div key={j.jaar} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[12px] font-medium tabular-nums text-ink">{euro(j.bedrag)}</span>
              <div className="flex h-28 w-full items-end">
                <div
                  className="flex w-full flex-col justify-end overflow-hidden rounded-t-lg bg-panel-2"
                  style={{ height: `${Math.max(6, j.pct)}%` }}
                >
                  <div
                    className="w-full bg-lime-2"
                    style={{ height: `${j.bedrag ? (j.gereserveerd / j.bedrag) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <span className={`text-[12px] tabular-nums ${j.jaar === HUIDIG_JAAR ? "font-medium text-ink" : "text-grey"}`}>
                {j.jaar}
              </span>
              <span className="text-[11px] text-grey-2">{j.aantal} {j.aantal === 1 ? "post" : "posten"}</span>
            </div>
          ))}
        </div>
      </div>

      <Toolbar>
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Zoek op post, pand of nummer..." />
        <ToolbarToggle actief={alleenTekort} onClick={() => setAlleenTekort((v) => !v)} icon={AlertTriangle}>
          Onvoldoende gedekt
        </ToolbarToggle>
      </Toolbar>

      <ListShell>
        {zichtbaar.length === 0 ? (
          <EmptyState icon={CalendarRange} titel="Geen posten gevonden" tekst="Pas je zoekopdracht of filter aan." />
        ) : (
          <>
            <ListHead>
              <span className={COL.status} />
              <HeadCell
                label="Onderhoudspost" className="min-w-0 flex-1"
                sorteerbaar sorteerId="post" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Z naar A", laag: "A naar Z" }}
                groep={groepOp} onGroep={(id) => setGroepOp(id as GroepOp)}
                groepeerOpties={[
                  { id: "jaar", label: "Jaar" },
                  { id: "pand", label: "Pand" },
                  { id: "categorie", label: "Categorie" },
                  { id: "geen", label: "Geen groepering" },
                ]}
              />
              <HeadCell
                label="Categorie" className={COL.categorie}
                opties={KOLOM_OPTIES.categorie} actief={filters.categorie ?? []}
                onWijzig={(v) => zetFilter("categorie", v)}
              />
              <HeadCell
                label="Pand" className={COL.pand}
                opties={KOLOM_OPTIES.pand} actief={filters.pand ?? []}
                onWijzig={(v) => zetFilter("pand", v)}
              />
              <HeadCell
                label="Jaar" className={COL.jaar} rechts
                sorteerbaar sorteerId="jaar" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Verste eerst", laag: "Eerstvolgende eerst" }}
                opties={KOLOM_OPTIES.jaar} actief={filters.jaar ?? []}
                onWijzig={(v) => zetFilter("jaar", v)}
              />
              <HeadCell label="Dekking" className={COL.dekking} />
              <span className={COL.actie} />
              <HeadCell
                label="Begroot" className={COL.bedrag} rechts
                sorteerbaar sorteerId="bedrag" sorteer={sorteer} onSorteer={zetSorteer}
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
                  {g.items.map((p) => {
                    const isGekozen = gekozen.includes(p.id);
                    const gz = gezondheid(p);
                    const Icoon = CATEGORIE_ICOON[p.categorie] ?? Wrench;
                    const dek = dekkingPct(p);
                    return (
                      <ListRow key={p.id} gekozen={isGekozen} onClick={() => setDetail(p.id)}>
                        <span className={`${COL.status} relative grid h-4 place-items-center`}>
                          <span className={isGekozen ? "hidden" : "group-hover:hidden"}>
                            <StatusDot toon={gz.toon} titel={gz.titel} />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleKies(p.id); }}
                            aria-label="Selecteren"
                            className={`grid h-4 w-4 place-items-center rounded border transition-colors ${
                              isGekozen ? "border-forest bg-forest text-paper" : "hidden border-grey-2 text-transparent group-hover:grid"
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </button>
                        </span>

                        <CellMain
                          titel={p.taak}
                          sub={`${STATUSSEN[p.status]} · laatst ${p.laatstUitgevoerd}`}
                          doorgehaald={p.status === "uitgevoerd"}
                        />

                        <span className={`${COL.categorie} items-center gap-1.5 text-[13px] text-grey`}>
                          <Icoon className="h-3.5 w-3.5 shrink-0 text-grey-2" />
                          <span className="truncate">{p.categorie}</span>
                        </span>

                        <span className={`${COL.pand} truncate text-[13px] text-grey-2`}>{p.pand}</span>

                        <span className={`${COL.jaar} text-[13px] tabular-nums ${
                          p.jaar <= HUIDIG_JAAR ? "font-medium text-ink" : "text-grey-2"
                        }`}>
                          {p.jaar}
                        </span>

                        <span className={COL.dekking}>
                          <span className="flex items-center gap-2">
                            <span className="block h-1.5 flex-1 overflow-hidden rounded-full bg-panel-2">
                              <span
                                className={`block h-full rounded-full ${dek >= 100 ? "bg-lime-2" : dek >= 50 ? "bg-[#f4c04f]" : "bg-red-400"}`}
                                style={{ width: `${Math.min(100, dek)}%` }}
                              />
                            </span>
                            <span className="w-8 shrink-0 text-right text-[12px] tabular-nums text-grey-2">
                              {Math.round(dek)}%
                            </span>
                          </span>
                        </span>

                        <span className={COL.actie}>
                          {p.status === "verkennend" && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); offerteAanvragen([p.id]); }}
                              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-grey opacity-0 transition-opacity hover:bg-panel-2 hover:text-forest group-hover:opacity-100"
                              title="Laat een agent offertes opvragen"
                            >
                              <Sparkles className="h-3 w-3" /> Offerte
                            </button>
                          )}
                        </span>

                        <span className={`${COL.bedrag} text-[13px] tabular-nums text-ink`}>{euro(p.bedrag)}</span>

                        <span className={COL.avatar}>
                          <Avatar naam="MB" agent={p.agent} />
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
        <BulkAction onClick={() => offerteAanvragen(gekozen)} icon={FileText}>Offertes opvragen</BulkAction>
        <BulkAction onClick={() => naarAgent(gekozen)} icon={Sparkles}>Naar agent</BulkAction>
        <BulkAction onClick={() => verwijder(gekozen)} icon={Trash2} gevaar>Verwijder</BulkAction>
      </BulkBar>

      <DetailPanel
        open={!!detailPost}
        onClose={() => setDetail(null)}
        kop={
          detailPost && (
            <>
              <span className="text-[12px] tabular-nums text-grey-2">{detailPost.id}</span>
              <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink">{detailPost.jaar}</span>
              {detailPost.agent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
                  <Sparkles className="h-3 w-3" /> Agent
                </span>
              )}
            </>
          )
        }
        voet={
          detailPost && (
            <>
              {detailPost.status === "verkennend" && (
                <button
                  type="button"
                  onClick={() => offerteAanvragen([detailPost.id])}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-forest/90"
                >
                  <Sparkles className="h-4 w-4" /> Offertes opvragen
                </button>
              )}
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-lime-2 px-3 py-2 text-[13px] font-medium text-forest transition-colors hover:bg-lime"
              >
                <CalendarRange className="h-4 w-4" /> Inplannen
              </button>
            </>
          )
        }
      >
        {detailPost && (() => {
          const dek = dekkingPct(detailPost);
          const Icoon = CATEGORIE_ICOON[detailPost.categorie] ?? Wrench;
          return (
            <>
              <div>
                <div className="flex items-center gap-2">
                  <StatusDot toon={gezondheid(detailPost).toon} titel={gezondheid(detailPost).titel} />
                  <h2 className="text-[18px] font-medium leading-snug text-ink">{detailPost.taak}</h2>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-[13px] text-grey">
                  <Building2 className="h-3.5 w-3.5 text-grey-2" /> {detailPost.pand}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Begroot", waarde: euro(detailPost.bedrag) },
                  { label: "Gereserveerd", waarde: euro(detailPost.gereserveerd) },
                  { label: "Uitvoerjaar", waarde: String(detailPost.jaar) },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl bg-panel/70 p-3">
                    <span className="block text-[11px] uppercase tracking-wide text-grey-2">{k.label}</span>
                    <span className="mt-1 block text-[15px] font-medium tabular-nums text-ink">{k.waarde}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wide text-grey-2">Dekking van de reservering</span>
                  <span className={`text-[11px] font-medium tabular-nums ${dek >= 100 ? "text-forest" : "text-[#c99a1f]"}`}>
                    {Math.round(dek)}%
                  </span>
                </div>
                <Progress pct={dek} />
                {dek < 100 && (
                  <p className="mt-2 text-[11px] text-grey-2">
                    Nog {euro(detailPost.bedrag - detailPost.gereserveerd)} te reserveren voor {detailPost.jaar}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wide text-grey-2">Resterende levensduur</span>
                  <span className="text-[11px] tabular-nums text-grey-2">{detailPost.levensduur}%</span>
                </div>
                <Progress pct={detailPost.levensduur} />
              </div>

              <p className="rounded-xl bg-panel/70 p-3 text-[13px] leading-relaxed text-grey">{detailPost.toelichting}</p>

              <DetailVelden>
                <DetailVeld label="Status">{STATUSSEN[detailPost.status]}</DetailVeld>
                <DetailVeld label="Categorie">
                  <Icoon className="h-3.5 w-3.5 text-grey-2" /> {detailPost.categorie}
                </DetailVeld>
                <DetailVeld label="Laatst">
                  <CalendarRange className="h-3.5 w-3.5 text-grey-2" /> {detailPost.laatstUitgevoerd}
                </DetailVeld>
                <DetailVeld label="Uitvoerder">
                  <Avatar naam="MB" agent={detailPost.agent} />
                  {detailPost.agent ? "Domio Agent" : "Mark Bakker"}
                </DetailVeld>
              </DetailVelden>

              <div className="flex items-center gap-4 border-t border-line pt-4 text-[12px] text-grey-2">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" /> {procent((detailPost.bedrag / Math.max(1, totaal)) * 100)} van de totale MJOP
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <Euro className="h-3.5 w-3.5" />
                  {detailPost.jaar <= HUIDIG_JAAR
                    ? "dit jaar aan de beurt"
                    : `over ${detailPost.jaar - HUIDIG_JAAR} jaar aan de beurt`}
                </span>
              </div>
            </>
          );
        })()}
      </DetailPanel>
    </>
  );
}
