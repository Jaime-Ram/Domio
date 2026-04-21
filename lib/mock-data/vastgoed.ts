// Mock data voor vastgoedbeheer dashboard
// Dit wordt later vervangen door echte Supabase data

// ─── Portefeuilles ────────────────────────────────────────────────────────────
export const mockPortfolios = [
  {
    id: 'pf-1',
    name: 'Privé — J.P. van der Berg',
    description: 'Persoonlijk vastgoed',
    entityType: 'Privé persoon',
    owner: 'J.P. van der Berg',
    kvk: null,
    propertyIds: ['1', '3', '5'],
  },
  {
    id: 'pf-2',
    name: 'Vastgoed BV Amsterdam',
    description: 'Bedrijfspanden in de regio Amsterdam',
    entityType: 'Besloten Vennootschap',
    owner: 'Vastgoed BV Amsterdam',
    kvk: '12345678',
    propertyIds: ['2'],
  },
  {
    id: 'pf-3',
    name: 'Smit Kantoren',
    description: 'Commercieel vastgoed A.J.M. Smit',
    entityType: 'Privé persoon',
    owner: 'A.J.M. Smit',
    kvk: null,
    propertyIds: ['4'],
  },
]

export const mockProperties = [
  {
    id: '1',
    portfolioId: 'pf-1',
    name: 'Appartement 101',
    address: 'Hoofdstraat 123, Amsterdam',
    type: 'Appartement',
    status: 'verhuurd',
    monthlyRent: 1200,
    size: 65,
    rooms: 2,
    registration: {
      type: 'persoon',
      name: 'J.P. van der Berg',
      address: 'Poststraat 45, Amsterdam',
      email: 'j.berg@example.com',
      phone: '+31 6 12345678',
      kvkNumber: null,
      rsin: null,
    },
    tenant: {
      id: '1',
      name: 'Jan Jansen',
      email: 'jan@example.com',
    },
    lease: {
      id: '1',
      startDate: '2023-01-01',
      endDate: '2025-12-31',
      monthlyRent: 1200,
    },
  },
  {
    id: '2',
    portfolioId: 'pf-2',
    name: 'Appartement 102',
    address: 'Hoofdstraat 123, Amsterdam',
    type: 'Appartement',
    status: 'verhuurd',
    monthlyRent: 1150,
    size: 60,
    rooms: 2,
    registration: {
      type: 'bedrijf',
      name: 'Vastgoed BV Amsterdam',
      address: 'Kadastraalweg 12, Amsterdam',
      email: 'info@vastgoedbv.nl',
      phone: '+31 20 1234567',
      kvkNumber: '12345678',
      rsin: '123456789',
    },
    tenant: {
      id: '2',
      name: 'Maria de Vries',
      email: 'maria@example.com',
    },
    lease: {
      id: '2',
      startDate: '2023-03-01',
      endDate: '2026-02-28',
      monthlyRent: 1150,
    },
  },
  {
    id: '3',
    portfolioId: 'pf-1',
    name: 'Appartement 103',
    address: 'Hoofdstraat 123, Amsterdam',
    type: 'Appartement',
    status: 'leegstand',
    monthlyRent: 1100,
    size: 55,
    rooms: 1,
    registration: {
      type: 'persoon',
      name: 'A.J.M. Smit',
      address: 'Dorpsstraat 78, Haarlem',
      email: 'a.smit@example.com',
      phone: '+31 23 9876543',
      kvkNumber: null,
      rsin: null,
    },
    tenant: null,
    lease: null,
  },
  {
    id: '4',
    portfolioId: 'pf-3',
    name: 'Kantoorruimte A',
    address: 'Zakenstraat 45, Rotterdam',
    type: 'Kantoor',
    status: 'leegstand',
    monthlyRent: 1100,
    size: 55,
    rooms: 5,
    registration: {
      type: 'persoon',
      name: 'A.J.M. Smit',
      address: 'Dorpsstraat 78, Haarlem',
      email: 'a.smit@example.com',
      phone: '+31 23 9876543',
      kvkNumber: null,
      rsin: null,
    },
    tenant: null,
    lease: null,
  },
  {
    id: '5',
    portfolioId: 'pf-1',
    name: 'Lovehaven Jan Huisje',
    address: 'Coolhaven 22C, Rotterdam',
    type: 'Appartement',
    status: 'verhuurd',
    monthlyRent: 3225,
    size: 111,
    rooms: 5,
    registration: {
      type: 'persoon',
      name: 'J.P. van der Berg',
      address: 'Poststraat 45, Amsterdam',
      email: 'j.berg@example.com',
      phone: '+31 6 12345678',
      kvkNumber: null,
      rsin: null,
    },
    tenant: {
      id: '1',
      name: 'Jan Jansen',
      email: 'jan@example.com',
    },
    lease: {
      id: '1',
      startDate: '2023-01-01',
      endDate: '2025-12-31',
      monthlyRent: 3225,
    },
  },
]

