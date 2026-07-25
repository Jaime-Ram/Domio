"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check, Circle, CircleDashed, CircleDotDashed, CheckCircle2, Building2, Calendar,
  Sparkles, X, CornerDownLeft, MessageSquare, Paperclip,
} from "lucide-react";
import {
  PageHeader, Toolbar, ToolbarSearch, ToolbarToggle, ListShell, ListGroup, ListRow,
  CellMain, Avatar, EmptyState, DetailPanel, DetailVeld, DetailVelden, Progress,
} from "../_ui";

/* ─────────────────────────── model ─────────────────────────── */

type Status = "todo" | "bezig" | "akkoord" | "klaar";

type Taak = {
  id: string;
  titel: string;
  status: Status;
  pand: string;
  deadline: string;
  dag: number;              // dagen vanaf vandaag, negatief is te laat
  agent: boolean;
  toegewezen: string;
  urgent: boolean;
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

const TAKEN: Taak[] = [
  { id: "T-118", titel: "Offerte dakreparatie beoordelen", status: "akkoord", pand: "Havenweg 8", deadline: "Gisteren", dag: -1, agent: true, toegewezen: "AG", urgent: true, subtaken: [{ t: "Offertes vergelijken", klaar: true }, { t: "Akkoord geven", klaar: false }], reacties: 3, bijlagen: 2, omschrijving: "Drie offertes opgevraagd voor de dakreparatie. De agent heeft ze vergeleken en adviseert Dakdekkers Van Dijk." },
  { id: "T-131", titel: "CV-storing verhelpen", status: "bezig", pand: "Lindenlaan 21", deadline: "Vandaag", dag: 0, agent: true, toegewezen: "AG", urgent: true, subtaken: [{ t: "Monteur zoeken", klaar: true }, { t: "Afspraak inplannen", klaar: true }, { t: "Uitvoering", klaar: false }], reacties: 5, bijlagen: 1, omschrijving: "Huurder meldt geen warm water. De agent heeft een monteur ingepland voor vanmiddag." },
  { id: "T-124", titel: "Eindinspectie inplannen", status: "bezig", pand: "Lindenlaan 21-4", deadline: "Morgen", dag: 1, agent: true, toegewezen: "AG", urgent: false, subtaken: [{ t: "Datum voorstellen", klaar: true }, { t: "Bevestigen bij huurder", klaar: false }], reacties: 0, bijlagen: 1, omschrijving: "De agent stemt een datum af voor de eindinspectie." },
  { id: "T-136", titel: "Liftkeuring inplannen", status: "akkoord", pand: "Kade 12", deadline: "1 aug", dag: 7, agent: true, toegewezen: "AG", urgent: false, subtaken: [{ t: "Keurder benaderen", klaar: true }, { t: "Datum bevestigen", klaar: false }], reacties: 2, bijlagen: 3, omschrijving: "De jaarlijkse liftkeuring moet voor september plaatsvinden." },
  { id: "T-142", titel: "Rookmelders controleren", status: "todo", pand: "Kade 12", deadline: "5 aug", dag: 11, agent: false, toegewezen: "MB", urgent: true, subtaken: [{ t: "Alle eenheden langs", klaar: false }], reacties: 0, bijlagen: 0, omschrijving: "Wettelijke jaarlijkse controle van de rookmelders." },
  { id: "T-129", titel: "Meterstanden doorgeven", status: "todo", pand: "Kade 12", deadline: "3 aug", dag: 9, agent: true, toegewezen: "AG", urgent: false, subtaken: [], reacties: 0, bijlagen: 0, omschrijving: "Kwartaalstanden doorgeven aan de energieleverancier." },
  { id: "T-134", titel: "Energielabel aanvragen", status: "todo", pand: "Parkzicht 3-2", deadline: "22 aug", dag: 28, agent: false, toegewezen: "MB", urgent: false, subtaken: [], reacties: 0, bijlagen: 0, omschrijving: "Het label verloopt dit jaar, tijdig vernieuwen." },
  { id: "T-126", titel: "Gevelreiniging offerte opvragen", status: "todo", pand: "Molenstraat 5", deadline: "10 aug", dag: 16, agent: false, toegewezen: "MB", urgent: false, subtaken: [{ t: "Partners benaderen", klaar: false }], reacties: 0, bijlagen: 0, omschrijving: "MJOP-post voor volgend jaar, alvast prijzen opvragen." },
  { id: "T-112", titel: "Voegwerk offerte opvragen", status: "klaar", pand: "Havenweg 8", deadline: "18 jul", dag: -7, agent: true, toegewezen: "AG", urgent: false, subtaken: [{ t: "Partners benaderen", klaar: true }], reacties: 1, bijlagen: 2, omschrijving: "Drie offertes ontvangen en gearchiveerd." },
  { id: "T-105", titel: "Schoonmaak trappenhuis inplannen", status: "klaar", pand: "Prinsengracht 42", deadline: "12 jul", dag: -13, agent: true, toegewezen: "AG", urgent: false, subtaken: [], reacties: 0, bijlagen: 0, omschrijving: "Maandelijkse schoonmaak ingeregeld bij de vaste partner." },
];

function StatusIcon({ s, className = "" }: { s: Status; className?: string }) {
  const def = STATUSSEN.find((x) => x.id === s)!;
  const Icon = def.icon;
  return <Icon className={`h-[18px] w-[18px] ${def.kleur} ${className}`} strokeWidth={2} />;
}

function Deadline({ t }: { t: Taak }) {
  const laat = t.dag < 0 && t.status !== "klaar";
  const vandaag = t.dag === 0;
  return (
    <span className={`text-[13px] tabular-nums ${laat ? "font-medium text-red-500" : vandaag ? "font-medium text-forest" : "text-grey-2"}`}>
      {t.deadline}
    </span>
  );
}

/* ─────────────────────────── pagina ─────────────────────────── */

export default function TakenPage() {
  const [taken, setTaken] = useState(TAKEN);
  const [query, setQuery] = useState("");
  const [alleenAgent, setAlleenAgent] = useState(false);
  const [dicht, setDicht] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);
  const [nieuwOpen, setNieuwOpen] = useState(false);
  const [nieuwTitel, setNieuwTitel] = useState("");
  const nieuwRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const zichtbaar = useMemo(
    () =>
      taken.filter((t) => {
        const mq = !q || t.titel.toLowerCase().includes(q) || t.pand.toLowerCase().includes(q);
        return mq && (!alleenAgent || t.agent);
      }),
    [taken, q, alleenAgent],
  );

  const groepen = useMemo(
    () => STATUSSEN.map((s) => ({ ...s, items: zichtbaar.filter((t) => t.status === s.id) })),
    [zichtbaar],
  );

  const toggleKlaar = useCallback((id: string) => {
    setTaken((prev) => prev.map((t) => (t.id === id ? { ...t, status: t.status === "klaar" ? "todo" : "klaar" } : t)));
  }, []);
  const naarAgent = useCallback((ids: string[]) => {
    setTaken((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, agent: true, toegewezen: "AG", status: t.status === "todo" ? "bezig" : t.status } : t)),
    );
  }, []);

  const voegToe = () => {
    const titel = nieuwTitel.trim();
    if (!titel) return;
    setTaken((prev) => [
      { id: `T-${150 + prev.length}`, titel, status: "todo", pand: "Nog te koppelen", deadline: "Geen datum", dag: 99, agent: false, toegewezen: "MB", urgent: false, subtaken: [], reacties: 0, bijlagen: 0, omschrijving: "" },
      ...prev,
    ]);
    setNieuwTitel("");
  };

  useEffect(() => {
    if (!detail) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [detail]);

  const open = taken.filter((t) => t.status !== "klaar").length;
  const bijAgent = taken.filter((t) => t.agent && t.status !== "klaar").length;
  const detailTaak = taken.find((t) => t.id === detail) || null;

  return (
    <>
      <PageHeader
        title="Taken"
        subtitle={<>{open} open · <span className="font-medium text-forest">{bijAgent} bij de agents</span></>}
        action={{ label: "Nieuwe taak", onClick: () => { setNieuwOpen(true); setTimeout(() => nieuwRef.current?.focus(), 30); } }}
      />

      <Toolbar>
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Zoek een taak of pand..." />
        <ToolbarToggle actief={alleenAgent} onClick={() => setAlleenAgent((v) => !v)}>Alleen agents</ToolbarToggle>
      </Toolbar>

      {/* nieuwe taak */}
      <AnimatePresence>
        {nieuwOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-paper p-4 ring-1 ring-forest/30">
              <Circle className="h-[18px] w-[18px] shrink-0 text-grey-2" />
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
                aria-label="Sluiten"
                className="grid h-7 w-7 place-items-center rounded-md text-grey-2 transition-colors hover:bg-panel hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ListShell>
        {zichtbaar.length === 0 ? (
          <EmptyState icon={Check} titel="Geen taken gevonden" tekst="Pas je zoekopdracht of filter aan." />
        ) : (
          groepen.map((g) => {
            if (g.items.length === 0) return null;
            const isDicht = dicht.includes(g.id);
            return (
              <ListGroup
                key={g.id}
                label={g.label}
                aantal={g.items.length}
                dicht={isDicht}
                onToggle={() => setDicht((d) => (isDicht ? d.filter((x) => x !== g.id) : [...d, g.id]))}
              >
                {g.items.map((t) => {
                  const klaar = t.status === "klaar";
                  return (
                    <ListRow key={t.id} onClick={() => setDetail(t.id)}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleKlaar(t.id); }}
                        title={klaar ? "Heropenen" : "Markeer als klaar"}
                        className="shrink-0 transition-transform hover:scale-110"
                      >
                        <StatusIcon s={t.status} />
                      </button>

                      <CellMain titel={t.titel} sub={t.pand} doorgehaald={klaar} />

                      {t.urgent && !klaar && (
                        <span className="hidden shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 sm:block">
                          Urgent
                        </span>
                      )}

                      {!t.agent && !klaar && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); naarAgent([t.id]); }}
                          className="hidden shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-grey opacity-0 transition-opacity hover:bg-panel-2 hover:text-forest group-hover:opacity-100 lg:inline-flex"
                          title="Laat een agent dit oppakken"
                        >
                          <Sparkles className="h-3.5 w-3.5" /> Agent
                        </button>
                      )}

                      <span className="w-[72px] shrink-0 text-right"><Deadline t={t} /></span>
                      <Avatar naam={t.toegewezen} agent={t.agent} />
                    </ListRow>
                  );
                })}
              </ListGroup>
            );
          })
        )}
      </ListShell>

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
                  <Sparkles className="h-4 w-4" /> Laat een agent dit doen
                </button>
              )}
              <button
                type="button"
                onClick={() => toggleKlaar(detailTaak.id)}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  detailTaak.status === "klaar" ? "bg-panel text-grey hover:bg-panel-2" : "bg-lime-2 text-forest hover:bg-lime"
                }`}
              >
                <Check className="h-4 w-4" strokeWidth={2.5} />
                {detailTaak.status === "klaar" ? "Heropenen" : "Markeer als klaar"}
              </button>
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
              <DetailVeld label="Pand">
                <Building2 className="h-3.5 w-3.5 text-grey-2" /> {detailTaak.pand}
              </DetailVeld>
              <DetailVeld label="Deadline">
                <Calendar className="h-3.5 w-3.5 text-grey-2" /> <Deadline t={detailTaak} />
              </DetailVeld>
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
                  <span className="text-[11px] uppercase tracking-wide text-grey-2">Stappen</span>
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
