"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/* tikt periodiek zodat de mock-animaties blijven loopen */
function useTick(ms: number) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((v) => v + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
}

function Arrow() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-paper transition-colors group-hover:bg-forest group-hover:text-paper">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M3 11 L11 3 M11 3 H5 M11 3 V9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function CardHead({ black, grey }: { black: string; grey: string }) {
  return (
    <h3 className="max-w-sm text-[clamp(1.4rem,2.4vw,1.9rem)] font-normal leading-tight tracking-[-0.01em]">
      <span className="text-ink">{black}</span>{" "}
      <span className="text-grey-2">{grey}</span>
    </h3>
  );
}

/* ---- lightweight mock UIs echoing Ramp's card visuals ---- */

function ChatMock() {
  const t = useTick(5200);
  const pop = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay },
  });
  return (
    <div key={t} className="mt-8 space-y-3">
      <motion.div
        {...pop(0.1)}
        className="max-w-[85%] rounded-2xl rounded-bl-md bg-paper p-4 text-[13px] leading-relaxed text-ink shadow-sm ring-1 ring-line"
      >
        Pand: Prinsengracht 42, bouwjaar 1932, plat dak met bitumen.
      </motion.div>
      <motion.div
        {...pop(0.7)}
        className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-paper p-4 text-[13px] leading-relaxed text-ink shadow-sm ring-1 ring-line"
      >
        Bouwdeel herkend: dakbedekking bitumen, conditie 3.
        Vervangingscyclus 20 jaar, volgende beurt in 2031.
        <br />
        Toegevoegd aan je MJOP met kostenraming.
      </motion.div>
      <motion.div
        {...pop(1.4)}
        className="mt-2 flex w-64 items-center gap-3 overflow-hidden rounded-xl bg-forest p-4 text-paper"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 16, delay: 1.6 }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime text-forest"
        >
          <svg width="15" height="15" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2 6.2 4.6 8.6 10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
        <span>
          <span className="block text-[13px] font-medium">Toegevoegd aan MJOP</span>
          <span className="block text-[12px] text-white/70">Dakbedekking bitumen</span>
        </span>
      </motion.div>
    </div>
  );
}

function InvoiceMock() {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-line bg-paper">
      <div className="flex items-center justify-between border-b border-line px-4 py-2 text-[12px] text-grey">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
        </span>
        <span>Domio.MJOP</span>
      </div>
      <div className="p-5">
        <div className="text-[15px] font-medium text-ink">
          Bouwdeel #BD-2043
        </div>
        <div className="mt-4 text-[12px] uppercase tracking-wide text-grey-2">
          Beoordeling
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-[12px] text-grey-2">01</span>
          <div className="flex-1 rounded-lg border border-line px-3 py-2 text-[13px] text-ink">
            Kozijnen hout, buiten
          </div>
          <div className="rounded-lg border border-line px-3 py-2 text-[13px] text-ink">
            Conditie 3
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-[11px] text-grey-2">
          <span>Bouwdeel</span>
          <span>Cyclus</span>
          <span>Conditie</span>
        </div>
      </div>
    </div>
  );
}

function AccountingMock() {
  const t = useTick(5200);
  const rows = [
    ["Dakbedekking bitumen", "€ 8.400", true],
    ["Schilderwerk buiten", "€ 6.200", true],
    ["CV-ketel vervangen", "€ 3.100", true],
    ["Gevelvoegwerk", "€ 4.750", false],
  ];
  return (
    <div className="mt-10 overflow-hidden rounded-xl bg-paper ring-1 ring-line">
      <div className="flex items-center justify-between border-b border-line px-4 py-2 text-[11px] uppercase tracking-wide text-grey-2">
        <span>Kostenraming</span>
        <span className="text-grey">Geïndexeerd</span>
      </div>
      <ul key={t} className="divide-y divide-line">
        {rows.map(([v, gl, ok], i) => (
          <li key={v as string} className="flex items-center justify-between px-4 py-2 text-[13px]">
            <span className="text-ink">{v}</span>
            <span className="flex items-center gap-2 text-grey">
              {gl}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.3 + i * 0.35 }}
                className={`grid h-4 w-4 place-items-center rounded-full ${ok ? "bg-lime-2 text-ink" : "bg-panel text-grey-2"}`}
              >
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M2 5.2 4.2 7.4 8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BankingMock() {
  const t = useTick(5200);
  return (
    <div className="mt-10 flex flex-col justify-between rounded-xl bg-paper p-5 ring-1 ring-line">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] uppercase tracking-wide text-grey-2">Reservefonds 2026</span>
        <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink">op peil</span>
      </div>
      <div className="mt-1 text-[28px] tracking-tight text-ink">&euro;84.250</div>
      <div key={t} className="mt-4 flex items-end gap-1.5 h-16">
        {[40, 52, 48, 63, 70, 66, 82, 90].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 overflow-hidden rounded-t bg-forest/10"
            initial={{ height: "6%" }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.07 }}
          >
            <div className="h-full w-full rounded-t bg-lime-2" style={{ opacity: i > 4 ? 1 : 0 }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsMock() {
  const tick = useTick(5200);
  const tiles = ["BAG", "WOZ", "NEN 2767", "Kadaster", "CBS-index", "EPA", "RVO", "3D BAG"];
  return (
    <div key={tick} className="mt-10 grid grid-cols-4 gap-2">
      {tiles.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
          className="grid aspect-square place-items-center rounded-xl bg-paper text-[12px] font-medium text-grey ring-1 ring-line"
        >
          {t}
        </motion.div>
      ))}
    </div>
  );
}

export default function Platform() {
  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <h2 className="display max-w-[755px] text-[clamp(1.9rem,3.4vw,2.5rem)]">
          <span className="text-ink">Alles wat in een MJOP hoort.</span>{" "}
          <span className="text-grey-2">
            De AI stelt het op, jij controleert en past aan.
          </span>
        </h2>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#"
            className="rounded-lg bg-lime px-5 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-lime-2"
          >
            Maak je eerste MJOP
          </a>
          <a
            href="#"
            className="rounded-lg border border-line bg-paper px-5 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-panel"
          >
            Bekijk voorbeeld-MJOP
          </a>
        </div>

        {/* Bento grid */}
        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          <article className="group flex flex-col rounded-2xl bg-panel p-8">
            <div className="flex items-start justify-between">
              <CardHead black="Bouwdelen" grey="die de AI automatisch herkent" />
              <Arrow />
            </div>
            <ChatMock />
          </article>

          <article className="group flex flex-col rounded-2xl bg-panel p-8">
            <div className="flex items-start justify-between">
              <CardHead black="Conditie volgens NEN 2767" grey="onderbouwd per bouwdeel" />
              <Arrow />
            </div>
            <InvoiceMock />
          </article>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {[
            {
              b: "Kostenraming",
              g: "met indexering per jaar",
              mock: <AccountingMock />,
            },
            {
              b: "Reservefonds",
              g: "berekend en onderbouwd",
              mock: <BankingMock />,
            },
            {
              b: "Altijd actueel",
              g: "en klaar voor verduurzaming",
              mock: <IntegrationsMock />,
            },
          ].map(({ b, g, mock }) => (
            <article
              key={b}
              className="group flex flex-col justify-between rounded-2xl bg-panel p-8"
            >
              <div className="flex items-start justify-between">
                <CardHead black={b} grey={g} />
                <Arrow />
              </div>
              {mock}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
