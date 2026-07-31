"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard, ClipboardCheck, Ticket, CalendarRange, Euro, ShieldCheck,
  Building2, BookUser, HardDrive, Settings, Smartphone,
  MessageSquare, Globe, Phone, Droplets, Flame, Zap, DoorOpen, Wrench,
  Sparkles, Check, AlertTriangle, Search, Plus,
} from "lucide-react";

/* ─────────── echte sidebar-navigatie (uit dashboard-nieuw) ─────────── */
const nav = [
  { header: "Overzicht", items: [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Taken", icon: ClipboardCheck },
  ]},
  { header: "Onderhoud", items: [
    { label: "Meldingen", icon: Ticket, active: true },
    { label: "MJOP", icon: CalendarRange },
    { label: "Kosten", icon: Euro },
    { label: "Compliance", icon: ShieldCheck },
  ]},
  { header: "Vastgoed", items: [
    { label: "Panden", icon: Building2 },
    { label: "Partners", icon: BookUser },
    { label: "Documenten", icon: HardDrive },
  ]},
  { header: "Meer", items: [
    { label: "App", icon: Smartphone },
    { label: "Accountinstellingen", icon: Settings },
  ]},
];

/* ─────────── echte meldingen (uit de tickets-pagina) ─────────── */
type Toon = "goed" | "let-op" | "slecht";
const KAN = { whatsapp: MessageSquare, portaal: Globe, telefoon: Phone } as const;
const CAT = { cv: Flame, lood: Droplets, elektra: Zap, deur: DoorOpen } as const;

const rows = [
  { id: "M-2418", titel: "Geen warm water", pand: "Lindenlaan 21-3", gemeld: "vandaag 08:12", kan: "whatsapp", cat: "CV en verwarming", catIcon: CAT.cv, partner: "Loodgieter Jansen", sla: "nog 1,5 u", toon: "let-op" as Toon, agent: true, live: true },
  { id: "M-2417", titel: "Lekkage onder de gootsteen", pand: "Prinsengracht 42-1", gemeld: "gisteren 16:40", kan: "whatsapp", cat: "Loodgieterswerk", catIcon: CAT.lood, partner: "Loodgieter Jansen", sla: "2 u te laat", toon: "slecht" as Toon, agent: true },
  { id: "M-2415", titel: "Stopcontact slaapkamer werkt niet", pand: "Kade 12-7", gemeld: "gisteren 11:20", kan: "portaal", cat: "Elektra", catIcon: CAT.elektra, partner: "Elektro Bakker", sla: "nog 6 u", toon: "goed" as Toon, agent: true },
  { id: "M-2412", titel: "Voordeur sluit niet goed", pand: "Havenweg 8-2", gemeld: "vandaag 09:05", kan: "telefoon", cat: "Deuren en sloten", catIcon: CAT.deur, partner: null, sla: "nog 18 u", toon: "goed" as Toon, agent: false },
  { id: "M-2408", titel: "Radiator wordt niet warm", pand: "Kade 12-3", gemeld: "2 dagen geleden", kan: "whatsapp", cat: "CV en verwarming", catIcon: CAT.cv, partner: "Loodgieter Jansen", sla: "nog 34 u", toon: "goed" as Toon, agent: true },
] as const;

const dotKleur: Record<Toon, string> = { goed: "bg-forest", "let-op": "bg-[#f4c04f]", slecht: "bg-red-400" };
const slaKleur: Record<Toon, string> = { goed: "text-grey-2", "let-op": "font-medium text-[#c99a1f]", slecht: "font-medium text-red-500" };

const GRID = "grid grid-cols-[14px_1fr_130px_86px_26px] items-center gap-3";

