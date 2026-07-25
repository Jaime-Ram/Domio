"use client";

/* Gedeelde bouwstenen voor het nieuwe dashboard. Alles wat op meerdere
   pagina's terugkomt staat hier, zodat de stijl overal gelijk blijft. */

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Search, ListFilter, ChevronDown, ChevronRight, ArrowDown, X, Sparkles, Check } from "lucide-react";

/* ── kaart ─────────────────────────────────────────────── */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-paper p-5 ring-1 ring-line ${className}`}>{children}</div>;
}

/* ── paginakop ─────────────────────────────────────────── */
export function PageHeader({
  title, subtitle, action, children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: { label: string; onClick?: () => void };
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-medium tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-[14px] text-grey">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-2 px-3.5 py-2 text-[13px] font-medium text-forest transition-colors hover:bg-lime"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── weergaveschakelaar (lijst / bord / raster) ────────── */
export function ViewToggle<T extends string>({
  value, onChange, opties,
}: {
  value: T;
  onChange: (v: T) => void;
  opties: { id: T; label: string; icon: React.ElementType }[];
}) {
  return (
    <div className="flex rounded-lg bg-panel p-0.5">
      {opties.map((o) => {
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
              value === o.id ? "bg-paper text-ink shadow-sm" : "text-grey hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" /> {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── werkbalk: zoeken, groeperen, filterknop ───────────── */
export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 flex flex-wrap items-center gap-4">{children}</div>;
}

export function ToolbarSearch({
  value, onChange, placeholder = "Zoeken...",
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex min-w-[200px] flex-1 items-center gap-2">
      <Search className="h-4 w-4 shrink-0 text-grey-2" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-grey-2"
      />
    </div>
  );
}

export function ToolbarSelect<T extends string>({
  value, onChange, opties,
}: { value: T; onChange: (v: T) => void; opties: { id: T; label: string }[] }) {
  return (
    <div className="flex items-center gap-1.5">
      <ListFilter className="h-4 w-4 shrink-0 text-grey-2" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="cursor-pointer bg-transparent text-[13px] text-grey outline-none hover:text-ink"
      >
        {opties.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function ToolbarToggle({
  actief, onClick, icon: Icon = Sparkles, children,
}: { actief: boolean; onClick: () => void; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] transition-colors ${
        actief ? "bg-forest text-paper" : "text-grey hover:bg-panel hover:text-ink"
      }`}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}