export const mockTenants = [
  {
    id: '1',
    name: 'Jan Jansen',
    email: 'jan@example.com',
    phone: '+31 6 12345678',
    property: mockProperties[0],
    lease: mockProperties[0].lease,
    status: 'actief',
    balance: 0,
    lastPayment: '2024-01-01',
  },
  {
    id: '2',
    name: 'Maria de Vries',
    email: 'maria@example.com',
    phone: '+31 6 87654321',
    property: mockProperties[1],
    lease: mockProperties[1].lease,
    status: 'actief',
    balance: -150,
    lastPayment: '2023-12-15',
  },
  {
    id: '3',
    name: 'Tech Solutions BV',
    email: 'info@techsolutions.nl',
    phone: '+31 20 1234567',
    property: mockProperties[3],
    lease: mockProperties[3].lease,
    status: 'actief',
    balance: 0,
    lastPayment: '2024-01-01',
  },
]

export const mockLeases = [
  {
    id: '1',
    property: mockProperties[0],
    tenant: mockTenants[0],
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    monthlyRent: 1200,
    deposit: 2400,
    status: 'actief',
    indexationDate: '2024-01-01',
    nextIndexation: '2025-01-01',
  },
  {
    id: '2',
    property: mockProperties[1],
    tenant: mockTenants[1],
    startDate: '2023-03-01',
    endDate: '2026-02-28',
    monthlyRent: 1150,
    deposit: 2300,
    status: 'actief',
    indexationDate: '2024-03-01',
    nextIndexation: '2025-03-01',
  },
  {
    id: '3',
    property: mockProperties[3],
    tenant: mockTenants[2],
    startDate: '2022-06-01',
    endDate: '2027-05-31',
    monthlyRent: 2500,
    deposit: 5000,
    status: 'actief',
    indexationDate: '2023-06-01',
    nextIndexation: '2024-06-01',
  },
]

export const mockMaintenanceRequests = [
  {
    id: '1',
    property: mockProperties[0],
    tenant: mockTenants[0],
    title: 'Lekkende kraan in keuken',
    description: 'De kraan in de keuken lekt constant',
    priority: 'normaal',
    status: 'open',
    createdAt: '2024-01-15',
    assignedTo: null,
  },
  {
    id: '2',
    property: mockProperties[1],
    tenant: mockTenants[1],
    title: 'Verwarming werkt niet',
    description: 'De verwarming in de woonkamer doet het niet',
    priority: 'urgent',
    status: 'in_behandeling',
    createdAt: '2024-01-10',
    assignedTo: 'Onderhoudsbedrijf ABC',
  },
  {
    id: '3',
    property: mockProperties[3],
    tenant: mockTenants[2],
    title: 'Schilderwerk nodig',
    description: 'Muren moeten opnieuw geschilderd worden',
    priority: 'laag',
    status: 'gepland',
    createdAt: '2024-01-05',
    assignedTo: 'Schildersbedrijf XYZ',
  },
]

export const mockPayments = [
  {
    id: '1',
    tenant: mockTenants[0],
    property: mockProperties[0],
    amount: 1200,
    type: 'huur',
    status: 'betaald',
    dueDate: '2024-01-01',
    paidDate: '2024-01-01',
    paymentMethod: 'SEPA',
  },
  {
    id: '2',
    tenant: mockTenants[1],
    property: mockProperties[1],
    amount: 1150,
    type: 'huur',
    status: 'openstaand',
    dueDate: '2024-01-01',
    paidDate: null,
    paymentMethod: null,
  },
  {
    id: '3',
    tenant: mockTenants[2],
    property: mockProperties[3],
    amount: 2500,
    type: 'huur',
    status: 'betaald',
    dueDate: '2024-01-01',
    paidDate: '2023-12-28',
    paymentMethod: 'Bankoverschrijving',
  },
]

export const mockInvoices = [
  {
    id: '1',
    tenant: mockTenants[0],
    property: mockProperties[0],
    type: 'huur',
    amount: 1200,
    status: 'betaald',
    issueDate: '2024-01-01',
    dueDate: '2024-01-01',
    paidDate: '2024-01-01',
  },
  {
    id: '2',
    tenant: mockTenants[1],
    property: mockProperties[1],
    type: 'huur',
    amount: 1150,
    status: 'openstaand',
    issueDate: '2024-01-01',
    dueDate: '2024-01-01',
    paidDate: null,
  },
  {
    id: '3',
    tenant: mockTenants[2],
    property: mockProperties[3],
    type: 'huur',
    amount: 2500,
    status: 'betaald',
    issueDate: '2024-01-01',
    dueDate: '2024-01-01',
    paidDate: '2023-12-28',
  },
]

