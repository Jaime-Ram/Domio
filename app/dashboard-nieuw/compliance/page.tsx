"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Check, Sparkles, Building2, ShieldCheck, ShieldAlert, Trash2, CalendarClock,
  Flame, Zap, Droplets, ArrowUpDown, Leaf, FileCheck2, RefreshCw, Repeat,
} from "lucide-react";
import {
  PageHeader, Toolbar, ToolbarSearch, ToolbarToggle, StatusDot, ListShell, ListHead,
  HeadCell, ListGroup, ListRow, CellMain, Avatar, EmptyState, BulkBar, BulkAction,
  DetailPanel, DetailVeld, DetailVelden, type SorteerRichting,
} from "../_ui";
import { KpiRow, KpiCard, KpiPill, MiniRing, useCountUp, getal, procent } from "../_kpi";

/* ─────────────────────────── model ─────────────────────────── */

type Keuring = {
  id: string;
  soort: string;
  pand: string;
  categorie: string;
  dagen: number;          // dagen tot vervaldatum, negatief is verlopen
  vervalt: string;
  interval: string;
  partner: string;
  agent: boolean;         // wordt automatisch verlengd door een agent
  verplicht: boolean;     // wettelijk verplicht
  toelichting: string;
};

const CATEGORIE_ICOON: Record<string, React.ElementType> = {
  "Brand en veiligheid": ShieldAlert,
  Elektra: Zap,
  Energie: Leaf,
  Installaties: Flame,
  Lift: ArrowUpDown,
  Water: Droplets,
};

const KEURINGEN: Keuring[] = [
  {
    id: "CP-201", soort: "Liftkeuring", pand: "Kade 12", categorie: "Lift",
    dagen: -34, vervalt: "22 jun 2026", interval: "elke 18 maanden", partner: "Otis Nederland",
    agent: false, verplicht: true,
    toelichting: "De wettelijke keuring is verlopen. Zonder geldig certificaat mag de lift formeel niet in gebruik zijn.",
  },
  {
    id: "CP-204", soort: "Elektrakeuring NEN 3140", pand: "Molenstraat 5", categorie: "Elektra",
    dagen: -8, vervalt: "18 jul 2026", interval: "elke 5 jaar", partner: "Elektra Vermeer",
    agent: false, verplicht: true,
    toelichting: "Inspectie van de installatie in de algemene ruimtes. De verzekeraar vraagt hier jaarlijks naar.",
  },
  {
    id: "CP-207", soort: "Gasketel-onderhoud", pand: "Prinsengracht 42", categorie: "Installaties",
    dagen: 21, vervalt: "16 aug 2026", interval: "jaarlijks", partner: "Installatiebedrijf Kroon",
    agent: true, verplicht: true,
    toelichting: "Jaarlijkse beurt van twaalf ketels. De agent plant dit automatisch zes weken voor de vervaldatum in.",
  },
  {
    id: "CP-210", soort: "Brandveiligheidscheck", pand: "Lindenlaan 21", categorie: "Brand en veiligheid",
    dagen: 44, vervalt: "08 sep 2026", interval: "jaarlijks", partner: "Ajax Brandbeveiliging",
    agent: true, verplicht: true,
    toelichting: "Controle van blusmiddelen, vluchtwegaanduiding en rookmelders.",
  },
  {
    id: "CP-213", soort: "Legionellabeheer", pand: "Parkzicht 3", categorie: "Water",
    dagen: 57, vervalt: "21 sep 2026", interval: "elke 6 maanden", partner: "Aqua Control",
    agent: true, verplicht: true,
    toelichting: "Monstername op vier tappunten plus actualisatie van het beheersplan.",
  },
  {
    id: "CP-216", soort: "Energielabel", pand: "Havenweg 8", categorie: "Energie",
    dagen: 96, vervalt: "30 okt 2026", interval: "elke 10 jaar", partner: "EPA-adviseur Blom",
    agent: false, verplicht: true,
    toelichting: "Label C loopt af. Bij verhuur van kantoorruimte is minimaal label C verplicht.",
  },
  {
    id: "CP-219", soort: "Rookmelders controle", pand: "Zuiderpad 17", categorie: "Brand en veiligheid",
    dagen: 128, vervalt: "01 dec 2026", interval: "jaarlijks", partner: "Ajax Brandbeveiliging",
    agent: true, verplicht: true,
    toelichting: "Sinds 2022 zijn rookmelders op elke verdieping verplicht, ook in bestaande bouw.",
  },
  {
    id: "CP-222", soort: "Dakveiligheid keuring", pand: "Vaartweg 90", categorie: "Brand en veiligheid",
    dagen: 173, vervalt: "15 jan 2027", interval: "jaarlijks", partner: "Veilig Werken op Hoogte",
    agent: false, verplicht: false,
    toelichting: "Ankerpunten op het dak. Niet wettelijk verplicht, wel nodig om partners veilig te laten werken.",
  },
  {
    id: "CP-225", soort: "Gasketel-onderhoud", pand: "Kade 12", categorie: "Installaties",
    dagen: 205, vervalt: "16 feb 2027", interval: "jaarlijks", partner: "Installatiebedrijf Kroon",
    agent: true, verplicht: true,
    toelichting: "Jaarlijkse beurt, gepland in het lage seizoen van de installateur.",
  },
  {
    id: "CP-228", soort: "Liftkeuring", pand: "Parkzicht 3", categorie: "Lift",
    dagen: 241, vervalt: "24 mrt 2027", interval: "elke 18 maanden", partner: "Otis Nederland",
    agent: true, verplicht: true,
    toelichting: "Loopt via het onderhoudscontract met Otis, de agent bewaakt de datum.",
  },
];

