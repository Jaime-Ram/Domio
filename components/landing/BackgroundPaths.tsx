"use client";

import { motion } from "motion/react";

/**
 * Kokonut-achtige "Background Paths": zacht animerende gestreepte lijn-paden.
 * Alleen de achtergrondlaag (geen demo-titel/knop), afgestemd op de Domio-
 * groentint en laag in dekking zodat tekst leesbaar blijft. Puur motion + SVG.
 */
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${
      189 + i * 6
    } -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${
      343 - i * 6
    }C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${
      875 - i * 6
    } ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-[#1d3014]"
        viewBox="0 0 696 316"
        fill="none"
        aria-hidden
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.06 + path.id * 0.015}
            initial={{ pathLength: 0.3, opacity: 0.5 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.45, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 22 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function BackgroundPaths() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </div>
  );
}
