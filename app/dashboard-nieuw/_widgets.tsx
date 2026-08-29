"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarRange, Sparkles, Check, Clock, BadgeCheck, Receipt, CalendarClock, Mail,
  ArrowUp, ArrowLeft, MessageSquarePlus,
} from "lucide-react";

/* ---------- 1. Dagbriefing van de assistent (witte brede kaart) ---------- */
const gepland = [
  { taak: "CV-onderhoud inplannen", pand: "Kade 12", tijd: "10:30" },
  { taak: "Bezichtiging nieuwe huurder", pand: "Prinsengracht 42", tijd: "14:00" },
  { taak: "Offerte dakinspectie beoordelen", pand: "Havenweg 8", tijd: "vandaag" },
];

const gedaanStart = [
  "Offerte opgevraagd bij Loodgieter Jansen · Prinsengracht 42-1",
  "Huurder ingelicht over inplanning · Kade 12-3",
  "Factuur van € 84 gecontroleerd en geboekt · Havenweg 8",
];

type Approval = { id: string; titel: string; context: string; icon: React.ElementType };
const approvalsStart: Approval[] = [
  { id: "a1", titel: "Offerte loodgieter goedkeuren · € 340", context: "Lekkage Prinsengracht 42-1", icon: Receipt },
  { id: "a2", titel: "Monteur inplannen buiten kantooruren", context: "CV-storing Lindenlaan 21", icon: CalendarClock },
  { id: "a3", titel: "Huurindexatie-brief versturen", context: "3 huurders · jaarlijkse verhoging", icon: Mail },
];

const suggesties = ["Wat staat er vandaag?", "Zijn er betalingsachterstanden?", "Plan onderhoud in"];

function replyFor(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("betaal") || t.includes("achterstand") || t.includes("huur"))
    return "Er staan 2 betalingen open: Kade 12-3 (€ 1.620, 4 dagen te laat) en Molenstraat 5 (€ 980, 11 dagen). Zal ik een vriendelijke herinnering sturen?";
  if (t.includes("onderhoud") || t.includes("plan") || t.includes("monteur") || t.includes("storing"))
    return "Ik kan direct een monteur inplannen en offertes opvragen bij je vaste partners. Voor welk pand is het en wat is de klacht?";
  if (t.includes("vandaag") || t.includes("planning") || t.includes("agenda") || t.includes("staat"))
    return "Vandaag: CV-onderhoud inplannen (Kade 12, 10:30), bezichtiging nieuwe huurder (Prinsengracht 42, 14:00) en de offerte voor de dakinspectie beoordelen. Er wachten ook 3 acties op je akkoord.";
  return "Ik kijk het meteen voor je na. Ik kan taken inplannen, offertes opvragen, huurders informeren en betalingen opvolgen. Waarmee kan ik helpen?";
}

type Message = { role: "user" | "assistant"; text: string };

