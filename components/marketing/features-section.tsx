'use client'

import { FileText, Users, Lock, CreditCard, Bell, Receipt, TrendingUp, Scan, Calculator, Link2, Building2, CheckCircle, Eye, PenTool } from 'lucide-react'

interface Feature {
  name: string
  icon: React.ComponentType<{ className?: string }>
}

interface FeatureCategory {
  title: string
  features: Feature[]
}

const featureCategories: FeatureCategory[] = [
  {
    title: 'Contracten & Documenten',
    features: [
      { name: 'Assets- en leverancierscontracten', icon: FileText },
      { name: 'Huurovereenkomsten', icon: Building2 },
      { name: 'Ticketsysteem', icon: CheckCircle },
      { name: 'Inspectiemodule', icon: Eye },
      { name: 'Online klantportaal', icon: Users },
      { name: 'Digitaal Ondertekenen', icon: PenTool },
    ],
  },
  {
    title: 'Data en toegang',
    features: [
      { name: 'Single Sign-On', icon: Lock },
      { name: 'Vierogenprincipe', icon: Eye },
    ],
  },
  {
    title: 'Financieel beheer',
    features: [
      { name: 'Betalingen', icon: CreditCard },
      { name: 'Betalingsherinnering', icon: Bell },
      { name: 'Factureren', icon: Receipt },
      { name: 'Huurafrekeningen', icon: Calculator },
      { name: 'Indexeren', icon: TrendingUp },
      { name: 'Inkoopfacturen scannen', icon: Scan },
      { name: 'Servicekostenafrekening', icon: Calculator },
      { name: 'Boekhoudkoppeling voor vastgoed', icon: Link2 },
      { name: 'Bizcuit – Bankkoppeling', icon: CreditCard },
    ],
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t bg-white/50 py-24 dark:bg-gray-900/50">
      <div className="container mx-auto w-full max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Alle functies die je nodig hebt
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Een compleet overzicht van alle functies die Domio biedt voor efficiënt vastgoedbeheer
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          {featureCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="rounded-xl bg-gradient-to-br from-[#002A1F]/5 to-[#356258]/5 p-6 dark:from-[#002A1F]/10 dark:to-[#356258]/10"
            >
              <h3 className="mb-6 text-xl font-bold text-[#002A1F] dark:text-[#9AFF7C]">
                {category.title}
              </h3>
              <ul className="space-y-4">
                {category.features.map((feature, featureIndex) => {
                  const Icon = feature.icon
                  return (
                    <li
                      key={featureIndex}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#002A1F]/10 dark:bg-[#9AFF7C]/20">
                        <Icon className="h-3.5 w-3.5 text-[#002A1F] dark:text-[#9AFF7C]" />
                      </div>
                      <span className="text-sm font-medium leading-relaxed">
                        {feature.name}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}



