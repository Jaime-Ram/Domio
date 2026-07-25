"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutList, Columns3, X, Sparkles, Check, Circle, CircleDashed, CircleDotDashed,
  CheckCircle2, Building2, Calendar, MessageSquare, Paperclip, Trash2, UserPlus,
  CornerDownLeft,
} from "lucide-react";
import {
  PageHeader, ViewToggle, Toolbar, ToolbarSearch, ToolbarToggle,
  ListShell, ListHead, HeadCell, ListGroup, ListRow, CellMain, LabelDot, Avatar,
  EmptyState, BulkBar, BulkAction, DetailPanel, DetailVeld, DetailVelden, Progress,
} from "../_ui";

/* één plek voor de kolombreedtes, zo blijven kop en rijen gelijk */
const COL = {
  status: "w-4 shrink-0",
  prio: "hidden w-[70px] shrink-0 lg:block",
  label: "hidden w-[112px] shrink-0 md:flex",
  voortgang: "hidden w-[56px] shrink-0 text-right xl:block",
  actie: "hidden w-[68px] shrink-0 lg:block",
  deadline: "w-[74px] shrink-0 text-right",
  avatar: "w-6 shrink-0",
};

/* ─────────────────────────── model ─────────────────────────── */

type Status = "todo" | "bezig" | "akkoord" | "klaar";
type Prio = 0 | 1 | 2 | 3; // 0 laag, 3 urgent

type Taak = {
  id: string;
  titel: string;
  status: Status;
  prio: Prio;
  pand: string;
  label: string;
  deadline: string;
  dag: number;               // dagen vanaf vandaag, negatief = te laat
  agent: boolean;            // opgepakt door de agent
  toegewezen: string;
  subtaken: { t: string; klaar: boolean }[];
  reacties: number;
  bijlagen: number;
  omschrijving: string;
};

const STATUSSEN: { id: Status; label: string; icon: React.ElementType; kleur: string }[] = [
  { id: "todo", label: "Te doen", icon: Circle, kleur: "text-grey-2" },
  { id: "bezig", label: "Bezig", icon: CircleDotDashed, kleur: "text-[#f4c04f]" },
  { id: "akkoord", label: "Wacht op akkoord", icon: CircleDashed, kleur: "text-forest" },
  { id: "klaar", label: "Klaar", icon: CheckCircle2, kleur: "text-lime-2" },
];

const PRIOS: Record<Prio, { label: string; kleur: string }> = {
  3: { label: "Urgent", kleur: "text-red-500" },
  2: { label: "Hoog", kleur: "text-[#f4c04f]" },
  1: { label: "Middel", kleur: "text-grey" },
  0: { label: "Laag", kleur: "text-grey-2" },
};

