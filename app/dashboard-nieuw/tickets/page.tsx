"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Check, Sparkles, Building2, Wrench, AlertTriangle, Trash2, MessageSquare,
  Paperclip, Mail, Phone, Globe, Zap, Droplets, Flame, PaintRoller,
  DoorOpen, CircleDot, Timer, Euro, User,
} from "lucide-react";
import {
  PageHeader, Toolbar, ToolbarSearch, ToolbarToggle, StatusDot, ListShell, ListHead,
  HeadCell, ListGroup, ListRow, CellMain, LabelDot, Avatar, EmptyState, BulkBar,
  BulkAction, DetailPanel, DetailVeld, DetailVelden, Progress, type SorteerRichting,
} from "../_ui";
import { KpiRow, KpiCard, KpiPill, MiniRing, MiniBars, useCountUp, euro, procent } from "../_kpi";

/* ─────────────────────────── model ─────────────────────────── */

type Status = "nieuw" | "bezig" | "partner" | "akkoord" | "klaar";
type Prio = "P1" | "P2" | "P3" | "P4";
type Kanaal = "whatsapp" | "mail" | "telefoon" | "portaal";

type Melding = {
  id: string;
  titel: string;
  pand: string;
  eenheid: string;
  categorie: string;
  prio: Prio;
  status: Status;
  kanaal: Kanaal;
  partner: string | null;
  slaUren: number;        // uren tot de SLA verloopt, negatief is overschreden
  kosten: number;
  agent: boolean;
  gemeld: string;
  eenKeerOpgelost: boolean;
  omschrijving: string;
  stappen: { t: string; klaar: boolean }[];
  historie: { tijd: string; wie: string; wat: string; agent: boolean }[];
  reacties: number;
  bijlagen: number;
};

/* SLA-afspraken per prioriteit */
const SLA: Record<Prio, { label: string; oplossen: number; kleur: string }> = {
  P1: { label: "Spoed", oplossen: 4, kleur: "bg-red-400" },
  P2: { label: "Hoog", oplossen: 24, kleur: "bg-[#f4c04f]" },
  P3: { label: "Normaal", oplossen: 72, kleur: "bg-forest" },
  P4: { label: "Laag", oplossen: 120, kleur: "bg-grey-2" },
};

const STATUSSEN: { id: Status; label: string }[] = [
  { id: "nieuw", label: "Nieuw" },
  { id: "bezig", label: "In behandeling" },
  { id: "partner", label: "Bij de partner" },
  { id: "akkoord", label: "Wacht op akkoord" },
  { id: "klaar", label: "Afgerond" },
];

const CATEGORIE_ICOON: Record<string, React.ElementType> = {
  Loodgieterswerk: Droplets,
  "CV en verwarming": Flame,
  Elektra: Zap,
  Schilderwerk: PaintRoller,
  "Deuren en sloten": DoorOpen,
  Overig: Wrench,
};

const KANAAL_ICOON: Record<Kanaal, React.ElementType> = {
  whatsapp: MessageSquare,
  mail: Mail,
  telefoon: Phone,
  portaal: Globe,
};

const KANAAL_LABEL: Record<Kanaal, string> = {
  whatsapp: "WhatsApp",
  mail: "E-mail",
  telefoon: "Telefoon",
  portaal: "Portaal",
};

