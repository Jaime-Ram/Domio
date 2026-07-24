"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { menus, MegaPanel } from "./NavMenu";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const links = [
  { label: "Product", caret: true },
  { label: "Voor wie", caret: true },
  { label: "Oplossingen", caret: true },
  { label: "Kennisbank", caret: true },
  { label: "Klanten", caret: false },
  { label: "Prijzen", caret: false },
];

function Caret({ open }: { open?: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Nav() {
  const [bar, setBar] = useState(true);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  // menu dat getoond blijft tijdens het inklappen, zodat de hoogte soepel terug morpht
  const [displayMenu, setDisplayMenu] = useState<string | null>(null);
  const [panelH, setPanelH] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menu) {
      setDisplayMenu(menu);
      return;
    }
    if (displayMenu) {
      const t = setTimeout(() => setDisplayMenu(null), 360);
      return () => clearTimeout(t);
    }
  }, [menu, displayMenu]);

  useIsoLayoutEffect(() => {
    if (menu && panelRef.current) setPanelH(panelRef.current.scrollHeight);
  }, [menu, displayMenu]);

  return (
    <div className="sticky top-0 z-50">
      {/* Announcement bar */}
      {bar && (
        <div className="relative bg-forest px-10 py-2.5 text-center text-[13.5px] text-paper">
          <span className="text-white/90">
            Nieuw: laat Domio Assist je onderhoudsmeldingen automatisch triëren.{" "}
            <a href="#" className="font-medium text-white underline underline-offset-2">
              Meer weten
            </a>
          </span>
          <button
            onClick={() => setBar(false)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            aria-label="Sluiten"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 2 10 10 M10 2 2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Nav */}
      <header
        className="relative z-40 border-b border-line/50 bg-paper/60 backdrop-blur-xl backdrop-saturate-150"
        onMouseLeave={() => setMenu(null)}
      >
        <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-16">
          <div className="flex items-center gap-9">
            <a href="#" aria-label="Domio home" onMouseEnter={() => setMenu(null)}>
              <Logo />
            </a>
            <ul className="hidden items-center gap-6 lg:flex">
              {links.map((l) => (
                <li
                  key={l.label}
                  onMouseEnter={() => setMenu(l.caret ? l.label : null)}
                >
                  <a
                    href="#"
                    className={`flex items-center gap-1 text-[14px] transition-opacity hover:opacity-60 ${
                      menu === l.label ? "text-ink opacity-60" : "text-ink"
                    }`}
                  >
                    {l.label}
                    {l.caret && <Caret open={menu === l.label} />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="hidden items-center gap-5 lg:flex"
            onMouseEnter={() => setMenu(null)}
          >
            <a href="/login" className="text-[15px] text-ink hover:opacity-60">
              Inloggen
            </a>
            <a
              href="#"
              className="rounded-lg bg-lime px-4 py-3 text-[14px] font-medium leading-none text-ink transition-colors hover:bg-lime-2"
            >
              Vraag demo aan
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-label="Toggle menu"
          >
            <span className="block h-0.5 w-5 bg-forest" />
            <span className="block h-0.5 w-5 bg-forest" />
          </button>
        </nav>

        {/* Mega-menu flyout (desktop): hoogte morpht soepel bij openen en wisselen */}
        <div
          className="absolute inset-x-0 top-full z-50 hidden overflow-hidden lg:block"
          style={{
            height: menu ? panelH : 0,
            opacity: menu ? 1 : 0,
            pointerEvents: menu ? "auto" : "none",
            transition:
              "height 360ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 240ms ease-out",
          }}
        >
          <div ref={panelRef}>
            {displayMenu && menus[displayMenu] && (
              <MegaPanel key={displayMenu} menu={menus[displayMenu]} />
            )}
          </div>
        </div>

        {open && (
          <div className="border-t border-line bg-paper px-6 py-4 lg:hidden">
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.label}>
                  <a href="#" className="block py-2 text-[16px] text-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <a href="/login" className="py-2 text-[16px] font-medium">
                Inloggen
              </a>
              <a
                href="#"
                className="rounded-lg bg-lime px-4 py-3 text-center text-[16px] font-medium text-ink"
              >
                Vraag demo aan
              </a>
            </div>
          </div>
        )}
      </header>

      {/* zwarte fade-overlay onder het uitklapmenu (van onder donker naar boven licht) */}
      {menu && menus[menu] && (
        <div
          className="fixed inset-0 z-30 hidden lg:block"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.1) 100%)",
            animation: "headerFadeIn 0.25s ease-out both",
          }}
          onMouseEnter={() => setMenu(null)}
        />
      )}
    </div>
  );
}