const TAKEN: Taak[] = [
  { id: "T-118", titel: "Offerte dakreparatie beoordelen", status: "akkoord", prio: 3, pand: "Havenweg 8", label: "Onderhoud", deadline: "Gisteren", dag: -1, agent: true, toegewezen: "AG", subtaken: [{ t: "Offertes vergelijken", klaar: true }, { t: "Akkoord geven", klaar: false }], reacties: 3, bijlagen: 2, omschrijving: "Drie offertes opgevraagd voor de dakreparatie. De agent heeft ze vergeleken en adviseert Dakdekkers Van Dijk." },
  { id: "T-121", titel: "Huurcontract verlengen", status: "todo", prio: 3, pand: "Prinsengracht 42-1", label: "Contracten", deadline: "Vandaag", dag: 0, agent: false, toegewezen: "MB", subtaken: [{ t: "Huurder benaderen", klaar: true }, { t: "Nieuwe termijn bepalen", klaar: false }, { t: "Contract opstellen", klaar: false }], reacties: 1, bijlagen: 0, omschrijving: "Het huidige contract loopt af op 1 september. Huurder heeft aangegeven te willen verlengen." },
  { id: "T-124", titel: "Eindinspectie inplannen", status: "bezig", prio: 2, pand: "Lindenlaan 21-4", label: "Inspectie", deadline: "Morgen", dag: 1, agent: true, toegewezen: "AG", subtaken: [{ t: "Datum voorstellen", klaar: true }, { t: "Bevestigen bij huurder", klaar: false }], reacties: 0, bijlagen: 1, omschrijving: "Huurder vertrekt eind deze maand. De agent stemt een datum af." },
  { id: "T-126", titel: "Servicekosten afrekenen", status: "todo", prio: 2, pand: "Molenstraat 5", label: "Financieel", deadline: "10 aug", dag: 16, agent: false, toegewezen: "MB", subtaken: [{ t: "Kosten verzamelen", klaar: false }, { t: "Afrekening versturen", klaar: false }], reacties: 0, bijlagen: 4, omschrijving: "Jaarlijkse afrekening servicekosten voor alle eenheden." },
  { id: "T-129", titel: "Meterstanden doorgeven", status: "todo", prio: 1, pand: "Kade 12", label: "Administratie", deadline: "3 aug", dag: 9, agent: true, toegewezen: "AG", subtaken: [], reacties: 0, bijlagen: 0, omschrijving: "Kwartaalstanden doorgeven aan de energieleverancier." },
  { id: "T-131", titel: "CV-storing verhelpen", status: "bezig", prio: 3, pand: "Lindenlaan 21", label: "Onderhoud", deadline: "Vandaag", dag: 0, agent: true, toegewezen: "AG", subtaken: [{ t: "Monteur zoeken", klaar: true }, { t: "Afspraak inplannen", klaar: true }, { t: "Uitvoering", klaar: false }], reacties: 5, bijlagen: 1, omschrijving: "Huurder meldt geen warm water. De agent heeft een monteur ingepland voor vanmiddag." },
  { id: "T-134", titel: "Energielabel aanvragen", status: "todo", prio: 1, pand: "Parkzicht 3-2", label: "Compliance", deadline: "22 aug", dag: 28, agent: false, toegewezen: "MB", subtaken: [], reacties: 0, bijlagen: 0, omschrijving: "Het label verloopt dit jaar, tijdig vernieuwen." },
  { id: "T-136", titel: "Huurindexatie doorvoeren", status: "akkoord", prio: 2, pand: "3 panden", label: "Financieel", deadline: "1 aug", dag: 7, agent: true, toegewezen: "AG", subtaken: [{ t: "Percentage berekenen", klaar: true }, { t: "Brieven opstellen", klaar: true }, { t: "Versturen", klaar: false }], reacties: 2, bijlagen: 3, omschrijving: "Jaarlijkse indexatie. De brieven staan klaar en wachten op akkoord voor verzending." },
  { id: "T-140", titel: "Sleuteloverdracht bevestigen", status: "todo", prio: 0, pand: "Parkzicht 3-2", label: "Contracten", deadline: "12 aug", dag: 18, agent: false, toegewezen: "MB", subtaken: [], reacties: 0, bijlagen: 0, omschrijving: "Nieuwe huurder ontvangt de sleutels bij oplevering." },
  { id: "T-142", titel: "Rookmelders controleren", status: "todo", prio: 2, pand: "Kade 12", label: "Compliance", deadline: "5 aug", dag: 11, agent: false, toegewezen: "MB", subtaken: [{ t: "Alle eenheden langs", klaar: false }], reacties: 0, bijlagen: 0, omschrijving: "Wettelijke jaarlijkse controle van de rookmelders." },
  { id: "T-145", titel: "Achterstand opvolgen", status: "bezig", prio: 3, pand: "Kade 12-3", label: "Financieel", deadline: "Vandaag", dag: 0, agent: true, toegewezen: "AG", subtaken: [{ t: "Herinnering sturen", klaar: true }, { t: "Betalingsregeling voorstellen", klaar: false }], reacties: 4, bijlagen: 0, omschrijving: "Huurder loopt 4 dagen achter. De agent heeft een vriendelijke herinnering gestuurd." },
  { id: "T-112", titel: "Voegwerk offerte opvragen", status: "klaar", prio: 1, pand: "Havenweg 8", label: "Onderhoud", deadline: "18 jul", dag: -7, agent: true, toegewezen: "AG", subtaken: [{ t: "Partners benaderen", klaar: true }], reacties: 1, bijlagen: 2, omschrijving: "Drie offertes ontvangen en gearchiveerd." },
  { id: "T-108", titel: "VvE-vergadering notulen delen", status: "klaar", prio: 0, pand: "Kade 12", label: "Administratie", deadline: "15 jul", dag: -10, agent: false, toegewezen: "MB", subtaken: [], reacties: 0, bijlagen: 1, omschrijving: "Notulen gedeeld met alle eigenaren." },
  { id: "T-105", titel: "Schoonmaak trappenhuis inplannen", status: "klaar", prio: 1, pand: "Prinsengracht 42", label: "Onderhoud", deadline: "12 jul", dag: -13, agent: true, toegewezen: "AG", subtaken: [], reacties: 0, bijlagen: 0, omschrijving: "Maandelijkse schoonmaak ingeregeld bij de vaste partner." },
];