const MELDINGEN: Melding[] = [
  {
    id: "M-2418", titel: "Geen warm water", pand: "Lindenlaan 21", eenheid: "21-3",
    categorie: "CV en verwarming", prio: "P1", status: "bezig", kanaal: "whatsapp",
    partner: "Loodgieter Jansen", slaUren: 1.5, kosten: 285, agent: true, gemeld: "vandaag 08:12",
    eenKeerOpgelost: true,
    omschrijving: "Huurder meldt dat er geen warm water uit de kraan komt. De ketel geeft foutcode F28.",
    stappen: [
      { t: "Melding getrieerd", klaar: true },
      { t: "Monteur gezocht en ingepland", klaar: true },
      { t: "Uitvoering", klaar: false },
      { t: "Nazorg bij huurder", klaar: false },
    ],
    historie: [
      { tijd: "08:12", wie: "Huurder", wat: "Melding binnengekomen via WhatsApp", agent: false },
      { tijd: "08:13", wie: "Agent", wat: "Gecategoriseerd als CV-storing, prioriteit spoed", agent: true },
      { tijd: "08:15", wie: "Agent", wat: "Loodgieter Jansen benaderd, beschikbaar vanmiddag", agent: true },
      { tijd: "08:21", wie: "Agent", wat: "Afspraak bevestigd bij huurder voor 14:00", agent: true },
    ],
    reacties: 5, bijlagen: 2,
  },
  {
    id: "M-2417", titel: "Lekkage onder de gootsteen", pand: "Prinsengracht 42", eenheid: "42-1",
    categorie: "Loodgieterswerk", prio: "P1", status: "akkoord", kanaal: "whatsapp",
    partner: "Loodgieter Jansen", slaUren: -2, kosten: 340, agent: true, gemeld: "gisteren 16:40",
    eenKeerOpgelost: false,
    omschrijving: "Water onder het aanrecht. Huurder heeft de hoofdkraan dichtgedraaid. Offerte van € 340 ligt klaar.",
    stappen: [
      { t: "Melding getrieerd", klaar: true },
      { t: "Offertes opgevraagd", klaar: true },
      { t: "Akkoord op offerte", klaar: false },
      { t: "Uitvoering", klaar: false },
    ],
    historie: [
      { tijd: "gisteren 16:40", wie: "Huurder", wat: "Melding binnengekomen via WhatsApp", agent: false },
      { tijd: "gisteren 16:42", wie: "Agent", wat: "Gecategoriseerd als lekkage, prioriteit spoed", agent: true },
      { tijd: "gisteren 17:05", wie: "Agent", wat: "Drie offertes opgevraagd", agent: true },
      { tijd: "vandaag 09:30", wie: "Agent", wat: "Offertes vergeleken, adviseert Loodgieter Jansen", agent: true },
    ],
    reacties: 3, bijlagen: 4,
  },
  {
    id: "M-2415", titel: "Stopcontact slaapkamer werkt niet", pand: "Kade 12", eenheid: "12-7",
    categorie: "Elektra", prio: "P2", status: "partner", kanaal: "portaal",
    partner: "Elektro Bakker", slaUren: 6, kosten: 145, agent: true, gemeld: "gisteren 11:20",
    eenKeerOpgelost: true,
    omschrijving: "Twee stopcontacten in de slaapkamer doen het niet. De groep valt niet uit.",
    stappen: [
      { t: "Melding getrieerd", klaar: true },
      { t: "Monteur ingepland", klaar: true },
      { t: "Uitvoering", klaar: false },
    ],
    historie: [
      { tijd: "gisteren 11:20", wie: "Huurder", wat: "Melding via het huurdersportaal", agent: false },
      { tijd: "gisteren 11:22", wie: "Agent", wat: "Gecategoriseerd als elektra, prioriteit hoog", agent: true },
      { tijd: "gisteren 13:00", wie: "Agent", wat: "Elektro Bakker ingepland voor morgenochtend", agent: true },
    ],
    reacties: 1, bijlagen: 1,
  },
  {
    id: "M-2412", titel: "Voordeur sluit niet goed", pand: "Havenweg 8", eenheid: "8-2",
    categorie: "Deuren en sloten", prio: "P2", status: "nieuw", kanaal: "telefoon",
    partner: null, slaUren: 18, kosten: 0, agent: false, gemeld: "vandaag 09:05",
    eenKeerOpgelost: true,
    omschrijving: "De voordeur van de bedrijfsruimte klemt en sluit niet volledig. Veiligheidsrisico buiten kantooruren.",
    stappen: [{ t: "Melding getrieerd", klaar: false }],
    historie: [{ tijd: "09:05", wie: "Huurder", wat: "Telefonisch gemeld", agent: false }],
    reacties: 0, bijlagen: 0,
  },
  {
    id: "M-2410", titel: "Schilderwerk kozijnen bladdert", pand: "Molenstraat 5", eenheid: "5-1",
    categorie: "Schilderwerk", prio: "P4", status: "nieuw", kanaal: "mail",
    partner: null, slaUren: 96, kosten: 0, agent: false, gemeld: "2 dagen geleden",
    eenKeerOpgelost: true,
    omschrijving: "Buitenkozijnen aan de straatzijde bladderen af. Geen spoed, kandidaat voor de MJOP.",
    stappen: [{ t: "Melding getrieerd", klaar: false }],
    historie: [{ tijd: "2 dagen geleden", wie: "Huurder", wat: "Gemeld per e-mail", agent: false }],
    reacties: 0, bijlagen: 3,
  },
  {
    id: "M-2408", titel: "Radiator wordt niet warm", pand: "Kade 12", eenheid: "12-3",
    categorie: "CV en verwarming", prio: "P3", status: "bezig", kanaal: "whatsapp",
    partner: "Loodgieter Jansen", slaUren: 34, kosten: 95, agent: true, gemeld: "2 dagen geleden",
    eenKeerOpgelost: true,
    omschrijving: "Eén radiator in de woonkamer blijft koud, de rest werkt. Waarschijnlijk ontluchten.",
    stappen: [
      { t: "Melding getrieerd", klaar: true },
      { t: "Zelfhulp gestuurd naar huurder", klaar: true },
      { t: "Monteur inplannen indien nodig", klaar: false },
    ],
    historie: [
      { tijd: "2 dagen geleden", wie: "Huurder", wat: "Melding via WhatsApp", agent: false },
      { tijd: "2 dagen geleden", wie: "Agent", wat: "Ontluchtingsinstructie gestuurd", agent: true },
    ],
    reacties: 2, bijlagen: 0,
  },
  {
    id: "M-2405", titel: "Liftstoring begane grond", pand: "Kade 12", eenheid: "algemeen",
    categorie: "Overig", prio: "P1", status: "klaar", kanaal: "telefoon",
    partner: "Liftservice Nederland", slaUren: 0, kosten: 620, agent: true, gemeld: "4 dagen geleden",
    eenKeerOpgelost: true,
    omschrijving: "Lift bleef steken op de begane grond. De monteur heeft de deursensor vervangen.",
    stappen: [
      { t: "Melding getrieerd", klaar: true },
      { t: "Spoedmonteur ingezet", klaar: true },
      { t: "Uitvoering", klaar: true },
      { t: "Factuur gecontroleerd", klaar: true },
    ],
    historie: [
      { tijd: "4 dagen geleden", wie: "Beheerder", wat: "Telefonisch gemeld", agent: false },
      { tijd: "4 dagen geleden", wie: "Agent", wat: "Spoedmonteur ingezet binnen 40 minuten", agent: true },
      { tijd: "3 dagen geleden", wie: "Agent", wat: "Factuur van € 620 gecontroleerd en geboekt", agent: true },
    ],
    reacties: 4, bijlagen: 2,
  },
  {
    id: "M-2401", titel: "Tochtklacht woonkamer", pand: "Parkzicht 3", eenheid: "3-2",
    categorie: "Overig", prio: "P4", status: "klaar", kanaal: "portaal",
    partner: null, slaUren: 0, kosten: 0, agent: true, gemeld: "vorige week",
    eenKeerOpgelost: true,
    omschrijving: "Tocht langs het schuifraam. Tochtstrip vervangen door de huismeester.",
    stappen: [{ t: "Melding getrieerd", klaar: true }, { t: "Opgelost", klaar: true }],
    historie: [
      { tijd: "vorige week", wie: "Huurder", wat: "Melding via het huurdersportaal", agent: false },
      { tijd: "vorige week", wie: "Agent", wat: "Huismeester ingeschakeld, opgelost", agent: true },
    ],
    reacties: 1, bijlagen: 0,
  },
];

