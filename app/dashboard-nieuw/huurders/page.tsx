"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Users, Check, Sparkles, Mail, Phone, Building2, Calendar, FileClock,
  AlertTriangle, Trash2, Send, MessageSquare,
} from "lucide-react";
import {
  PageHeader, Toolbar, ToolbarSearch, ToolbarToggle, StatusDot, ListShell, ListHead,
  HeadCell, ListGroup, ListRow, CellMain, LabelDot, Avatar, EmptyState, BulkBar,
  BulkAction, DetailPanel, DetailVeld, DetailVelden, Progress, type SorteerRichting,
} from "../_ui";
import { KpiRow, KpiCard, KpiPill, MiniRing, MiniProgress, useCountUp, euro, procent } from "../_kpi";

/* ─────────────────────────── model ─────────────────────────── */

type Huurder = {
  id: string;
  naam: string;
  email: string;
  telefoon: string;
  pand: string;
  eenheid: string;
  huur: number;
  achterstand: number;
  start: string;        // ingangsdatum, weergave
  startSort: number;    // sorteerwaarde (jjjjmm)
  eindeDagen: number;   // dagen tot einde contract, groot getal = geen einddatum
  einde: string;
  status: "Actief" | "Opzegging" | "Achterstand";
  agent: boolean;
};

const HUURDERS: Huurder[] = [
  { id: "H-01", naam: "Lisa de Groot", email: "lisa.degroot@email.nl", telefoon: "06 12345678", pand: "Prinsengracht 42", eenheid: "42-1", huur: 1450, achterstand: 0, start: "jan 2024", startSort: 202401, eindeDagen: 38, einde: "1 sep 2026", status: "Actief", agent: true },
  { id: "H-02", naam: "Youssef El Amrani", email: "y.elamrani@email.nl", telefoon: "06 23456789", pand: "Kade 12", eenheid: "12-3", huur: 1620, achterstand: 1620, start: "sep 2023", startSort: 202309, eindeDagen: 400, einde: "1 sep 2027", status: "Achterstand", agent: true },
  { id: "H-03", naam: "Sander Bakker", email: "s.bakker@email.nl", telefoon: "06 34567890", pand: "Havenweg 8", eenheid: "8-2", huur: 1280, achterstand: 0, start: "mrt 2025", startSort: 202503, eindeDagen: 600, einde: "1 mrt 2028", status: "Actief", agent: false },
  { id: "H-04", naam: "Emma Visser", email: "emma.visser@email.nl", telefoon: "06 45678901", pand: "Lindenlaan 21", eenheid: "21-4", huur: 1510, achterstand: 0, start: "jul 2022", startSort: 202207, eindeDagen: 21, einde: "15 aug 2026", status: "Opzegging", agent: false },
  { id: "H-05", naam: "David Chen", email: "d.chen@email.nl", telefoon: "06 56789012", pand: "Molenstraat 5", eenheid: "5-1", huur: 1190, achterstand: 980, start: "nov 2024", startSort: 202411, eindeDagen: 500, einde: "1 nov 2027", status: "Achterstand", agent: true },
  { id: "H-06", naam: "Fatima Yılmaz", email: "f.yilmaz@email.nl", telefoon: "06 67890123", pand: "Parkzicht 3", eenheid: "3-2", huur: 1340, achterstand: 0, start: "mei 2023", startSort: 202305, eindeDagen: 75, einde: "1 okt 2026", status: "Actief", agent: true },
  { id: "H-07", naam: "Peter Janssen", email: "p.janssen@email.nl", telefoon: "06 78901234", pand: "Kade 12", eenheid: "12-7", huur: 1385, achterstand: 0, start: "feb 2025", startSort: 202502, eindeDagen: 620, einde: "1 feb 2028", status: "Actief", agent: false },
  { id: "H-08", naam: "Anouk Willemsen", email: "a.willemsen@email.nl", telefoon: "06 89012345", pand: "Vaartweg 90", eenheid: "90-1", huur: 1700, achterstand: 0, start: "aug 2021", startSort: 202108, eindeDagen: 55, einde: "20 sep 2026", status: "Actief", agent: true },
];