const LABEL_KLEUR: Record<string, string> = {
  Onderhoud: "bg-[#f4c04f]",
  Financieel: "bg-forest",
  Compliance: "bg-red-400",
  Contracten: "bg-lime-2",
  Inspectie: "bg-sky-400",
  Administratie: "bg-grey-2",
};

/* ─────────────────────────── bouwstenen ─────────────────────────── */

/* prioriteit als oplopende balkjes */
function PrioIcon({ p, className = "" }: { p: Prio; className?: string }) {
  const hoogtes = [4, 7, 10];
  return (
    <svg viewBox="0 0 14 12" className={`h-3.5 w-3.5 ${PRIOS[p].kleur} ${className}`} aria-label={PRIOS[p].label}>
      {hoogtes.map((h, i) => (
        <rect key={i} x={1 + i * 4.5} y={11 - h} width="3" height={h} rx="1" fill={p > i ? "currentColor" : "rgba(0,0,0,0.13)"} />
      ))}
    </svg>
  );
}

function StatusIcon({ s, className = "" }: { s: Status; className?: string }) {
  const def = STATUSSEN.find((x) => x.id === s)!;
  const Icon = def.icon;
  return <Icon className={`h-4 w-4 ${def.kleur} ${className}`} strokeWidth={2} />;
}

function Deadline({ t }: { t: Taak }) {
  const laat = t.dag < 0 && t.status !== "klaar";
  const vandaag = t.dag === 0;
  return (
    <span className={`text-[12px] tabular-nums ${laat ? "font-medium text-red-500" : vandaag ? "font-medium text-forest" : "text-grey-2"}`}>
      {t.deadline}
    </span>
  );
}

/* waarde per kolom waarop gefilterd kan worden */
const KOLOM_WAARDE: Record<string, (t: Taak) => string> = {
  prio: (t) => PRIOS[t.prio].label,
  label: (t) => t.label,
  deadline: (t) =>
    t.status === "klaar" ? "Afgerond" : t.dag < 0 ? "Te laat" : t.dag === 0 ? "Vandaag" : "Later",
};

const KOLOM_OPTIES: Record<string, string[]> = {
  prio: ["Urgent", "Hoog", "Middel", "Laag"],
  label: ["Onderhoud", "Financieel", "Compliance", "Contracten", "Inspectie", "Administratie"],
  deadline: ["Te laat", "Vandaag", "Later", "Afgerond"],
};

/* ─────────────────────────── pagina ─────────────────────────── */

type GroepOp = "status" | "prio" | "pand" | "geen";