export function AssistantBriefing({ className = "" }: { className?: string }) {
  const [approvals, setApprovals] = useState(approvalsStart);
  const [gedaan, setGedaan] = useState(gedaanStart);

  const [mode, setMode] = useState<"briefing" | "chat">("briefing");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const handle = (a: Approval, akkoord: boolean) => {
    setApprovals((prev) => prev.filter((x) => x.id !== a.id));
    if (akkoord) setGedaan((prev) => [`${a.titel.split(" · ")[0]} · goedgekeurd`, ...prev]);
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMode("chat");
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "assistant", text: replyFor(text) }]);
    }, 900);
  };

  return (
    <div className={`flex flex-col rounded-2xl bg-paper p-5 ring-1 ring-line ${className}`}>
      {/* kop */}
      <div className="flex items-center gap-3">
        {mode === "chat" && (
          <button
            type="button"
            onClick={() => setMode("briefing")}
            aria-label="Terug naar briefing"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-grey transition-colors hover:bg-panel hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest text-lime-2">
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-lime-2" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-ink">Domio Assistent</div>
          <div className="text-[12px] text-grey-2">{mode === "chat" ? "Online · reageert direct" : "Je dagbriefing voor vandaag"}</div>
        </div>
        {mode === "briefing" ? (
          <span className="shrink-0 rounded-full bg-panel px-2.5 py-1 text-[11px] font-medium text-grey">Vandaag</span>
        ) : (
          <button
            type="button"
            onClick={() => { setMessages([]); setMode("briefing"); }}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-panel px-2.5 py-1 text-[11px] font-medium text-grey transition-colors hover:bg-panel-2 hover:text-ink"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" /> Nieuw
          </button>
        )}
      </div>

      {mode === "briefing" ? (
        <div className="mt-3">
          <p className="text-[13px] leading-relaxed text-grey">
            Goedemorgen Mark. Ik heb <span className="font-medium text-ink">{gedaan.length} taken</span> afgehandeld en{" "}
            <span className="font-medium text-ink">{gepland.length} ingepland</span>.{" "}
            {approvals.length > 0 ? (
              <><span className="font-medium text-forest">{approvals.length} acties</span> wachten op je akkoord.</>
            ) : (
              <span className="font-medium text-forest">Alles is afgehandeld.</span>
            )}
          </p>

          {/* twee kolommen: gepland + afgehandeld */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-panel/70 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-grey-2">
                <Clock className="h-3.5 w-3.5" /> Vandaag gepland
              </div>
              <ul className="space-y-2">
                {gepland.map((g, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-forest/40" />
                    <span className="min-w-0 flex-1 truncate text-ink">{g.taak}</span>
                    <span className="shrink-0 text-[11px] text-grey-2">{g.tijd}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-panel/70 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-grey-2">
                <BadgeCheck className="h-3.5 w-3.5" /> Alvast afgehandeld
              </div>
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {gedaan.slice(0, 3).map((g) => (
                    <motion.li
                      key={g}
                      layout
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2 text-[13px]"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime-2" strokeWidth={3} />
                      <span className="min-w-0 flex-1 text-ink">{g}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </div>

          {/* goedkeuringen */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wide text-grey-2">Wacht op je akkoord</span>
              {approvals.length > 0 && (
                <span className="rounded-full bg-lime-2 px-2 py-0.5 text-[11px] font-medium text-forest">{approvals.length}</span>
              )}
            </div>

            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {approvals.map((a) => {
                  const Icon = a.icon;
                  return (
                    <motion.div
                      key={a.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 rounded-xl bg-panel p-2.5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper text-forest ring-1 ring-line">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">{a.titel}</span>
                        <span className="block truncate text-[12px] text-grey-2">{a.context}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handle(a, false)}
                        className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-grey transition-colors hover:bg-panel-2 hover:text-ink"
                      >
                        Later
                      </button>
                      <button
                        type="button"
                        onClick={() => handle(a, true)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-lime-2 px-2.5 py-1.5 text-[12px] font-medium text-forest transition-colors hover:bg-lime"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Goedkeuren
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {approvals.length === 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-panel p-3 text-[13px] text-grey">
                  <Check className="h-4 w-4 text-lime-2" strokeWidth={3} /> Niets meer om goed te keuren, alles is bijgewerkt.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* chat-modus */
        <div ref={scrollRef} className="mt-4 max-h-[340px] min-h-[220px] flex-1 space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.role === "user" ? "bg-forest text-paper" : "bg-panel text-ink"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl bg-panel px-3.5 py-3">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-grey-2" style={{ animationDelay: `${d * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* composer */}
      <div className="mt-4">
        {mode === "briefing" && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {suggesties.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full bg-panel px-2.5 py-1 text-[12px] font-medium text-grey transition-colors hover:bg-panel-2 hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-center gap-2 rounded-xl bg-panel px-3 py-2 ring-1 ring-transparent transition focus-within:bg-paper focus-within:ring-line"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Vraag je assistent iets..."
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-grey-2"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Versturen"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-lime-2 text-forest transition-colors hover:bg-lime disabled:cursor-not-allowed disabled:bg-panel-2 disabled:text-grey-2"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- 2. Ticketstatus (gestapelde balk) ---------- */
const ticketStatus = [
  { label: "Open", n: 12, color: "#e3e3de" },
  { label: "In behandeling", n: 34, color: "#7ee85c" },
  { label: "Wacht op onderdelen", n: 8, color: "#f4c04f" },
  { label: "Opgelost", n: 46, color: "#1d3014" },
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