export const mockKPIs = {
  totalProperties: 4,
  occupiedProperties: 3,
  occupancyRate: 75,
  totalMonthlyRevenue: 4850,
  outstandingPayments: 150,
  openTickets: 1,
  upcomingIndexations: 2,
  averageRent: 1212.5,
}

export const mockRevenueData = [
  { month: 'Jul', revenue: 4850 },
  { month: 'Aug', revenue: 4850 },
  { month: 'Sep', revenue: 4850 },
  { month: 'Oct', revenue: 4850 },
  { month: 'Nov', revenue: 4850 },
  { month: 'Dec', revenue: 4850 },
  { month: 'Jan', revenue: 4850 },
]

export const mockOccupancyData = [
  { month: 'Jul', occupancy: 70 },
  { month: 'Aug', occupancy: 72 },
  { month: 'Sep', occupancy: 75 },
  { month: 'Oct', occupancy: 75 },
  { month: 'Nov', occupancy: 75 },
  { month: 'Dec', occupancy: 75 },
  { month: 'Jan', occupancy: 75 },
]

export const mockRecentActivities = [
  {
    id: '1',
    type: 'payment',
    message: 'Huur betaald - Jan Jansen - €1.200',
    timestamp: '2024-01-15T10:30:00',
    property: mockProperties[0],
  },
  {
    id: '2',
    type: 'maintenance',
    message: 'Onderhoud gemeld - Hoofdstraat 123',
    timestamp: '2024-01-15T09:15:00',
    property: mockProperties[0],
  },
  {
    id: '3',
    type: 'lease',
    message: 'Contract verlengd - Maria de Vries',
    timestamp: '2024-01-14T14:20:00',
    property: mockProperties[1],
  },
  {
    id: '4',
    type: 'document',
    message: 'Document geüpload - Verzekeringspolis',
    timestamp: '2024-01-14T08:00:00',
    property: mockProperties[3],
  },
  {
    id: '5',
    type: 'payment',
    message: 'Huur betaald - Tech Solutions BV - €2.500',
    timestamp: '2024-01-13T16:45:00',
    property: mockProperties[3],
  },
]

// Uitgaven mock data
export const mockExpenses = [
  {
    id: '1',
    description: 'Reparatie verwarming',
    amount: 350,
    date: '2024-01-10',
    category: 'Onderhoud',
    property: mockProperties[1],
    invoice: 'factuur-001.pdf',
  },
  {
    id: '2',
    description: 'Opstalverzekering Q1 2024',
    amount: 450,
    date: '2024-01-05',
    category: 'Verzekering',
    property: null,
    invoice: 'polis-verzekering.pdf',
  },
  {
    id: '3',
    description: 'VvE bijdrage',
    amount: 150,
    date: '2024-01-03',
    category: 'VvE',
    property: mockProperties[0],
    invoice: null,
  },
  {
    id: '4',
    description: 'Gemeentelijke belastingen',
    amount: 280,
    date: '2024-01-02',
    category: 'Belasting',
    property: mockProperties[3],
    invoice: 'belastingaanslag.pdf',
  },
]

// Documenten mock data
export const mockDocuments = [
  {
    id: '1',
    name: 'Huurcontract Jan Jansen.pdf',
    type: 'Contract',
    property: mockProperties[0],
    uploadDate: '2023-01-01',
    size: '245 KB',
    url: '/documents/contract-1.pdf',
  },
  {
    id: '2',
    name: 'Plaatsbeschrijving Hoofdstraat 123.pdf',
    type: 'Contract',
    property: mockProperties[0],
    uploadDate: '2023-01-01',
    size: '1.2 MB',
    url: '/documents/plaatsbeschrijving-1.pdf',
  },
  {
    id: '3',
    name: 'Elektra-keuring 2023.pdf',
    type: 'Keuring',
    property: mockProperties[0],
    uploadDate: '2023-06-15',
    size: '890 KB',
    url: '/documents/elektra-keuring-1.pdf',
  },
  {
    id: '4',
    name: 'Opstalverzekering 2024.pdf',
    type: 'Verzekering',
    property: null,
    uploadDate: '2024-01-01',
    size: '567 KB',
    url: '/documents/verzekering-2024.pdf',
  },
  {
    id: '5',
    name: 'Factuur reparatie verwarming.pdf',
    type: 'Factuur',
    property: mockProperties[1],
    uploadDate: '2024-01-10',
    size: '123 KB',
    url: '/documents/factuur-001.pdf',
    amount_due: 0,
    due_date: '2024-02-14',
  },
  {
    id: '6',
    name: 'Energielabel B certificaat.pdf',
    type: 'Overig',
    property: mockProperties[0],
    uploadDate: '2023-03-20',
    size: '450 KB',
    url: '/documents/energielabel-1.pdf',
  },
]