export default function TakenPage() {
  const [taken, setTaken] = useState(TAKEN);
  const [view, setView] = useState<"lijst" | "bord">("lijst");
  const [groepOp, setGroepOp] = useState<GroepOp>("status");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [query, setQuery] = useState("");
  const [alleenAgent, setAlleenAgent] = useState(false);
  const [dicht, setDicht] = useState<string[]>([]);
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);
  const [nieuwOpen, setNieuwOpen] = useState(false);
  const [nieuwTitel, setNieuwTitel] = useState("");

  const nieuwRef = useRef<HTMLInputElement>(null);

  const zetFilter = (kolom: string, waarden: string[]) =>
    setFilters((f) => ({ ...f, [kolom]: waarden }));

  const q = query.trim().toLowerCase();
  const zichtbaar = useMemo(
    () =>
      taken.filter((t) => {
        const mq = !q || t.titel.toLowerCase().includes(q) || t.pand.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
        const mf = Object.entries(filters).every(
          ([kolom, waarden]) => !waarden.length || waarden.includes(KOLOM_WAARDE[kolom](t)),
        );
        return mq && mf && (!alleenAgent || t.agent);
      }),
    [taken, q, filters, alleenAgent],
  );

  const groepen = useMemo(() => {
    if (groepOp === "geen") return [{ key: "alles", label: "", icon: null, items: zichtbaar }];
    if (groepOp === "status")
      return STATUSSEN.map((s) => ({ key: s.id as string, label: s.label, icon: <StatusIcon s={s.id} />, items: zichtbaar.filter((t) => t.status === s.id) }));
    if (groepOp === "prio")
      return ([3, 2, 1, 0] as Prio[]).map((p) => ({ key: String(p), label: PRIOS[p].label, icon: <PrioIcon p={p} />, items: zichtbaar.filter((t) => t.prio === p) }));
    const panden = Array.from(new Set(zichtbaar.map((t) => t.pand)));
    return panden.map((p) => ({ key: p, label: p, icon: <Building2 className="h-4 w-4 text-grey-2" />, items: zichtbaar.filter((t) => t.pand === p) }));
  }, [zichtbaar, groepOp]);

  const toggleKlaar = useCallback((id: string) => {
    setTaken((prev) => prev.map((t) => (t.id === id ? { ...t, status: t.status === "klaar" ? "todo" : "klaar" } : t)));
  }, []);
  const toggleKies = useCallback((id: string) => {
    setGekozen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const naarAgent = useCallback((ids: string[]) => {
    setTaken((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, agent: true, toegewezen: "AG", status: t.status === "todo" ? "bezig" : t.status } : t)),
    );
    setGekozen([]);
  }, []);
  const verwijder = useCallback((ids: string[]) => {
    setTaken((prev) => prev.filter((t) => !ids.includes(t.id)));
    setGekozen([]);
  }, []);
  const voegToe = () => {
    const titel = nieuwTitel.trim();
    if (!titel) return;
    const nr = `T-${150 + taken.length}`;
    setTaken((prev) => [
      { id: nr, titel, status: "todo", prio: 1, pand: "Nog te koppelen", label: "Administratie", deadline: "Geen datum", dag: 99, agent: false, toegewezen: "MB", subtaken: [], reacties: 0, bijlagen: 0, omschrijving: "" },
      ...prev,
    ]);
    setNieuwTitel("");
  };

  /* Esc sluit het detailpaneel */
  useEffect(() => {
    if (!detail) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [detail]);

  const open = taken.filter((t) => t.status !== "klaar").length;
  const agentTaken = taken.filter((t) => t.agent && t.status !== "klaar").length;
  const teLaat = taken.filter((t) => t.dag < 0 && t.status !== "klaar").length;
  const detailTaak = taken.find((t) => t.id === detail) || null;

  return (
    <>
      <PageHeader
        title="Taken"
        subtitle={
          <>
            {open} open · <span className="font-medium text-forest">{agentTaken} bij de agent</span>
            {teLaat > 0 && <> · <span className="font-medium text-red-500">{teLaat} te laat</span></>}
          </>
        }
        action={{ label: "Nieuwe taak", onClick: () => { setNieuwOpen(true); setTimeout(() => nieuwRef.current?.focus(), 30); } }}
      >
        <ViewToggle
          value={view}
          onChange={setView}
          opties={[{ id: "lijst", label: "Lijst", icon: LayoutList }, { id: "bord", label: "Bord", icon: Columns3 }]}
        />
      </PageHeader>

      <Toolbar>
        <ToolbarSearch value={query} onChange={setQuery} />
        <ToolbarToggle actief={alleenAgent} onClick={() => setAlleenAgent((v) => !v)}>Alleen agent</ToolbarToggle>
      </Toolbar>

      {/* nieuwe taak */}
      <AnimatePresence>
        {nieuwOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-xl bg-paper p-3 ring-1 ring-forest/30">
              <Circle className="h-4 w-4 shrink-0 text-grey-2" />
              <input
                ref={nieuwRef}
                value={nieuwTitel}
                onChange={(e) => setNieuwTitel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") voegToe(); }}
                placeholder="Wat moet er gebeuren?"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-grey-2"
              />
              <span className="hidden items-center gap-1 text-[11px] text-grey-2 sm:flex">
                <CornerDownLeft className="h-3 w-3" /> om toe te voegen
              </span>
              <button
                type="button"
                onClick={() => { setNieuwOpen(false); setNieuwTitel(""); }}
                className="grid h-7 w-7 place-items-center rounded-md text-grey-2 transition-colors hover:bg-panel hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* inhoud */}
      {view === "lijst" ? (
        <ListShell>
          {groepen.every((g) => g.items.length === 0) ? (
            <EmptyState icon={Check} titel="Geen taken gevonden" tekst="Pas je zoekopdracht of filter aan." />
          ) : (
            <>
              <ListHead>
                <span className={COL.status} />
                <HeadCell
                  label="Taak"
                  className="min-w-0 flex-1"
                  groep={groepOp}
                  onGroep={(id) => setGroepOp(id as GroepOp)}
                  groepeerOpties={[
                    { id: "status", label: "Status" },
                    { id: "prio", label: "Prioriteit" },
                    { id: "pand", label: "Pand" },
                    { id: "geen", label: "Geen groepering" },
                  ]}
                />
                <HeadCell
                  label="Prioriteit"
                  className={COL.prio}
                  opties={KOLOM_OPTIES.prio}
                  actief={filters.prio ?? []}
                  onWijzig={(v) => zetFilter("prio", v)}
                />
                <HeadCell
                  label="Categorie"
                  className={COL.label}
                  opties={KOLOM_OPTIES.label}
                  actief={filters.label ?? []}
                  onWijzig={(v) => zetFilter("label", v)}
                />
                <HeadCell label="Stappen" className={COL.voortgang} rechts />
                <span className={COL.actie} />
                <HeadCell
                  label="Deadline"
                  className={COL.deadline}
                  rechts
                  opties={KOLOM_OPTIES.deadline}
                  actief={filters.deadline ?? []}
                  onWijzig={(v) => zetFilter("deadline", v)}
                />
                <span className={COL.avatar} />
              </ListHead>

              {groepen.map((g) => {
                if (g.items.length === 0) return null;
                const isDicht = dicht.includes(g.key);
                return (
                  <ListGroup
                    key={g.key}
                    label={g.label}
                    aantal={g.items.length}
                    dicht={isDicht}
                    onToggle={() => setDicht((d) => (isDicht ? d.filter((x) => x !== g.key) : [...d, g.key]))}
                  >
                    {g.items.map((t) => {
                      const isGekozen = gekozen.includes(t.id);
                      const klaar = t.status === "klaar";
                      const af = t.subtaken.filter((s) => s.klaar).length;
                      return (
                        <ListRow key={t.id} gekozen={isGekozen} onClick={() => setDetail(t.id)}>
                          <span className={`${COL.status} relative grid h-4 place-items-center`}>
                            {/* status, wordt selectievakje bij hover */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleKlaar(t.id); }}
                              title={klaar ? "Heropenen" : "Markeer als klaar"}
                              className={isGekozen ? "hidden" : "group-hover:hidden"}
                            >
                              <StatusIcon s={t.status} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleKies(t.id); }}
                              aria-label="Selecteren"
                              className={`grid h-4 w-4 place-items-center rounded border transition-colors ${
                                isGekozen ? "border-forest bg-forest text-paper" : "hidden border-grey-2 text-transparent group-hover:grid"
                              }`}
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </button>
                          </span>

                          <CellMain titel={t.titel} sub={t.pand} doorgehaald={klaar} />

                          <span className={`${COL.prio} text-[13px]`}>
                            {klaar ? (
                              <span className="text-grey-2">—</span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <PrioIcon p={t.prio} />
                                <span className={t.prio >= 2 ? "text-ink" : "text-grey-2"}>{PRIOS[t.prio].label}</span>
                              </span>
                            )}
                          </span>

                          <LabelDot kleur={LABEL_KLEUR[t.label] || "bg-grey-2"} className={COL.label}>
                            {t.label}
                          </LabelDot>

                          <span className={`${COL.voortgang} text-[13px] tabular-nums text-grey-2`}>
                            {t.subtaken.length > 0 ? `${af}/${t.subtaken.length}` : "—"}
                          </span>

                          <span className={COL.actie}>
                            {!t.agent && !klaar && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); naarAgent([t.id]); }}
                                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-grey opacity-0 transition-opacity hover:bg-panel-2 hover:text-forest group-hover:opacity-100"
                                title="Laat de agent dit oppakken"
                              >
                                <Sparkles className="h-3 w-3" /> Agent
                              </button>
                            )}
                          </span>

                          <span className={COL.deadline}><Deadline t={t} /></span>
                          <span className={COL.avatar}><Avatar naam={t.toegewezen} agent={t.agent} /></span>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUSSEN.map((s) => {
            const items = zichtbaar.filter((t) => t.status === s.id);
            return (
              <div
                key={s.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) setTaken((prev) => prev.map((t) => (t.id === id ? { ...t, status: s.id } : t)));
                }}
                className="flex flex-col rounded-2xl bg-panel/60 p-2.5"
              >
                <div className="mb-2 flex items-center gap-2 px-1.5 py-1">
                  <StatusIcon s={s.id} />
                  <span className="text-[13px] font-medium text-ink">{s.label}</span>
                  <span className="rounded-full bg-panel-2 px-1.5 text-[11px] font-medium tabular-nums text-grey">{items.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                      onClick={() => setDetail(t.id)}
                      className="cursor-pointer rounded-xl bg-paper p-3 ring-1 ring-line transition-shadow hover:shadow-soft-lg"
                    >
                      <div className="flex items-center gap-2">
                        <PrioIcon p={t.prio} />
                        <span className="text-[11px] tabular-nums text-grey-2">{t.id}</span>
                        <span className="ml-auto"><Avatar naam={t.toegewezen} agent={t.agent} /></span>
                      </div>
                      <p className={`mt-2 text-[13px] leading-snug ${t.status === "klaar" ? "text-grey-2 line-through" : "text-ink"}`}>{t.titel}</p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-panel px-2 py-0.5 text-[11px] text-grey">
                          <span className={`h-1.5 w-1.5 rounded-full ${LABEL_KLEUR[t.label] || "bg-grey-2"}`} />
                          {t.label}
                        </span>
                        {t.subtaken.length > 0 && (
                          <span className="flex items-center gap-1 text-[11px] tabular-nums text-grey-2">
                            <Check className="h-3 w-3" />{t.subtaken.filter((x) => x.klaar).length}/{t.subtaken.length}
                          </span>
                        )}
                        <span className="ml-auto"><Deadline t={t} /></span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[12px] text-grey-2">
                      Sleep een taak hierheen
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BulkBar aantal={gekozen.length} onSluit={() => setGekozen([])}>
        <BulkAction onClick={() => naarAgent(gekozen)} icon={Sparkles}>Naar agent</BulkAction>
        <BulkAction onClick={() => { gekozen.forEach(toggleKlaar); setGekozen([]); }} icon={Check}>Afvinken</BulkAction>
        <BulkAction onClick={() => verwijder(gekozen)} icon={Trash2} gevaar>Verwijder</BulkAction>
      </BulkBar>

      <DetailPanel
        open={!!detailTaak}
        onClose={() => setDetail(null)}
        kop={
          detailTaak && (
            <>
              <span className="text-[12px] tabular-nums text-grey-2">{detailTaak.id}</span>
              {detailTaak.agent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
                  <Sparkles className="h-3 w-3" /> Agent
                </span>
              )}
            </>
          )
        }
        voet={
          detailTaak && (
            <>
              {!detailTaak.agent && (
                <button
                  type="button"
                  onClick={() => naarAgent([detailTaak.id])}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-forest/90"
                >
                  <Sparkles className="h-4 w-4" /> Laat de agent dit doen
                </button>
              )}
              <button
                type="button"
                onClick={() => toggleKlaar(detailTaak.id)}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  detailTaak.status === "klaar" ? "bg-panel text-grey hover:bg-panel-2" : "bg-lime-2 text-forest hover:bg-lime"
                }`}
              >
                <Check className="h-4 w-4" strokeWidth={2.5} /> {detailTaak.status === "klaar" ? "Heropenen" : "Markeer als klaar"}
              </button>
              {!detailTaak.agent && (
                <button type="button" aria-label="Toewijzen" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-grey transition-colors hover:bg-panel hover:text-ink" title="Toewijzen">
                  <UserPlus className="h-4 w-4" />
                </button>
              )}
            </>
          )
        }
      >
        {detailTaak && (
          <>
            <h2 className="text-[18px] font-medium leading-snug text-ink">{detailTaak.titel}</h2>

            <DetailVelden>
              <DetailVeld label="Status">
                <StatusIcon s={detailTaak.status} /> {STATUSSEN.find((s) => s.id === detailTaak.status)!.label}
              </DetailVeld>
              <DetailVeld label="Prioriteit"><PrioIcon p={detailTaak.prio} /> {PRIOS[detailTaak.prio].label}</DetailVeld>
              <DetailVeld label="Pand"><Building2 className="h-3.5 w-3.5 text-grey-2" /> {detailTaak.pand}</DetailVeld>
              <DetailVeld label="Deadline"><Calendar className="h-3.5 w-3.5 text-grey-2" /> <Deadline t={detailTaak} /></DetailVeld>
              <DetailVeld label="Toegewezen">
                <Avatar naam={detailTaak.toegewezen} agent={detailTaak.agent} />
                {detailTaak.agent ? "Domio Agent" : "Mark Bakker"}
              </DetailVeld>
            </DetailVelden>

            {detailTaak.omschrijving && (
              <p className="rounded-xl bg-panel/70 p-3 text-[13px] leading-relaxed text-grey">{detailTaak.omschrijving}</p>
            )}

            {detailTaak.subtaken.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wide text-grey-2">Subtaken</span>
                  <span className="text-[11px] tabular-nums text-grey-2">
                    {detailTaak.subtaken.filter((s) => s.klaar).length}/{detailTaak.subtaken.length}
                  </span>
                </div>
                <Progress
                  className="mb-3"
                  pct={(detailTaak.subtaken.filter((s) => s.klaar).length / detailTaak.subtaken.length) * 100}
                />
                <ul className="space-y-1.5">
                  {detailTaak.subtaken.map((s, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[13px]">
                      <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${s.klaar ? "border-lime-2 bg-lime-2 text-forest" : "border-line text-transparent"}`}>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className={s.klaar ? "text-grey-2 line-through" : "text-ink"}>{s.t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-4 border-t border-line pt-4 text-[12px] text-grey-2">
              <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> {detailTaak.reacties} reacties</span>
              <span className="flex items-center gap-1.5"><Paperclip className="h-3.5 w-3.5" /> {detailTaak.bijlagen} bijlagen</span>
            </div>
          </>
        )}
      </DetailPanel>
    </>
  );
}