/* ─────────────────────────── hulpjes ─────────────────────────── */

const COL = {
  prio: "w-4 shrink-0",
  categorie: "hidden w-[128px] shrink-0 lg:flex",
  partner: "hidden w-[132px] shrink-0 xl:block",
  sla: "w-[92px] shrink-0 text-right",
  kosten: "hidden w-[78px] shrink-0 text-right md:block",
  actie: "hidden w-[68px] shrink-0 lg:block",
  avatar: "w-6 shrink-0",
};

/* de SLA-klok waarschuwt vóór de overschrijding, niet erna */
function slaStand(m: Melding): { toon: "goed" | "let-op" | "slecht"; tekst: string; pct: number } {
  if (m.status === "klaar") return { toon: "goed", tekst: "Gehaald", pct: 100 };
  const totaal = SLA[m.prio].oplossen;
  const verstreken = Math.max(0, totaal - m.slaUren);
  const pct = Math.min(100, (verstreken / totaal) * 100);
  if (m.slaUren < 0) return { toon: "slecht", tekst: `${Math.abs(m.slaUren)} u te laat`, pct: 100 };
  if (m.slaUren <= totaal * 0.25) return { toon: "let-op", tekst: `nog ${m.slaUren} u`, pct };
  return { toon: "goed", tekst: `nog ${m.slaUren} u`, pct };
}

