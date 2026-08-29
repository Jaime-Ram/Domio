"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

/* Obsidian-achtige "werkend brein" graph op canvas.
   Knopen zweven zacht, signalen vuren door de verbindingen en cascaderen. */

type Node = {
  bx: number;
  by: number; // basispositie (genormaliseerd 0..1)
  x: number;
  y: number;
  amp: number;
  phx: number;
  phy: number;
  spd: number;
  r: number;
  hub: boolean;
  glow: number;
  links: number[];
};

const hubs = [
  { bx: 0.5, by: 0.5, label: "Domio Assist" },
  { bx: 0.2, by: 0.28, label: "Intake" },
  { bx: 0.8, by: 0.28, label: "Vakman" },
  { bx: 0.8, by: 0.72, label: "Facturen" },
  { bx: 0.2, by: 0.72, label: "Compliance" },
];

export default function AgentBrain() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    // knopen bouwen: hubs + satellieten per cluster
    const nodes: Node[] = [];
    hubs.forEach((h) => {
      nodes.push({
        bx: h.bx, by: h.by, x: h.bx, y: h.by,
        amp: 0.006, phx: rnd(0, 6.28), phy: rnd(0, 6.28), spd: rnd(0.3, 0.5),
        r: 5.5, hub: true, glow: 0, links: [],
      });
    });
    const hubCount = nodes.length;
    hubs.forEach((h, hi) => {
      const n = hi === 0 ? 5 : 4;
      for (let k = 0; k < n; k++) {
        const ang = rnd(0, 6.28);
        const dist = rnd(0.06, 0.14);
        nodes.push({
          bx: Math.min(0.94, Math.max(0.06, h.bx + Math.cos(ang) * dist)),
          by: Math.min(0.9, Math.max(0.08, h.by + Math.sin(ang) * dist * 0.85)),
          x: 0, y: 0,
          amp: rnd(0.01, 0.022), phx: rnd(0, 6.28), phy: rnd(0, 6.28), spd: rnd(0.4, 0.9),
          r: rnd(1.8, 3.2), hub: false, glow: 0,
          links: [hi],
        });
      }
    });

    // verbindingen: hubs -> center, satelliet -> hub, wat cross-links
    const edges: [number, number][] = [];
    for (let i = 1; i < hubCount; i++) edges.push([0, i]);
    nodes.forEach((nd, i) => {
      if (!nd.hub) edges.push([i, nd.links[0]]);
    });
    // een paar satelliet-satelliet links binnen cluster voor brein-gevoel
    for (let h = 0; h < hubCount; h++) {
      const sats = nodes
        .map((nd, i) => ({ nd, i }))
        .filter((o) => !o.nd.hub && o.nd.links[0] === h);
      for (let k = 0; k + 1 < sats.length; k += 2) {
        edges.push([sats[k].i, sats[k + 1].i]);
      }
    }

    type Pulse = { e: number; from: number; t: number; spd: number };
    let pulses: Pulse[] = [];

    const spawnFrom = (nodeIndex: number, depth = 0) => {
      const outs = edges
        .map((e, ei) => ({ e, ei }))
        .filter((o) => o.e[0] === nodeIndex || o.e[1] === nodeIndex);
      if (!outs.length) return;
      const pick = outs[Math.floor(Math.random() * outs.length)];
      pulses.push({ e: pick.ei, from: nodeIndex, t: 0, spd: rnd(0.7, 1.2) });
      if (depth < 2 && Math.random() < 0.5) {
        const other = pick.e[0] === nodeIndex ? pick.e[1] : pick.e[0];
        setTimeout(() => spawnFrom(other, depth + 1), rnd(120, 260));
      }
    };

    let dpr = 1;
    let W = 0;
    let H = 0;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();
    let spawnTimer = 0;
    const px = (n: Node) => n.x * W;
    const py = (n: Node) => n.y * H;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      // posities updaten (zweven)
      for (const n of nodes) {
        if (reduce) {
          n.x = n.bx;
          n.y = n.by;
        } else {
          n.x = n.bx + Math.sin(t * n.spd + n.phx) * n.amp;
          n.y = n.by + Math.cos(t * n.spd + n.phy) * n.amp;
        }
        if (n.glow > 0) n.glow *= 0.94;
      }

      // pulsen spawnen
      spawnTimer -= dt;
      if (!reduce && spawnTimer <= 0) {
        spawnTimer = rnd(0.5, 1.1);
        spawnFrom(Math.random() < 0.55 ? 0 : Math.floor(rnd(1, hubCount)));
      }

      // pulsen updaten
      const next: Pulse[] = [];
      for (const p of pulses) {
        p.t += p.spd * dt;
        if (p.t >= 1) {
          const [a, b] = edges[p.e];
          const target = p.from === a ? b : a;
          nodes[target].glow = 1;
        } else next.push(p);
      }
      pulses = next;

      ctx.clearRect(0, 0, W, H);

      // verbindingen
      for (const [a, b] of edges) {
        const na = nodes[a];
        const nb = nodes[b];
        ctx.beginPath();
        ctx.moveTo(px(na), py(na));
        ctx.lineTo(px(nb), py(nb));
        ctx.strokeStyle = "rgba(90,90,80,0.13)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // pulsen (met gloed) en actieve lijn oplichten
      for (const p of pulses) {
        const [a, b] = edges[p.e];
        const na = nodes[a];
        const nb = nodes[b];
        const from = p.from === a ? na : nb;
        const to = p.from === a ? nb : na;
        const x = px(from) + (px(to) - px(from)) * p.t;
        const y = py(from) + (py(to) - py(from)) * p.t;

        // oplichtende lijn
        ctx.beginPath();
        ctx.moveTo(px(from), py(from));
        ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(126,232,92,0.55)";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 2.8, 0, 6.2832);
        ctx.fillStyle = "#7ee85c";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(126,232,92,0.9)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // knopen
      for (const n of nodes) {
        const x = px(n);
        const y = py(n);
        if (n.glow > 0.05) {
          ctx.beginPath();
          ctx.arc(x, y, n.r + 8 * n.glow, 0, 6.2832);
          ctx.fillStyle = `rgba(126,232,92,${0.18 * n.glow})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, 6.2832);
        if (n.hub) {
          ctx.fillStyle = "#1d3014";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, n.r - 2.4, 0, 6.2832);
          ctx.fillStyle = "#c8e957";
          ctx.fill();
        } else {
          const g = n.glow;
          ctx.fillStyle = g > 0.05
            ? `rgb(${Math.round(150 + 0)},${Math.round(150 + 82 * g)},${Math.round(140)})`
            : "#b7b7ae";
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <motion.div
      ref={wrapRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl bg-panel ring-1 ring-line"
      style={{ minHeight: 580 }}
    >
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-30" />
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* labels bij de hub-knopen */}
      {hubs.map((h) => (
        <div
          key={h.label}
          className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${h.bx * 100}%`, top: `calc(${h.by * 100}% + ${h.by < 0.5 ? "-22px" : "20px"})` }}
        >
          <span
            className={`rounded-full px-2.5 py-1 text-[12px] font-medium shadow-sm ring-1 ring-line ${
              h.label === "Domio Assist" ? "bg-forest text-paper" : "bg-paper text-ink"
            }`}
          >
            {h.label}
          </span>
        </div>
      ))}

      {/* onderschrift */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-[13px] text-grey">
        Agents die realtime samenwerken aan je onderhoud
      </div>
    </motion.div>
  );
}
