/* Gedeelde bouwstenen voor het nieuwe dashboard, in de nieuwe stijl. */
import { Plus } from "lucide-react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-paper p-5 ring-1 ring-line ${className}`}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[24px] font-medium tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-[14px] text-grey">{subtitle}</p>}
      </div>
      {action && (
        <button className="flex items-center gap-2 rounded-lg bg-lime px-3.5 py-2 text-[14px] font-medium text-forest transition-colors hover:bg-lime-2">
          <Plus className="h-4 w-4" /> {action.label}
        </button>
      )}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  green: "bg-lime/25 text-forest",
  grey: "bg-panel text-grey ring-1 ring-line",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
};

export function Badge({ tone = "grey", children }: { tone?: keyof typeof badgeTones | string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeTones[tone] ?? badgeTones.grey}`}>
      {children}
    </span>
  );
}

/* Tabel-primitieven */
export function DataTable({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-grey-2">{head}</tr>
          </thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Th({ children, right = false }: { children?: React.ReactNode; right?: boolean }) {
  return <th className={`px-5 py-2.5 font-medium ${right ? "text-right" : ""}`}>{children}</th>;
}

export function Td({ children, right = false, className = "" }: { children?: React.ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-5 py-3 ${right ? "text-right" : ""} ${className}`}>{children}</td>;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="transition-colors hover:bg-[#f4f4f1]">{children}</tr>;
}