/* ─────────────────────────── hulpjes ─────────────────────────── */

const COL = {
  status: "w-4 shrink-0",
  categorie: "hidden w-[150px] shrink-0 lg:flex",
  pand: "hidden w-[124px] shrink-0 xl:block",
  interval: "hidden w-[124px] shrink-0 xl:flex",
  termijn: "hidden w-[152px] shrink-0 md:block",
  actie: "hidden w-[76px] shrink-0 lg:block",
  vervalt: "w-[86px] shrink-0 text-right",
  avatar: "w-6 shrink-0",
};

/* het signaal hier is tijd: hoeveel dagen zijn er nog tot de vervaldatum */
function gezondheid(k: Keuring): { toon: "goed" | "let-op" | "slecht"; titel: string } {
  if (k.dagen < 0) return { toon: "slecht", titel: `${Math.abs(k.dagen)} dagen verlopen` };
  if (k.dagen <= 60) return { toon: "let-op", titel: `verloopt over ${k.dagen} dagen` };
  return { toon: "goed", titel: `nog ${k.dagen} dagen geldig` };
}

function termijnTekst(k: Keuring) {
  if (k.dagen < 0) return `${Math.abs(k.dagen)} d te laat`;
  if (k.dagen === 0) return "vandaag";
  return `nog ${k.dagen} d`;
}

const KOLOM_WAARDE: Record<string, (k: Keuring) => string> = {
  categorie: (k) => k.categorie,
  pand: (k) => k.pand,
  soort: (k) => k.soort,
};

const KOLOM_OPTIES: Record<string, string[]> = {
  categorie: Object.keys(CATEGORIE_ICOON).sort(),
  pand: Array.from(new Set(KEURINGEN.map((k) => k.pand))).sort(),
};

const SORTEER: Record<string, (k: Keuring) => number | string> = {
  keuring: (k) => k.soort.toLowerCase(),
  vervalt: (k) => k.dagen,
};

