import {
  LayoutDashboard,
  ClipboardCheck,
  Building2,
  Users,
  Euro,
  Wrench,
  Workflow,
  Check,
  Loader2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Ticket,
  Search,
  Bell,
} from 'lucide-react'

/* ────────────────────────────────────────────────────────────────────────────
 * Gedeeld app-venster (Stripe-achtige product-shot) met de echte Domio-sidebar.
 * Elk "scherm" vult het hoofdpaneel; `active` bepaalt welk nav-item oplicht.
 * Geen screenshots — puur componenten in de Domio-huisstijl.
 * ──────────────────────────────────────────────────────────────────────────── */

type NavKey = 'dashboard' | 'taken' | 'portefeuille' | 'huurders' | 'financieel' | 'onderhoud' | 'flows'

const NAV_GROUPS: { label: string; items: { key: NavKey; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: 'Overzicht',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'taken', label: 'Taken', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Vastgoedbeheer',
    items: [
      { key: 'portefeuille', label: 'Portefeuille', icon: Building2 },
      { key: 'huurders', label: 'Huurders', icon: Users },
      { key: 'financieel', label: 'Financieel', icon: Euro },
      { key: 'onderhoud', label: 'Onderhoud', icon: Wrench },
      { key: 'flows', label: 'Flows', icon: Workflow },
    ],
  },
]