function gezondheid(m: Melding): { toon: "goed" | "let-op" | "slecht"; titel: string } {
  const s = slaStand(m);
  const titel =
    m.status === "klaar" ? "Afgerond binnen de afspraak"
      : s.toon === "slecht" ? `SLA overschreden met ${Math.abs(m.slaUren)} uur`
      : s.toon === "let-op" ? `SLA verloopt over ${m.slaUren} uur`
      : `Binnen de afspraak, nog ${m.slaUren} uur`;
  return { toon: s.toon, titel };
}

const KOLOM_WAARDE: Record<string, (m: Melding) => string> = {
  categorie: (m) => m.categorie,
  partner: (m) => m.partner ?? "Nog geen partner",
  sla: (m) => {
    const s = slaStand(m);
    return s.toon === "slecht" ? "Overschreden" : s.toon === "let-op" ? "Verloopt bijna" : "Binnen de afspraak";
  },
};

const KOLOM_OPTIES: Record<string, string[]> = {
  categorie: Object.keys(CATEGORIE_ICOON),
  partner: [
    ...Array.from(new Set(MELDINGEN.map((m) => m.partner).filter(Boolean) as string[])).sort(),
    "Nog geen partner",
  ],
  sla: ["Overschreden", "Verloopt bijna", "Binnen de afspraak"],
};

const SORTEER: Record<string, (m: Melding) => number | string> = {
  melding: (m) => m.titel.toLowerCase(),
  sla: (m) => m.slaUren,
  kosten: (m) => m.kosten,
};

/* ─────────────────────────── pagina ─────────────────────────── */

type GroepOp = "status" | "prio" | "pand" | "geen";

