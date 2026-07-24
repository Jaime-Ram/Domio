"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

const logos = [
  "Vesteda",
  "Bouwinvest",
  "MVGM",
  "Pararius",
  "Rotsvast",
  "Interhouse",
  "123Wonen",
  "Nederwoon",
  "Rebo Groep",
  "Woonstad",
  "Van der Linden",
  "Woonbron",
];

const stats = [
  { big: "3 dagen", small: "sneller opgelost", company: "Vastgoedbeheer West" },
  { big: "30%", small: "goedkoper onderhoud", company: "MVGM" },
  { big: "75%", small: "minder handwerk", company: "Rotsvast" },
  { big: "2x", small: "zoveel panden beheerd", company: "Bouwinvest" },
];

export default function SocialProof() {
  const [s, setS] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setS((v) => (v + 1) % stats.length), 3200);
    return () => clearInterval(t);
  }, []);

  const stat = stats[s];

  return (
    <section className="bg-paper py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        {/* kop + link */}
        <div className="max-w-2xl">
          <h2 className="display text-[clamp(1.6rem,2.8vw,2.1rem)]">
            <span className="text-ink">
              Sluit je aan bij 2.000+ verhuurders en beheerders
            </span>{" "}
            <span className="text-grey-2">
              die hun onderhoud sneller en rustiger regelen.
            </span>
          </h2>
          <a
            href="#"
            className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-ink hover:opacity-60"
          >
            Lees het klantverhaal <span aria-hidden>&rarr;</span>
          </a>
        </div>

        {/* logo-tegels + uitgelicht blok (2x2) rechtsboven */}
        <div className="mt-10 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {/* uitgelicht, 2x2, rechtsboven, met achtergrondfoto + roterende stat */}
          <div className="relative col-span-2 row-span-2 overflow-hidden rounded-2xl text-paper lg:col-start-7 lg:row-start-1">
            <Image
              src="/images/Achtergrond3.jpg"
              alt=""
              fill
              sizes="(min-width:1024px) 25vw, 66vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, rgba(22,31,19,0.5) 0%, rgba(15,22,12,0.8) 100%)",
              }}
            />
            <span className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur-sm">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 11 11 3 M11 3 H5 M11 3 V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="absolute inset-0 z-10 flex flex-col justify-end p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={s}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="text-[clamp(2.4rem,3.6vw,3.25rem)] font-medium leading-none tracking-tight text-white">
                    {stat.big}
                  </div>
                  <div className="mt-2 text-[14px] text-white/75">{stat.small}</div>
                  <div className="mt-4 text-[13px] font-medium">{stat.company}</div>
                </motion.div>
              </AnimatePresence>
              {/* voortgangsstipjes */}
              <div className="mt-4 flex gap-1.5">
                {stats.map((_, k) => (
                  <span
                    key={k}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      k === s ? "w-5 bg-lime-2" : "w-1.5 bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {logos.map((name) => (
            <div
              key={name}
              className="flex aspect-square items-center justify-center rounded-xl bg-paper text-center ring-1 ring-line transition-colors hover:bg-panel"
            >
              <span className="px-1.5 text-[12px] font-medium text-grey-2">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
