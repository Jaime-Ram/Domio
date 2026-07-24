"use client";

import { useEffect, useState } from "react";
import HeroProduct from "./HeroProduct";

const agentStats = [
  ["MELDINGEN GETRIEERD", 313278],
  ["VAKLIEDEN AANGESTUURD", 177518],
  ["WERKBONNEN GEMAAKT", 93],
  ["FACTUREN GEMATCHT", 30932],
  ["SLA'S BEWAAKT", 2421],
  ["UREN BESPAARD", 906],
] as const;

export default function Hero() {
  const [stats, setStats] = useState<number[]>(agentStats.map(([, n]) => n));
  const [busy, setBusy] = useState(1345);

  useEffect(() => {
    const b = setInterval(
      () =>
        setStats((s) =>
          s.map((n) => n + (Math.random() < 0.6 ? Math.ceil(Math.random() * 3) : 0))
        ),
      900
    );
    const c = setInterval(
      () => setBusy((v) => Math.max(1280, Math.min(1420, v + Math.round((Math.random() - 0.45) * 6)))),
      1600
    );
    return () => {
      clearInterval(b);
      clearInterval(c);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-paper">
      {/* heel subtiel flowend gloed op de achtergrond */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="hero-blob-a absolute -left-[6%] top-[4%] h-[52vh] w-[52vh] rounded-full opacity-[0.16] blur-3xl"
          style={{ background: "radial-gradient(circle, #94f477 0%, transparent 68%)" }}
        />
        <div
          className="hero-blob-b absolute right-[0%] top-[20%] h-[58vh] w-[58vh] rounded-full opacity-[0.13] blur-3xl"
          style={{ background: "radial-gradient(circle, #2f6a1e 0%, transparent 68%)" }}
        />
      </div>

      {/* dotted side grids */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[6%] dotgrid opacity-70 lg:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[6%] dotgrid opacity-70 lg:block" />

      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="pt-16 lg:pt-24">
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-grey">
            Agents bezig met vastgoedbeheer:
            <span className="rounded bg-panel px-2 py-1 font-mono text-ink tabular-nums">
              {busy.toLocaleString("nl-NL")}
            </span>
          </div>

          <h1 className="display mt-6 max-w-[1050px] text-[clamp(2.5rem,5vw,4rem)] text-ink">
            Onderhoud dat zichzelf regelt.
          </h1>

          <p className="mt-5 max-w-3xl text-[clamp(1.05rem,1.5vw,1.25rem)] leading-snug text-grey">
            Van melding tot factuur, geregeld door agents. Jij houdt de regie.
          </p>

          {/* email capture */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 flex max-w-md items-center gap-2 rounded-xl border border-line bg-panel p-2"
          >
            <input
              type="email"
              placeholder="Je zakelijke e-mailadres"
              className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-grey-2"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-lime px-4 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-lime-2"
            >
              Gratis starten
            </button>
          </form>
        </div>

        {/* Product in actie: melding door de onderhoudsloop */}
        <div className="mt-12 mb-6">
          <HeroProduct />
        </div>
      </div>

      {/* Agents at work bar */}
      <div className="border-y border-line bg-paper">
        <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-6 py-3 lg:px-16">
          <span className="flex shrink-0 items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-ink">
            Vandaag automatisch geregeld:
          </span>
          {agentStats.map(([label], i) => (
            <span
              key={label}
              className="flex shrink-0 items-center gap-2 text-[12px] uppercase tracking-wide text-grey-2"
            >
              {label}:
              <span className="rounded bg-panel px-1.5 py-0.5 font-mono text-[12px] tabular-nums text-ink">
                {stats[i].toLocaleString("en-US")}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