export default function MeldingenPage() {
  const [meldingen, setMeldingen] = useState(MELDINGEN);
  const [groepOp, setGroepOp] = useState<GroepOp>("status");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sorteer, setSorteer] = useState<{ kolom: string; richting: SorteerRichting } | null>(null);
  const [query, setQuery] = useState("");
  const [alleenRisico, setAlleenRisico] = useState(false);
  const [dicht, setDicht] = useState<string[]>([]);
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);

  const zetFilter = (kolom: string, waarden: string[]) => setFilters((f) => ({ ...f, [kolom]: waarden }));
  const zetSorteer = (kolom: string, richting: SorteerRichting) =>
    setSorteer((s) => (s?.kolom === kolom && s.richting === richting ? null : { kolom, richting }));

  const q = query.trim().toLowerCase();
  const zichtbaar = useMemo(() => {
    const lijst = meldingen.filter((m) => {
      const mq = !q || m.titel.toLowerCase().includes(q) || m.pand.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
      const mf = Object.entries(filters).every(([k, v]) => !v.length || v.includes(KOLOM_WAARDE[k](m)));
      const mr = !alleenRisico || (m.status !== "klaar" && slaStand(m).toon !== "goed");
      return mq && mf && mr;
    });
    if (!sorteer) return lijst;
    const w = SORTEER[sorteer.kolom];
    return [...lijst].sort((a, b) => {
      const va = w(a), vb = w(b);
      const vgl = typeof va === "string" ? String(va).localeCompare(String(vb)) : Number(va) - Number(vb);
      return sorteer.richting === "hoog" ? -vgl : vgl;
    });
  }, [meldingen, q, filters, alleenRisico, sorteer]);

  const groepen = useMemo(() => {
    if (groepOp === "geen") return [{ key: "alles", label: "", items: zichtbaar }];
    if (groepOp === "status")
      return STATUSSEN.map((s) => ({ key: s.id, label: s.label, items: zichtbaar.filter((m) => m.status === s.id) }));
    if (groepOp === "prio")
      return (["P1", "P2", "P3", "P4"] as Prio[]).map((p) => ({
        key: p, label: `${SLA[p].label} (${p})`, items: zichtbaar.filter((m) => m.prio === p),
      }));
    const panden = Array.from(new Set(zichtbaar.map((m) => m.pand))).sort();
    return panden.map((p) => ({ key: p, label: p, items: zichtbaar.filter((m) => m.pand === p) }));
  }, [zichtbaar, groepOp]);

  const toggleKies = useCallback((id: string) => {
    setGekozen((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);
  const naarAgent = useCallback((ids: string[]) => {
    setMeldingen((p) =>
      p.map((m) => (ids.includes(m.id) ? { ...m, agent: true, status: m.status === "nieuw" ? "bezig" : m.status } : m)),
    );
    setGekozen([]);
  }, []);
  const afronden = useCallback((ids: string[]) => {
    setMeldingen((p) => p.map((m) => (ids.includes(m.id) ? { ...m, status: "klaar", slaUren: 0 } : m)));
    setGekozen([]);
  }, []);
  const verwijder = useCallback((ids: string[]) => {
    setMeldingen((p) => p.filter((m) => !ids.includes(m.id)));
    setGekozen([]);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [detail]);

  const open = meldingen.filter((m) => m.status !== "klaar");
  const risico = open.filter((m) => slaStand(m).toon !== "goed").length;
  const overschreden = open.filter((m) => m.slaUren < 0).length;
  const bijAgent = open.filter((m) => m.agent).length;
  const afgerond = meldingen.filter((m) => m.status === "klaar");
  const eenKeer = meldingen.filter((m) => m.eenKeerOpgelost).length;
  const eenKeerPct = meldingen.length ? (eenKeer / meldingen.length) * 100 : 0;
  const kostenOpen = open.reduce((s, m) => s + m.kosten, 0);
  const detailMelding = meldingen.find((m) => m.id === detail) || null;

  const openTeller = useCountUp(open.length);
  const risicoTeller = useCountUp(risico);
  const kostenTeller = useCountUp(kostenOpen);

  return (
    <>
      <PageHeader
        title="Meldingen"
        subtitle={
          <>
            {open.length} open · <span className="font-medium text-forest">{bijAgent} bij de agents</span>
            {overschreden > 0 && <> · <span className="font-medium text-red-500">{overschreden} te laat</span></>}
          </>
        }
        action={{ label: "Melding aanmaken" }}
      />

      <KpiRow>
        <KpiCard label="Open meldingen" waarde={String(Math.round(openTeller))} sub={`${afgerond.length} afgerond deze maand`}>
          <MiniBars data={[45, 60, 52, 70, 48, 62, 40, 35]} vanaf={5} />
        </KpiCard>

        <KpiCard
          label="SLA-risico"
          waarde={String(Math.round(risicoTeller))}
          toon={overschreden > 0 ? "slecht" : risico > 0 ? "let-op" : "goed"}
          sub={
            overschreden > 0 ? `${overschreden} al te laat`
              : risico > 0 ? "verloopt binnen een kwart van de tijd"
              : "alles ruim binnen de afspraak"
          }
          badge={<KpiPill>{open.length} open</KpiPill>}
        />

        <div className="flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-line">
          <span className="text-[12px] uppercase tracking-wide text-grey-2">In één keer opgelost</span>
          <div className="mt-4 flex flex-1 items-center gap-4">
            <MiniRing pct={eenKeerPct} formaat={72} dik={3.4} kleur="#5cc93f" tekstKlasse="text-[15px] text-forest" />
            <div className="min-w-0">
              <div className="text-[15px] font-medium text-ink">Zonder herhaalbezoek</div>
              <div className="mt-1 text-[12px] text-grey-2">{eenKeer} van {meldingen.length}</div>
            </div>
          </div>
        </div>

        <KpiCard
          label="Kosten in behandeling"
          waarde={euro(kostenTeller)}
          sub="geraamd op de open meldingen"
          badge={<KpiPill>{procent(eenKeerPct)} in één keer</KpiPill>}
        />
      </KpiRow>

      <Toolbar>
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Zoek op melding, pand of nummer..." />
        <ToolbarToggle actief={alleenRisico} onClick={() => setAlleenRisico((v) => !v)} icon={AlertTriangle}>
          SLA-risico
        </ToolbarToggle>
      </Toolbar>

      <ListShell>
        {zichtbaar.length === 0 ? (
          <EmptyState icon={Wrench} titel="Geen meldingen gevonden" tekst="Pas je zoekopdracht of filter aan." />
        ) : (
          <>
            <ListHead>
              <span className={COL.prio} />
              <HeadCell
                label="Melding"
                className="min-w-0 flex-1"
                sorteerbaar sorteerId="melding" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Z naar A", laag: "A naar Z" }}
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
                label="Categorie" className={COL.categorie}
                opties={KOLOM_OPTIES.categorie} actief={filters.categorie ?? []}
                onWijzig={(v) => zetFilter("categorie", v)}
              />
              <HeadCell
                label="Partner" className={COL.partner}
                opties={KOLOM_OPTIES.partner} actief={filters.partner ?? []}
                onWijzig={(v) => zetFilter("partner", v)}
              />
              <HeadCell
                label="SLA" className={COL.sla} rechts
                sorteerbaar sorteerId="sla" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Meeste tijd over", laag: "Minste tijd over" }}
                opties={KOLOM_OPTIES.sla} actief={filters.sla ?? []}
                onWijzig={(v) => zetFilter("sla", v)}
              />
              <HeadCell
                label="Kosten" className={COL.kosten} rechts
                sorteerbaar sorteerId="kosten" sorteer={sorteer} onSorteer={zetSorteer}
              />
              <span className={COL.actie} />
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
                  {g.items.map((m) => {
                    const isGekozen = gekozen.includes(m.id);
                    const gz = gezondheid(m);
                    const s = slaStand(m);
                    const Icoon = CATEGORIE_ICOON[m.categorie] ?? Wrench;
                    const KanaalIcoon = KANAAL_ICOON[m.kanaal];
                    return (
                      <ListRow key={m.id} gekozen={isGekozen} onClick={() => setDetail(m.id)}>
                        <span className={`${COL.prio} relative grid h-4 place-items-center`}>
                          <span className={isGekozen ? "hidden" : "group-hover:hidden"}>
                            <StatusDot toon={gz.toon} titel={gz.titel} />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleKies(m.id); }}
                            aria-label="Selecteren"
                            className={`grid h-4 w-4 place-items-center rounded border transition-colors ${
                              isGekozen ? "border-forest bg-forest text-paper" : "hidden border-grey-2 text-transparent group-hover:grid"
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </button>
                        </span>

                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <KanaalIcoon className="h-3.5 w-3.5 shrink-0 text-grey-2" aria-label={KANAAL_LABEL[m.kanaal]} />
                          <CellMain
                            titel={m.titel}
                            sub={`${m.pand} ${m.eenheid} · ${m.gemeld}`}
                            doorgehaald={m.status === "klaar"}
                          />
                        </span>

                        <span className={`${COL.categorie} items-center gap-1.5 text-[13px] text-grey`}>
                          <Icoon className="h-3.5 w-3.5 shrink-0 text-grey-2" />
                          <span className="truncate">{m.categorie}</span>
                        </span>

                        <span className={`${COL.partner} truncate text-[13px] ${m.partner ? "text-grey" : "text-grey-2"}`}>
                          {m.partner ?? "Nog niet toegewezen"}
                        </span>

                        <span className={`${COL.sla} text-[13px] tabular-nums ${
                          s.toon === "slecht" ? "font-medium text-red-500"
                            : s.toon === "let-op" ? "font-medium text-[#c99a1f]" : "text-grey-2"
                        }`}>
                          {s.tekst}
                        </span>

                        <span className={`${COL.kosten} text-[13px] tabular-nums ${m.kosten ? "text-ink" : "text-grey-2"}`}>
                          {m.kosten ? euro(m.kosten) : "—"}
                        </span>

                        <span className={COL.actie}>
                          {!m.agent && m.status !== "klaar" && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); naarAgent([m.id]); }}
                              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-grey opacity-0 transition-opacity hover:bg-panel-2 hover:text-forest group-hover:opacity-100"
                              title="Laat een agent dit oppakken"
                            >
                              <Sparkles className="h-3 w-3" /> Agent
                            </button>
                          )}
                        </span>

                        <span className={COL.avatar}>
                          <Avatar naam="MB" agent={m.agent} />
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
        <BulkAction onClick={() => afronden(gekozen)} icon={Check}>Afronden</BulkAction>
        <BulkAction onClick={() => verwijder(gekozen)} icon={Trash2} gevaar>Verwijder</BulkAction>
      </BulkBar>

      <DetailPanel
        open={!!detailMelding}
        onClose={() => setDetail(null)}
        kop={
          detailMelding && (
            <>
              <span className="text-[12px] tabular-nums text-grey-2">{detailMelding.id}</span>
              <LabelDot kleur={SLA[detailMelding.prio].kleur}>{SLA[detailMelding.prio].label}</LabelDot>
              {detailMelding.agent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
                  <Sparkles className="h-3 w-3" /> Agent
                </span>
              )}
            </>
          )
        }
        voet={
          detailMelding && (
            <>
              {!detailMelding.agent && detailMelding.status !== "klaar" && (
                <button
                  type="button"
                  onClick={() => naarAgent([detailMelding.id])}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-forest/90"
                >
                  <Sparkles className="h-4 w-4" /> Laat een agent dit doen
                </button>
              )}
              <button
                type="button"
                onClick={() => afronden([detailMelding.id])}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  detailMelding.status === "klaar" ? "bg-panel text-grey hover:bg-panel-2" : "bg-lime-2 text-forest hover:bg-lime"
                }`}
              >
                <Check className="h-4 w-4" strokeWidth={2.5} />
                {detailMelding.status === "klaar" ? "Afgerond" : "Melding afronden"}
              </button>
            </>
          )
        }
      >
        {detailMelding && (() => {
          const s = slaStand(detailMelding);
          const Icoon = CATEGORIE_ICOON[detailMelding.categorie] ?? Wrench;
          const KanaalIcoon = KANAAL_ICOON[detailMelding.kanaal];
          const af = detailMelding.stappen.filter((x) => x.klaar).length;
          return (
            <>
              <div>
                <div className="flex items-center gap-2">
                  <StatusDot {...gezondheid(detailMelding)} />
                  <h2 className="text-[18px] font-medium leading-snug text-ink">{detailMelding.titel}</h2>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-[13px] text-grey">
                  <Building2 className="h-3.5 w-3.5 text-grey-2" /> {detailMelding.pand} {detailMelding.eenheid}
                </p>
              </div>

              {detailMelding.status !== "klaar" && (
                <div className={`rounded-xl p-3 ${
                  s.toon === "slecht" ? "bg-red-50" : s.toon === "let-op" ? "bg-[#fdf6e3]" : "bg-panel/70"
                }`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-grey-2">
                      <Timer className="h-3.5 w-3.5" /> Oplostijd volgens afspraak
                    </span>
                    <span className={`text-[12px] font-medium tabular-nums ${
                      s.toon === "slecht" ? "text-red-500" : s.toon === "let-op" ? "text-[#c99a1f]" : "text-grey"
                    }`}>
                      {s.tekst}
                    </span>
                  </div>
                  <Progress pct={s.pct} />
                  <p className="mt-2 text-[11px] text-grey-2">
                    {SLA[detailMelding.prio].label} betekent binnen {SLA[detailMelding.prio].oplossen} uur opgelost
                  </p>
                </div>
              )}

              <p className="rounded-xl bg-panel/70 p-3 text-[13px] leading-relaxed text-grey">{detailMelding.omschrijving}</p>

              <DetailVelden>
                <DetailVeld label="Status">
                  {STATUSSEN.find((x) => x.id === detailMelding.status)!.label}
                </DetailVeld>
                <DetailVeld label="Categorie">
                  <Icoon className="h-3.5 w-3.5 text-grey-2" /> {detailMelding.categorie}
                </DetailVeld>
                <DetailVeld label="Kanaal">
                  <KanaalIcoon className="h-3.5 w-3.5 text-grey-2" /> {KANAAL_LABEL[detailMelding.kanaal]} · {detailMelding.gemeld}
                </DetailVeld>
                <DetailVeld label="Partner">
                  {detailMelding.partner ? (
                    <><User className="h-3.5 w-3.5 text-grey-2" /> {detailMelding.partner}</>
                  ) : (
                    <span className="text-grey-2">Nog niet toegewezen</span>
                  )}
                </DetailVeld>
                <DetailVeld label="Kosten">
                  <Euro className="h-3.5 w-3.5 text-grey-2" />
                  {detailMelding.kosten ? euro(detailMelding.kosten) : "Nog niet bekend"}
                </DetailVeld>
              </DetailVelden>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wide text-grey-2">Stappen</span>
                  <span className="text-[11px] tabular-nums text-grey-2">{af}/{detailMelding.stappen.length}</span>
                </div>
                <Progress className="mb-3" pct={(af / detailMelding.stappen.length) * 100} />
                <ul className="space-y-1.5">
                  {detailMelding.stappen.map((x, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[13px]">
                      <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                        x.klaar ? "border-lime-2 bg-lime-2 text-forest" : "border-line text-transparent"
                      }`}>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className={x.klaar ? "text-grey-2 line-through" : "text-ink"}>{x.t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="mb-2 block text-[11px] uppercase tracking-wide text-grey-2">Verloop</span>
                <ul className="relative space-y-3">
                  <span className="absolute bottom-1 left-[5px] top-1 w-px bg-line" aria-hidden />
                  {detailMelding.historie.map((h, i) => (
                    <li key={i} className="relative flex gap-3 pl-5">
                      <span className={`absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-paper ${h.agent ? "bg-lime-2" : "bg-line"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] text-ink">{h.wat}</span>
                        <span className="block text-[11px] text-grey-2">{h.wie} · {h.tijd}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-4 border-t border-line pt-4 text-[12px] text-grey-2">
                <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> {detailMelding.reacties} berichten</span>
                <span className="flex items-center gap-1.5"><Paperclip className="h-3.5 w-3.5" /> {detailMelding.bijlagen} bijlagen</span>
                <span className="ml-auto flex items-center gap-1.5"><CircleDot className="h-3.5 w-3.5" /> {detailMelding.prio}</span>
              </div>
            </>
          );
        })()}
      </DetailPanel>
    </>
  );
}