/* ── kerncijfer-strip boven een overzicht ──────────────── */
export function StatRow({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}

export function Stat({
  label, waarde, sub, toon = "neutraal",
}: {
  label: string;
  waarde: string;
  sub?: string;
  toon?: "neutraal" | "goed" | "let-op" | "slecht";
}) {
  const kleur = {
    neutraal: "text-ink",
    goed: "text-forest",
    "let-op": "text-[#c99a1f]",
    slecht: "text-red-500",
  }[toon];
  return (
    <div className="rounded-xl bg-paper p-4 ring-1 ring-line">
      <span className="text-[11px] uppercase tracking-wide text-grey-2">{label}</span>
      <span className={`mt-1.5 block text-[20px] font-medium leading-none tabular-nums ${kleur}`}>{waarde}</span>
      {sub && <span className="mt-1.5 block text-[12px] text-grey-2">{sub}</span>}
    </div>
  );
}

/* statusstip voor de gezondheid van een regel */
export function StatusDot({ toon, titel }: { toon: "goed" | "let-op" | "slecht"; titel: string }) {
  const kleur = { goed: "bg-lime-2", "let-op": "bg-[#f4c04f]", slecht: "bg-red-400" }[toon];
  return <span className={`block h-2 w-2 shrink-0 rounded-full ${kleur}`} title={titel} />;
}

/* ── lijst met groepen ─────────────────────────────────── */
/* Geen omhullende kaart meer: elke groep is een eigen blok met ruimte ertussen. */
export function ListShell({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

/* kolomkoppen; gebruikt dezelfde padding en gap als ListRow zodat alles uitlijnt */
export function ListHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 flex items-center gap-4 px-5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-grey-2">
      {children}
    </div>
  );
}

/* sluit een menu bij een klik erbuiten */
function useOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

/* kolomkop met eigen filtermenu en optioneel groeperen */
export type SorteerRichting = "hoog" | "laag";

export function HeadCell({
  label, className = "", rechts = false, opties, actief = [], onWijzig,
  groepeerOpties, groep, onGroep,
  sorteerbaar = false, sorteerId, sorteer, onSorteer, sorteerLabels,
}: {
  label: string;
  className?: string;
  rechts?: boolean;
  opties?: string[];                                   // waarden om op te filteren
  actief?: string[];                                   // aangevinkte waarden
  onWijzig?: (v: string[]) => void;
  groepeerOpties?: { id: string; label: string }[];     // groepeer-keuzes in dit menu
  groep?: string;
  onGroep?: (id: string) => void;
  sorteerbaar?: boolean;
  sorteerId?: string;                                  // sleutel van deze kolom
  sorteer?: { kolom: string; richting: SorteerRichting } | null;
  onSorteer?: (kolom: string, richting: SorteerRichting) => void;
  sorteerLabels?: { hoog: string; laag: string };       // bijv. "Nieuwste eerst"
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false));
  const heeftMenu = !!opties?.length || !!groepeerOpties?.length || sorteerbaar;
  const isActief = actief.length > 0;
  const sorteertHier = sorteerbaar && sorteer?.kolom === sorteerId;
  const labels = sorteerLabels ?? { hoog: "Hoog naar laag", laag: "Laag naar hoog" };

  if (!heeftMenu) {
    return <span className={`${className} ${rechts ? "text-right" : ""}`}>{label}</span>;
  }

  const wissel = (o: string) =>
    onWijzig?.(actief.includes(o) ? actief.filter((x) => x !== o) : [...actief, o]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-1 uppercase tracking-wide transition-colors hover:text-ink ${
          rechts ? "justify-end" : ""
        } ${isActief || sorteertHier || open ? "text-ink" : ""}`}
      >
        {label}
        {isActief && (
          <span className="grid h-3.5 min-w-[14px] place-items-center rounded-full bg-forest px-1 text-[9px] text-paper">
            {actief.length}
          </span>
        )}
        {sorteertHier
          ? <ArrowDown className={`h-3 w-3 transition-transform ${sorteer!.richting === "laag" ? "rotate-180" : ""}`} />
          : <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && (
        <div
          className={`absolute top-[calc(100%+6px)] z-30 w-[190px] rounded-xl bg-paper p-1.5 shadow-soft-lg ring-1 ring-line ${
            rechts ? "right-0" : "left-0"
          }`}
        >
          {sorteerbaar && sorteerId && (
            <>
              <span className="block px-2.5 pb-1 pt-1.5 text-[10px] uppercase tracking-wide text-grey-2">Sorteer</span>
              {(["hoog", "laag"] as SorteerRichting[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { onSorteer?.(sorteerId, r); setOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-[5px] text-left text-[13px] normal-case tracking-normal text-grey transition-colors hover:bg-panel hover:text-ink"
                >
                  <span className="grid h-3.5 w-3.5 shrink-0 place-items-center">
                    {sorteertHier && sorteer!.richting === r && <Check className="h-3 w-3 text-forest" strokeWidth={3} />}
                  </span>
                  {labels[r]}
                </button>
              ))}
              {((opties && opties.length > 0) || (groepeerOpties && groepeerOpties.length > 0)) && (
                <div className="my-1 h-px bg-line" />
              )}
            </>
          )}

          {groepeerOpties && groepeerOpties.length > 0 && (
            <>
              <span className="block px-2.5 pb-1 pt-1.5 text-[10px] uppercase tracking-wide text-grey-2">Groepeer op</span>
              {groepeerOpties.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => { onGroep?.(g.id); setOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-[5px] text-left text-[13px] normal-case tracking-normal text-grey transition-colors hover:bg-panel hover:text-ink"
                >
                  <span className="grid h-3.5 w-3.5 shrink-0 place-items-center">
                    {groep === g.id && <Check className="h-3 w-3 text-forest" strokeWidth={3} />}
                  </span>
                  {g.label}
                </button>
              ))}
              {opties && opties.length > 0 && <div className="my-1 h-px bg-line" />}
            </>
          )}

          {opties && opties.length > 0 && (
            <>
              <span className="block px-2.5 pb-1 pt-1.5 text-[10px] uppercase tracking-wide text-grey-2">Filter</span>
              {opties.map((o) => {
                const aan = actief.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => wissel(o)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-[5px] text-left text-[13px] normal-case tracking-normal text-grey transition-colors hover:bg-panel hover:text-ink"
                  >
                    <span
                      className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded border transition-colors ${
                        aan ? "border-forest bg-forest text-paper" : "border-line text-transparent"
                      }`}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                    </span>
                    {o}
                  </button>
                );
              })}
              {isActief && (
                <>
                  <div className="my-1 h-px bg-line" />
                  <button
                    type="button"
                    onClick={() => onWijzig?.([])}
                    className="w-full rounded-md px-2.5 py-[5px] text-left text-[13px] normal-case tracking-normal text-grey transition-colors hover:bg-panel hover:text-ink"
                  >
                    Filter wissen
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function ListGroup({
  label, aantal, dicht, onToggle, children,
}: {
  label: string; aantal: number; dicht: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  /* zonder label tonen we geen groepskop, bijvoorbeeld bij "geen groepering" */
  if (!label) {
    return <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">{children}</div>;
  }

  return (
    <div className="mb-5 last:mb-0">
      <button
        type="button"
        onClick={onToggle}
        className="group/kop mb-1.5 flex w-full items-center gap-2 px-1.5 text-left"
      >
        {dicht
          ? <ChevronRight className="h-3.5 w-3.5 text-grey-2" />
          : <ChevronDown className="h-3.5 w-3.5 text-grey-2" />}
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <span className="text-[12px] tabular-nums text-grey-2">{aantal}</span>
      </button>
      {!dicht && (
        <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">{children}</div>
      )}
    </div>
  );
}

export function ListRow({
  gekozen = false, onClick, children,
}: { gekozen?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      className={`group relative flex cursor-pointer items-center gap-4 border-b border-line/70 px-5 py-2.5 transition-colors last:border-b-0 ${
        gekozen ? "bg-lime/10" : "hover:bg-panel/50"
      }`}
    >
      {children}
    </div>
  );
}

/* primaire cel: hoofdtekst met subtekst eronder, scheelt een kolom */
export function CellMain({ titel, sub, doorgehaald = false }: { titel: string; sub?: string; doorgehaald?: boolean }) {
  return (
    <span className="min-w-0 flex-1">
      <span className={`block truncate text-[14px] ${doorgehaald ? "text-grey-2 line-through" : "text-ink"}`}>{titel}</span>
      {sub && <span className="block truncate text-[12px] text-grey-2">{sub}</span>}
    </span>
  );
}

/* ── kleine celtypes voor in een rij ───────────────────── */
export function LabelDot({ kleur, children, className = "" }: { kleur: string; children: React.ReactNode; className?: string }) {
  return (
    <span className={`flex items-center gap-1.5 text-[12px] text-grey-2 ${className}`}>
      <span className={`block h-1.5 w-1.5 shrink-0 rounded-full ${kleur}`} />
      <span className="truncate">{children}</span>
    </span>
  );
}

export function Avatar({ naam, agent }: { naam: string; agent?: boolean }) {
  if (agent) {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-forest text-lime-2" title="Domio Agent">
        <Sparkles className="h-3 w-3" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-panel-2 text-[10px] font-medium text-grey" title={naam}>
      {naam}
    </span>
  );
}

/* ── lege staat ────────────────────────────────────────── */
export function EmptyState({ icon: Icon, titel, tekst }: { icon: React.ElementType; titel: string; tekst: string }) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-2xl bg-paper p-8 text-center ring-1 ring-line">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-panel text-grey-2">
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-3 text-[15px] font-medium text-ink">{titel}</p>
        <p className="mt-1 text-[13px] text-grey">{tekst}</p>
      </div>
    </div>
  );
}

/* ── bulkbalk onderin ──────────────────────────────────── */
export function BulkBar({
  aantal, onSluit, children,
}: { aantal: number; onSluit: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {aantal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-forest p-2 pl-4 text-paper shadow-soft-lg"
        >
          <span className="text-[13px] font-medium">{aantal} geselecteerd</span>
          <span className="mx-1 h-5 w-px bg-white/20" />
          {children}
          <button type="button" onClick={onSluit} aria-label="Sluiten" className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BulkAction({
  onClick, icon: Icon, gevaar = false, children,
}: { onClick: () => void; icon: React.ElementType; gevaar?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-white/10 ${gevaar ? "hover:text-red-300" : ""}`}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}

/* ── detailpaneel dat van rechts inschuift ─────────────── */
export function DetailPanel({
  open, onClose, kop, voet, children,
}: {
  open: boolean;
  onClose: () => void;
  kop?: React.ReactNode;
  voet?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-forest/20 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-paper shadow-soft-lg"
          >
            <div className="flex items-center gap-2 border-b border-line px-5 py-4">
              {kop}
              <button
                type="button"
                onClick={onClose}
                aria-label="Sluiten"
                className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-grey transition-colors hover:bg-panel hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">{children}</div>
            {voet && <div className="flex items-center gap-2 border-t border-line px-5 py-4">{voet}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* rij met label en waarde in het detailpaneel */
export function DetailVeld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="text-grey-2">{label}</span>
      <span className="flex items-center gap-2 text-ink">{children}</span>
    </>
  );
}

export function DetailVelden({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-[92px_1fr] gap-y-2.5 text-[13px]">{children}</div>;
}

/* voortgangsbalk */
export function Progress({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-panel-2 ${className}`}>
      <motion.div
        className="h-full rounded-full bg-lime-2"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

/* ── badge (bestaand, blijft in gebruik op andere pagina's) ── */
const badgeTones: Record<string, string> = {
  green: "bg-lime/25 text-forest",
  grey: "bg-panel text-grey ring-1 ring-line",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
};

export function Badge({ tone = "grey", children }: { tone?: keyof typeof badgeTones | string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeTones[tone] ?? badgeTones.grey}`}>
      {children}
    </span>
  );
}

/* ── tabel-primitieven (nog in gebruik op andere pagina's) ── */
export function DataTable({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-grey-2">{head}</tr>
          </thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Th({ children, right = false }: { children?: React.ReactNode; right?: boolean }) {
  return <th className={`px-5 py-2.5 font-medium ${right ? "text-right" : ""}`}>{children}</th>;
}

export function Td({ children, right = false, className = "" }: { children?: React.ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-5 py-3 ${right ? "text-right" : ""} ${className}`}>{children}</td>;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="transition-colors hover:bg-[#f4f4f1]">{children}</tr>;
}
