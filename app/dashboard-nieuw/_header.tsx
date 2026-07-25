"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search, Bell, HelpCircle, Plus, Sparkles, Building2, Users, Ticket, Receipt,
  User, Shield, CreditCard, Settings, LogOut, Wrench, FileText, AlertTriangle, Check,
  ChevronsUpDown,
} from "lucide-react";

const BASE = "/dashboard-nieuw";

const iconBtn =
  "grid h-[34px] w-[34px] place-items-center rounded-lg text-grey transition-colors hover:bg-panel hover:text-ink";
const menuItem =
  "flex w-full items-center gap-3 rounded-md px-3 py-[5px] text-[14px] text-grey transition-colors hover:bg-panel hover:text-ink text-left";
const menuCard =
  "absolute right-0 top-[calc(100%+8px)] z-50 rounded-xl bg-paper p-1.5 shadow-soft-lg ring-1 ring-line";

/* sluit bij klik buiten */
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

const notificaties = [
  { id: 1, titel: "Nieuwe storingsmelding", body: "Lekkage in de badkamer · Prinsengracht 42-1", tijd: "12 min", icon: Wrench, ongelezen: true },
  { id: 2, titel: "Factuur ontvangen", body: "Loodgieter Jansen · € 340", tijd: "1 uur", icon: FileText, ongelezen: true },
  { id: 3, titel: "Keuring verloopt", body: "Liftkeuring Kade 12 · over 14 dagen", tijd: "3 uur", icon: AlertTriangle, ongelezen: false },
];

const snelActies = [
  { label: "Melding aanmaken", icon: Ticket, href: `${BASE}/tickets` },
  { label: "MJOP-post toevoegen", icon: Receipt, href: `${BASE}/mjop` },
  { label: "Pand toevoegen", icon: Building2, href: `${BASE}/portefeuille` },
  { label: "Partner toevoegen", icon: Users, href: `${BASE}/contactboek` },
];

export function DashboardHeader() {
  const [open, setOpen] = useState<null | "add" | "bell">(null);
  const close = () => setOpen(null);

  const addRef = useOutside<HTMLDivElement>(close);
  const bellRef = useOutside<HTMLDivElement>(close);

  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const ongelezen = notificaties.filter((n) => n.ongelezen).length;

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="flex h-full items-center gap-3 px-5 lg:px-8">
        {/* zoeken */}
        <div className="flex min-w-0 max-w-[420px] flex-1 items-center gap-2 rounded-xl bg-panel px-3 py-2 ring-1 ring-transparent transition focus-within:bg-paper focus-within:ring-line">
          <Search className="h-4 w-4 shrink-0 text-grey-2" />
          <input
            ref={searchRef}
            placeholder="Zoek meldingen, panden, partners..."
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-grey-2"
          />
          <kbd className="hidden shrink-0 rounded border border-line bg-paper px-1.5 py-0.5 text-[10px] font-medium text-grey-2 sm:block">
            ⌘K
          </kbd>
        </div>

        <div className="flex-1" />

        {/* snel toevoegen */}
        <div className="relative" ref={addRef}>
          <button
            type="button"
            onClick={() => setOpen(open === "add" ? null : "add")}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-lime-2 px-3 text-[13px] font-medium text-forest transition-colors hover:bg-lime"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Nieuw</span>
          </button>
          {open === "add" && (
            <div className={`${menuCard} w-[220px]`}>
              {snelActies.map((a) => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} href={a.href} onClick={close} className={menuItem}>
                    <Icon className="size-[17px] shrink-0" />
                    <span>{a.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* assistent */}
        <Link href={`${BASE}/agentic`} className={iconBtn} title="Domio Assistent">
          <Sparkles className="h-[18px] w-[18px]" />
        </Link>

        {/* notificaties */}
        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => setOpen(open === "bell" ? null : "bell")}
            className={`${iconBtn} relative`}
            title="Notificaties"
          >
            <Bell className="h-[18px] w-[18px]" />
            {ongelezen > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-forest px-1 text-[10px] font-medium text-paper ring-2 ring-paper">
                {ongelezen}
              </span>
            )}
          </button>
          {open === "bell" && (
            <div className={`${menuCard} w-[320px] p-0`}>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-[14px] font-medium text-ink">Notificaties</span>
                <button type="button" className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-medium text-forest transition-colors hover:bg-panel">
                  <Check className="h-3.5 w-3.5" /> Alles gelezen
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto border-t border-line p-1.5">
                {notificaties.map((n) => {
                  const Icon = n.icon;
                  return (
                    <button key={n.id} type="button" className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-panel">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-panel text-forest">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-ink">{n.titel}</span>
                        <span className="block truncate text-[12px] text-grey-2">{n.body}</span>
                        <span className="mt-0.5 block text-[11px] text-grey-2">{n.tijd}</span>
                      </span>
                      {n.ongelezen && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lime-2" />}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-line p-1.5">
                <button type="button" className="w-full rounded-md py-1.5 text-[13px] font-medium text-forest transition-colors hover:bg-panel">
                  Alle notificaties bekijken
                </button>
              </div>
            </div>
          )}
        </div>

        {/* hulp */}
        <Link href={`${BASE}/hulp`} className={iconBtn} title="Hulp">
          <HelpCircle className="h-[18px] w-[18px]" />
        </Link>
      </div>
    </header>
  );
}

/* profielmenu onder in de sidebar, klapt naar boven open */
export function SidebarUser() {
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      {open && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 rounded-xl bg-paper p-1.5 shadow-soft-lg ring-1 ring-line">
          <div className="px-2.5 py-1.5">
            <span className="block truncate text-[13px] font-medium text-ink">Mark Bakker</span>
            <span className="block truncate text-[12px] text-grey-2">mark@domio.nl</span>
          </div>
          <div className="my-1 h-px bg-line" />
          {[
            { label: "Account", icon: User },
            { label: "Beveiliging", icon: Shield },
            { label: "Abonnement", icon: CreditCard },
            { label: "Koppelingen", icon: Settings },
          ].map(({ label, icon: Icon }) => (
            <Link key={label} href={`${BASE}/instellingen`} onClick={() => setOpen(false)} className={menuItem}>
              <Icon className="size-[17px] shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
          <div className="my-1 h-px bg-line" />
          <button type="button" className={`${menuItem} hover:text-red-600`}>
            <LogOut className="size-[17px] shrink-0" />
            <span>Uitloggen</span>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${open ? "bg-panel" : "hover:bg-panel"}`}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest text-[13px] font-medium text-paper">MB</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">Mark Bakker</span>
          <span className="block truncate text-[12px] text-grey">Verhuurder</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-grey-2" />
      </button>
    </div>
  );
}
