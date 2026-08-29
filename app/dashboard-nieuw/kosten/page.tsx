"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Check, Sparkles, Building2, Receipt, AlertTriangle, Trash2, Euro, Calendar,
  Droplets, Flame, Zap, PaintRoller, DoorOpen, Wrench, FileText, User,
} from "lucide-react";
import {
  PageHeader, Toolbar, ToolbarSearch, ToolbarToggle, StatusDot, ListShell, ListHead,
  HeadCell, ListGroup, ListRow, CellMain, Avatar, EmptyState, BulkBar, BulkAction,
  DetailPanel, DetailVeld, DetailVelden, Progress, type SorteerRichting,
} from "../_ui";
import { KpiRow, KpiCard, KpiPill, MiniRing, MiniProgress, useCountUp, euro, procent } from "../_kpi";

/* ─────────────────────────── model ─────────────────────────── */

type Status = "controle" | "akkoord" | "betaald";

type Factuur = {
  id: string;
  partner: string;
  omschrijving: string;
  pand: string;
  melding: string | null;
  categorie: string;
  bedrag: number;
  status: Status;
  datum: string;
  vervalt: number;       // dagen tot vervaldatum, negatief is verlopen
  agent: boolean;
  afwijking: number;     // verschil met de offerte, 0 als er niets afwijkt
  regels: { t: string; bedrag: number }[];
};

const STATUSSEN: { id: Status; label: string }[] = [
  { id: "controle", label: "Te controleren" },
  { id: "akkoord", label: "Goedgekeurd" },
  { id: "betaald", label: "Betaald" },
];

const CATEGORIE_ICOON: Record<string, React.ElementType> = {
  Loodgieterswerk: Droplets,
  "CV en verwarming": Flame,
  Elektra: Zap,
  Schilderwerk: PaintRoller,
  "Deuren en sloten": DoorOpen,
  Overig: Wrench,
};

/* begroot tegenover werkelijk per maand */
const MAANDEN = [
  { month: "feb", begroot: 6800, werkelijk: 7400 },
  { month: "mrt", begroot: 6800, werkelijk: 5900 },
  { month: "apr", begroot: 6800, werkelijk: 8100 },
  { month: "mei", begroot: 6800, werkelijk: 6200 },
  { month: "jun", begroot: 6800, werkelijk: 5400 },
  { month: "jul", begroot: 6800, werkelijk: 4900 },
];

const PER_CATEGORIE = [
  { naam: "CV en verwarming", bedrag: 18400 },
  { naam: "Loodgieterswerk", bedrag: 14250 },
  { naam: "Elektra", bedrag: 9800 },
  { naam: "Schilderwerk", bedrag: 7600 },
  { naam: "Deuren en sloten", bedrag: 4100 },
  { naam: "Overig", bedrag: 3190 },
];

const PER_PAND = [
  { naam: "Kade 12", bedrag: 16800, eenheden: 12 },
  { naam: "Prinsengracht 42", bedrag: 12400, eenheden: 8 },
  { naam: "Havenweg 8", bedrag: 9600, eenheden: 4 },
  { naam: "Lindenlaan 21", bedrag: 8300, eenheden: 6 },
  { naam: "Parkzicht 3", bedrag: 5400, eenheden: 6 },
  { naam: "Molenstraat 5", bedrag: 4840, eenheden: 1 },
];

