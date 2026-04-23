import type { PaymentProfile } from '@/lib/supabase/betaalflow'
import type { CostAllocationKey } from '@/lib/supabase/verdeelsleutel'

export const mockPaymentProfiles: PaymentProfile[] = [
  {
    id: 'pp-1',
    owner_id: 'demo',
    name: 'Standaard',
    description: 'Betaling voor de 1e van de maand, herinneringen 3 dagen voor en 7 dagen na.',
    pay_date: 1,
    reminders: [-3, 7, 14],
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date('2024-01-10').toISOString(),
    tenant_count: 4,
  },
  {
    id: 'pp-2',
    owner_id: 'demo',
    name: 'Probleemhuurder',
    description: 'Strengere follow-up: herinneringen al 5 dagen voor betaaldag.',
    pay_date: 1,
    reminders: [-5, 3, 7, 14, 30],
    created_at: new Date('2024-02-05').toISOString(),
    updated_at: new Date('2024-02-05').toISOString(),
    tenant_count: 1,
  },
  {
    id: 'pp-3',
    owner_id: 'demo',
    name: 'Zakelijk — 15e maand',
    description: 'Zakelijke huurders die halverwege de maand betalen.',
    pay_date: 15,
    reminders: [-3, 7],
    created_at: new Date('2024-03-01').toISOString(),
    updated_at: new Date('2024-03-01').toISOString(),
    tenant_count: 2,
  },
]

export const mockCostAllocationKeys: CostAllocationKey[] = [
  {
    id: 'cak-1',
    owner_id: 'demo',
    property_id: null,
    name: 'Gelijke verdeling',
    method: 'equal',
    units: [],
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'cak-2',
    owner_id: 'demo',
    property_id: 'prop-1',
    name: 'Oppervlakte — Keizersgracht 12',
    method: 'surface_area',
    units: [
      { unit_id: 'unit-1', m2: 65 },
      { unit_id: 'unit-2', m2: 80 },
      { unit_id: 'unit-3', m2: 55 },
    ],
    created_at: new Date('2024-02-10').toISOString(),
    updated_at: new Date('2024-02-10').toISOString(),
  },
  {
    id: 'cak-3',
    owner_id: 'demo',
    property_id: null,
    name: 'Servicekosten split 40/60',
    method: 'custom',
    units: [
      { unit_id: 'unit-a', percentage: 40 },
      { unit_id: 'unit-b', percentage: 60 },
    ],
    created_at: new Date('2024-03-20').toISOString(),
    updated_at: new Date('2024-03-20').toISOString(),
  },
]