// Compliance data per pand
export const mockCompliance = [
  {
    propertyId: '1',
    property: mockProperties[0],
    smokeDetectors: true,
    electricityInspection: {
      valid: true,
      expiryDate: '2028-06-15',
      documentId: '3',
    },
    insurance: {
      valid: true,
      expiryDate: '2024-12-31',
      documentId: '4',
    },
    tenantInsurance: true,
    overallStatus: 'green',
  },
  {
    propertyId: '2',
    property: mockProperties[1],
    smokeDetectors: true,
    electricityInspection: {
      valid: true,
      expiryDate: '2024-02-28',
      documentId: null,
    },
    insurance: {
      valid: true,
      expiryDate: '2024-12-31',
      documentId: '4',
    },
    tenantInsurance: false,
    overallStatus: 'orange',
  },
  {
    propertyId: '3',
    property: mockProperties[2],
    smokeDetectors: false,
    electricityInspection: {
      valid: false,
      expiryDate: null,
      documentId: null,
    },
    insurance: {
      valid: true,
      expiryDate: '2024-12-31',
      documentId: '4',
    },
    tenantInsurance: false,
    overallStatus: 'red',
  },
  {
    propertyId: '4',
    property: mockProperties[3],
    smokeDetectors: true,
    electricityInspection: {
      valid: true,
      expiryDate: '2025-05-31',
      documentId: null,
    },
    insurance: {
      valid: true,
      expiryDate: '2024-12-31',
      documentId: '4',
    },
    tenantInsurance: true,
    overallStatus: 'green',
  },
]

// Huurachterstand procedures
export const mockRentArrearsProcedures = [
  {
    id: '1',
    tenant: mockTenants[1],
    property: mockProperties[1],
    totalArrears: 1150,
    daysPastDue: 45,
    steps: [
      {
        step: 1,
        name: 'Herinnering verstuurd',
        completed: true,
        completedDate: '2023-12-05',
        document: 'herinnering-maria-devries.pdf',
        notes: 'Email herinnering verstuurd',
      },
      {
        step: 2,
        name: 'Contact opgenomen',
        completed: true,
        completedDate: '2023-12-12',
        document: null,
        notes: 'Telefonisch contact gehad, beloofde te betalen voor eind december',
      },
      {
        step: 3,
        name: '14-dagenbrief verstuurd',
        completed: true,
        completedDate: '2024-01-05',
        document: '14dagenbrief-maria-devries.pdf',
        notes: 'Aangetekend verstuurd',
      },
      {
        step: 4,
        name: 'Vroegsignalering gemeente',
        completed: false,
        completedDate: null,
        document: null,
        notes: '',
      },
      {
        step: 5,
        name: 'Juridisch',
        completed: false,
        completedDate: null,
        document: null,
        notes: '',
      },
    ],
    startDate: '2023-12-01',
    status: 'in_behandeling',
  },
]

// Brief templates
export const mockLetterTemplates = [
  {
    id: 'herinnering',
    name: 'Betalingsherinnering',
    content: `Beste {{huurder_naam}},

We hebben geconstateerd dat de huur voor {{adres}} over de maand {{maand}} nog niet is voldaan.

Het verschuldigde bedrag is: €{{bedrag}}

Mocht u de betaling inmiddels hebben verricht, dan kunt u deze brief als niet verzonden beschouwen.

Met vriendelijke groet,
{{beheerder_naam}}`,
  },
  {
    id: '14dagen',
    name: '14-dagenbrief',
    content: `Aangetekend

Beste {{huurder_naam}},

Ondanks onze eerdere herinnering hebben wij de huur voor {{adres}} nog niet ontvangen.

Verschuldigd bedrag: €{{bedrag}}
Vervaldatum: {{vervaldatum}}

U heeft 14 dagen de tijd om te betalen, anders zijn wij genoodzaakt juridische stappen te ondernemen.

Met vriendelijke groet,
{{beheerder_naam}}`,
  },
  {
    id: 'ingebrekestelling',
    name: 'Ingebrekestelling',
    content: `Aangetekend met bewijs van ontvangst

Beste {{huurder_naam}},

Bij deze stellen wij u formeel in gebreke wegens het niet nakomen van uw betalingsverplichting.

Pand: {{adres}}
Verschuldigd bedrag: €{{bedrag}}
Aantal dagen achterstand: {{dagen}}

Indien niet binnen 7 dagen wordt betaald, zullen wij een deurwaarder inschakelen en de huurovereenkomst ontbinden.

Met vriendelijke groet,
{{beheerder_naam}}`,
  },
]