const FACTUREN: Factuur[] = [
  {
    id: "F-1042", partner: "Loodgieter Jansen", omschrijving: "Lekkage gootsteen verhelpen",
    pand: "Prinsengracht 42", melding: "M-2417", categorie: "Loodgieterswerk", bedrag: 340,
    status: "controle", datum: "vandaag", vervalt: 30, agent: true, afwijking: 0,
    regels: [{ t: "Voorrijkosten", bedrag: 45 }, { t: "Arbeid 2 uur", bedrag: 190 }, { t: "Materiaal", bedrag: 105 }],
  },
  {
    id: "F-1041", partner: "Elektro Bakker", omschrijving: "Groep vervangen en stopcontacten",
    pand: "Kade 12", melding: "M-2415", categorie: "Elektra", bedrag: 415,
    status: "controle", datum: "gisteren", vervalt: 29, agent: true, afwijking: 70,
    regels: [{ t: "Arbeid 3 uur", bedrag: 285 }, { t: "Materiaal", bedrag: 130 }],
  },
  {
    id: "F-1039", partner: "Liftservice Nederland", omschrijving: "Deursensor vervangen",
    pand: "Kade 12", melding: "M-2405", categorie: "Overig", bedrag: 620,
    status: "akkoord", datum: "3 dagen geleden", vervalt: 27, agent: true, afwijking: 0,
    regels: [{ t: "Spoedtoeslag", bedrag: 120 }, { t: "Arbeid", bedrag: 260 }, { t: "Onderdeel", bedrag: 240 }],
  },
  {
    id: "F-1036", partner: "Schildersbedrijf De Vries", omschrijving: "Schilderwerk trappenhuis",
    pand: "Havenweg 8", melding: null, categorie: "Schilderwerk", bedrag: 2840,
    status: "akkoord", datum: "vorige week", vervalt: 21, agent: false, afwijking: 0,
    regels: [{ t: "Arbeid 4 dagen", bedrag: 2200 }, { t: "Verf en materiaal", bedrag: 640 }],
  },
  {
    id: "F-1031", partner: "Loodgieter Jansen", omschrijving: "CV-onderhoud jaarlijks",
    pand: "Lindenlaan 21", melding: null, categorie: "CV en verwarming", bedrag: 1180,
    status: "betaald", datum: "2 weken geleden", vervalt: 0, agent: true, afwijking: 0,
    regels: [{ t: "Onderhoudsbeurt 6 ketels", bedrag: 1080 }, { t: "Kleine onderdelen", bedrag: 100 }],
  },
  {
    id: "F-1028", partner: "Slotenservice Amsterdam", omschrijving: "Cilinders vervangen",
    pand: "Parkzicht 3", melding: null, categorie: "Deuren en sloten", bedrag: 465,
    status: "betaald", datum: "3 weken geleden", vervalt: 0, agent: true, afwijking: 0,
    regels: [{ t: "Arbeid", bedrag: 165 }, { t: "3 cilinders", bedrag: 300 }],
  },
  {
    id: "F-1024", partner: "Elektro Bakker", omschrijving: "Noodverlichting keuren",
    pand: "Kade 12", melding: null, categorie: "Elektra", bedrag: 380,
    status: "betaald", datum: "vorige maand", vervalt: 0, agent: false, afwijking: 0,
    regels: [{ t: "Keuring 14 armaturen", bedrag: 380 }],
  },
];

const BEGROOT_JAAR = 124000;

/* ─────────────────────────── hulpjes ─────────────────────────── */

const COL = {
  status: "w-4 shrink-0",
  categorie: "hidden w-[132px] shrink-0 lg:flex",
  pand: "hidden w-[124px] shrink-0 xl:block",
  vervalt: "hidden w-[82px] shrink-0 text-right md:block",
  actie: "hidden w-[68px] shrink-0 lg:block",
  bedrag: "w-[88px] shrink-0 text-right",
  avatar: "w-6 shrink-0",
};

const FOREST = "#1d3014";
const GREY = "#97978f";

function gezondheid(f: Factuur): { toon: "goed" | "let-op" | "slecht"; titel: string } {
  if (f.afwijking > 0) return { toon: "slecht", titel: `${euro(f.afwijking)} boven de offerte` };
  if (f.status === "controle" && f.vervalt < 7) return { toon: "let-op", titel: `Vervalt over ${f.vervalt} dagen` };
  if (f.status === "controle") return { toon: "let-op", titel: "Wacht op controle" };
  return { toon: "goed", titel: f.status === "betaald" ? "Betaald" : "Goedgekeurd" };
}

const KOLOM_WAARDE: Record<string, (f: Factuur) => string> = {
  categorie: (f) => f.categorie,
  pand: (f) => f.pand,
};

const KOLOM_OPTIES: Record<string, string[]> = {
  categorie: Object.keys(CATEGORIE_ICOON),
  pand: Array.from(new Set(FACTUREN.map((f) => f.pand))).sort(),
};