const MAANDEN = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/* de eerstvolgende keuringen in een kaart, zodat het cijfer meteen een gezicht heeft */
function MiniLijst({
  items, toon, onKies,
}: { items: Keuring[]; toon: "let-op" | "slecht"; onKies: (id: string) => void }) {
  if (!items.length) {
    return <span className="text-[12px] text-grey-2">niets open</span>;
  }
  const kleur = toon === "slecht" ? "bg-red-400" : "bg-[#f4c04f]";
  return (
    <div className="w-full space-y-1">
      {[...items].sort((a, b) => a.dagen - b.dagen).slice(0, 3).map((k) => (
        <button
          key={k.id}
          type="button"
          onClick={() => onKies(k.id)}
          className="flex w-full items-center gap-2 rounded-md px-1 py-[3px] text-left transition-colors hover:bg-panel"
        >
          <span className={`block h-1.5 w-1.5 shrink-0 rounded-full ${kleur}`} />
          <span className="min-w-0 flex-1 truncate text-[12px] text-grey">{k.soort}</span>
          <span className="shrink-0 text-[11px] tabular-nums text-grey-2">{termijnTekst(k)}</span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── pagina ─────────────────────────── */

type GroepOp = "termijn" | "pand" | "categorie" | "geen";

const TERMIJN_GROEP = (k: Keuring) =>
  k.dagen < 0 ? "Verlopen" : k.dagen <= 60 ? "Verloopt binnen 60 dagen" : "Op orde";
const TERMIJN_VOLGORDE = ["Verlopen", "Verloopt binnen 60 dagen", "Op orde"];

export default function CompliancePage() {
  const [keuringen, setKeuringen] = useState(KEURINGEN);
  const [groepOp, setGroepOp] = useState<GroepOp>("termijn");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sorteer, setSorteer] = useState<{ kolom: string; richting: SorteerRichting } | null>(null);
  const [query, setQuery] = useState("");
  const [alleenActie, setAlleenActie] = useState(false);
  const [dicht, setDicht] = useState<string[]>([]);
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);

  const zetFilter = (k: string, v: string[]) => setFilters((f) => ({ ...f, [k]: v }));
  const zetSorteer = (kolom: string, richting: SorteerRichting) =>
    setSorteer((s) => (s?.kolom === kolom && s.richting === richting ? null : { kolom, richting }));

  const q = query.trim().toLowerCase();
  const zichtbaar = useMemo(() => {
    const lijst = keuringen.filter((k) => {
      const mq = !q || k.soort.toLowerCase().includes(q) || k.pand.toLowerCase().includes(q) || k.partner.toLowerCase().includes(q);
      const mf = Object.entries(filters).every(([kol, v]) => !v.length || v.includes(KOLOM_WAARDE[kol](k)));
      return mq && mf && (!alleenActie || k.dagen <= 60);
    });
    if (!sorteer) return [...lijst].sort((a, b) => a.dagen - b.dagen);
    const w = SORTEER[sorteer.kolom];
    return [...lijst].sort((a, b) => {
      const va = w(a), vb = w(b);
      const vgl = typeof va === "string" ? va.localeCompare(String(vb)) : Number(va) - Number(vb);
      return sorteer.richting === "hoog" ? -vgl : vgl;
    });
  }, [keuringen, q, filters, alleenActie, sorteer]);

  const groepen = useMemo(() => {
    if (groepOp === "geen") return [{ key: "alles", label: "", items: zichtbaar }];
    if (groepOp === "termijn") {
      return TERMIJN_VOLGORDE.map((n) => ({ key: n, label: n, items: zichtbaar.filter((k) => TERMIJN_GROEP(k) === n) }));
    }
    const sleutel = KOLOM_WAARDE[groepOp];
    const namen = Array.from(new Set(zichtbaar.map(sleutel))).sort();
    return namen.map((n) => ({ key: n, label: n, items: zichtbaar.filter((k) => sleutel(k) === n) }));
  }, [zichtbaar, groepOp]);

  const toggleKies = useCallback((id: string) => {
    setGekozen((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);
  const naarAgent = useCallback((ids: string[]) => {
    setKeuringen((p) => p.map((x) => (ids.includes(x.id) ? { ...x, agent: true } : x)));
    setGekozen([]);
  }, []);
  const verwijder = useCallback((ids: string[]) => {
    setKeuringen((p) => p.filter((x) => !ids.includes(x.id)));
    setGekozen([]);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [detail]);

  /* cijfers */
  const verlopen = keuringen.filter((k) => k.dagen < 0);
  const bijnaOm = keuringen.filter((k) => k.dagen >= 0 && k.dagen <= 60);
  const opOrde = keuringen.filter((k) => k.dagen > 60);
  const opOrdePct = keuringen.length ? (opOrde.length / keuringen.length) * 100 : 100;
  const bewaaktPct = keuringen.length ? (keuringen.filter((k) => k.agent).length / keuringen.length) * 100 : 0;
  const detailItem = keuringen.find((k) => k.id === detail) || null;

  const opOrdeTeller = useCountUp(opOrde.length);

  /* vervalkalender: aantal keuringen per komende maand */
  const kalender = useMemo(() => {
    const start = 6; // juli 2026
    return Array.from({ length: 9 }, (_, i) => {
      const vanaf = i * 30, tot = (i + 1) * 30;
      const items = keuringen.filter((k) => (i === 0 ? k.dagen < tot : k.dagen >= vanaf && k.dagen < tot));
      return {
        maand: MAANDEN[(start + i) % 12],
        jaar: 2026 + Math.floor((start + i) / 12),
        aantal: items.length,
        laat: items.some((k) => k.dagen < 0),
      };
    });
  }, [keuringen]);
  const kalenderMax = Math.max(1, ...kalender.map((m) => m.aantal));

  return (
    <>
      <PageHeader
        title="Compliance"
        subtitle={
          <>
            {keuringen.length} keuringen bewaakt
            {verlopen.length > 0 && <> · <span className="font-medium text-red-500">{verlopen.length} verlopen</span></>}
            {bijnaOm.length > 0 && <> · <span className="font-medium text-[#c99a1f]">{bijnaOm.length} verloopt binnenkort</span></>}
          </>
        }
        action={{ label: "Keuring toevoegen" }}
      />

      <KpiRow>
        <KpiCard
          label="Op orde"
          waarde={getal(opOrdeTeller)}
          toon={verlopen.length ? "neutraal" : "goed"}
          sub={`van ${keuringen.length} bewaakte keuringen`}
          badge={<KpiPill>{procent(opOrdePct)} geldig</KpiPill>}
        >
          <div className="w-full">
            <div className="flex h-2 w-full gap-1 overflow-hidden">
              {[
                { n: opOrde.length, kleur: "bg-lime-2" },
                { n: bijnaOm.length, kleur: "bg-[#f4c04f]" },
                { n: verlopen.length, kleur: "bg-red-400" },
              ].map((s, i) => s.n > 0 && (
                <span
                  key={i}
                  className={`block h-full rounded-full ${s.kleur}`}
                  style={{ width: `${(s.n / keuringen.length) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-grey-2">
              <span className="flex items-center gap-1.5"><span className="block h-1.5 w-1.5 rounded-full bg-lime-2" /> {opOrde.length} op orde</span>
              <span className="flex items-center gap-1.5"><span className="block h-1.5 w-1.5 rounded-full bg-[#f4c04f]" /> {bijnaOm.length} binnenkort</span>
              <span className="flex items-center gap-1.5"><span className="block h-1.5 w-1.5 rounded-full bg-red-400" /> {verlopen.length} verlopen</span>
            </div>
          </div>
        </KpiCard>

        <KpiCard
          label="Verloopt < 60 dagen"
          waarde={String(bijnaOm.length)}
          toon={bijnaOm.length ? "let-op" : "goed"}
          sub={bijnaOm.length ? `eerstvolgende over ${Math.min(...bijnaOm.map((k) => k.dagen))} dagen` : "niets op korte termijn"}
        >
          <MiniLijst items={bijnaOm} toon="let-op" onKies={setDetail} />
        </KpiCard>

        <KpiCard
          label="Verlopen"
          waarde={String(verlopen.length)}
          toon={verlopen.length ? "slecht" : "goed"}
          sub={verlopen.length ? "vraagt direct actie" : "alles binnen de termijn"}
        >
          <MiniLijst items={verlopen} toon="slecht" onKies={setDetail} />
        </KpiCard>

        <div className="flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-line">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[12px] uppercase tracking-wide text-grey-2">Door agents bewaakt</span>
            <KpiPill>automatisch</KpiPill>
          </div>
          <div className="mt-4 flex flex-1 items-center justify-center">
            <MiniRing vol pct={bewaaktPct} dik={3.4} kleur="#5cc93f" tekstKlasse="text-[22px] text-forest" />
          </div>
        </div>
      </KpiRow>

      {/* vervalkalender */}
      <div className="mb-6 rounded-2xl bg-paper p-5 ring-1 ring-line">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[13px] font-medium text-grey">Wat er de komende maanden verloopt</p>
          <span className="text-[11px] text-grey-2">{keuringen.length} keuringen in beeld</span>
        </div>
        <div className="flex items-end gap-3">
          {kalender.map((m, i) => (
            <div key={`${m.maand}-${m.jaar}`} className="flex flex-1 flex-col items-center gap-2">
              <span className={`text-[12px] font-medium tabular-nums ${m.aantal ? "text-ink" : "text-grey-2"}`}>
                {m.aantal || ""}
              </span>
              <div className="flex h-20 w-full items-end">
                <div
                  className={`w-full rounded-t-lg ${
                    !m.aantal ? "bg-panel-2" : m.laat ? "bg-red-400" : i === 0 ? "bg-[#f4c04f]" : "bg-lime-2"
                  }`}
                  style={{ height: `${m.aantal ? Math.max(10, (m.aantal / kalenderMax) * 100) : 4}%` }}
                />
              </div>
              <span className={`text-[12px] ${i === 0 ? "font-medium text-ink" : "text-grey"}`}>{m.maand}</span>
            </div>
          ))}
        </div>
      </div>

      <Toolbar>
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Zoek op keuring, pand of partner..." />
        <ToolbarToggle actief={alleenActie} onClick={() => setAlleenActie((v) => !v)} icon={CalendarClock}>
          Vraagt actie
        </ToolbarToggle>
      </Toolbar>

      <ListShell>
        {zichtbaar.length === 0 ? (
          <EmptyState icon={ShieldCheck} titel="Geen keuringen gevonden" tekst="Pas je zoekopdracht of filter aan." />
        ) : (
          <>
            <ListHead>
              <span className={COL.status} />
              <HeadCell
                label="Keuring" className="min-w-0 flex-1"
                sorteerbaar sorteerId="keuring" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Z naar A", laag: "A naar Z" }}
                groep={groepOp} onGroep={(id) => setGroepOp(id as GroepOp)}
                groepeerOpties={[
                  { id: "termijn", label: "Termijn" },
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
              <HeadCell label="Interval" className={COL.interval} />
              <HeadCell label="Termijn" className={COL.termijn} />
              <span className={COL.actie} />
              <HeadCell
                label="Vervalt" className={COL.vervalt} rechts
                sorteerbaar sorteerId="vervalt" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Verste eerst", laag: "Eerstvolgende eerst" }}
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
                  {g.items.map((k) => {
                    const isGekozen = gekozen.includes(k.id);
                    const gz = gezondheid(k);
                    const Icoon = CATEGORIE_ICOON[k.categorie] ?? ShieldCheck;
                    /* de balk loopt vol naarmate de geldigheid opraakt */
                    const verstreken = k.dagen < 0 ? 100 : Math.max(0, Math.min(100, 100 - (k.dagen / 365) * 100));
                    return (
                      <ListRow key={k.id} gekozen={isGekozen} onClick={() => setDetail(k.id)}>
                        <span className={`${COL.status} relative grid h-4 place-items-center`}>
                          <span className={isGekozen ? "hidden" : "group-hover:hidden"}>
                            <StatusDot toon={gz.toon} titel={gz.titel} />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleKies(k.id); }}
                            aria-label="Selecteren"
                            className={`grid h-4 w-4 place-items-center rounded border transition-colors ${
                              isGekozen ? "border-forest bg-forest text-paper" : "hidden border-grey-2 text-transparent group-hover:grid"
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </button>
                        </span>

                        <CellMain
                          titel={k.soort}
                          sub={`${k.partner}${k.verplicht ? " · wettelijk verplicht" : ""}`}
                        />

                        <span className={`${COL.categorie} items-center gap-1.5 text-[13px] text-grey`}>
                          <Icoon className="h-3.5 w-3.5 shrink-0 text-grey-2" />
                          <span className="truncate">{k.categorie}</span>
                        </span>

                        <span className={`${COL.pand} truncate text-[13px] text-grey-2`}>{k.pand}</span>

                        <span className={`${COL.interval} items-center gap-1.5 text-[12px] text-grey-2`}>
                          <Repeat className="h-3 w-3 shrink-0" />
                          <span className="truncate">{k.interval}</span>
                        </span>

                        <span className={COL.termijn}>
                          <span className="flex items-center gap-2">
                            <span className="block h-1.5 flex-1 overflow-hidden rounded-full bg-panel-2">
                              <span
                                className={`block h-full rounded-full ${
                                  k.dagen < 0 ? "bg-red-400" : k.dagen <= 60 ? "bg-[#f4c04f]" : "bg-lime-2"
                                }`}
                                style={{ width: `${verstreken}%` }}
                              />
                            </span>
                            <span className={`w-[68px] shrink-0 whitespace-nowrap text-right text-[12px] tabular-nums ${
                              k.dagen < 0 ? "text-red-500" : k.dagen <= 60 ? "text-[#c99a1f]" : "text-grey-2"
                            }`}>
                              {termijnTekst(k)}
                            </span>
                          </span>
                        </span>

                        <span className={COL.actie}>
                          {!k.agent && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); naarAgent([k.id]); }}
                              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-grey opacity-0 transition-opacity hover:bg-panel-2 hover:text-forest group-hover:opacity-100"
                              title="Laat een agent deze keuring bewaken en inplannen"
                            >
                              <Sparkles className="h-3 w-3" /> Bewaken
                            </button>
                          )}
                        </span>

                        <span className={`${COL.vervalt} text-[13px] tabular-nums ${
                          k.dagen < 0 ? "font-medium text-red-500" : "text-grey"
                        }`}>
                          {k.vervalt}
                        </span>

                        <span className={COL.avatar}>
                          <Avatar naam="MB" agent={k.agent} />
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
        <BulkAction onClick={() => naarAgent(gekozen)} icon={Sparkles}>Laat bewaken</BulkAction>
        <BulkAction onClick={() => setGekozen([])} icon={RefreshCw}>Verlenging plannen</BulkAction>
        <BulkAction onClick={() => verwijder(gekozen)} icon={Trash2} gevaar>Verwijder</BulkAction>
      </BulkBar>

      <DetailPanel
        open={!!detailItem}
        onClose={() => setDetail(null)}
        kop={
          detailItem && (
            <>
              <span className="text-[12px] tabular-nums text-grey-2">{detailItem.id}</span>
              {detailItem.verplicht && (
                <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink">Wettelijk verplicht</span>
              )}
              {detailItem.agent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
                  <Sparkles className="h-3 w-3" /> Agent
                </span>
              )}
            </>
          )
        }
        voet={
          detailItem && (
            <>
              {!detailItem.agent && (
                <button
                  type="button"
                  onClick={() => naarAgent([detailItem.id])}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-forest/90"
                >
                  <Sparkles className="h-4 w-4" /> Laat bewaken
                </button>
              )}
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-lime-2 px-3 py-2 text-[13px] font-medium text-forest transition-colors hover:bg-lime"
              >
                <CalendarClock className="h-4 w-4" /> Verlenging plannen
              </button>
            </>
          )
        }
      >
        {detailItem && (() => {
          const gz = gezondheid(detailItem);
          const Icoon = CATEGORIE_ICOON[detailItem.categorie] ?? ShieldCheck;
          const verstreken = detailItem.dagen < 0 ? 100 : Math.max(0, Math.min(100, 100 - (detailItem.dagen / 365) * 100));
          return (
            <>
              <div>
                <div className="flex items-center gap-2">
                  <StatusDot toon={gz.toon} titel={gz.titel} />
                  <h2 className="text-[18px] font-medium leading-snug text-ink">{detailItem.soort}</h2>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-[13px] text-grey">
                  <Building2 className="h-3.5 w-3.5 text-grey-2" /> {detailItem.pand}
                </p>
              </div>

              {/* de klok: hoeveel tijd is er nog */}
              <div className={`rounded-xl p-4 ${
                detailItem.dagen < 0 ? "bg-red-50" : detailItem.dagen <= 60 ? "bg-[#f4c04f]/10" : "bg-panel/70"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12px] text-grey">
                    <CalendarClock className="h-3.5 w-3.5" /> Geldig tot {detailItem.vervalt}
                  </span>
                  <span className={`text-[13px] font-medium tabular-nums ${
                    detailItem.dagen < 0 ? "text-red-500" : detailItem.dagen <= 60 ? "text-[#c99a1f]" : "text-forest"
                  }`}>
                    {termijnTekst(detailItem)}
                  </span>
                </div>
                <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-panel-2">
                  <span
                    className={`block h-full rounded-full ${
                      detailItem.dagen < 0 ? "bg-red-400" : detailItem.dagen <= 60 ? "bg-[#f4c04f]" : "bg-lime-2"
                    }`}
                    style={{ width: `${verstreken}%` }}
                  />
                </span>
                <p className="mt-2 text-[11px] text-grey-2">
                  {detailItem.dagen < 0
                    ? "Deze keuring is verlopen. Plan de verlenging zo snel mogelijk in."
                    : `Wordt herhaald ${detailItem.interval}.`}
                </p>
              </div>

              <p className="rounded-xl bg-panel/70 p-3 text-[13px] leading-relaxed text-grey">{detailItem.toelichting}</p>

              <DetailVelden>
                <DetailVeld label="Categorie">
                  <Icoon className="h-3.5 w-3.5 text-grey-2" /> {detailItem.categorie}
                </DetailVeld>
                <DetailVeld label="Partner">
                  <FileCheck2 className="h-3.5 w-3.5 text-grey-2" /> {detailItem.partner}
                </DetailVeld>
                <DetailVeld label="Interval">
                  <Repeat className="h-3.5 w-3.5 text-grey-2" /> {detailItem.interval}
                </DetailVeld>
                <DetailVeld label="Verplicht">
                  {detailItem.verplicht ? "Ja, wettelijk" : "Nee, eigen beleid"}
                </DetailVeld>
                <DetailVeld label="Bewaking">
                  <Avatar naam="MB" agent={detailItem.agent} />
                  {detailItem.agent ? "Domio Agent" : "Mark Bakker"}
                </DetailVeld>
              </DetailVelden>
            </>
          );
        })()}
      </DetailPanel>
    </>
  );
}
