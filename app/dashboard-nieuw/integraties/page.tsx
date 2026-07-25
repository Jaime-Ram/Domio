"use client";

import { useState } from "react";
import { Search, Check, Plus, Sparkles } from "lucide-react";

type Conn = {
  id: string;
  naam: string;
  cat: string;
  desc: string;
  letter: string;
  bg: string;
  connected?: boolean;
};

const CONNECTORS: Conn[] = [
  // Boekhouding
  { id: "exact", naam: "Exact Online", cat: "Boekhouding", desc: "Synchroniseer facturen en grootboek", letter: "E", bg: "#E30613" },
  { id: "twinfield", naam: "Twinfield", cat: "Boekhouding", desc: "Boekhouding en rapportages", letter: "T", bg: "#005CA9" },
  { id: "moneybird", naam: "Moneybird", cat: "Boekhouding", desc: "Facturen en administratie", letter: "M", bg: "#24B47E" },
  { id: "accountview", naam: "AccountView", cat: "Boekhouding", desc: "Betalingen matchen per huurder", letter: "A", bg: "#1C4E80", connected: true },
  // Betalingen
  { id: "rabobank", naam: "Rabobank", cat: "Betalingen", desc: "Automatische bankkoppeling (PSD2)", letter: "R", bg: "#000066", connected: true },
  { id: "ing", naam: "ING", cat: "Betalingen", desc: "Transacties inlezen", letter: "I", bg: "#FF6200" },
  { id: "mollie", naam: "Mollie", cat: "Betalingen", desc: "Online betalingen en incasso", letter: "M", bg: "#000000" },
  { id: "bunq", naam: "bunq", cat: "Betalingen", desc: "Zakelijke rekeningen", letter: "b", bg: "#271A45" },
  // Communicatie
  { id: "gmail", naam: "Gmail", cat: "Communicatie", desc: "E-mail met huurders koppelen", letter: "G", bg: "#EA4335" },
  { id: "outlook", naam: "Outlook", cat: "Communicatie", desc: "Agenda en e-mail synchroniseren", letter: "O", bg: "#0078D4" },
  { id: "whatsapp", naam: "WhatsApp Business", cat: "Communicatie", desc: "Berichten met huurders", letter: "W", bg: "#25D366", connected: true },
  // Opslag
  { id: "gdrive", naam: "Google Drive", cat: "Opslag", desc: "Documenten en contracten", letter: "G", bg: "#1FA463" },
  { id: "dropbox", naam: "Dropbox", cat: "Opslag", desc: "Bestandsopslag koppelen", letter: "D", bg: "#0061FF" },
  { id: "onedrive", naam: "OneDrive", cat: "Opslag", desc: "Microsoft-bestandsopslag", letter: "O", bg: "#0364B8" },
  // Registers
  { id: "bag", naam: "BAG / Kadaster", cat: "Registers", desc: "Adres- en pandgegevens ophalen", letter: "K", bg: "#154273", connected: true },
  { id: "eponline", naam: "EP-Online", cat: "Registers", desc: "Energielabels automatisch ophalen", letter: "E", bg: "#6DB33F" },
];

const CATS = ["Alles", "Verbonden", "Boekhouding", "Betalingen", "Communicatie", "Opslag", "Registers"];

export default function IntegratiesPage() {
  const [connected, setConnected] = useState<Set<string>>(
    () => new Set(CONNECTORS.filter((c) => c.connected).map((c) => c.id)),
  );
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Alles");

  const toggle = (id: string) =>
    setConnected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const q = query.trim().toLowerCase();
  const items = CONNECTORS.filter((c) => {
    const matchQ = !q || c.naam.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
    const matchC =
      cat === "Alles" ? true : cat === "Verbonden" ? connected.has(c.id) : c.cat === cat;
    return matchQ && matchC;
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-medium tracking-tight text-ink">Integraties</h1>
          <p className="text-[14px] text-grey">
            Koppel Domio met je bestaande tools en registers.{" "}
            <span className="font-medium text-forest">{connected.size} gekoppeld</span>.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-forest px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-forest/90"
        >
          <Plus className="h-4 w-4" /> Eigen koppeling
        </button>
      </div>

      {/* zoek + filters */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2 ring-1 ring-line focus-within:ring-forest/30">
          <Search className="h-4 w-4 shrink-0 text-grey-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek een koppeling..."
            className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-grey-2"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                cat === c ? "bg-forest text-paper" : "bg-panel text-grey hover:bg-panel-2 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      {items.length === 0 ? (
        <div className="grid min-h-[200px] place-items-center rounded-2xl bg-paper ring-1 ring-line">
          <p className="text-[14px] text-grey">Geen koppelingen gevonden voor deze zoekopdracht.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => {
            const isOn = connected.has(c.id);
            return (
              <div key={c.id} className="flex flex-col rounded-2xl bg-paper p-4 ring-1 ring-line transition-shadow hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <span
                    className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[15px] font-semibold text-white"
                    style={{ background: c.bg }}
                  >
                    {c.letter}
                    {isOn && (
                      <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border-2 border-paper bg-lime-2">
                        <Check className="h-2.5 w-2.5 text-forest" strokeWidth={3.5} />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-medium text-ink">{c.naam}</span>
                    </div>
                    <span className="text-[12px] text-grey-2">{c.cat}</span>
                  </div>
                </div>

                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-grey">{c.desc}</p>

                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    isOn
                      ? "bg-panel text-grey hover:bg-panel-2 hover:text-ink"
                      : "bg-paper text-ink ring-1 ring-line hover:bg-panel hover:ring-forest/40"
                  }`}
                >
                  {isOn ? (<><Check className="h-4 w-4" strokeWidth={2.5} /> Verbonden</>) : "Verbinden"}
                </button>
              </div>
            );
          })}

          {/* eigen koppeling kaart */}
          {(cat === "Alles" || cat === "Verbonden") && !q && (
            <button
              type="button"
              className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line p-4 text-center transition-colors hover:border-forest/30 hover:bg-panel/50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-panel text-forest">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-[14px] font-medium text-ink">Eigen koppeling toevoegen</span>
              <span className="text-[12px] text-grey-2">Verbind een API of webhook</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