export function AppFrame({
  active,
  title,
  children,
}: {
  active: NavKey
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_30px_60px_-24px_rgba(22,51,0,0.28),0_12px_28px_-14px_rgba(22,51,0,0.16)]">
      {/* Venster-chrome */}
      <div className="flex items-center gap-2 border-b border-black/5 bg-[#FBFAF7] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#f0605c]" />
        <span className="h-3 w-3 rounded-full bg-[#f7bd4f]" />
        <span className="h-3 w-3 rounded-full bg-[#61c454]" />
        <div className="ml-3 flex items-center gap-2 rounded-md bg-white px-3 py-1 text-[11px] font-medium text-[#163300]/50 ring-1 ring-black/5">
          <Building2 className="h-3 w-3" />
          app.domio.nl
        </div>
      </div>

      <div className="flex">
        {/* Echte Domio-sidebar (compact) */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-black/5 bg-gray-50 p-2.5 sm:flex">
          <div className="px-2 pb-3 pt-1.5 text-sm font-semibold tracking-tight text-[#163300]">
            Domio
          </div>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-1.5">
              <p className="px-3 pb-1 pt-1 text-[11px] text-gray-500">{group.label}</p>
              <ul className="flex flex-col space-y-px">
                {group.items.map((item) => {
                  const isActive = item.key === active
                  return (
                    <li key={item.key}>
                      <div
                        className={`flex items-center gap-3 rounded-md px-3 py-[5px] text-[13px] ${
                          isActive
                            ? 'bg-[#9FE870]/40 font-medium text-[#163300]'
                            : 'text-gray-700'
                        }`}
                      >
                        <item.icon className="size-[16px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                        {item.label}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* Hoofdpaneel */}
        <div className="min-w-0 flex-1">
          {/* Topbar */}
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-3">
            <h3 className="text-[15px] font-semibold tracking-tight text-[#163300]">{title}</h3>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg bg-[#FBFAF7] px-3 py-1.5 text-[12px] text-[#163300]/40 sm:flex">
                <Search className="h-3.5 w-3.5" /> Zoeken
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FBFAF7] text-[#163300]/50">
                <Bell className="h-3.5 w-3.5" />
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#163300] text-[11px] font-semibold text-white">
                JR
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── SCHERM: ONDERHOUD ─────────────────────────── */

const STEPS = [
  { label: 'Melding getrieerd', sub: 'Lekkage · hoge urgentie', state: 'done' as const },
  { label: 'Vakman gekozen', sub: 'Loodgieter · De Vries Installatie', state: 'done' as const },
  { label: 'Afspraak ingepland', sub: 'Morgen 09:00 · bevestigd', state: 'active' as const },
  { label: 'Factuur verwerkt', sub: 'Wacht op afronding', state: 'todo' as const },
]

export function ScreenMaintenance() {
  return (
    <AppFrame active="onderhoud" title="Onderhoud">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#9FE870]/30 px-2.5 py-0.5 text-[11px] font-medium text-[#163300]">
              <Sparkles className="h-3 w-3" /> Agent actief
            </span>
            <span className="text-[11px] font-medium text-[#163300]/40">#DM-2041</span>
          </div>
          <h4 className="mt-2 text-[15px] font-semibold tracking-tight text-[#163300]">
            Lekkage badkamer · Prinsengracht 12-3
          </h4>
          <p className="text-[12px] text-[#163300]/50">Gemeld 07:14 · Huurder: F. Jansen</p>
        </div>
        <div className="rounded-lg bg-[#163300] px-3 py-2 text-center">
          <div className="text-[10px] uppercase tracking-wide text-white/50">Doorlooptijd</div>
          <div className="text-sm font-semibold text-white">1 u 46 m</div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {STEPS.map((step) => (
          <div
            key={step.label}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
              step.state === 'active' ? 'border-[#9FE870] bg-[#9FE870]/10' : 'border-black/5 bg-[#FBFAF7]'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                step.state === 'done'
                  ? 'bg-[#163300] text-white'
                  : step.state === 'active'
                    ? 'bg-[#9FE870] text-[#163300]'
                    : 'border border-black/10 bg-white text-[#163300]/30'
              }`}
            >
              {step.state === 'done' ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : step.state === 'active' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-[#163300]">{step.label}</div>
              <div className="truncate text-[12px] text-[#163300]/50">{step.sub}</div>
            </div>
            {step.state === 'active' && (
              <span className="shrink-0 text-[11px] font-medium text-[#163300]/60">bezig…</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FBFAF7] px-3.5 py-3 text-[12px] text-[#163300]/60">
        <Sparkles className="h-3.5 w-3.5 text-[#163300]/40" />
        <span>
          <span className="font-medium text-[#163300]">Agent</span> stuurde de huurder een update en
          bevestigde de afspraak met de loodgieter.
        </span>
      </div>
    </AppFrame>
  )
}

/* ─────────────────────────── SCHERM: FINANCIEEL ─────────────────────────── */

const PAYMENTS = [
  { name: 'F. Jansen', pand: 'Prinsengracht 12-3', bedrag: '€ 1.450', matched: true },
  { name: 'M. El Amrani', pand: 'Kinkerstraat 88-1', bedrag: '€ 1.190', matched: true },
  { name: 'S. de Boer', pand: 'Javastraat 40-2', bedrag: '€ 1.675', matched: true },
  { name: 'T. Visser', pand: 'Vechtstraat 7-H', bedrag: '€ 980', matched: false },
]

export function ScreenFinance() {
  return (
    <AppFrame active="financieel" title="Betalingen">
      <div className="flex items-center gap-2 rounded-xl border border-[#9FE870] bg-[#9FE870]/10 px-3.5 py-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#163300] text-white">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <span className="text-[13px] text-[#163300]">
          <span className="font-semibold">18 betalingen</span> automatisch gematcht aan de juiste huurder en pand.
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-black/5">
        <div className="grid grid-cols-[1.4fr_1.6fr_0.9fr_0.9fr] bg-[#FBFAF7] px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[#163300]/40">
          <span>Huurder</span>
          <span>Pand</span>
          <span className="text-right">Bedrag</span>
          <span className="text-right">Status</span>
        </div>
        {PAYMENTS.map((p, i) => (
          <div
            key={p.name}
            className={`grid grid-cols-[1.4fr_1.6fr_0.9fr_0.9fr] items-center px-4 py-3 text-[13px] ${
              i > 0 ? 'border-t border-black/5' : ''
            }`}
          >
            <span className="font-medium text-[#163300]">{p.name}</span>
            <span className="truncate text-[#163300]/55">{p.pand}</span>
            <span className="text-right font-medium text-[#163300]">{p.bedrag}</span>
            <span className="flex justify-end">
              {p.matched ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#9FE870]/40 px-2 py-0.5 text-[11px] font-medium text-[#163300]">
                  <Check className="h-3 w-3" strokeWidth={3} /> Gematcht
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f7bd4f]/20 px-2 py-0.5 text-[11px] font-medium text-[#8a6d1a]">
                  Open
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </AppFrame>
  )
}

/* ─────────────────────────── SCHERM: DASHBOARD ─────────────────────────── */

const KPIS = [
  { label: 'Maandhuur', value: '€ 48.920', delta: '+3,2%', up: true },
  { label: 'Bezetting', value: '97%', delta: '+1,0%', up: true },
  { label: 'Open tickets', value: '4', delta: '−2', up: false },
  { label: 'Achterstand', value: '€ 980', delta: '−12%', up: false },
]

const PORTFOLIO = [
  { pand: 'Prinsengracht 12', units: '4 units', bezet: '100%' },
  { pand: 'Kinkerstraat 88', units: '6 units', bezet: '92%' },
  { pand: 'Javastraat 40', units: '3 units', bezet: '100%' },
]

export function ScreenDashboard() {
  return (
    <AppFrame active="dashboard" title="Dashboard">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border border-black/5 bg-[#FBFAF7] p-3.5">
            <div className="text-[11px] font-medium text-[#163300]/45">{k.label}</div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-[#163300]">{k.value}</div>
            <div
              className={`mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium ${
                k.up ? 'text-[#15803D]' : 'text-[#163300]/45'
              }`}
            >
              {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        {/* Portefeuille-lijst */}
        <div className="overflow-hidden rounded-xl border border-black/5">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2.5">
            <span className="text-[12px] font-semibold text-[#163300]">Portefeuille</span>
            <span className="text-[11px] text-[#163300]/40">13 units</span>
          </div>
          {PORTFOLIO.map((row, i) => (
            <div
              key={row.pand}
              className={`flex items-center justify-between px-4 py-3 text-[13px] ${
                i > 0 ? 'border-t border-black/5' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9FE870]/30 text-[#163300]">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <div>
                  <div className="font-medium text-[#163300]">{row.pand}</div>
                  <div className="text-[11px] text-[#163300]/45">{row.units}</div>
                </div>
              </div>
              <span className="text-[12px] font-medium text-[#15803D]">{row.bezet} bezet</span>
            </div>
          ))}
        </div>

        {/* Recente activiteit */}
        <div className="rounded-xl border border-black/5 p-4">
          <div className="text-[12px] font-semibold text-[#163300]">Wat er speelt</div>
          <ul className="mt-2.5 space-y-2.5">
            {[
              { icon: Ticket, text: 'Lekkage Prinsengracht opgelost' },
              { icon: Euro, text: 'Huur september ontvangen' },
              { icon: Users, text: 'Nieuw contract getekend' },
            ].map((a) => (
              <li key={a.text} className="flex items-center gap-2.5 text-[12px] text-[#163300]/70">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FBFAF7] text-[#163300]/50">
                  <a.icon className="h-3.5 w-3.5" />
                </span>
                {a.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppFrame>
  )
}
