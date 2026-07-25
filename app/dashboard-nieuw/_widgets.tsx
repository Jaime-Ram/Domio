"use client";

import { motion } from "motion/react";
import { Bot, CalendarRange } from "lucide-react";

/* ---------- 1. Agents aan het werk (witte brede kaart) ---------- */
const agentFeed = [
  { taak: "Offerte opgevraagd bij Loodgieter Jansen", pand: "Prinsengracht 42-1", tijd: "nu bezig", live: true },
  { taak: "Huurder ingelicht over inplanning", pand: "Kade 12-3", tijd: "2 min", live: false },
  { taak: "Factuur gecontroleerd en goedgekeurd", pand: "Havenweg 8", tijd: "5 min", live: false },
  { taak: "Monteur ingepland voor CV-storing", pand: "Lindenlaan 21", tijd: "12 min", live: false },
  { taak: "Ticket automatisch afgehandeld", pand: "Molenstraat 5", tijd: "18 min", live: false },
];

export function AgentsAtWork({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col rounded-2xl bg-paper p-5 ring-1 ring-line ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-lime/20 text-forest">
            <Bot className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[14px] font-medium text-ink">Agents aan het werk</div>
            <div className="text-[12px] text-grey-2">realtime activiteit</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/20 px-2.5 py-1 text-[11px] font-medium text-forest">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-2 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-2" />
          </span>
          3 actief
        </span>
      </div>

      <ul className="flex flex-col divide-y divide-line">
        {agentFeed.map((a, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.1, ease: "easeOut" }}
            className="flex items-center gap-3 py-2.5"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${a.live ? "bg-lime-2" : "bg-line"}`}>
              {a.live && <span className="block h-2 w-2 animate-ping rounded-full bg-lime-2" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-ink">{a.taak}</span>
              <span className="block truncate text-[12px] text-grey-2">{a.pand}</span>
            </span>
            <span className={`shrink-0 text-[11px] ${a.live ? "font-medium text-forest" : "text-grey-2"}`}>{a.tijd}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 2. Ticketstatus (gestapelde balk) ---------- */
const ticketStatus = [
  { label: "Open", n: 12, color: "#e3e3de" },
  { label: "In behandeling", n: 34, color: "#7ee85c" },
  { label: "Wacht op onderdelen", n: 8, color: "#f4c04f" },
  { label: "Opgelost", n: 46, color: "#161f13" },
];

export function TicketStatusCard({ className = "" }: { className?: string }) {
  const total = ticketStatus.reduce((s, t) => s + t.n, 0);
  return (
    <div className={`flex flex-col rounded-2xl bg-paper p-5 ring-1 ring-line ${className}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] uppercase tracking-wide text-grey-2">Tickets</span>
        <span className="text-[13px] font-medium text-ink">{total} totaal</span>
      </div>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-panel-2">
        {ticketStatus.map((t, i) => (
          <motion.div
            key={t.label}
            style={{ background: t.color }}
            initial={{ width: 0 }}
            animate={{ width: `${(t.n / total) * 100}%` }}
            transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: "easeOut" }}
          />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5">
        {ticketStatus.map((t) => (
          <li key={t.label} className="flex items-center gap-2 text-[12px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: t.color }} />
            <span className="text-grey">{t.label}</span>
            <span className="font-medium tabular-nums text-ink">{t.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 3. Aankomende planning (tijdlijn) ---------- */
const planning = [
  { dag: "22", maand: "jul", taak: "CV-onderhoud", pand: "Kade 12", tone: "green" },
  { dag: "28", maand: "jul", taak: "Dakinspectie", pand: "Havenweg 8", tone: "amber" },
  { dag: "04", maand: "aug", taak: "Schilderwerk gevel", pand: "Prinsengracht 42", tone: "grey" },
  { dag: "11", maand: "aug", taak: "Liftkeuring", pand: "Kade 12", tone: "grey" },
];

const dotTone: Record<string, string> = { green: "bg-lime-2", amber: "bg-[#f4c04f]", grey: "bg-line" };

export function UpcomingTimeline({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col rounded-2xl bg-paper p-5 ring-1 ring-line ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-grey-2" />
        <span className="text-[12px] uppercase tracking-wide text-grey-2">Aankomende planning</span>
      </div>
      <ul className="relative flex flex-1 flex-col gap-4">
        <span className="absolute left-[5px] top-1 bottom-1 w-px bg-line" aria-hidden />
        {planning.map((p, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.09 }}
            className="relative flex items-center gap-3 pl-5"
          >
            <span className={`absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ring-2 ring-paper ${dotTone[p.tone]}`} />
            <span className="flex w-10 shrink-0 flex-col items-center rounded-lg bg-panel py-1 leading-none">
              <span className="text-[14px] font-medium text-ink">{p.dag}</span>
              <span className="text-[10px] uppercase text-grey-2">{p.maand}</span>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-ink">{p.taak}</span>
              <span className="block truncate text-[12px] text-grey-2">{p.pand}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- compositie ---------- */
export function DashboardWidgets() {
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AgentsAtWork className="xl:col-span-2" />
        <UpcomingTimeline />
      </div>
      <div className="mt-6">
        <TicketStatusCard />
      </div>
    </>
  );
}
