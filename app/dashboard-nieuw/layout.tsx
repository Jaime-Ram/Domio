"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardCheck, Building2, Users, HardDrive,
  Euro, CreditCard, AlertTriangle, Receipt, ShieldCheck, Wrench, CalendarRange,
  BookUser, Workflow, Plug, Sparkles, Smartphone, Settings, Ticket, ChevronDown,
} from "lucide-react";
import { DashboardHeader, SidebarUser } from "./_header";

const BASE = "/dashboard-nieuw";

type Item = {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string; icon: React.ElementType }[];
};

const navGroups: { header?: string; items: Item[] }[] = [
  { header: "Overzicht", items: [
    { label: "Dashboard", href: BASE, icon: LayoutDashboard },
    { label: "Taken", href: `${BASE}/taken`, icon: ClipboardCheck },
  ]},
  { header: "Onderhoud", items: [
    { label: "Meldingen", href: `${BASE}/tickets`, icon: Ticket },
    { label: "MJOP", href: `${BASE}/mjop`, icon: CalendarRange },
    { label: "Kosten", href: `${BASE}/kosten`, icon: Euro },
    { label: "Compliance", href: `${BASE}/compliance`, icon: ShieldCheck },
  ]},
  { header: "Vastgoed", items: [
    { label: "Panden", href: `${BASE}/portefeuille`, icon: Building2 },
    { label: "Partners", href: `${BASE}/contactboek`, icon: BookUser },
    { label: "Documenten", href: `${BASE}/documenten`, icon: HardDrive },
  ]},
  { header: "Meer", items: [
    { label: "App", href: `${BASE}/app`, icon: Smartphone },
    { label: "Accountinstellingen", href: `${BASE}/instellingen`, icon: Settings },
  ]},
];

const itemClass = (active: boolean) =>
  `flex w-full items-center gap-3 rounded-md px-3 py-[5px] text-[14px] transition-colors text-left ${
    active ? "bg-[#f4f4f1] font-medium text-ink" : "text-[#55554e] hover:bg-[#f4f4f1]"
  }`;

export default function DashboardNieuwLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href?: string) =>
    !href ? false : href === BASE ? pathname === BASE : pathname === href || pathname.startsWith(href + "/");

  const childActive = (item: Item) => !!item.children?.some((c) => isActive(c.href));

  const [open, setOpen] = useState<string[]>([]);
  useEffect(() => {
    const toOpen = navGroups
      .flatMap((g) => g.items)
      .filter((it) => it.children && it.children.some((c) => isActive(c.href)))
      .map((it) => it.label);
    setOpen((prev) => Array.from(new Set([...prev, ...toOpen])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggle = (label: string) =>
    setOpen((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));

  return (
    <div className="min-h-screen bg-[#f4f4f1] text-ink">
      <div className="flex">
        {/* sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-paper lg:flex">
          <div className="flex h-16 items-center px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/DomioLogo.png" alt="Domio" className="h-5 w-auto" />
          </div>
          <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            {navGroups.map((g, gi) => (
              <div key={gi}>
                {g.header && (
                  <p className="px-3 pb-1 text-[12px] font-normal text-[#97978f]">{g.header}</p>
                )}
                <ul className="flex flex-col space-y-px">
                  {g.items.map((item) => {
                    const Icon = item.icon;
                    if (item.children) {
                      const isOpen = open.includes(item.label);
                      return (
                        <li key={item.label}>
                          <button type="button" onClick={() => toggle(item.label)} className={itemClass(false)}>
                            <Icon className="size-[17px] shrink-0" strokeWidth={childActive(item) ? 2.5 : 2} />
                            <span className="flex-1">{item.label}</span>
                            <ChevronDown className={`size-3.5 shrink-0 text-[#97978f] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                          <div
                            className="grid transition-[grid-template-rows] duration-300 ease-out"
                            style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                          >
                            <div className="overflow-hidden">
                              <ul className="space-y-px py-0.5 ps-5">
                                {item.children.map((c) => {
                                  const ChildIcon = c.icon;
                                  const active = isActive(c.href);
                                  return (
                                    <li key={c.label}>
                                      <Link href={c.href} className={itemClass(active)}>
                                        <ChildIcon className="size-[15px] shrink-0" strokeWidth={active ? 2.5 : 2} />
                                        <span>{c.label}</span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        </li>
                      );
                    }
                    const active = isActive(item.href);
                    return (
                      <li key={item.label}>
                        <Link href={item.href!} className={itemClass(active)}>
                          <Icon className={`size-[17px] shrink-0 ${active ? "text-forest" : "text-[#97978f]"}`} strokeWidth={active ? 2.5 : 2} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="border-t border-line p-3">
            <SidebarUser />
          </div>
        </aside>

        {/* main */}
        <div className="flex-1">
          <DashboardHeader />

          <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
