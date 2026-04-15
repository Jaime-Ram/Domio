export const MOCK_TENANT = {
  id: '1',
  name: 'Jan Jansen',
  email: 'jan@example.com',
  phone: '+31 6 12 34 56 78',
  address: 'Keizersgracht 12-A, Amsterdam',
  unit: 'Appartement 12-A',
  property: 'Keizersgracht 12',
  startDate: '2023-01-01',
  endDate: null,
  monthlyRent: 1450,
  deposit: 2900,
  depositStatus: 'gestort' as const,
  landlordName: 'Domio Beheer',
  landlordPhone: '+31 20 123 45 67',
  landlordEmail: 'beheer@domio.nl',
  nextPaymentDate: '2026-05-01',
  balance: 0,
}

export const MOCK_PAYMENTS = [
  { id: '1', period: 'April 2026', amount: 1450, paidOn: '2026-04-01', status: 'Betaald' as const },
  { id: '2', period: 'Maart 2026', amount: 1450, paidOn: '2026-03-01', status: 'Betaald' as const },
  { id: '3', period: 'Februari 2026', amount: 1450, paidOn: '2026-02-03', status: 'Te laat' as const },
  { id: '4', period: 'Januari 2026', amount: 1450, paidOn: '2026-01-01', status: 'Betaald' as const },
  { id: '5', period: 'December 2025', amount: 1450, paidOn: '2025-12-01', status: 'Betaald' as const },
  { id: '6', period: 'November 2025', amount: 1450, paidOn: '2025-11-01', status: 'Betaald' as const },
]

export const MOCK_TICKETS = [
  { id: '1', title: 'Lekkage badkamer', category: 'Loodgieterswerk', status: 'in_behandeling' as const, date: '2026-04-02', description: 'Water druppelt van het plafond bij de douche.' },
  { id: '2', title: 'Kapotte CV-ketel', category: 'Verwarming', status: 'afgerond' as const, date: '2026-01-15', description: 'Ketel sloeg af, geen verwarming.' },
  { id: '3', title: 'Raam sluit niet goed', category: 'Ramen/deuren', status: 'open' as const, date: '2026-03-20', description: 'Slaapkamerraam sluit niet meer goed af.' },
]

export const MOCK_DOCUMENTS = [
  { id: '1', name: 'Huurovereenkomst 2023', category: 'Contract', date: '2023-01-01', size: '245 KB' },
  { id: '2', name: 'Borgovereenkomst', category: 'Borg', date: '2023-01-01', size: '98 KB' },
  { id: '3', name: 'Plaatsbeschrijving intrede', category: 'Inspectie', date: '2023-01-05', size: '1.2 MB' },
  { id: '4', name: 'Jaarafrekening servicekosten 2025', category: 'Financieel', date: '2026-02-01', size: '134 KB' },
  { id: '5', name: 'Huisreglement', category: 'Informatie', date: '2023-01-01', size: '56 KB' },
]

export const MOCK_MESSAGES = [
  { id: '1', from: 'landlord', name: 'Domio Beheer', text: 'Goedemiddag, de loodgieter komt aanstaande vrijdag 14:00–16:00 voor de lekkage. Kunt u thuis zijn?', date: '2026-04-10T13:22:00' },
  { id: '2', from: 'tenant', name: 'Jan Jansen', text: 'Ja, dat is prima. Ik ben thuis.', date: '2026-04-10T14:05:00' },
  { id: '3', from: 'landlord', name: 'Domio Beheer', text: 'Goed, dan plannen we dat in. We sturen een bevestiging.', date: '2026-04-10T14:30:00' },
  { id: '4', from: 'tenant', name: 'Jan Jansen', text: 'Bedankt!', date: '2026-04-10T14:32:00' },
]
