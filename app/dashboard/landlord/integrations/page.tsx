import { GrayBlock } from '@/components/ui/gray-block'

type Bank = { name: string; file: string }

type Integration = {
  name: string
  description: string
  status?: 'active'
  banks?: Bank[]
} & (
  | { type: 'icon'; file: string; bg: string }
  | { type: 'logo'; file: string }
)

function IntegrationLogo({ integration }: { integration: Integration }) {
  if (integration.type === 'icon') {
    return (
      <div className="w-full h-full flex items-center justify-center p-2" style={{ backgroundColor: integration.bg }}>
        <img
          src={`/integrations/${integration.file}`}
          alt=""
          className="w-full h-full object-contain"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>
    )
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-white p-1">
      <img
        src={`/integrations/${integration.file}`}
        alt=""
        className="w-full h-full object-contain"
      />
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-10">
      {CATEGORIES.map((cat) => (
        <section key={cat.label}>
          <h2 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 mb-3">{cat.label}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cat.integrations.map((integration) => (
              <GrayBlock
                key={integration.name}
                className={`flex items-start gap-4 p-4${integration.banks ? ' col-span-full' : ''}`}
              >
                <div className="shrink-0 w-11 h-11 rounded-xl overflow-hidden">
                  <IntegrationLogo integration={integration} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{integration.name}</span>
                    {integration.status === 'active' ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#163300]/10 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870]">In ontwikkeling</span>
                    ) : (
                      <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500">Binnenkort</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{integration.description}</p>
                  {integration.banks && integration.banks.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06]">
                      <p className="text-[10px] font-medium text-gray-400 dark:text-neutral-500 mb-1.5">Ondersteunde banken</p>
                      <div className="flex flex-wrap gap-1.5">
                        {integration.banks.map((bank) => (
                          <div key={bank.name} title={bank.name} className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                            <img src={`/integrations/banks/${bank.file}`} alt={bank.name} className="w-full h-full object-contain p-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GrayBlock>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

const CATEGORIES: { label: string; integrations: Integration[] }[] = [
  {
    label: 'Bankieren & Open Banking',
    integrations: [
      {
        name: 'Yapily',
        description: 'Open Banking API (PSD2) — automatisch huurbetalingen matchen en bankrekeningen uitlezen.',
        type: 'logo',
        file: 'yapily.svg',
        status: 'active',
        banks: [
          { name: 'ING', file: 'ing.svg' },
          { name: 'ABN AMRO', file: 'abnamro.svg' },
          { name: 'Rabobank', file: 'rabobank.svg' },
          { name: 'Bunq', file: 'bunq.svg' },
          { name: 'SNS Bank', file: 'sns.svg' },
          { name: 'ASN Bank', file: 'asn.svg' },
          { name: 'Knab', file: 'knab.svg' },
          { name: 'RegioBank', file: 'regiobank.svg' },
          { name: 'Triodos Bank', file: 'triodos.svg' },
        ],
      },
    ],
  },
  {
    label: 'Boekhouding',
    integrations: [
      { name: 'Exact Online', description: 'Synchroniseer huurbetalingen, facturen en grootboekposten.', type: 'logo', file: 'exact.svg' },
      { name: 'Moneybird', description: 'Automatisch facturen aanmaken en betalingen verwerken.', type: 'logo', file: 'moneybird.svg' },
      { name: 'Snelstart', description: 'Koppel je portefeuille direct aan je boekhouding.', type: 'logo', file: 'snelstart.svg' },
      { name: 'Twinfield', description: 'Professionele boekhoudkoppeling voor grotere portefeuilles.', type: 'logo', file: 'twinfield.png' },
      { name: 'AFAS', description: 'Integreer met AFAS Profit voor HR en financiën.', type: 'logo', file: 'afas.png' },
    ],
  },
]