const STATUS_KLEUR: Record<string, string> = {
  Actief: "bg-lime-2",
  Opzegging: "bg-[#f4c04f]",
  Achterstand: "bg-red-400",
};

/* één plek voor de kolombreedtes, zo blijven kop en rijen gelijk */
const COL = {
  status: "w-4 shrink-0",
  pand: "hidden w-[132px] shrink-0 lg:block",
  contract: "hidden w-[108px] shrink-0 xl:block",
  einde: "hidden w-[92px] shrink-0 text-right xl:block",
  achterstand: "hidden w-[86px] shrink-0 text-right md:block",
  actie: "hidden w-[68px] shrink-0 lg:block",
  huur: "w-[84px] shrink-0 text-right",
  avatar: "w-6 shrink-0",
};

const KOLOM_WAARDE: Record<string, (h: Huurder) => string> = {
  pand: (h) => h.pand,
  einde: (h) => (h.eindeDagen <= 90 ? "Loopt af binnen 90 dagen" : "Loopt langer door"),
  achterstand: (h) => (h.achterstand > 0 ? "Met achterstand" : "Geen achterstand"),
};

const KOLOM_OPTIES: Record<string, string[]> = {
  pand: Array.from(new Set(HUURDERS.map((h) => h.pand))).sort(),
  einde: ["Loopt af binnen 90 dagen", "Loopt langer door"],
  achterstand: ["Met achterstand", "Geen achterstand"],
};

/* sorteerwaarde per kolom */
const SORTEER: Record<string, (h: Huurder) => number | string> = {
  naam: (h) => h.naam.toLowerCase(),
  contract: (h) => h.startSort,
  einde: (h) => h.eindeDagen,
  achterstand: (h) => h.achterstand,
  huur: (h) => h.huur,
};

function gezondheid(h: Huurder): { toon: "goed" | "let-op" | "slecht"; titel: string } {
  if (h.achterstand > 900) return { toon: "slecht", titel: `Achterstand ${euro(h.achterstand)}` };
  if (h.status === "Opzegging") return { toon: "let-op", titel: "Heeft opgezegd" };
  if (h.achterstand > 0) return { toon: "let-op", titel: "Achterstand" };
  if (h.eindeDagen <= 90) return { toon: "let-op", titel: `Contract loopt af over ${h.eindeDagen} dagen` };
  return { toon: "goed", titel: "Alles in orde" };
}

/* ─────────────────────────── pagina ─────────────────────────── */

type GroepOp = "status" | "pand" | "geen";