const SORTEER: Record<string, (f: Factuur) => number | string> = {
  factuur: (f) => f.partner.toLowerCase(),
  bedrag: (f) => f.bedrag,
  vervalt: (f) => f.vervalt,
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="space-y-1 rounded-xl border border-line bg-paper px-3 py-2.5 text-[12px] shadow-sm">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.name === "werkelijk" ? FOREST : GREY }} />
          <span className="text-grey">{p.name === "werkelijk" ? "Werkelijk" : "Begroot"}</span>
          <span className="ml-auto font-medium text-ink">{euro(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── pagina ─────────────────────────── */

type GroepOp = "status" | "categorie" | "pand" | "geen";

export default function KostenPage() {
  const [facturen, setFacturen] = useState(FACTUREN);
  const [groepOp, setGroepOp] = useState<GroepOp>("status");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sorteer, setSorteer] = useState<{ kolom: string; richting: SorteerRichting } | null>(null);
  const [query, setQuery] = useState("");
  const [alleenAandacht, setAlleenAandacht] = useState(false);
  const [dicht, setDicht] = useState<string[]>([]);
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);

  const zetFilter = (k: string, v: string[]) => setFilters((f) => ({ ...f, [k]: v }));
  const zetSorteer = (kolom: string, richting: SorteerRichting) =>
    setSorteer((s) => (s?.kolom === kolom && s.richting === richting ? null : { kolom, richting }));

  const q = query.trim().toLowerCase();
  const zichtbaar = useMemo(() => {
    const lijst = facturen.filter((f) => {
      const mq = !q || f.partner.toLowerCase().includes(q) || f.omschrijving.toLowerCase().includes(q) || f.id.toLowerCase().includes(q);
      const mf = Object.entries(filters).every(([k, v]) => !v.length || v.includes(KOLOM_WAARDE[k](f)));
      return mq && mf && (!alleenAandacht || gezondheid(f).toon !== "goed");
    });
    if (!sorteer) return lijst;
    const w = SORTEER[sorteer.kolom];
    return [...lijst].sort((a, b) => {
      const va = w(a), vb = w(b);
      const vgl = typeof va === "string" ? String(va).localeCompare(String(vb)) : Number(va) - Number(vb);
      return sorteer.richting === "hoog" ? -vgl : vgl;
    });
  }, [facturen, q, filters, alleenAandacht, sorteer]);

  const groepen = useMemo(() => {
    if (groepOp === "geen") return [{ key: "alles", label: "", items: zichtbaar }];
    if (groepOp === "status")
      return STATUSSEN.map((s) => ({ key: s.id, label: s.label, items: zichtbaar.filter((f) => f.status === s.id) }));
    const sleutel = (f: Factuur) => (groepOp === "categorie" ? f.categorie : f.pand);
    const namen = Array.from(new Set(zichtbaar.map(sleutel))).sort();
    return namen.map((n) => ({ key: n, label: n, items: zichtbaar.filter((f) => sleutel(f) === n) }));
  }, [zichtbaar, groepOp]);

  const toggleKies = useCallback((id: string) => {
    setGekozen((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);
  const goedkeuren = useCallback((ids: string[]) => {
    setFacturen((p) => p.map((f) => (ids.includes(f.id) ? { ...f, status: "akkoord" } : f)));
    setGekozen([]);
  }, []);
  const naarAgent = useCallback((ids: string[]) => {
    setFacturen((p) => p.map((f) => (ids.includes(f.id) ? { ...f, agent: true } : f)));
    setGekozen([]);
  }, []);
  const verwijder = useCallback((ids: string[]) => {
    setFacturen((p) => p.filter((f) => !ids.includes(f.id)));
    setGekozen([]);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [detail]);

  /* cijfers */
  const besteed = PER_CATEGORIE.reduce((s, c) => s + c.bedrag, 0);
  const bestedPct = (besteed / BEGROOT_JAAR) * 100;
  const teControleren = facturen.filter((f) => f.status === "controle");
  const openBedrag = teControleren.reduce((s, f) => s + f.bedrag, 0);
  const afwijkend = facturen.filter((f) => f.afwijking > 0);
  const totEenheden = PER_PAND.reduce((s, p) => s + p.eenheden, 0);
  const perEenheid = totEenheden ? besteed / totEenheden : 0;
  const doorAgent = facturen.filter((f) => f.agent).length;
  const detailFactuur = facturen.find((f) => f.id === detail) || null;

  const besteedTeller = useCountUp(besteed);
  const openTeller = useCountUp(openBedrag);
  const perEenheidTeller = useCountUp(perEenheid);

  const maxCategorie = Math.max(...PER_CATEGORIE.map((c) => c.bedrag));
  const maxPand = Math.max(...PER_PAND.map((p) => p.bedrag));

  return (
    <>
      <PageHeader
        title="Onderhoudskosten"
        subtitle={
          <>
            {euro(besteed)} besteed van {euro(BEGROOT_JAAR)} begroot
            {afwijkend.length > 0 && <> · <span className="font-medium text-red-500">{afwijkend.length} factuur wijkt af</span></>}
          </>
        }
        action={{ label: "Factuur toevoegen" }}
      />

      <KpiRow>
        <KpiCard
          label="Besteed dit jaar"
          waarde={euro(besteedTeller)}
          sub={`nog ${euro(BEGROOT_JAAR - besteed)} te gaan`}
          badge={<KpiPill>{procent(bestedPct)} besteed</KpiPill>}
        >
          <MiniProgress pct={bestedPct} />
        </KpiCard>

        <KpiCard
          label="Te controleren"
          waarde={euro(openTeller)}
          toon={afwijkend.length > 0 ? "slecht" : teControleren.length > 0 ? "let-op" : "goed"}
          sub={`${teControleren.length} facturen wachten op akkoord`}
        />

        <KpiCard
          label="Per eenheid"
          waarde={euro(perEenheidTeller)}
          sub={`over ${totEenheden} eenheden dit jaar`}
          badge={<KpiPill>{PER_PAND.length} panden</KpiPill>}
        />

        <div className="flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-line">
          <span className="text-[12px] uppercase tracking-wide text-grey-2">Door agents afgehandeld</span>
          <div className="mt-4 flex flex-1 items-center gap-4">
            <MiniRing
              pct={(doorAgent / facturen.length) * 100}
              formaat={72} dik={3.4} kleur="#5cc93f" tekstKlasse="text-[15px] text-forest"
            />
            <div className="min-w-0">
              <div className="text-[15px] font-medium text-ink">Facturen</div>
              <div className="mt-1 text-[12px] text-grey-2">{doorAgent} van {facturen.length} gecontroleerd</div>
            </div>
          </div>
        </div>
      </KpiRow>

      {/* verloop en verdeling */}
      <div className="mb-6 grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-paper p-5 ring-1 ring-line">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-grey">Uitgaven per maand</p>
              <p className="mt-1.5 text-[26px] font-medium leading-none text-forest">{euro(MAANDEN[MAANDEN.length - 1].werkelijk)}</p>
              <p className="mt-1.5 text-[12px] text-grey-2">deze maand tot nu toe</p>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-[11px] text-grey-2">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-full bg-forest" /> Werkelijk</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-px w-3 border-t-2 border-dashed border-grey-2/60" /> Begroot</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MAANDEN} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="kost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={FOREST} stopOpacity={0.14} />
                  <stop offset="100%" stopColor={FOREST} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecece8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GREY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: GREY }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} width={44} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="begroot" name="begroot" stroke={GREY} strokeWidth={1.5} strokeDasharray="4 3" fill="none" dot={false} activeDot={{ r: 3, fill: GREY }} />
              <Area type="monotone" dataKey="werkelijk" name="werkelijk" stroke={FOREST} strokeWidth={2.5} fill="url(#kost)" dot={false} activeDot={{ r: 4, fill: FOREST }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col rounded-2xl bg-paper p-5 ring-1 ring-line">
          <p className="text-[13px] font-medium text-grey">Per categorie</p>
          <ul className="mt-4 flex flex-1 flex-col justify-between gap-3">
            {PER_CATEGORIE.map((c) => {
              const Icoon = CATEGORIE_ICOON[c.naam] ?? Wrench;
              return (
                <li key={c.naam}>
                  <div className="mb-1.5 flex items-center gap-2 text-[13px]">
                    <Icoon className="h-3.5 w-3.5 shrink-0 text-grey-2" />
                    <span className="truncate text-ink">{c.naam}</span>
                    <span className="ml-auto shrink-0 tabular-nums text-grey">{euro(c.bedrag)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-panel-2">
                    <div className="h-full rounded-full bg-lime-2" style={{ width: `${(c.bedrag / maxCategorie) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* per pand */}
      <div className="mb-6 rounded-2xl bg-paper p-5 ring-1 ring-line">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-[13px] font-medium text-grey">Per pand</p>
          <span className="text-[12px] text-grey-2">kosten en kosten per eenheid</span>
        </div>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
          {PER_PAND.map((p) => (
            <li key={p.naam}>
              <div className="mb-1.5 flex items-baseline gap-2 text-[13px]">
                <span className="truncate text-ink">{p.naam}</span>
                <span className="ml-auto shrink-0 tabular-nums text-grey">{euro(p.bedrag)}</span>
                <span className="w-[74px] shrink-0 text-right text-[12px] tabular-nums text-grey-2">
                  {euro(p.bedrag / p.eenheden)} p/e
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-panel-2">
                <div className="h-full rounded-full bg-forest/70" style={{ width: `${(p.bedrag / maxPand) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Toolbar>
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Zoek op partner, omschrijving of nummer..." />
        <ToolbarToggle actief={alleenAandacht} onClick={() => setAlleenAandacht((v) => !v)} icon={AlertTriangle}>
          Aandacht nodig
        </ToolbarToggle>
      </Toolbar>

      <ListShell>
        {zichtbaar.length === 0 ? (
          <EmptyState icon={Receipt} titel="Geen facturen gevonden" tekst="Pas je zoekopdracht of filter aan." />
        ) : (
          <>
            <ListHead>
              <span className={COL.status} />
              <HeadCell
                label="Factuur" className="min-w-0 flex-1"
                sorteerbaar sorteerId="factuur" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Z naar A", laag: "A naar Z" }}
                groep={groepOp} onGroep={(id) => setGroepOp(id as GroepOp)}
                groepeerOpties={[
                  { id: "status", label: "Status" },
                  { id: "categorie", label: "Categorie" },
                  { id: "pand", label: "Pand" },
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
                label="Vervalt" className={COL.vervalt} rechts
                sorteerbaar sorteerId="vervalt" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Verst weg eerst", laag: "Eerst vervallend" }}
              />
              <span className={COL.actie} />
              <HeadCell
                label="Bedrag" className={COL.bedrag} rechts
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
                  {g.items.map((f) => {
                    const isGekozen = gekozen.includes(f.id);
                    const gz = gezondheid(f);
                    const Icoon = CATEGORIE_ICOON[f.categorie] ?? Wrench;
                    return (
                      <ListRow key={f.id} gekozen={isGekozen} onClick={() => setDetail(f.id)}>
                        <span className={`${COL.status} relative grid h-4 place-items-center`}>
                          <span className={isGekozen ? "hidden" : "group-hover:hidden"}>
                            <StatusDot toon={gz.toon} titel={gz.titel} />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleKies(f.id); }}
                            aria-label="Selecteren"
                            className={`grid h-4 w-4 place-items-center rounded border transition-colors ${
                              isGekozen ? "border-forest bg-forest text-paper" : "hidden border-grey-2 text-transparent group-hover:grid"
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </button>
                        </span>

                        <CellMain
                          titel={f.partner}
                          sub={`${f.omschrijving}${f.melding ? ` · ${f.melding}` : ""}`}
                        />

                        <span className={`${COL.categorie} items-center gap-1.5 text-[13px] text-grey`}>
                          <Icoon className="h-3.5 w-3.5 shrink-0 text-grey-2" />
                          <span className="truncate">{f.categorie}</span>
                        </span>

                        <span className={`${COL.pand} truncate text-[13px] text-grey-2`}>{f.pand}</span>

                        <span className={`${COL.vervalt} text-[13px] tabular-nums ${
                          f.status === "betaald" ? "text-grey-2"
                            : f.vervalt < 7 ? "font-medium text-[#c99a1f]" : "text-grey-2"
                        }`}>
                          {f.status === "betaald" ? "—" : `${f.vervalt} dgn`}
                        </span>

                        <span className={COL.actie}>
                          {f.status === "controle" && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); goedkeuren([f.id]); }}
                              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-grey opacity-0 transition-opacity hover:bg-panel-2 hover:text-forest group-hover:opacity-100"
                              title="Factuur goedkeuren"
                            >
                              <Check className="h-3 w-3" /> Akkoord
                            </button>
                          )}
                        </span>

                        <span className={`${COL.bedrag} text-[13px] tabular-nums ${f.afwijking > 0 ? "font-medium text-red-500" : "text-ink"}`}>
                          {euro(f.bedrag)}
                        </span>

                        <span className={COL.avatar}>
                          <Avatar naam="MB" agent={f.agent} />
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
        <BulkAction onClick={() => goedkeuren(gekozen)} icon={Check}>Goedkeuren</BulkAction>
        <BulkAction onClick={() => naarAgent(gekozen)} icon={Sparkles}>Naar agent</BulkAction>
        <BulkAction onClick={() => verwijder(gekozen)} icon={Trash2} gevaar>Verwijder</BulkAction>
      </BulkBar>

      <DetailPanel
        open={!!detailFactuur}
        onClose={() => setDetail(null)}
        kop={
          detailFactuur && (
            <>
              <span className="text-[12px] tabular-nums text-grey-2">{detailFactuur.id}</span>
              {detailFactuur.agent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
                  <Sparkles className="h-3 w-3" /> Agent
                </span>
              )}
            </>
          )
        }
        voet={
          detailFactuur && (
            <button
              type="button"
              onClick={() => goedkeuren([detailFactuur.id])}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                detailFactuur.status === "controle" ? "bg-lime-2 text-forest hover:bg-lime" : "bg-panel text-grey hover:bg-panel-2"
              }`}
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
              {detailFactuur.status === "controle" ? "Factuur goedkeuren" : "Goedgekeurd"}
            </button>
          )
        }
      >
        {detailFactuur && (
          <>
            <div>
              <div className="flex items-center gap-2">
                <StatusDot {...gezondheid(detailFactuur)} />
                <h2 className="text-[18px] font-medium leading-snug text-ink">{detailFactuur.partner}</h2>
              </div>
              <p className="mt-0.5 text-[13px] text-grey">{detailFactuur.omschrijving}</p>
            </div>

            {detailFactuur.afwijking > 0 && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-[13px] text-red-600">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Deze factuur ligt <span className="font-medium">{euro(detailFactuur.afwijking)}</span> boven de
                  goedgekeurde offerte. Vraag de partner om een toelichting voordat je akkoord geeft.
                </span>
              </div>
            )}

            {/* factuurregels */}
            <div>
              <span className="mb-2 block text-[11px] uppercase tracking-wide text-grey-2">Factuurregels</span>
              <ul className="divide-y divide-line rounded-xl bg-panel/70">
                {detailFactuur.regels.map((r, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-2 text-[13px]">
                    <span className="text-grey">{r.t}</span>
                    <span className="tabular-nums text-ink">{euro(r.bedrag)}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between px-3 py-2 text-[13px]">
                  <span className="font-medium text-ink">Totaal</span>
                  <span className="font-medium tabular-nums text-ink">{euro(detailFactuur.bedrag)}</span>
                </li>
              </ul>
            </div>

            <DetailVelden>
              <DetailVeld label="Status">
                {STATUSSEN.find((s) => s.id === detailFactuur.status)!.label}
              </DetailVeld>
              <DetailVeld label="Pand">
                <Building2 className="h-3.5 w-3.5 text-grey-2" /> {detailFactuur.pand}
              </DetailVeld>
              <DetailVeld label="Melding">
                {detailFactuur.melding ? (
                  <><FileText className="h-3.5 w-3.5 text-grey-2" /> {detailFactuur.melding}</>
                ) : (
                  <span className="text-grey-2">Gepland onderhoud</span>
                )}
              </DetailVeld>
              <DetailVeld label="Ontvangen">
                <Calendar className="h-3.5 w-3.5 text-grey-2" /> {detailFactuur.datum}
              </DetailVeld>
              <DetailVeld label="Vervalt">
                {detailFactuur.status === "betaald" ? (
                  <span className="text-grey-2">Betaald</span>
                ) : (
                  <span className={detailFactuur.vervalt < 7 ? "text-[#c99a1f]" : ""}>over {detailFactuur.vervalt} dagen</span>
                )}
              </DetailVeld>
              <DetailVeld label="Partner">
                <User className="h-3.5 w-3.5 text-grey-2" /> {detailFactuur.partner}
              </DetailVeld>
            </DetailVelden>

            <div className="flex items-center gap-4 border-t border-line pt-4 text-[12px] text-grey-2">
              <span className="flex items-center gap-1.5">
                <Euro className="h-3.5 w-3.5" /> {procent((detailFactuur.bedrag / BEGROOT_JAAR) * 100)} van het jaarbudget
              </span>
            </div>
          </>
        )}
      </DetailPanel>
    </>
  );
}
