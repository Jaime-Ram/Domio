"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/* SVG-canvas 1000 x 580; posities in beide systemen (svg + %) synchroon */
const HUB = { x: 500, y: 290 };
const agents = [
  { key: "intake", label: "Intake-agent", role: "vangt meldingen op", x: 175, y: 150, msg: "Nieuwe melding: lekkage keuken" },
  { key: "vakman", label: "Vakman-agent", role: "stuurt de klus aan", x: 825, y: 150, msg: "Jansen kan morgen langs" },
  { key: "facturen", label: "Facturen-agent", role: "matcht en boekt", x: 825, y: 430, msg: "€ 84,20 gematcht aan werkbon" },
  { key: "compliance", label: "Compliance-agent", role: "bewaakt SLA's", x: 175, y: 430, msg: "SLA gehaald, binnen 24 uur" },
] as const;

const pct = (v: number, size: number) => `${(v / size) * 100}%`;

/* gebogen pad van hub naar een agent (kwadratische curve met lichte boog) */
function curve(a: { x: number; y: number }) {
  const mx = (HUB.x + a.x) / 2;
  const my = (HUB.y + a.y) / 2;
  const dx = a.y - HUB.y;
  const dy = HUB.x - a.x;
  const norm = Math.hypot(dx, dy) || 1;
  const bow = 46;
  const cx = mx + (dx / norm) * bow;
  const cy = my + (dy / norm) * bow;
  return `M${HUB.x} ${HUB.y} Q${cx} ${cy} ${a.x} ${a.y}`;
}

function Node({
  label,
  role,
  active,
  hubNode = false,
}: {
  label: string;
  role: string;
  active: boolean;
  hubNode?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-paper p-3 text-left ring-1 transition-all duration-500 ${
        active
          ? "ring-lime-2 shadow-[0_0_0_5px_rgba(148,244,119,0.18),0_18px_40px_-18px_rgba(0,0,0,0.3)]"
          : "ring-line shadow-sm"
      } ${hubNode ? "px-4 py-3.5" : ""}`}
      style={{ width: hubNode ? 184 : 158 }}
    >
      <div className="flex items-center gap-2">
        <span
          className={`grid place-items-center rounded-full ${
            hubNode ? "h-7 w-7 bg-forest" : "h-5 w-5 bg-panel"
          }`}
        >
          <span
            className={`rounded-full transition-colors duration-500 ${
              active || hubNode ? "bg-lime-2" : "bg-grey-2"
            } ${hubNode ? "h-2 w-2 animate-pulse" : "h-1.5 w-1.5"}`}
          />
        </span>
        <span className={`font-medium text-ink ${hubNode ? "text-[14px]" : "text-[13px]"}`}>
          {label}
        </span>
      </div>
      <div className="mt-1 text-[11px] text-grey">{role}</div>
    </div>
  );
}

export default function AgentFlow() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((v) => (v + 1) % agents.length), 2600);
    return () => clearInterval(t);
  }, []);

  const active = agents[step];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl bg-panel ring-1 ring-line"
      style={{ minHeight: 580 }}
    >
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-40" />

      {/* verbindingen + stromende pulsjes */}
      <svg
        viewBox="0 0 1000 580"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          {agents.map((a) => (
            <path key={`p-${a.key}`} id={`path-${a.key}`} d={curve(a)} fill="none" />
          ))}
        </defs>

        {/* basislijnen */}
        {agents.map((a) => (
          <use
            key={`l-${a.key}`}
            href={`#path-${a.key}`}
            stroke={a.key === active.key ? "#94f477" : "#dcdcd6"}
            strokeWidth={a.key === active.key ? 2.5 : 1.5}
            className="transition-all duration-500"
          />
        ))}

        {/* pulsjes die continu heen en weer stromen */}
        {agents.map((a, i) => (
          <g key={`d-${a.key}`}>
            {/* hub -> agent */}
            <circle r={a.key === active.key ? 4.5 : 3} fill={a.key === active.key ? "#7ee85c" : "#b7b7ae"}>
              <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${i * 0.5}s`}>
                <mpath href={`#path-${a.key}`} />
              </animateMotion>
            </circle>
            {/* agent -> hub (omgekeerd via keyPoints) */}
            <circle r={a.key === active.key ? 4.5 : 3} fill={a.key === active.key ? "#7ee85c" : "#c8c8c0"}>
              <animateMotion
                dur="2.4s"
                repeatCount="indefinite"
                begin={`${i * 0.5 + 1.2}s`}
                keyPoints="1;0"
                keyTimes="0;1"
                calcMode="linear"
              >
                <mpath href={`#path-${a.key}`} />
              </animateMotion>
            </circle>
          </g>
        ))}
      </svg>

      {/* berichtje bij de actieve agent, vloeiend in/uit */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.key}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest px-3 py-1.5 text-[12px] font-medium text-paper shadow-lg"
          style={{
            left: pct(active.x, 1000),
            top: `calc(${pct(active.y, 580)} + ${active.y < 290 ? "44px" : "-44px"})`,
          }}
        >
          {active.msg}
        </motion.div>
      </AnimatePresence>

      {/* nodes */}
      <div
        className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ left: pct(HUB.x, 1000), top: pct(HUB.y, 580) }}
      >
        <Node label="Domio Assist" role="coördineert alles" active hubNode />
      </div>
      {agents.map((a) => (
        <div
          key={a.key}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(a.x, 1000), top: pct(a.y, 580) }}
        >
          <Node label={a.label} role={a.role} active={a.key === active.key} />
        </div>
      ))}
    </motion.div>
  );
}