export default function HuurdersPage() {
  const [huurders, setHuurders] = useState(HUURDERS);
  const [groepOp, setGroepOp] = useState<GroepOp>("status");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sorteer, setSorteer] = useState<{ kolom: string; richting: SorteerRichting } | null>(null);
  const [query, setQuery] = useState("");
  const [alleenAandacht, setAlleenAandacht] = useState(false);
  const [dicht, setDicht] = useState<string[]>([]);
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);

  const zetFilter = (kolom: string, waarden: string[]) => setFilters((f) => ({ ...f, [kolom]: waarden }));
  const zetSorteer = (kolom: string, richting: SorteerRichting) =>
    setSorteer((s) => (s?.kolom === kolom && s.richting === richting ? null : { kolom, richting }));

  const q = query.trim().toLowerCase();
  const zichtbaar = useMemo(() => {
    const lijst = huurders.filter((h) => {
      const mq = !q || h.naam.toLowerCase().includes(q) || h.pand.toLowerCase().includes(q) || h.eenheid.toLowerCase().includes(q);
      const mf = Object.entries(filters).every(
        ([kolom, waarden]) => !waarden.length || waarden.includes(KOLOM_WAARDE[kolom](h)),
      );
      return mq && mf && (!alleenAandacht || gezondheid(h).toon !== "goed");
    });

    if (!sorteer) return lijst;
    const waarde = SORTEER[sorteer.kolom];
    return [...lijst].sort((a, b) => {
      const va = waarde(a);
      const vb = waarde(b);
      const vgl = typeof va === "string" ? String(va).localeCompare(String(vb)) : Number(va) - Number(vb);
      return sorteer.richting === "hoog" ? -vgl : vgl;
    });
  }, [huurders, q, filters, alleenAandacht, sorteer]);

  const groepen = useMemo(() => {
    if (groepOp === "geen") return [{ key: "alles", label: "", items: zichtbaar }];
    const sleutel = (h: Huurder) => (groepOp === "status" ? h.status : h.pand);
    const namen = Array.from(new Set(zichtbaar.map(sleutel))).sort();
    return namen.map((n) => ({ key: n, label: n, items: zichtbaar.filter((h) => sleutel(h) === n) }));
  }, [zichtbaar, groepOp]);

  const toggleKies = useCallback((id: string) => {
    setGekozen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const naarAgent = useCallback((ids: string[]) => {
    setHuurders((prev) => prev.map((h) => (ids.includes(h.id) ? { ...h, agent: true } : h)));
    setGekozen([]);
  }, []);
  const verwijder = useCallback((ids: string[]) => {
    setHuurders((prev) => prev.filter((h) => !ids.includes(h.id)));
    setGekozen([]);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [detail]);

  const maandhuur = huurders.reduce((s, h) => s + h.huur, 0);
  const achterstand = huurders.reduce((s, h) => s + h.achterstand, 0);
  const metAchterstand = huurders.filter((h) => h.achterstand > 0).length;
  const gefactureerd = maandhuur + achterstand;
  const incassoPct = gefactureerd ? (maandhuur / gefactureerd) * 100 : 100;
  const aflopend = huurders.filter((h) => h.eindeDagen <= 90).length;
  const actief = huurders.filter((h) => h.status === "Actief").length;
  const detailHuurder = huurders.find((h) => h.id === detail) || null;

  const huurTeller = useCountUp(maandhuur);
  const achterstandTeller = useCountUp(achterstand);
  const aflopendTeller = useCountUp(aflopend);

  return (
    <>
      <PageHeader
        title="Huurders"
        subtitle={`${huurders.length} huurders · ${actief} actief`}
        action={{ label: "Huurder uitnodigen" }}
      />

      <KpiRow>
        <div className="flex h-full items-center gap-4 rounded-2xl bg-paper p-5 ring-1 ring-line">
          <MiniRing pct={(actief / huurders.length) * 100} />
          <div>
            <div className="text-[12px] uppercase tracking-wide text-grey-2">Actief</div>
            <div className="mt-1 text-[15px] font-medium text-ink">{actief} van {huurders.length} huurders</div>
            <div className="mt-1 text-[12px] text-grey-2">{huurders.length - actief} met aandachtspunt</div>
          </div>
        </div>

        <KpiCard
          label="Huur per maand"
          waarde={euro(huurTeller)}
          sub={`${euro(maandhuur / huurders.length)} gemiddeld per huurder`}
        />

        <KpiCard
          label="Achterstand"
          waarde={euro(achterstandTeller)}
          toon={achterstand > 0 ? "slecht" : "goed"}
          sub={metAchterstand ? `${metAchterstand} huurders` : "Alles geïnd"}
        >
          <MiniProgress pct={incassoPct} />
        </KpiCard>

        <KpiCard
          label="Contract loopt af"
          waarde={String(Math.round(aflopendTeller))}
          toon={aflopend > 0 ? "let-op" : "goed"}
          sub={aflopend > 0 ? "binnen 90 dagen" : "Geen aflopende contracten"}
          badge={<KpiPill>{procent(incassoPct)} geïnd</KpiPill>}
        />
      </KpiRow>

      <Toolbar>
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Zoek op naam, pand of eenheid..." />
        <ToolbarToggle actief={alleenAandacht} onClick={() => setAlleenAandacht((v) => !v)} icon={AlertTriangle}>
          Aandacht nodig
        </ToolbarToggle>
      </Toolbar>

      <ListShell>
        {zichtbaar.length === 0 ? (
          <EmptyState icon={Users} titel="Geen huurders gevonden" tekst="Pas je zoekopdracht of filter aan." />
        ) : (
          <>
            <ListHead>
              <span className={COL.status} />
              <HeadCell
                label="Huurder"
                className="min-w-0 flex-1"
                sorteerbaar
                sorteerId="naam"
                sorteer={sorteer}
                onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Z naar A", laag: "A naar Z" }}
                groep={groepOp}
                onGroep={(id) => setGroepOp(id as GroepOp)}
                groepeerOpties={[
                  { id: "status", label: "Status" },
                  { id: "pand", label: "Pand" },
                  { id: "geen", label: "Geen groepering" },
                ]}
              />
              <HeadCell
                label="Pand"
                className={COL.pand}
                opties={KOLOM_OPTIES.pand}
                actief={filters.pand ?? []}
                onWijzig={(v) => zetFilter("pand", v)}
              />
              <HeadCell
                label="Sinds"
                className={COL.contract}
                sorteerbaar
                sorteerId="contract"
                sorteer={sorteer}
                onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Nieuwste eerst", laag: "Oudste eerst" }}
              />
              <HeadCell
                label="Einde"
                className={COL.einde}
                rechts
                sorteerbaar
                sorteerId="einde"
                sorteer={sorteer}
                onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Verst weg eerst", laag: "Eerst aflopend" }}
                opties={KOLOM_OPTIES.einde}
                actief={filters.einde ?? []}
                onWijzig={(v) => zetFilter("einde", v)}
              />
              <HeadCell
                label="Achterstand"
                className={COL.achterstand}
                rechts
                sorteerbaar
                sorteerId="achterstand"
                sorteer={sorteer}
                onSorteer={zetSorteer}
                opties={KOLOM_OPTIES.achterstand}
                actief={filters.achterstand ?? []}
                onWijzig={(v) => zetFilter("achterstand", v)}
              />
              <span className={COL.actie} />
              <HeadCell
                label="Huur p/m"
                className={COL.huur}
                rechts
                sorteerbaar
                sorteerId="huur"
                sorteer={sorteer}
                onSorteer={zetSorteer}
              />
              <span className={COL.avatar} />
            </ListHead>

            {groepen.map((g) => {
              const isDicht = dicht.includes(g.key);
              return (
                <ListGroup
                  key={g.key}
                  label={g.label}
                  aantal={g.items.length}
                  dicht={isDicht}
                  onToggle={() => setDicht((d) => (isDicht ? d.filter((x) => x !== g.key) : [...d, g.key]))}
                >
                  {g.items.map((h) => {
                    const isGekozen = gekozen.includes(h.id);
                    const gz = gezondheid(h);
                    return (
                      <ListRow key={h.id} gekozen={isGekozen} onClick={() => setDetail(h.id)}>
                        <span className={`${COL.status} relative grid h-4 place-items-center`}>
                          <span className={isGekozen ? "hidden" : "group-hover:hidden"}>
                            <StatusDot toon={gz.toon} titel={gz.titel} />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleKies(h.id); }}
                            aria-label="Selecteren"
                            className={`grid h-4 w-4 place-items-center rounded border transition-colors ${
                              isGekozen ? "border-forest bg-forest text-paper" : "hidden border-grey-2 text-transparent group-hover:grid"
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </button>
                        </span>

                        <CellMain titel={h.naam} sub={h.email} />

                        <LabelDot kleur={STATUS_KLEUR[h.status]} className={COL.pand}>
                          {h.pand} {h.eenheid}
                        </LabelDot>

                        <span className={`${COL.contract} text-[13px] text-grey-2`}>{h.start}</span>

                        <span className={`${COL.einde} text-[13px] tabular-nums ${h.eindeDagen <= 90 ? "font-medium text-[#c99a1f]" : "text-grey-2"}`}>
                          {h.eindeDagen <= 90 ? `${h.eindeDagen} dgn` : h.einde}
                        </span>

                        <span className={`${COL.achterstand} text-[13px] tabular-nums ${h.achterstand > 0 ? "font-medium text-red-500" : "text-grey-2"}`}>
                          {h.achterstand > 0 ? euro(h.achterstand) : "—"}
                        </span>

                        <span className={COL.actie}>
                          {!h.agent && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); naarAgent([h.id]); }}
                              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-grey opacity-0 transition-opacity hover:bg-panel-2 hover:text-forest group-hover:opacity-100"
                              title="Laat de agent het contact oppakken"
                            >
                              <Sparkles className="h-3 w-3" /> Agent
                            </button>
                          )}
                        </span>

                        <span className={`${COL.huur} text-[13px] tabular-nums text-ink`}>{euro(h.huur)}</span>
                        <span className={COL.avatar}>
                          <Avatar naam={h.naam.split(" ").map((w) => w[0]).slice(0, 2).join("")} agent={h.agent} />
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
        <BulkAction onClick={() => naarAgent(gekozen)} icon={Sparkles}>Naar agent</BulkAction>
        <BulkAction onClick={() => setGekozen([])} icon={Send}>Bericht sturen</BulkAction>
        <BulkAction onClick={() => verwijder(gekozen)} icon={Trash2} gevaar>Verwijder</BulkAction>
      </BulkBar>

      <DetailPanel
        open={!!detailHuurder}
        onClose={() => setDetail(null)}
        kop={
          detailHuurder && (
            <>
              <span className="text-[12px] tabular-nums text-grey-2">{detailHuurder.id}</span>
              {detailHuurder.agent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
                  <Sparkles className="h-3 w-3" /> Agent
                </span>
              )}
            </>
          )
        }
        voet={
          detailHuurder && (
            <>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-lime-2 px-3 py-2 text-[13px] font-medium text-forest transition-colors hover:bg-lime"
              >
                <MessageSquare className="h-4 w-4" /> Bericht sturen
              </button>
              {!detailHuurder.agent && (
                <button
                  type="button"
                  onClick={() => naarAgent([detailHuurder.id])}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-forest/90"
                >
                  <Sparkles className="h-4 w-4" /> Contact via de agent
                </button>
              )}
            </>
          )
        }
      >
        {detailHuurder && (
          <>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest text-[15px] font-medium text-paper">
                {detailHuurder.naam.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StatusDot {...gezondheid(detailHuurder)} />
                  <h2 className="truncate text-[18px] font-medium leading-snug text-ink">{detailHuurder.naam}</h2>
                </div>
                <p className="text-[13px] text-grey">{detailHuurder.pand} {detailHuurder.eenheid}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Huur p/m", waarde: euro(detailHuurder.huur) },
                { label: "Achterstand", waarde: detailHuurder.achterstand > 0 ? euro(detailHuurder.achterstand) : "—" },
                { label: "Huurder sinds", waarde: detailHuurder.start },
              ].map((k) => (
                <div key={k.label} className="rounded-xl bg-panel/70 p-3">
                  <span className="block text-[11px] uppercase tracking-wide text-grey-2">{k.label}</span>
                  <span className="mt-1 block text-[15px] font-medium tabular-nums text-ink">{k.waarde}</span>
                </div>
              ))}
            </div>

            {detailHuurder.eindeDagen <= 90 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wide text-grey-2">Contract loopt af</span>
                  <span className="text-[11px] tabular-nums text-grey-2">nog {detailHuurder.eindeDagen} dagen</span>
                </div>
                <Progress pct={100 - (detailHuurder.eindeDagen / 90) * 100} />
              </div>
            )}

            <DetailVelden>
              <DetailVeld label="Status">
                <LabelDot kleur={STATUS_KLEUR[detailHuurder.status]}>{detailHuurder.status}</LabelDot>
              </DetailVeld>
              <DetailVeld label="E-mail">
                <Mail className="h-3.5 w-3.5 text-grey-2" /> {detailHuurder.email}
              </DetailVeld>
              <DetailVeld label="Telefoon">
                <Phone className="h-3.5 w-3.5 text-grey-2" /> {detailHuurder.telefoon}
              </DetailVeld>
              <DetailVeld label="Eenheid">
                <Building2 className="h-3.5 w-3.5 text-grey-2" /> {detailHuurder.pand} {detailHuurder.eenheid}
              </DetailVeld>
              <DetailVeld label="Ingangsdatum">
                <Calendar className="h-3.5 w-3.5 text-grey-2" /> {detailHuurder.start}
              </DetailVeld>
              <DetailVeld label="Einddatum">
                <FileClock className="h-3.5 w-3.5 text-grey-2" /> {detailHuurder.einde}
              </DetailVeld>
            </DetailVelden>

            <div className="border-t border-line pt-4 text-[12px] text-grey-2">
              {euro(detailHuurder.huur * 12)} huur per jaar
            </div>
          </>
        )}
      </DetailPanel>
    </>
  );
}
