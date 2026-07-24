import {
  LayoutDashboard,
  Wrench,
  Users,
  Receipt,
  Building2,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react'

/**
 * Stripe-achtige "product shot": een echt gerenderd stukje Domio-UI in een
 * app-venster. Toont een agent-pijplijn die live een onderhoudsmelding
 * afhandelt (triage -> vakman -> inplannen -> factuur). Geen screenshot,
 * puur componenten in de Domio-huisstijl, zodat bezoekers de echte software zien.
 */

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', active: false },
  { icon: Wrench, label: 'Onderhoud', active: true },
  { icon: Users, label: 'Huurders', active: false },
  { icon: Building2, label: 'Panden', active: false },
  { icon: Receipt, label: 'Facturen', active: false },
]

const STEPS = [
  { label: 'Melding getrieerd', sub: 'Lekkage · hoge urgentie', state: 'done' as const },
  { label: 'Vakman gekozen', sub: 'Loodgieter · De Vries Installatie', state: 'done' as const },
  { label: 'Afspraak ingepland', sub: 'Morgen 09:00 · bevestigd', state: 'active' as const },
  { label: 'Factuur verwerkt', sub: 'Wacht op afronding', state: 'todo' as const },
]

export function AgenticProductMockup() {
  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8">
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_30px_60px_-20px_rgba(22,51,0,0.28),0_12px_28px_-12px_rgba(22,51,0,0.18)]">
        {/* Venster-chrome */}
        <div className="flex items-center gap-2 border-b border-black/5 bg-[#FBFAF7] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#f0605c]" />
          <span className="h-3 w-3 rounded-full bg-[#f7bd4f]" />
          <span className="h-3 w-3 rounded-full bg-[#61c454]" />
          <div className="ml-3 flex items-center gap-2 rounded-md bg-white px-3 py-1 text-[11px] font-medium text-[#163300]/50 ring-1 ring-black/5">
            <Building2 className="h-3 w-3" />
            app.domio.nl / onderhoud
          </div>
        </div>

        {/* Body: mini-sidebar + hoofdpaneel */}
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden w-48 shrink-0 flex-col gap-1 border-r border-black/5 bg-[#FBFAF7] p-3 sm:flex">
            <div className="px-2 pb-3 pt-1 text-sm font-semibold tracking-tight text-[#163300]">
              Domio
            </div>
            {NAV.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-md px-3 py-[6px] text-[13px] ${
                  item.active
                    ? 'bg-[#9FE870]/40 font-medium text-[#163300]'
                    : 'text-[#163300]/60'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </aside>

          {/* Hoofdpaneel */}
          <div className="min-w-0 flex-1 bg-white p-5 sm:p-6">
            {/* Ticket-kop */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#9FE870]/30 px-2.5 py-0.5 text-[11px] font-medium text-[#163300]">
                    <Sparkles className="h-3 w-3" /> Agent actief
                  </span>
                  <span className="text-[11px] font-medium text-[#163300]/40">#DM-2041</span>
                </div>
                <h3 className="mt-2 text-[15px] font-semibold tracking-tight text-[#163300]">
                  Lekkage badkamer · Prinsengracht 12-3
                </h3>
                <p className="text-[12px] text-[#163300]/50">
                  Gemeld 07:14 · Huurder: F. Jansen
                </p>
              </div>
              <div className="rounded-lg bg-[#163300] px-3 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-white/50">Doorlooptijd</div>
                <div className="text-sm font-semibold text-white">1 u 46 m</div>
              </div>
            </div>

            {/* Agent-pijplijn */}
            <div className="mt-5 space-y-2">
              {STEPS.map((step) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
                    step.state === 'active'
                      ? 'border-[#9FE870] bg-[#9FE870]/10'
                      : 'border-black/5 bg-[#FBFAF7]'
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
                    <span className="shrink-0 text-[11px] font-medium text-[#163300]/60">
                      bezig…
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Activiteit-regel */}
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FBFAF7] px-3.5 py-3 text-[12px] text-[#163300]/60">
              <Sparkles className="h-3.5 w-3.5 text-[#163300]/40" />
              <span>
                <span className="font-medium text-[#163300]">Agent</span> stuurde huurder een update en
                bevestigde de afspraak met de loodgieter.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
