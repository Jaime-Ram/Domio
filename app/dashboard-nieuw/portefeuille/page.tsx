"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  LayoutList, LayoutGrid, Building2, Check, Sparkles, MapPin, Home, Users,
  Euro, Wrench, TrendingUp, Archive, Trash2, CalendarRange, AlertTriangle, FileClock,
} from "lucide-react";
import {
  PageHeader, ViewToggle, Toolbar, ToolbarSearch, ToolbarToggle,
  StatusDot, ListShell, ListHead, HeadCell, ListGroup, ListRow, CellMain, LabelDot,
  Avatar, EmptyState, BulkBar, BulkAction, DetailPanel, DetailVeld, DetailVelden, Progress,
} from "../_ui";
import {
  KpiRow, KpiCard, KpiPill, MiniBars, MiniRing, MiniProgress,
  useCountUp, euro, procent,
} from "../_kpi";
import { getPortefeuille, gezondheid, type PandRij } from "@/lib/dashboard/portefeuille";
import { getUser } from "@/lib/supabase/auth";
import { getProfile } from "@/lib/supabase/profile";

/* ─────────────────────────── model ─────────────────────────── */

type Pand = PandRij;

const LABEL_KLEUR: Record<string, string> = { A: "bg-lime-2", B: "bg-forest", C: "bg-[#f4c04f]", D: "bg-red-400" };

/* één plek voor de kolombreedtes, zo blijven kop en rijen gelijk */
const COL = {
  status: "w-4 shrink-0",
  type: "hidden w-[120px] shrink-0 lg:block",
  bezetting: "w-[74px] shrink-0 text-right",
  achterstand: "hidden w-[86px] shrink-0 text-right md:block",
  signalen: "hidden w-[72px] shrink-0 text-right xl:block",
  huur: "w-[86px] shrink-0 text-right",
  beheerder: "w-6 shrink-0",
};

/* waarde per kolom waarop gefilterd kan worden */
const KOLOM_WAARDE: Record<string, (p: Pand) => string> = {
  type: (p) => p.type,
  bezetting: (p) => (p.bezet === 0 ? "Volledig leeg" : p.bezet < p.eenheden ? "Deels leeg" : "Volledig bezet"),
  achterstand: (p) => (p.achterstand > 0 ? "Met achterstand" : "Geen achterstand"),
  signalen: (p) =>
    p.aflopend > 0 ? "Aflopend contract" : p.openTickets > 0 ? "Open tickets" : "Geen signalen",
};

const KOLOM_OPTIES: Record<string, string[]> = {
  type: ["Appartementen", "Bedrijfsruimte", "Woonhuis"],
  bezetting: ["Volledig bezet", "Deels leeg", "Volledig leeg"],
  achterstand: ["Met achterstand", "Geen achterstand"],
  signalen: ["Aflopend contract", "Open tickets", "Geen signalen"],
};

/* ─────────────────────────── pagina ─────────────────────────── */

type GroepOp = "plaats" | "type" | "label" | "geen";