/* ─────────── Centraal venster: de echte Meldingen-pagina ─────────── */
function CentralWindow() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-paper shadow-[0_50px_100px_-40px_rgba(0,0,0,0.4)] ring-1 ring-line">
      {/* browser-chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-panel/60 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </span>
        <span className="ml-2 flex items-center gap-1.5 rounded-md bg-paper px-2.5 py-1 text-[11px] font-medium text-grey-2 ring-1 ring-line">
          <Building2 className="h-3 w-3" /> app.domio.nl/meldingen
        </span>
      </div>

      <div className="flex">
        {/* sidebar */}
        <aside className="hidden w-[188px] shrink-0 flex-col border-r border-line bg-paper p-2 md:flex">
          <div className="px-3 pb-3 pt-1.5 text-[14px] font-semibold text-ink">Domio</div>
          <nav className="space-y-3">
            {nav.map((g) => (
              <div key={g.header}>
                <p className="px-3 pb-1 text-[11px] text-[#97978f]">{g.header}</p>
                <ul className="space-y-px">
                  {g.items.map((it) => {
                    const Icon = it.icon;
                    const active = "active" in it && it.active;
                    return (
                      <li key={it.label}>
                        <div className={`flex items-center gap-3 rounded-md px-3 py-[5px] text-[13px] ${
                          active ? "bg-[#f4f4f1] font-medium text-ink" : "text-[#55554e]"
                        }`}>
                          <Icon className={`size-[16px] shrink-0 ${active ? "text-forest" : "text-[#97978f]"}`} strokeWidth={active ? 2.5 : 2} />
                          {it.label}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* hoofdinhoud */}
        <div className="min-w-0 flex-1 bg-[#f4f4f1] p-4 sm:p-5">
          {/* page header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[17px] font-semibold text-ink">Meldingen</h3>
              <p className="mt-0.5 text-[12px] text-grey">
                7 open · <span className="font-medium text-forest">5 bij de agents</span> ·{" "}
                <span className="font-medium text-red-500">1 te laat</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-forest px-3 py-1.5 text-[12px] font-medium text-paper">
              <Plus className="h-3.5 w-3.5" /> Melding aanmaken
            </span>
          </div>

          {/* kpi's */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { l: "Open meldingen", v: "7", s: "12 afgerond deze maand" },
              { l: "SLA-risico", v: "2", s: "1 al te laat", toon: "slecht" },
              { l: "In één keer opgelost", v: "92%", s: "zonder herhaalbezoek" },
            ].map((k) => (
              <div key={k.l} className="rounded-xl bg-paper p-3 ring-1 ring-line">
                <div className="text-[10.5px] uppercase tracking-wide text-grey-2">{k.l}</div>
                <div className={`mt-1 text-[20px] font-semibold ${k.toon === "slecht" ? "text-red-500" : "text-ink"}`}>{k.v}</div>
                <div className="mt-0.5 text-[10.5px] text-grey-2">{k.s}</div>
              </div>
            ))}
          </div>

          {/* toolbar */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-paper px-3 py-1.5 text-[12px] text-grey-2 ring-1 ring-line">
              <Search className="h-3.5 w-3.5" /> Zoek op melding, pand of nummer...
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-paper px-3 py-1.5 text-[12px] text-grey ring-1 ring-line">
              <AlertTriangle className="h-3.5 w-3.5" /> SLA-risico
            </div>
          </div>

          {/* lijst */}
          <div className="mt-4 overflow-hidden rounded-xl bg-paper ring-1 ring-line">
            <div className={`${GRID} border-b border-line px-4 py-2 text-[10.5px] font-medium uppercase tracking-wide text-grey-2`}>
              <span />
              <span>Melding</span>
              <span>Categorie</span>
              <span className="text-right">SLA</span>
              <span />
            </div>

            <div className="bg-[#f4f4f1]/60 px-4 py-1.5 text-[11px] font-medium text-grey">In behandeling · 5</div>

            {rows.map((m, k) => {
              const Kan = KAN[m.kan as keyof typeof KAN];
              const Cat = m.catIcon;
              return (
                <div key={m.id} className={`${GRID} px-4 py-2.5 ${k > 0 ? "border-t border-line" : ""}`}>
                  <span className="grid h-4 w-4 place-items-center">
                    <span className={`h-2 w-2 rounded-full ${dotKleur[m.toon]} ${"live" in m ? "animate-pulse" : ""}`} />
                  </span>

                  <span className="flex min-w-0 items-center gap-2">
                    <Kan className="h-3.5 w-3.5 shrink-0 text-grey-2" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">{m.titel}</span>
                      <span className="block truncate text-[11px] text-grey-2">{m.pand} · {m.gemeld}</span>
                    </span>
                  </span>

                  <span className="flex items-center gap-1.5 text-[12px] text-grey">
                    <Cat className="h-3.5 w-3.5 shrink-0 text-grey-2" />
                    <span className="truncate">{m.cat}</span>
                  </span>

                  <span className={`text-right text-[12px] tabular-nums ${slaKleur[m.toon]}`}>{m.sla}</span>

                  <span>
                    {m.agent ? (
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-lime/50 text-forest" title="Agent">
                        <Sparkles className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-panel text-[10px] font-semibold text-grey ring-1 ring-line">MB</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Agent-blok: triage-console (donker) ─────────── */
const consoleLines = [
  { t: "cmd", text: "triage-melding  #M-2418" },
  { t: "ok", text: "CV-storing · prioriteit spoed" },
  { t: "cmd", text: "kies-vakman  --beschikbaar" },
  { t: "ok", text: "Jansen · 4,9★ · vanmiddag 14:00" },
  { t: "cmd", text: "bevestig-afspraak  huurder" },
  { t: "done", text: "bevestigd, wacht op uitvoering" },
] as const;

function AgentConsole({ active }: { active: number }) {
  return (
    <div className="w-[258px] overflow-hidden rounded-xl bg-forest shadow-[0_30px_70px_-28px_rgba(0,0,0,0.55)] ring-1 ring-black/20">
      <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/25" />
          <span className="h-2 w-2 rounded-full bg-white/25" />
          <span className="h-2 w-2 rounded-full bg-white/25" />
        </span>
        <span className="ml-1 text-[11px] font-medium text-lime">Triage-agent</span>
        <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-lime-2" />
      </div>
      <div className="space-y-1.5 p-3.5 font-mono text-[11px] leading-relaxed">
        {consoleLines.map((l, k) => (
          <motion.div key={k} initial={false} animate={{ opacity: k <= active ? 1 : 0.25 }} transition={{ duration: 0.3 }} className="flex items-start gap-1.5">
            {l.t === "cmd" ? <span className="text-lime-2">›</span> : l.t === "done" ? <span className="text-lime-2">◆</span> : <span className="text-white/30">·</span>}
            <span className={l.t === "ok" ? "text-white/55" : "text-paper"}>{l.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Agent-blok: planning + finance (licht) ─────────── */
function AgentCard() {
  return (
    <div className="w-[248px] overflow-hidden rounded-xl bg-paper shadow-[0_30px_70px_-28px_rgba(0,0,0,0.42)] ring-1 ring-line">
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
        <span className="grid h-5 w-5 place-items-center rounded-md bg-lime text-forest"><Check className="h-3 w-3" strokeWidth={3} /></span>
        <span className="text-[11px] font-medium text-grey">Planning-agent</span>
        <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-lime-2" />
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-panel text-[12px] font-semibold text-ink ring-1 ring-line">LJ</span>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-ink">Loodgieter Jansen</div>
            <div className="text-[11px] text-grey">vanmiddag 14:00 bevestigd</div>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-panel/60 p-3 ring-1 ring-line">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-grey">Factuur</span>
            <span className="font-medium text-ink">€ 285,00</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-forest">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-lime-2 text-forest"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
            Gematcht aan WB-2418
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Subtiele verbindingslijntjes, stijl van de achtergrond ─────────── */
function ConnectLines() {
  const paths = ["M12 60 C 28 54, 34 40, 44 34", "M88 30 C 74 26, 66 30, 58 34", "M16 40 C 30 42, 40 46, 50 50"];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full text-[#163300]" viewBox="0 0 100 76" preserveAspectRatio="none" fill="none" aria-hidden>
      {paths.map((d, k) => (
        <motion.path key={k} d={d} stroke="currentColor" strokeWidth="0.28" strokeLinecap="round" strokeOpacity={0.16} vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0.6, opacity: 0.4 }} animate={{ pathLength: 1, opacity: [0.25, 0.5, 0.25] }} transition={{ duration: 9 + k * 2, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </svg>
  );
}

export default function HeroProduct() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((v) => (v + 1) % (consoleLines.length + 2)), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative lg:min-h-[560px] lg:py-6">
      <div className="absolute inset-0 hidden lg:block"><ConnectLines /></div>

      {/* rechter agent-kaart ACHTER het venster */}
      <motion.div
        initial={{ opacity: 0, y: -14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}
        className="absolute -right-2 bottom-2 z-10 hidden lg:block xl:right-4"
      >
        <AgentCard />
      </motion.div>

      {/* centraal, breed softwarevenster */}
      <div className="relative z-20 mx-auto flex max-w-3xl items-center lg:min-h-[520px] lg:max-w-[860px]">
        <CentralWindow />
      </div>

      {/* linker agent-console VOOR het venster */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
        className="absolute -left-2 top-6 z-30 hidden lg:block xl:left-2"
      >
        <AgentConsole active={Math.min(step, consoleLines.length - 1)} />
      </motion.div>
    </div>
  );
}