export default function PortefeuillePage() {
  const [panden, setPanden] = useState<Pand[]>([]);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState<string | null>(null);
  const [view, setView] = useState<"lijst" | "raster">("lijst");
  const [groepOp, setGroepOp] = useState<GroepOp>("plaats");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [query, setQuery] = useState("");
  const [alleenAandacht, setAlleenAandacht] = useState(false);
  const [dicht, setDicht] = useState<string[]>([]);
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);

  const zetFilter = (kolom: string, waarden: string[]) =>
    setFilters((f) => ({ ...f, [kolom]: waarden }));

  const q = query.trim().toLowerCase();
  const zichtbaar = useMemo(
    () =>
      panden.filter((p) => {
        const mq = !q || p.naam.toLowerCase().includes(q) || p.plaats.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
        const mf = Object.entries(filters).every(
          ([kolom, waarden]) => !waarden.length || waarden.includes(KOLOM_WAARDE[kolom](p)),
        );
        return mq && mf && (!alleenAandacht || gezondheid(p).toon !== "goed");
      }),
    [panden, q, filters, alleenAandacht],
  );

  const groepen = useMemo(() => {
    if (groepOp === "geen") return [{ key: "alles", label: "", items: zichtbaar }];
    const sleutel = (p: Pand) =>
      groepOp === "plaats" ? p.plaats : groepOp === "type" ? p.type : p.label ? `Label ${p.label}` : "Label onbekend";
    const namen = Array.from(new Set(zichtbaar.map(sleutel))).sort();
    return namen.map((n) => ({ key: n, label: n, items: zichtbaar.filter((p) => sleutel(p) === n) }));
  }, [zichtbaar, groepOp]);

  const toggleKies = useCallback((id: string) => {
    setGekozen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const naarAgent = useCallback((ids: string[]) => {
    setPanden((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, agent: true } : p)));
    setGekozen([]);
  }, []);
  const verwijder = useCallback((ids: string[]) => {
    setPanden((prev) => prev.filter((p) => !ids.includes(p.id)));
    setGekozen([]);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [detail]);

  /* echte data ophalen */
  useEffect(() => {
    let afgebroken = false;
    (async () => {
      try {
        const { user } = await getUser();
        if (!user) { if (!afgebroken) { setFout("niet-ingelogd"); setLaden(false); } return; }
        const profiel = await getProfile(user.id).catch(() => null);
        const data = await getPortefeuille(user.id, profiel?.full_name ?? null, user.email ?? null);
        if (!afgebroken) { setPanden(data.panden); setLaden(false); }
      } catch (e) {
        if (!afgebroken) { setFout(e instanceof Error ? e.message : "onbekende fout"); setLaden(false); }
      }
    })();
    return () => { afgebroken = true; };
  }, []);

  /* portefeuille-cijfers */
  const totEenheden = panden.reduce((s, p) => s + p.eenheden, 0);
  const totBezet = panden.reduce((s, p) => s + p.bezet, 0);
  const bezettingPct = totEenheden ? (totBezet / totEenheden) * 100 : 0;
  const maandhuur = panden.reduce((s, p) => s + p.huur, 0);
  const achterstand = panden.reduce((s, p) => s + p.achterstand, 0);
  const gefactureerd = maandhuur + achterstand;
  const incassoPct = gefactureerd ? (maandhuur / gefactureerd) * 100 : 100;
  const openTickets = panden.reduce((s, p) => s + p.openTickets, 0);
  const pandenMetTickets = panden.filter((p) => p.openTickets > 0).length;
  const detailPand = panden.find((p) => p.id === detail) || null;

  /* staafjes tonen de huur per pand, relatief aan het grootste pand */
  const huurVerdeling = useMemo(() => {
    const top = [...panden].sort((a, b) => b.huur - a.huur).slice(0, 8);
    const max = Math.max(1, ...top.map((p) => p.huur));
    return top.map((p) => Math.max(8, Math.round((p.huur / max) * 100)));
  }, [panden]);

  const huurTeller = useCountUp(maandhuur);
  const achterstandTeller = useCountUp(achterstand);
  const ticketTeller = useCountUp(openTickets);

  return (
    <>
      <PageHeader
        title="Portefeuille"
        subtitle={`${panden.length} panden · ${totEenheden} eenheden`}
        action={{ label: "Pand toevoegen" }}
      >
        <ViewToggle
          value={view}
          onChange={setView}
          opties={[{ id: "lijst", label: "Lijst", icon: LayoutList }, { id: "raster", label: "Raster", icon: LayoutGrid }]}
        />
      </PageHeader>

      {/* kerncijfers als widgets, alleen op basis van echte data */}
      {!laden && !fout && panden.length > 0 && (
        <KpiRow>
          <div className="flex h-full items-center gap-4 rounded-2xl bg-paper p-5 ring-1 ring-line">
            <MiniRing pct={bezettingPct} />
            <div>
              <div className="text-[12px] uppercase tracking-wide text-grey-2">Bezetting</div>
              <div className="mt-1 text-[15px] font-medium text-ink">{totBezet} van {totEenheden} eenheden</div>
              <div className="mt-1 text-[12px] text-grey-2">
                {totEenheden - totBezet === 0 ? "Volledig verhuurd" : `${totEenheden - totBezet} leeg`}
              </div>
            </div>
          </div>

          <KpiCard
            label="Huur per maand"
            waarde={euro(huurTeller)}
            sub={totBezet ? `${euro(maandhuur / totBezet)} gemiddeld per eenheid` : undefined}
          >
            <MiniBars data={huurVerdeling} vanaf={0} />
          </KpiCard>

          <KpiCard
            label="Open tickets"
            waarde={String(Math.round(ticketTeller))}
            toon={openTickets > 0 ? "let-op" : "goed"}
            sub={openTickets > 0 ? `verdeeld over ${pandenMetTickets} panden` : "Geen openstaande meldingen"}
            badge={<KpiPill>{panden.length} panden</KpiPill>}
          />

          <KpiCard
            label="Achterstand"
            waarde={euro(achterstandTeller)}
            toon={achterstand > 0 ? "slecht" : "goed"}
            sub={`${procent(incassoPct)} van de huur geïnd`}
          >
            <MiniProgress pct={incassoPct} />
          </KpiCard>
        </KpiRow>
      )}

      <Toolbar>
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Zoek op pand, plaats of type..." />
        <ToolbarToggle actief={alleenAandacht} onClick={() => setAlleenAandacht((v) => !v)} icon={AlertTriangle}>
          Aandacht nodig
        </ToolbarToggle>
      </Toolbar>

      {laden ? (
        <ListShell>
          <div className="divide-y divide-line/70 overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-panel-2" />
                <span className="min-w-0 flex-1">
                  <span className="block h-3 w-40 animate-pulse rounded bg-panel-2" />
                  <span className="mt-1.5 block h-2.5 w-28 animate-pulse rounded bg-panel" />
                </span>
                <span className="hidden h-3 w-20 animate-pulse rounded bg-panel-2 lg:block" />
                <span className="h-3 w-10 animate-pulse rounded bg-panel-2" />
                <span className="h-3 w-16 animate-pulse rounded bg-panel-2" />
                <span className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-panel-2" />
              </div>
            ))}
          </div>
        </ListShell>
      ) : fout === "niet-ingelogd" ? (
        <ListShell>
          <EmptyState
            icon={Building2}
            titel="Log in om je portefeuille te zien"
            tekst="Deze pagina toont de panden van je eigen account."
          />
        </ListShell>
      ) : fout ? (
        <ListShell>
          <EmptyState icon={AlertTriangle} titel="Kon de portefeuille niet laden" tekst={fout} />
        </ListShell>
      ) : panden.length === 0 ? (
        <ListShell>
          <EmptyState
            icon={Building2}
            titel="Nog geen panden"
            tekst="Voeg je eerste pand toe om je portefeuille op te bouwen."
          />
        </ListShell>
      ) : view === "lijst" ? (
        <ListShell>
          {groepen.length === 0 ? (
            <EmptyState icon={Building2} titel="Geen panden gevonden" tekst="Pas je zoekopdracht of filter aan." />
          ) : (
            <>
              <ListHead>
                <span className={COL.status} />
                <HeadCell
                  label="Pand"
                  className="min-w-0 flex-1"
                  groep={groepOp}
                  onGroep={(id) => setGroepOp(id as GroepOp)}
                  groepeerOpties={[
                    { id: "plaats", label: "Plaats" },
                    { id: "type", label: "Type" },
                    { id: "label", label: "Energielabel" },
                    { id: "geen", label: "Geen groepering" },
                  ]}
                />
                <HeadCell
                  label="Type"
                  className={COL.type}
                  opties={KOLOM_OPTIES.type}
                  actief={filters.type ?? []}
                  onWijzig={(v) => zetFilter("type", v)}
                />
                <HeadCell
                  label="Bezet"
                  className={COL.bezetting}
                  rechts
                  opties={KOLOM_OPTIES.bezetting}
                  actief={filters.bezetting ?? []}
                  onWijzig={(v) => zetFilter("bezetting", v)}
                />
                <HeadCell
                  label="Achterstand"
                  className={COL.achterstand}
                  rechts
                  opties={KOLOM_OPTIES.achterstand}
                  actief={filters.achterstand ?? []}
                  onWijzig={(v) => zetFilter("achterstand", v)}
                />
                <HeadCell
                  label="Signalen"
                  className={COL.signalen}
                  rechts
                  opties={KOLOM_OPTIES.signalen}
                  actief={filters.signalen ?? []}
                  onWijzig={(v) => zetFilter("signalen", v)}
                />
                <HeadCell label="Huur p/m" className={COL.huur} rechts />
                <span className={COL.beheerder} />
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
                    {g.items.map((p) => {
                      const isGekozen = gekozen.includes(p.id);
                      const gz = gezondheid(p);
                      const pct = p.eenheden ? Math.round((p.bezet / p.eenheden) * 100) : 0;
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

                          <CellMain titel={p.naam} sub={`${p.plaats} · ${p.eenheden} ${p.eenheden === 1 ? "eenheid" : "eenheden"}`} />

                          <span className={`${COL.type} truncate text-[13px] text-grey`}>{p.type}</span>

                          <span className={`${COL.bezetting} text-[13px] tabular-nums ${pct === 100 ? "text-grey" : "font-medium text-[#c99a1f]"}`}>
                            {pct === 0 ? <span className="text-red-500">0%</span> : `${pct}%`}
                          </span>

                          <span className={`${COL.achterstand} text-[13px] tabular-nums ${p.achterstand > 0 ? "font-medium text-red-500" : "text-grey-2"}`}>
                            {p.achterstand > 0 ? euro(p.achterstand) : "—"}
                          </span>

                          <span className={`${COL.signalen} text-[13px] tabular-nums text-grey-2`}>
                            {p.aflopend > 0 || p.openTickets > 0 ? (
                              <span className="inline-flex items-center justify-end gap-2">
                                {p.aflopend > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-[#c99a1f]" title={`${p.aflopend} contracten lopen af`}>
                                    <FileClock className="h-3 w-3" />{p.aflopend}
                                  </span>
                                )}
                                {p.openTickets > 0 && (
                                  <span className="inline-flex items-center gap-0.5" title={`${p.openTickets} open tickets`}>
                                    <Wrench className="h-3 w-3" />{p.openTickets}
                                  </span>
                                )}
                              </span>
                            ) : "—"}
                          </span>

                          <span className={`${COL.huur} text-[13px] tabular-nums text-ink`}>
                            {p.huur ? euro(p.huur) : "—"}
                          </span>

                          <span className={COL.beheerder}>
                            <Avatar naam={p.beheerder} agent={p.agent} />
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
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {zichtbaar.map((p) => {
            const pct = p.eenheden ? Math.round((p.bezet / p.eenheden) * 100) : 0;
            const gz = gezondheid(p);
            return (
              <div
                key={p.id}
                onClick={() => setDetail(p.id)}
                className="cursor-pointer rounded-2xl bg-paper p-5 ring-1 ring-line transition-shadow hover:shadow-soft-lg"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-panel text-forest">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <StatusDot toon={gz.toon} titel={gz.titel} />
                      <span className="truncate text-[14px] font-medium text-ink">{p.naam}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-grey-2">
                      <MapPin className="h-3 w-3" /> {p.plaats} · {p.type}
                    </span>
                  </span>
                  <Avatar naam={p.beheerder} agent={p.agent} />
                </div>

                <div className="mt-5 flex items-baseline justify-between">
                  <span className="text-[12px] uppercase tracking-wide text-grey-2">Bezetting</span>
                  <span className="text-[12px] tabular-nums text-grey">{p.bezet}/{p.eenheden} · {pct}%</span>
                </div>
                <MiniProgress pct={pct} />

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3">
                  <span>
                    <span className="block text-[11px] uppercase tracking-wide text-grey-2">Huur p/m</span>
                    <span className="mt-0.5 block text-[15px] font-medium tabular-nums text-ink">
                      {p.huur ? euro(p.huur) : "—"}
                    </span>
                  </span>
                  <span>
                    <span className="block text-[11px] uppercase tracking-wide text-grey-2">Achterstand</span>
                    <span className={`mt-0.5 block text-[15px] font-medium tabular-nums ${p.achterstand > 0 ? "text-red-500" : "text-grey-2"}`}>
                      {p.achterstand > 0 ? euro(p.achterstand) : "—"}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
          {zichtbaar.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-3">
              <ListShell>
                <EmptyState icon={Building2} titel="Geen panden gevonden" tekst="Pas je zoekopdracht of filter aan." />
              </ListShell>
            </div>
          )}
        </div>
      )}

      <BulkBar aantal={gekozen.length} onSluit={() => setGekozen([])}>
        <BulkAction onClick={() => naarAgent(gekozen)} icon={Sparkles}>Naar agent</BulkAction>
        <BulkAction onClick={() => setGekozen([])} icon={Archive}>Archiveer</BulkAction>
        <BulkAction onClick={() => verwijder(gekozen)} icon={Trash2} gevaar>Verwijder</BulkAction>
      </BulkBar>

      <DetailPanel
        open={!!detailPand}
        onClose={() => setDetail(null)}
        kop={
          detailPand && (
            <>
              <span className="text-[12px] tabular-nums text-grey-2">{detailPand.id}</span>
              {detailPand.agent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
                  <Sparkles className="h-3 w-3" /> Agent
                </span>
              )}
            </>
          )
        }
        voet={
          detailPand && (
            <>
              {!detailPand.agent && (
                <button
                  type="button"
                  onClick={() => naarAgent([detailPand.id])}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-forest/90"
                >
                  <Sparkles className="h-4 w-4" /> Beheer via de agent
                </button>
              )}
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-lime-2 px-3 py-2 text-[13px] font-medium text-forest transition-colors hover:bg-lime"
              >
                <Home className="h-4 w-4" /> Eenheden bekijken
              </button>
            </>
          )
        }
      >
        {detailPand && (
          <>
            <div>
              <div className="flex items-center gap-2">
                <StatusDot {...gezondheid(detailPand)} />
                <h2 className="text-[18px] font-medium leading-snug text-ink">{detailPand.naam}</h2>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-[13px] text-grey">
                <MapPin className="h-3.5 w-3.5 text-grey-2" /> {detailPand.adres}, {detailPand.plaats}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Eenheden", waarde: String(detailPand.eenheden), icon: Home },
                { label: "Bezet", waarde: String(detailPand.bezet), icon: Users },
                { label: "Huur p/m", waarde: detailPand.huur ? euro(detailPand.huur) : "—", icon: Euro },
              ].map((k) => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="rounded-xl bg-panel/70 p-3">
                    <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-grey-2">
                      <Icon className="h-3 w-3" /> {k.label}
                    </span>
                    <span className="mt-1 block text-[16px] font-medium tabular-nums text-ink">{k.waarde}</span>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide text-grey-2">Bezettingsgraad</span>
                <span className="text-[11px] tabular-nums text-grey-2">
                  {Math.round((detailPand.bezet / detailPand.eenheden) * 100)}%
                </span>
              </div>
              <Progress pct={(detailPand.bezet / detailPand.eenheden) * 100} />
            </div>

            <DetailVelden>
              <DetailVeld label="Huur p/m">
                <TrendingUp className="h-3.5 w-3.5 text-grey-2" />
                {euro(detailPand.huur)}
                <span className="text-[12px] text-grey-2">
                  {detailPand.bezet} verhuurde {detailPand.bezet === 1 ? "eenheid" : "eenheden"}
                </span>
              </DetailVeld>
              <DetailVeld label="Huurincasso">
                <span className={detailPand.incasso === 100 ? "text-forest" : "text-red-500"}>{detailPand.incasso}%</span>
                {detailPand.achterstand > 0 && (
                  <span className="text-[12px] text-red-500">achterstand {euro(detailPand.achterstand)}</span>
                )}
              </DetailVeld>
              <DetailVeld label="Contracten">
                <FileClock className="h-3.5 w-3.5 text-grey-2" />
                {detailPand.aflopend > 0 ? `${detailPand.aflopend} aflopend binnen 90 dagen` : "Geen aflopende contracten"}
              </DetailVeld>
              <DetailVeld label="Open tickets">
                <Wrench className="h-3.5 w-3.5 text-grey-2" />
                {detailPand.openTickets > 0 ? `${detailPand.openTickets} open` : "Geen"}
              </DetailVeld>
              <DetailVeld label="Type">{detailPand.type}</DetailVeld>
              <DetailVeld label="Energielabel">
                {detailPand.label
                  ? <LabelDot kleur={LABEL_KLEUR[detailPand.label]}>Label {detailPand.label}</LabelDot>
                  : <span className="text-grey-2">Onbekend</span>}
              </DetailVeld>
              <DetailVeld label="Bouwjaar">{detailPand.bouwjaar ?? "Onbekend"}</DetailVeld>
              <DetailVeld label="MJOP">
                <CalendarRange className="h-3.5 w-3.5 text-grey-2" /> {detailPand.mjopPost}
              </DetailVeld>
              <DetailVeld label="Beheerder">
                <Avatar naam={detailPand.beheerder} agent={detailPand.agent} />
                {detailPand.agent ? "Domio Agent" : "Mark Bakker"}
              </DetailVeld>
            </DetailVelden>

            <div className="flex items-center gap-4 border-t border-line pt-4 text-[12px] text-grey-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                {detailPand.huur ? `${euro(detailPand.huur * 12)} huur per jaar` : "Geen huurinkomsten"}
              </span>
            </div>
          </>
        )}
      </DetailPanel>
    </>
  );
}
