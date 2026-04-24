// Mock data voor vastgoedbeheer dashboard
// Dit wordt later vervangen door echte Supabase data

// ─── Rechtspersonen ───────────────────────────────────────────────────────────
export const mockLegalEntities = [
  {
    id: 'le-1',
    name: 'J.P. van der Berg',
    type: 'Privé persoon',
    kvk: null,
    rsin: null,
    address: 'Poststraat 45, 1011 AB Amsterdam',
    email: 'jp@vandenberg.nl',
    phone: '+31 6 21345678',
    btw: null,
    iban: 'NL91 ABNA 0417 1643 00',
  },
  {
    id: 'le-2',
    name: 'VDB Vastgoed BV',
    type: 'Besloten Vennootschap',
    kvk: '12345678',
    rsin: '823456789',
    address: 'Herengracht 182, 1016 BR Amsterdam',
    email: 'info@vdbvastgoed.nl',
    phone: '+31 20 7654321',
    btw: 'NL823456789B01',
    iban: 'NL44 RABO 0123 4567 89',
  },
  {
    id: 'le-3',
    name: 'Smit Onroerend Goed VOF',
    type: 'Vennootschap onder firma',
    kvk: '87654321',
    rsin: '987654321',
    address: 'Coolsingel 88, 3012 AG Rotterdam',
    email: 'info@smit-og.nl',
    phone: '+31 10 2223344',
    btw: 'NL987654321B01',
    iban: 'NL20 INGB 0001 2345 67',
  },
  {
    id: 'le-4',
    name: 'Stichting Woonkansen Utrecht',
    type: 'Stichting',
    kvk: '54321098',
    rsin: '654321098',
    address: 'Oudegracht 145, 3511 AK Utrecht',
    email: 'beheer@woonkansen.nl',
    phone: '+31 30 1122334',
    btw: null,
    iban: 'NL71 TRIO 0320 7457 25',
  },
]

// ─── Portefeuilles ────────────────────────────────────────────────────────────
export const mockPortfolios = [
  {
    id: 'pf-1',
    name: 'Privé — J.P. van der Berg',
    description: 'Persoonlijk vastgoed in Amsterdam en omstreken',
    entityType: 'Privé persoon',
    legalEntityId: 'le-1',
    owner: 'J.P. van der Berg',
    kvk: null,
    propertyIds: ['1', '3', '5'],
  },
  {
    id: 'pf-2',
    name: 'VDB Vastgoed BV',
    description: 'Woon- en bedrijfspanden via besloten vennootschap',
    entityType: 'Besloten Vennootschap',
    legalEntityId: 'le-2',
    owner: 'VDB Vastgoed BV',
    kvk: '12345678',
    propertyIds: ['2', '6', '7', '8'],
  },
  {
    id: 'pf-3',
    name: 'Smit Onroerend Goed VOF',
    description: 'Commercieel en gemengd vastgoed Rotterdam',
    entityType: 'Vennootschap onder firma',
    legalEntityId: 'le-3',
    owner: 'A.J.M. Smit & B.K. Smit',
    kvk: '87654321',
    propertyIds: ['4', '9', '10'],
  },
  {
    id: 'pf-4',
    name: 'Stichting Woonkansen Utrecht',
    description: 'Sociale verhuur in de regio Utrecht',
    entityType: 'Stichting',
    legalEntityId: 'le-4',
    owner: 'Stichting Woonkansen Utrecht',
    kvk: '54321098',
    propertyIds: ['11', '12', '13'],
  },
  {
    id: 'pf-5',
    name: 'Privé — A.M. Hendriks',
    description: 'Middenhuur en vrije sector Den Haag',
    entityType: 'Privé persoon',
    legalEntityId: null,
    owner: 'A.M. Hendriks',
    kvk: null,
    propertyIds: ['14', '15'],
  },
]

// ─── Objecten ─────────────────────────────────────────────────────────────────
export const mockProperties = [
  // pf-1 — Privé J.P. van der Berg
  {
    id: '1',
    portfolioId: 'pf-1',
    name: 'Appartement Keizersgracht',
    address: 'Keizersgracht 312, 1016 EX Amsterdam',
    type: 'Appartement',
    status: 'verhuurd',
    monthlyRent: 1650,
    size: 72,
    rooms: 3,
    energyLabel: 'C',
    constructionYear: 1932,
    registration: {
      type: 'persoon',
      name: 'J.P. van der Berg',
      address: 'Poststraat 45, 1011 AB Amsterdam',
      email: 'jp@vandenberg.nl',
      phone: '+31 6 21345678',
      kvkNumber: null,
      rsin: null,
    },
    tenant: { id: 't-1', name: 'Sophie Vermeer', email: 's.vermeer@gmail.com' },
    lease: { id: 'l-1', startDate: '2022-09-01', endDate: null, monthlyRent: 1650 },
  },
  {
    id: '3',
    portfolioId: 'pf-1',
    name: 'Studio Jordaan',
    address: 'Elandsgracht 58, 1016 TX Amsterdam',
    type: 'Studio',
    status: 'leegstand',
    monthlyRent: 1100,
    size: 38,
    rooms: 1,
    energyLabel: 'D',
    constructionYear: 1958,
    registration: {
      type: 'persoon',
      name: 'J.P. van der Berg',
      address: 'Poststraat 45, 1011 AB Amsterdam',
      email: 'jp@vandenberg.nl',
      phone: '+31 6 21345678',
      kvkNumber: null,
      rsin: null,
    },
    tenant: null,
    lease: null,
  },
  {
    id: '5',
    portfolioId: 'pf-1',
    name: 'Ruim appartement Coolhaven',
    address: 'Coolhaven 22C, 3024 AR Rotterdam',
    type: 'Appartement',
    status: 'verhuurd',
    monthlyRent: 3225,
    size: 111,
    rooms: 5,
    energyLabel: 'A',
    constructionYear: 2018,
    registration: {
      type: 'persoon',
      name: 'J.P. van der Berg',
      address: 'Poststraat 45, 1011 AB Amsterdam',
      email: 'jp@vandenberg.nl',
      phone: '+31 6 21345678',
      kvkNumber: null,
      rsin: null,
    },
    tenant: { id: 't-2', name: 'Lars & Nina de Boer', email: 'lars.deboer@outlook.com' },
    lease: { id: 'l-2', startDate: '2023-04-01', endDate: null, monthlyRent: 3225 },
  },

  // pf-2 — VDB Vastgoed BV
  {
    id: '2',
    portfolioId: 'pf-2',
    name: 'Appartement Zuidas',
    address: 'Beethovenstraat 204, 1077 JR Amsterdam',
    type: 'Appartement',
    status: 'verhuurd',
    monthlyRent: 2250,
    size: 85,
    rooms: 3,
    energyLabel: 'A',
    constructionYear: 2012,
    registration: {
      type: 'bedrijf',
      name: 'VDB Vastgoed BV',
      address: 'Herengracht 182, 1016 BR Amsterdam',
      email: 'info@vdbvastgoed.nl',
      phone: '+31 20 7654321',
      kvkNumber: '12345678',
      rsin: '823456789',
    },
    tenant: { id: 't-11', name: 'Marcus & Isabelle Wijnbergen', email: 'm.wijnbergen@gmail.com' },
    lease: { id: 'l-11', startDate: '2024-09-01', endDate: null, monthlyRent: 2250 },
  },
  {
    id: '6',
    portfolioId: 'pf-2',
    name: 'Duplex Oud-West',
    address: 'Jan Pieter Heijestraat 131, 1054 MB Amsterdam',
    type: 'Appartement',
    status: 'verhuurd',
    monthlyRent: 1875,
    size: 94,
    rooms: 4,
    energyLabel: 'B',
    constructionYear: 1901,
    registration: {
      type: 'bedrijf',
      name: 'VDB Vastgoed BV',
      address: 'Herengracht 182, 1016 BR Amsterdam',
      email: 'info@vdbvastgoed.nl',
      phone: '+31 20 7654321',
      kvkNumber: '12345678',
      rsin: '823456789',
    },
    tenant: { id: 't-4', name: 'Fatima El-Amin', email: 'fatima.elamin@live.nl' },
    lease: { id: 'l-4', startDate: '2021-03-01', endDate: null, monthlyRent: 1875 },
  },
  {
    id: '7',
    portfolioId: 'pf-2',
    name: 'Winkelruimte De Pijp',
    address: 'Albert Cuypstraat 55, 1072 CT Amsterdam',
    type: 'Winkel',
    status: 'verhuurd',
    monthlyRent: 3400,
    size: 120,
    rooms: 2,
    energyLabel: 'C',
    constructionYear: 1925,
    registration: {
      type: 'bedrijf',
      name: 'VDB Vastgoed BV',
      address: 'Herengracht 182, 1016 BR Amsterdam',
      email: 'info@vdbvastgoed.nl',
      phone: '+31 20 7654321',
      kvkNumber: '12345678',
      rsin: '823456789',
    },
    tenant: { id: 't-5', name: 'Bakkerij Van Dijk BV', email: 'info@bakkerijavndijk.nl' },
    lease: { id: 'l-5', startDate: '2020-01-01', endDate: '2025-12-31', monthlyRent: 3400 },
  },
  {
    id: '8',
    portfolioId: 'pf-2',
    name: 'Appartement Haarlem Noord',
    address: 'Generaal Cronjéstraat 14, 2022 AK Haarlem',
    type: 'Appartement',
    status: 'leegstand',
    monthlyRent: 1450,
    size: 66,
    rooms: 2,
    energyLabel: 'E',
    constructionYear: 1968,
    registration: {
      type: 'bedrijf',
      name: 'VDB Vastgoed BV',
      address: 'Herengracht 182, 1016 BR Amsterdam',
      email: 'info@vdbvastgoed.nl',
      phone: '+31 20 7654321',
      kvkNumber: '12345678',
      rsin: '823456789',
    },
    tenant: null,
    lease: null,
  },

  // pf-3 — Smit Onroerend Goed VOF
  {
    id: '4',
    portfolioId: 'pf-3',
    name: 'Kantoorruimte Blaak',
    address: 'Blaak 31, 3011 GA Rotterdam',
    type: 'Kantoor',
    status: 'verhuurd',
    monthlyRent: 4200,
    size: 220,
    rooms: 8,
    energyLabel: 'B',
    constructionYear: 2005,
    registration: {
      type: 'bedrijf',
      name: 'Smit Onroerend Goed VOF',
      address: 'Coolsingel 88, 3012 AG Rotterdam',
      email: 'info@smit-og.nl',
      phone: '+31 10 2223344',
      kvkNumber: '87654321',
      rsin: '987654321',
    },
    tenant: { id: 't-6', name: 'Tech Solutions BV', email: 'info@techsolutions.nl' },
    lease: { id: 'l-6', startDate: '2022-06-01', endDate: '2027-05-31', monthlyRent: 4200 },
  },
  {
    id: '9',
    portfolioId: 'pf-3',
    name: 'Magazijn Waalhaven',
    address: 'Waalhaven ZZ 14, 3089 JH Rotterdam',
    type: 'Bedrijfsruimte',
    status: 'verhuurd',
    monthlyRent: 2800,
    size: 450,
    rooms: 3,
    energyLabel: 'D',
    constructionYear: 1992,
    registration: {
      type: 'bedrijf',
      name: 'Smit Onroerend Goed VOF',
      address: 'Coolsingel 88, 3012 AG Rotterdam',
      email: 'info@smit-og.nl',
      phone: '+31 10 2223344',
      kvkNumber: '87654321',
      rsin: '987654321',
    },
    tenant: { id: 't-7', name: 'Logistiek Noord BV', email: 'planning@logistieknrd.nl' },
    lease: { id: 'l-7', startDate: '2021-01-01', endDate: '2026-12-31', monthlyRent: 2800 },
  },
  {
    id: '10',
    portfolioId: 'pf-3',
    name: 'Gemengd pand Schiedamseweg',
    address: 'Schiedamseweg 88, 3026 AE Rotterdam',
    type: 'Gemengd',
    status: 'leegstand',
    monthlyRent: 2100,
    size: 160,
    rooms: 6,
    energyLabel: 'F',
    constructionYear: 1950,
    registration: {
      type: 'bedrijf',
      name: 'Smit Onroerend Goed VOF',
      address: 'Coolsingel 88, 3012 AG Rotterdam',
      email: 'info@smit-og.nl',
      phone: '+31 10 2223344',
      kvkNumber: '87654321',
      rsin: '987654321',
    },
    tenant: null,
    lease: null,
  },

  // pf-4 — Stichting Woonkansen Utrecht
  {
    id: '11',
    portfolioId: 'pf-4',
    name: 'Woning Lombok',
    address: 'Kanaalstraat 102, 3531 CL Utrecht',
    type: 'Woning',
    status: 'verhuurd',
    monthlyRent: 895,
    size: 78,
    rooms: 3,
    energyLabel: 'C',
    constructionYear: 1965,
    registration: {
      type: 'bedrijf',
      name: 'Stichting Woonkansen Utrecht',
      address: 'Oudegracht 145, 3511 AK Utrecht',
      email: 'beheer@woonkansen.nl',
      phone: '+31 30 1122334',
      kvkNumber: '54321098',
      rsin: '654321098',
    },
    tenant: { id: 't-8', name: 'Amara Diallo', email: 'amara.diallo@gmail.com' },
    lease: { id: 'l-8', startDate: '2020-05-01', endDate: null, monthlyRent: 895 },
  },
  {
    id: '12',
    portfolioId: 'pf-4',
    name: 'Appartement Overvecht',
    address: 'Amsterdamsestraatweg 511, 3553 EC Utrecht',
    type: 'Appartement',
    status: 'achterstand',
    monthlyRent: 780,
    size: 62,
    rooms: 2,
    energyLabel: 'D',
    constructionYear: 1975,
    registration: {
      type: 'bedrijf',
      name: 'Stichting Woonkansen Utrecht',
      address: 'Oudegracht 145, 3511 AK Utrecht',
      email: 'beheer@woonkansen.nl',
      phone: '+31 30 1122334',
      kvkNumber: '54321098',
      rsin: '654321098',
    },
    tenant: { id: 't-9', name: 'Mohammed Rahim', email: 'm.rahim@hotmail.com' },
    lease: { id: 'l-9', startDate: '2019-11-01', endDate: null, monthlyRent: 780 },
  },
  {
    id: '13',
    portfolioId: 'pf-4',
    name: 'Portiekwoning Wittevrouwen',
    address: 'Biltstraat 211, 3572 AE Utrecht',
    type: 'Woning',
    status: 'beëindigd',
    monthlyRent: 950,
    size: 84,
    rooms: 3,
    energyLabel: 'B',
    constructionYear: 1948,
    registration: {
      type: 'bedrijf',
      name: 'Stichting Woonkansen Utrecht',
      address: 'Oudegracht 145, 3511 AK Utrecht',
      email: 'beheer@woonkansen.nl',
      phone: '+31 30 1122334',
      kvkNumber: '54321098',
      rsin: '654321098',
    },
    tenant: { id: 't-10', name: 'Reza Ahmadi', email: 'r.ahmadi@gmail.com' },
    lease: { id: 'l-10', startDate: '2018-02-01', endDate: '2024-01-31', monthlyRent: 950 },
  },

  // pf-5 — Privé A.M. Hendriks
  {
    id: '14',
    portfolioId: 'pf-5',
    name: 'Appartement Statenkwartier',
    address: 'Prins Mauritslaan 12, 2582 LR Den Haag',
    type: 'Appartement',
    status: 'verhuurd',
    monthlyRent: 1725,
    size: 79,
    rooms: 3,
    energyLabel: 'B',
    constructionYear: 1924,
    registration: {
      type: 'persoon',
      name: 'A.M. Hendriks',
      address: 'Laan van Meerdervoort 220, 2563 AP Den Haag',
      email: 'a.hendriks@hetnet.nl',
      phone: '+31 6 55512233',
      kvkNumber: null,
      rsin: null,
    },
    tenant: { id: 't-3', name: 'Julien Moreau', email: 'j.moreau@kpmg.com' },
    lease: { id: 'l-3', startDate: '2024-02-01', endDate: '2027-01-31', monthlyRent: 1725 },
  },
  {
    id: '15',
    portfolioId: 'pf-5',
    name: 'Penthouse Scheveningen',
    address: 'Gevers Deynootweg 90, 2586 BX Den Haag',
    type: 'Appartement',
    status: 'leegstand',
    monthlyRent: 3100,
    size: 118,
    rooms: 4,
    energyLabel: 'A',
    constructionYear: 2020,
    registration: {
      type: 'persoon',
      name: 'A.M. Hendriks',
      address: 'Laan van Meerdervoort 220, 2563 AP Den Haag',
      email: 'a.hendriks@hetnet.nl',
      phone: '+31 6 55512233',
      kvkNumber: null,
      rsin: null,
    },
    tenant: null,
    lease: null,
  },
]

// ─── Huurders ─────────────────────────────────────────────────────────────────
export const mockTenants = [
  {
    id: 't-1',
    name: 'Sophie Vermeer',
    email: 's.vermeer@gmail.com',
    phone: '+31 6 43219876',
    bankAccount: 'NL18 ABNA 0484 9309 86',
    property: mockProperties.find(p => p.id === '1')!,
    lease: { id: 'l-1', startDate: '2022-09-01', endDate: null, monthlyRent: 1650 },
    status: 'actief',
    balance: 0,
    lastPayment: '2026-04-01',
    notes: 'Betaalt altijd stipt via automatische incasso.',
  },
  {
    id: 't-2',
    name: 'Lars & Nina de Boer',
    email: 'lars.deboer@outlook.com',
    phone: '+31 6 76543210',
    bankAccount: 'NL83 RABO 0300 0652 64',
    property: mockProperties.find(p => p.id === '5')!,
    lease: { id: 'l-2', startDate: '2023-04-01', endDate: null, monthlyRent: 3225 },
    status: 'actief',
    balance: 0,
    lastPayment: '2026-04-01',
    notes: 'Jong gezin, verbouwingswensen besproken in jan. 2025.',
  },
  {
    id: 't-3',
    name: 'Julien Moreau',
    email: 'j.moreau@kpmg.com',
    phone: '+31 6 11223344',
    bankAccount: 'NL91 INGB 0001 5555 44',
    property: mockProperties.find(p => p.id === '14')!,
    lease: { id: 'l-3', startDate: '2024-02-01', endDate: '2027-01-31', monthlyRent: 1725 },
    status: 'actief',
    balance: 0,
    lastPayment: '2026-04-01',
    notes: 'Expat, werkzaam bij KPMG Den Haag. Huurgarantie via werkgever.',
  },
  {
    id: 't-4',
    name: 'Fatima El-Amin',
    email: 'fatima.elamin@live.nl',
    phone: '+31 6 98765432',
    bankAccount: 'NL76 TRIO 0380 5059 00',
    property: mockProperties.find(p => p.id === '6')!,
    lease: { id: 'l-4', startDate: '2021-03-01', endDate: null, monthlyRent: 1875 },
    status: 'actief',
    balance: 0,
    lastPayment: '2026-04-05',
    notes: 'Betaalt op de 5e van de maand. Langjarige huurder.',
  },
  {
    id: 't-5',
    name: 'Bakkerij Van Dijk BV',
    email: 'info@bakkerijavndijk.nl',
    phone: '+31 20 5551234',
    bankAccount: 'NL46 ABNA 0528 1789 17',
    property: mockProperties.find(p => p.id === '7')!,
    lease: { id: 'l-5', startDate: '2020-01-01', endDate: '2025-12-31', monthlyRent: 3400 },
    status: 'actief',
    balance: -3400,
    lastPayment: '2026-03-07',
    notes: 'Commercieel huurder. Contract loopt einde 2025 — verlenging in bespreking.',
  },
  {
    id: 't-6',
    name: 'Tech Solutions BV',
    email: 'info@techsolutions.nl',
    phone: '+31 10 9876543',
    bankAccount: 'NL31 RABO 0148 2585 17',
    property: mockProperties.find(p => p.id === '4')!,
    lease: { id: 'l-6', startDate: '2022-06-01', endDate: '2027-05-31', monthlyRent: 4200 },
    status: 'actief',
    balance: 0,
    lastPayment: '2026-03-31',
    notes: 'Betaalt vooruit, altijd einde vorige maand.',
  },
  {
    id: 't-7',
    name: 'Logistiek Noord BV',
    email: 'planning@logistieknrd.nl',
    phone: '+31 10 4442211',
    bankAccount: 'NL64 INGB 0006 5441 52',
    property: mockProperties.find(p => p.id === '9')!,
    lease: { id: 'l-7', startDate: '2021-01-01', endDate: '2026-12-31', monthlyRent: 2800 },
    status: 'actief',
    balance: 0,
    lastPayment: '2026-04-01',
    notes: 'Betrouwbare huurder, heeft magazijn uitgebreid met een aanbouw in 2023.',
  },
  {
    id: 't-8',
    name: 'Amara Diallo',
    email: 'amara.diallo@gmail.com',
    phone: '+31 6 33344455',
    bankAccount: 'NL56 ABNA 0248 9999 44',
    property: mockProperties.find(p => p.id === '11')!,
    lease: { id: 'l-8', startDate: '2020-05-01', endDate: null, monthlyRent: 895 },
    status: 'actief',
    balance: 0,
    lastPayment: '2026-04-01',
    notes: 'Sociale huur, vaste bijdrage Stichting. Onderhoudsmeldingen verloopt altijd goed.',
  },
  {
    id: 't-9',
    name: 'Mohammed Rahim',
    email: 'm.rahim@hotmail.com',
    phone: '+31 6 77788899',
    bankAccount: 'NL29 RABO 0380 0960 33',
    property: mockProperties.find(p => p.id === '12')!,
    lease: { id: 'l-9', startDate: '2019-11-01', endDate: null, monthlyRent: 780 },
    status: 'achterstand',
    balance: -1560,
    lastPayment: '2026-02-10',
    notes: '2 maanden achterstand (mrt + apr 2026). 14-dagenbrief verstuurd mrt 2026.',
  },
  {
    id: 't-10',
    name: 'Reza Ahmadi',
    email: 'r.ahmadi@gmail.com',
    phone: '+31 6 20001122',
    bankAccount: 'NL02 INGB 0000 9999 11',
    property: mockProperties.find(p => p.id === '13')!,
    lease: { id: 'l-10', startDate: '2018-02-01', endDate: '2024-01-31', monthlyRent: 950 },
    status: 'beëindigd',
    balance: 0,
    lastPayment: '2024-01-31',
    notes: 'Contract beëindigd per 1 feb 2024. Borg teruggestort op 2024-02-08.',
  },
  {
    id: 't-11',
    name: 'Marcus & Isabelle Wijnbergen',
    email: 'm.wijnbergen@gmail.com',
    phone: '+31 6 50102030',
    bankAccount: 'NL88 ABNA 0490 1122 33',
    property: mockProperties.find(p => p.id === '2')!,
    lease: { id: 'l-11', startDate: '2024-09-01', endDate: null, monthlyRent: 2250 },
    status: 'actief',
    balance: 0,
    lastPayment: '2026-04-01',
    notes: 'Stel zonder kinderen. Beide werkzaam in Amsterdam. Nieuwe huurder na vertrek Moreau.',
  },
]

// ─── Contracten ───────────────────────────────────────────────────────────────
export const mockLeases = [
  {
    id: 'l-1',
    property: mockProperties.find(p => p.id === '1')!,
    tenant: mockTenants.find(t => t.id === 't-1')!,
    startDate: '2022-09-01', endDate: null, contractType: 'onbepaald',
    monthlyRent: 1650, deposit: 3300, billingDay: 1, noticePeriodMonths: 2,
    indexation: 'cbs', status: 'actief',
    lastIndexation: '2025-09-01', nextIndexation: '2026-09-01',
  },
  {
    id: 'l-2',
    property: mockProperties.find(p => p.id === '5')!,
    tenant: mockTenants.find(t => t.id === 't-2')!,
    startDate: '2023-04-01', endDate: null, contractType: 'onbepaald',
    monthlyRent: 3225, deposit: 6450, billingDay: 1, noticePeriodMonths: 3,
    indexation: 'cbs', status: 'actief',
    lastIndexation: '2025-04-01', nextIndexation: '2026-04-01',
  },
  {
    id: 'l-3',
    property: mockProperties.find(p => p.id === '14')!,
    tenant: mockTenants.find(t => t.id === 't-3')!,
    startDate: '2024-02-01', endDate: '2027-01-31', contractType: 'bepaald',
    monthlyRent: 1725, deposit: 3450, billingDay: 1, noticePeriodMonths: 2,
    indexation: 'cbs', status: 'actief',
    lastIndexation: '2025-02-01', nextIndexation: '2026-02-01',
  },
  {
    id: 'l-4',
    property: mockProperties.find(p => p.id === '6')!,
    tenant: mockTenants.find(t => t.id === 't-4')!,
    startDate: '2021-03-01', endDate: null, contractType: 'onbepaald',
    monthlyRent: 1875, deposit: 3750, billingDay: 5, noticePeriodMonths: 2,
    indexation: 'cbs', status: 'actief',
    lastIndexation: '2025-03-05', nextIndexation: '2026-03-05',
  },
  {
    id: 'l-5',
    property: mockProperties.find(p => p.id === '7')!,
    tenant: mockTenants.find(t => t.id === 't-5')!,
    startDate: '2020-01-01', endDate: '2025-12-31', contractType: 'bepaald',
    monthlyRent: 3400, deposit: 6800, billingDay: 1, noticePeriodMonths: 6,
    indexation: 'markthuur', status: 'actief',
    lastIndexation: '2025-01-01', nextIndexation: '2026-01-01',
  },
  {
    id: 'l-6',
    property: mockProperties.find(p => p.id === '4')!,
    tenant: mockTenants.find(t => t.id === 't-6')!,
    startDate: '2022-06-01', endDate: '2027-05-31', contractType: 'bepaald',
    monthlyRent: 4200, deposit: 8400, billingDay: 1, noticePeriodMonths: 6,
    indexation: 'cbs', status: 'actief',
    lastIndexation: '2025-06-01', nextIndexation: '2026-06-01',
  },
  {
    id: 'l-7',
    property: mockProperties.find(p => p.id === '9')!,
    tenant: mockTenants.find(t => t.id === 't-7')!,
    startDate: '2021-01-01', endDate: '2026-12-31', contractType: 'bepaald',
    monthlyRent: 2800, deposit: 5600, billingDay: 1, noticePeriodMonths: 6,
    indexation: 'cbs', status: 'actief',
    lastIndexation: '2025-01-01', nextIndexation: '2026-01-01',
  },
  {
    id: 'l-8',
    property: mockProperties.find(p => p.id === '11')!,
    tenant: mockTenants.find(t => t.id === 't-8')!,
    startDate: '2020-05-01', endDate: null, contractType: 'onbepaald',
    monthlyRent: 895, deposit: 895, billingDay: 1, noticePeriodMonths: 1,
    indexation: 'geen', status: 'actief',
    lastIndexation: '2024-05-01', nextIndexation: '2025-05-01',
  },
  {
    id: 'l-9',
    property: mockProperties.find(p => p.id === '12')!,
    tenant: mockTenants.find(t => t.id === 't-9')!,
    startDate: '2019-11-01', endDate: null, contractType: 'onbepaald',
    monthlyRent: 780, deposit: 780, billingDay: 1, noticePeriodMonths: 1,
    indexation: 'geen', status: 'achterstand',
    lastIndexation: '2024-11-01', nextIndexation: '2025-11-01',
  },
  {
    id: 'l-10',
    property: mockProperties.find(p => p.id === '13')!,
    tenant: mockTenants.find(t => t.id === 't-10')!,
    startDate: '2018-02-01', endDate: '2024-01-31', contractType: 'bepaald',
    monthlyRent: 950, deposit: 950, billingDay: 1, noticePeriodMonths: 1,
    indexation: 'geen', status: 'beëindigd',
    lastIndexation: null, nextIndexation: null,
  },
  {
    id: 'l-11',
    property: mockProperties.find(p => p.id === '2')!,
    tenant: mockTenants.find(t => t.id === 't-11')!,
    startDate: '2024-09-01', endDate: null, contractType: 'onbepaald',
    monthlyRent: 2250, deposit: 4500, billingDay: 1, noticePeriodMonths: 2,
    indexation: 'cbs', status: 'actief',
    lastIndexation: null, nextIndexation: '2025-09-01',
  },
]

// ─── Betalingsgeschiedenis ────────────────────────────────────────────────────
// 10 maanden historie per actieve huurder (jul 2025 – apr 2026)
// Statuslegenda: betaald | openstaand | achterstallig
// Betaalmethode: SEPA (automatische incasso) | Overboeking

function pay(
  id: string, tenantId: string, propertyId: string, amount: number,
  due: string, paid: string | null, method: string | null,
  status: 'betaald' | 'openstaand' | 'achterstallig' = paid ? 'betaald' : 'openstaand',
) {
  return { id, tenantId, propertyId, amount, type: 'huur', status, dueDate: due, paidDate: paid, paymentMethod: method }
}

export const mockPayments = [
  // ── Borg betalingen (eenmalig bij aanvang) ──────────────────────────────────
  pay('borg-t1',  't-1',  '1',  3300, '2022-09-01', '2022-09-01', 'Overboeking', 'betaald'),
  pay('borg-t2',  't-2',  '5',  6450, '2023-04-01', '2023-04-01', 'Overboeking', 'betaald'),
  pay('borg-t3',  't-3',  '14', 3450, '2024-02-01', '2024-02-01', 'Overboeking', 'betaald'),
  pay('borg-t4',  't-4',  '6',  3750, '2021-03-01', '2021-03-01', 'Overboeking', 'betaald'),
  pay('borg-t5',  't-5',  '7',  6800, '2020-01-01', '2020-01-01', 'Overboeking', 'betaald'),
  pay('borg-t6',  't-6',  '4',  8400, '2022-06-01', '2022-06-01', 'Overboeking', 'betaald'),
  pay('borg-t7',  't-7',  '9',  5600, '2021-01-01', '2021-01-01', 'Overboeking', 'betaald'),
  pay('borg-t8',  't-8',  '11',  895, '2020-05-01', '2020-05-01', 'Overboeking', 'betaald'),
  pay('borg-t9',  't-9',  '12',  780, '2019-11-01', '2019-11-01', 'Overboeking', 'betaald'),
  pay('borg-t11', 't-11', '2',  4500, '2024-09-01', '2024-09-01', 'Overboeking', 'betaald'),

  // ── t-1 Sophie Vermeer — €1.650/mnd, SEPA, stipt ──────────────────────────
  pay('t1-2025-07', 't-1', '1', 1650, '2025-07-01', '2025-07-01', 'SEPA'),
  pay('t1-2025-08', 't-1', '1', 1650, '2025-08-01', '2025-08-01', 'SEPA'),
  pay('t1-2025-09', 't-1', '1', 1650, '2025-09-01', '2025-08-29', 'SEPA'),
  pay('t1-2025-10', 't-1', '1', 1650, '2025-10-01', '2025-10-01', 'SEPA'),
  pay('t1-2025-11', 't-1', '1', 1650, '2025-11-01', '2025-10-31', 'SEPA'),
  pay('t1-2025-12', 't-1', '1', 1650, '2025-12-01', '2025-12-02', 'SEPA'),
  pay('t1-2026-01', 't-1', '1', 1650, '2026-01-01', '2026-01-01', 'SEPA'),
  pay('t1-2026-02', 't-1', '1', 1650, '2026-02-01', '2026-02-01', 'SEPA'),
  pay('t1-2026-03', 't-1', '1', 1650, '2026-03-01', '2026-02-28', 'SEPA'),
  pay('t1-2026-04', 't-1', '1', 1650, '2026-04-01', '2026-04-01', 'SEPA'),

  // ── t-2 Lars & Nina de Boer — €3.225/mnd, SEPA, stipt ────────────────────
  pay('t2-2025-07', 't-2', '5', 3225, '2025-07-01', '2025-07-01', 'SEPA'),
  pay('t2-2025-08', 't-2', '5', 3225, '2025-08-01', '2025-08-01', 'SEPA'),
  pay('t2-2025-09', 't-2', '5', 3225, '2025-09-01', '2025-09-01', 'SEPA'),
  pay('t2-2025-10', 't-2', '5', 3225, '2025-10-01', '2025-10-01', 'SEPA'),
  pay('t2-2025-11', 't-2', '5', 3225, '2025-11-01', '2025-11-01', 'SEPA'),
  pay('t2-2025-12', 't-2', '5', 3225, '2025-12-01', '2025-12-01', 'SEPA'),
  pay('t2-2026-01', 't-2', '5', 3225, '2026-01-01', '2026-01-01', 'SEPA'),
  pay('t2-2026-02', 't-2', '5', 3225, '2026-02-01', '2026-02-01', 'SEPA'),
  pay('t2-2026-03', 't-2', '5', 3225, '2026-03-01', '2026-03-01', 'SEPA'),
  pay('t2-2026-04', 't-2', '5', 3225, '2026-04-01', '2026-04-01', 'SEPA'),

  // ── t-3 Julien Moreau — €1.725/mnd, Overboeking, KPMG-garantie ──────────
  pay('t3-2025-07', 't-3', '14', 1725, '2025-07-01', '2025-07-01', 'Overboeking'),
  pay('t3-2025-08', 't-3', '14', 1725, '2025-08-01', '2025-08-01', 'Overboeking'),
  pay('t3-2025-09', 't-3', '14', 1725, '2025-09-01', '2025-09-01', 'Overboeking'),
  pay('t3-2025-10', 't-3', '14', 1725, '2025-10-01', '2025-10-01', 'Overboeking'),
  pay('t3-2025-11', 't-3', '14', 1725, '2025-11-01', '2025-11-01', 'Overboeking'),
  pay('t3-2025-12', 't-3', '14', 1725, '2025-12-01', '2025-12-01', 'Overboeking'),
  pay('t3-2026-01', 't-3', '14', 1725, '2026-01-01', '2026-01-01', 'Overboeking'),
  pay('t3-2026-02', 't-3', '14', 1725, '2026-02-01', '2026-02-01', 'Overboeking'),
  pay('t3-2026-03', 't-3', '14', 1725, '2026-03-01', '2026-03-01', 'Overboeking'),
  pay('t3-2026-04', 't-3', '14', 1725, '2026-04-01', '2026-04-01', 'Overboeking'),

  // ── t-4 Fatima El-Amin — €1.875/mnd, betaalt op de 5e ───────────────────
  pay('t4-2025-07', 't-4', '6', 1875, '2025-07-05', '2025-07-05', 'Overboeking'),
  pay('t4-2025-08', 't-4', '6', 1875, '2025-08-05', '2025-08-04', 'Overboeking'),
  pay('t4-2025-09', 't-4', '6', 1875, '2025-09-05', '2025-09-05', 'Overboeking'),
  pay('t4-2025-10', 't-4', '6', 1875, '2025-10-05', '2025-10-06', 'Overboeking'),
  pay('t4-2025-11', 't-4', '6', 1875, '2025-11-05', '2025-11-05', 'Overboeking'),
  pay('t4-2025-12', 't-4', '6', 1875, '2025-12-05', '2025-12-05', 'Overboeking'),
  pay('t4-2026-01', 't-4', '6', 1875, '2026-01-05', '2026-01-05', 'Overboeking'),
  pay('t4-2026-02', 't-4', '6', 1875, '2026-02-05', '2026-02-05', 'Overboeking'),
  pay('t4-2026-03', 't-4', '6', 1875, '2026-03-05', '2026-03-05', 'Overboeking'),
  pay('t4-2026-04', 't-4', '6', 1875, '2026-04-05', '2026-04-05', 'Overboeking'),

  // ── t-5 Bakkerij Van Dijk BV — €3.400/mnd, commercieel, soms laat ────────
  pay('t5-2025-07', 't-5', '7', 3400, '2025-07-01', '2025-07-03', 'Overboeking'),
  pay('t5-2025-08', 't-5', '7', 3400, '2025-08-01', '2025-08-01', 'SEPA'),
  pay('t5-2025-09', 't-5', '7', 3400, '2025-09-01', '2025-09-01', 'SEPA'),
  pay('t5-2025-10', 't-5', '7', 3400, '2025-10-01', '2025-10-01', 'SEPA'),
  pay('t5-2025-11', 't-5', '7', 3400, '2025-11-01', '2025-11-12', 'Overboeking'), // 11 dagen te laat
  pay('t5-2025-12', 't-5', '7', 3400, '2025-12-01', '2025-12-01', 'SEPA'),
  pay('t5-2026-01', 't-5', '7', 3400, '2026-01-01', '2026-01-01', 'SEPA'),
  pay('t5-2026-02', 't-5', '7', 3400, '2026-02-01', '2026-02-01', 'SEPA'),
  pay('t5-2026-03', 't-5', '7', 3400, '2026-03-01', '2026-03-07', 'Overboeking'), // 6 dagen te laat
  pay('t5-2026-04', 't-5', '7', 3400, '2026-04-01', null, null, 'openstaand'),

  // ── t-6 Tech Solutions BV — €4.200/mnd, SEPA, betaalt vooruit ────────────
  pay('t6-2025-07', 't-6', '4', 4200, '2025-07-01', '2025-06-30', 'SEPA'),
  pay('t6-2025-08', 't-6', '4', 4200, '2025-08-01', '2025-07-31', 'SEPA'),
  pay('t6-2025-09', 't-6', '4', 4200, '2025-09-01', '2025-08-29', 'SEPA'),
  pay('t6-2025-10', 't-6', '4', 4200, '2025-10-01', '2025-09-30', 'SEPA'),
  pay('t6-2025-11', 't-6', '4', 4200, '2025-11-01', '2025-10-31', 'SEPA'),
  pay('t6-2025-12', 't-6', '4', 4200, '2025-12-01', '2025-11-28', 'SEPA'),
  pay('t6-2026-01', 't-6', '4', 4200, '2026-01-01', '2025-12-31', 'SEPA'),
  pay('t6-2026-02', 't-6', '4', 4200, '2026-02-01', '2026-01-31', 'SEPA'),
  pay('t6-2026-03', 't-6', '4', 4200, '2026-03-01', '2026-02-28', 'SEPA'),
  pay('t6-2026-04', 't-6', '4', 4200, '2026-04-01', '2026-03-31', 'SEPA'),

  // ── t-7 Logistiek Noord BV — €2.800/mnd, SEPA, stipt ─────────────────────
  pay('t7-2025-07', 't-7', '9', 2800, '2025-07-01', '2025-07-01', 'SEPA'),
  pay('t7-2025-08', 't-7', '9', 2800, '2025-08-01', '2025-08-01', 'SEPA'),
  pay('t7-2025-09', 't-7', '9', 2800, '2025-09-01', '2025-09-01', 'SEPA'),
  pay('t7-2025-10', 't-7', '9', 2800, '2025-10-01', '2025-10-01', 'SEPA'),
  pay('t7-2025-11', 't-7', '9', 2800, '2025-11-01', '2025-11-01', 'SEPA'),
  pay('t7-2025-12', 't-7', '9', 2800, '2025-12-01', '2025-12-01', 'SEPA'),
  pay('t7-2026-01', 't-7', '9', 2800, '2026-01-01', '2026-01-01', 'SEPA'),
  pay('t7-2026-02', 't-7', '9', 2800, '2026-02-01', '2026-02-01', 'SEPA'),
  pay('t7-2026-03', 't-7', '9', 2800, '2026-03-01', '2026-03-01', 'SEPA'),
  pay('t7-2026-04', 't-7', '9', 2800, '2026-04-01', '2026-04-01', 'SEPA'),

  // ── t-8 Amara Diallo — €895/mnd, SEPA, sociale huur, altijd betaald ──────
  pay('t8-2025-07', 't-8', '11', 895, '2025-07-01', '2025-07-01', 'SEPA'),
  pay('t8-2025-08', 't-8', '11', 895, '2025-08-01', '2025-08-01', 'SEPA'),
  pay('t8-2025-09', 't-8', '11', 895, '2025-09-01', '2025-09-01', 'SEPA'),
  pay('t8-2025-10', 't-8', '11', 895, '2025-10-01', '2025-10-01', 'SEPA'),
  pay('t8-2025-11', 't-8', '11', 895, '2025-11-01', '2025-11-01', 'SEPA'),
  pay('t8-2025-12', 't-8', '11', 895, '2025-12-01', '2025-12-01', 'SEPA'),
  pay('t8-2026-01', 't-8', '11', 895, '2026-01-01', '2026-01-01', 'SEPA'),
  pay('t8-2026-02', 't-8', '11', 895, '2026-02-01', '2026-02-01', 'SEPA'),
  pay('t8-2026-03', 't-8', '11', 895, '2026-03-01', '2026-03-01', 'SEPA'),
  pay('t8-2026-04', 't-8', '11', 895, '2026-04-01', '2026-04-01', 'SEPA'),

  // ── t-9 Mohammed Rahim — €780/mnd, achterstand vanaf mrt 2026 ────────────
  pay('t9-2025-07', 't-9', '12', 780, '2025-07-01', '2025-07-08', 'Overboeking'),
  pay('t9-2025-08', 't-9', '12', 780, '2025-08-01', '2025-08-06', 'Overboeking'),
  pay('t9-2025-09', 't-9', '12', 780, '2025-09-01', '2025-09-03', 'Overboeking'),
  pay('t9-2025-10', 't-9', '12', 780, '2025-10-01', '2025-10-15', 'Overboeking'), // 14 dagen te laat
  pay('t9-2025-11', 't-9', '12', 780, '2025-11-01', '2025-11-07', 'Overboeking'),
  pay('t9-2025-12', 't-9', '12', 780, '2025-12-01', '2025-12-04', 'Overboeking'),
  pay('t9-2026-01', 't-9', '12', 780, '2026-01-01', '2026-01-09', 'Overboeking'),
  pay('t9-2026-02', 't-9', '12', 780, '2026-02-01', '2026-02-10', 'Overboeking'),
  pay('t9-2026-03', 't-9', '12', 780, '2026-03-01', null, null, 'achterstallig'),
  pay('t9-2026-04', 't-9', '12', 780, '2026-04-01', null, null, 'achterstallig'),

  // ── t-10 Reza Ahmadi — beëindigd per 2024-01-31 ───────────────────────────
  pay('t10-2023-10', 't-10', '13', 950, '2023-10-01', '2023-10-01', 'SEPA'),
  pay('t10-2023-11', 't-10', '13', 950, '2023-11-01', '2023-11-01', 'SEPA'),
  pay('t10-2023-12', 't-10', '13', 950, '2023-12-01', '2023-12-01', 'SEPA'),
  pay('t10-2024-01', 't-10', '13', 950, '2024-01-01', '2024-01-31', 'SEPA'), // laatste huur + sleuteloverdracht

  // ── t-11 Marcus & Isabelle Wijnbergen — €2.250/mnd, SEPA, nieuw ──────────
  pay('t11-2024-09', 't-11', '2', 2250, '2024-09-01', '2024-09-01', 'SEPA'),
  pay('t11-2024-10', 't-11', '2', 2250, '2024-10-01', '2024-10-01', 'SEPA'),
  pay('t11-2024-11', 't-11', '2', 2250, '2024-11-01', '2024-11-01', 'SEPA'),
  pay('t11-2024-12', 't-11', '2', 2250, '2024-12-01', '2024-12-02', 'SEPA'),
  pay('t11-2025-01', 't-11', '2', 2250, '2025-01-01', '2025-01-01', 'SEPA'),
  pay('t11-2025-02', 't-11', '2', 2250, '2025-02-01', '2025-02-01', 'SEPA'),
  pay('t11-2025-03', 't-11', '2', 2250, '2025-03-01', '2025-03-01', 'SEPA'),
  pay('t11-2025-04', 't-11', '2', 2250, '2025-04-01', '2025-04-01', 'SEPA'),
  pay('t11-2025-05', 't-11', '2', 2250, '2025-05-01', '2025-05-01', 'SEPA'),
  pay('t11-2025-06', 't-11', '2', 2250, '2025-06-01', '2025-06-01', 'SEPA'),
  pay('t11-2025-07', 't-11', '2', 2250, '2025-07-01', '2025-07-01', 'SEPA'),
  pay('t11-2025-08', 't-11', '2', 2250, '2025-08-01', '2025-08-01', 'SEPA'),
  pay('t11-2025-09', 't-11', '2', 2250, '2025-09-01', '2025-09-01', 'SEPA'),
  pay('t11-2025-10', 't-11', '2', 2250, '2025-10-01', '2025-10-01', 'SEPA'),
  pay('t11-2025-11', 't-11', '2', 2250, '2025-11-01', '2025-11-01', 'SEPA'),
  pay('t11-2025-12', 't-11', '2', 2250, '2025-12-01', '2025-12-01', 'SEPA'),
  pay('t11-2026-01', 't-11', '2', 2250, '2026-01-01', '2026-01-01', 'SEPA'),
  pay('t11-2026-02', 't-11', '2', 2250, '2026-02-01', '2026-02-01', 'SEPA'),
  pay('t11-2026-03', 't-11', '2', 2250, '2026-03-01', '2026-03-01', 'SEPA'),
  pay('t11-2026-04', 't-11', '2', 2250, '2026-04-01', '2026-04-01', 'SEPA'),
]

// ─── KPI's ────────────────────────────────────────────────────────────────────
const verhuurdeObjecten = mockProperties.filter(p => p.status === 'verhuurd' || p.status === 'achterstand')
const totalRent = verhuurdeObjecten.reduce((sum, p) => sum + p.monthlyRent, 0)

export const mockKPIs = {
  totalProperties: mockProperties.length,
  occupiedProperties: verhuurdeObjecten.length,
  occupancyRate: Math.round((verhuurdeObjecten.length / mockProperties.length) * 100),
  totalMonthlyRevenue: totalRent,
  outstandingPayments: mockTenants.filter(t => t.balance < 0).reduce((sum, t) => sum + Math.abs(t.balance), 0),
  openTickets: 4,
  upcomingIndexations: 3,
  averageRent: Math.round(totalRent / verhuurdeObjecten.length),
}

// ─── Recente activiteiten (chronologisch aflopend) ────────────────────────────
export const mockRecentActivities = [
  // April 2026
  { id: 'act-01', type: 'maintenance', message: 'Onderhoudsverzoek — Schimmel badkamer — M. Rahim (Overvecht)', timestamp: '2026-04-20T14:03:00', property: mockProperties.find(p => p.id === '12')! },
  { id: 'act-02', type: 'payment',     message: 'Huur ontvangen — Lars & Nina de Boer — €3.225', timestamp: '2026-04-01T09:04:00', property: mockProperties.find(p => p.id === '5')! },
  { id: 'act-03', type: 'payment',     message: 'Huur ontvangen — Sophie Vermeer — €1.650', timestamp: '2026-04-01T08:51:00', property: mockProperties.find(p => p.id === '1')! },
  { id: 'act-04', type: 'payment',     message: 'Huur ontvangen — Marcus & Isabelle Wijnbergen — €2.250', timestamp: '2026-04-01T08:45:00', property: mockProperties.find(p => p.id === '2')! },
  { id: 'act-05', type: 'alert',       message: 'Huur niet ontvangen — Mohammed Rahim — april 2026 (2e maand)', timestamp: '2026-04-05T08:00:00', property: mockProperties.find(p => p.id === '12')! },
  { id: 'act-06', type: 'payment',     message: 'Huur ontvangen — Fatima El-Amin — €1.875', timestamp: '2026-04-05T10:22:00', property: mockProperties.find(p => p.id === '6')! },
  { id: 'act-07', type: 'document',    message: 'Huurovereenkomst verlengd geüpload — Julien Moreau t/m jan 2027', timestamp: '2026-04-03T11:00:00', property: mockProperties.find(p => p.id === '14')! },

  // Maart 2026
  { id: 'act-08', type: 'alert',       message: 'Huur niet ontvangen — Mohammed Rahim — maart 2026 (1e maand)', timestamp: '2026-03-08T08:00:00', property: mockProperties.find(p => p.id === '12')! },
  { id: 'act-09', type: 'payment',     message: 'Huur ontvangen (te laat) — Bakkerij Van Dijk BV — €3.400 (+6 dagen)', timestamp: '2026-03-07T15:44:00', property: mockProperties.find(p => p.id === '7')! },
  { id: 'act-10', type: 'letter',      message: '14-dagenbrief verstuurd — Mohammed Rahim — achterstand €780', timestamp: '2026-03-01T09:00:00', property: mockProperties.find(p => p.id === '12')! },
  { id: 'act-11', type: 'maintenance', message: 'Reparatie ingepland — Cv-ketel Oud-West — Akkerman Installaties 14 apr', timestamp: '2026-03-28T10:15:00', property: mockProperties.find(p => p.id === '6')! },
  { id: 'act-12', type: 'payment',     message: 'Huur vooruitbetaald — Tech Solutions BV — €4.200 (april)', timestamp: '2026-03-31T07:58:00', property: mockProperties.find(p => p.id === '4')! },

  // Februari 2026
  { id: 'act-13', type: 'payment',     message: 'Huur ontvangen — Mohammed Rahim — €780 (laatste betaling)', timestamp: '2026-02-10T13:22:00', property: mockProperties.find(p => p.id === '12')! },
  { id: 'act-14', type: 'maintenance', message: 'Cv-ketel storing gemeld — Fatima El-Amin — foutcode E3', timestamp: '2026-02-18T17:40:00', property: mockProperties.find(p => p.id === '6')! },
  { id: 'act-15', type: 'document',    message: 'Energielabel A geüpload — Coolhaven 22C Rotterdam', timestamp: '2026-02-12T09:30:00', property: mockProperties.find(p => p.id === '5')! },

  // Januari 2026
  { id: 'act-16', type: 'indexation',  message: 'Huurindexatie doorgevoerd — Sophie Vermeer — €1.600 → €1.650 (+3,1% CBS)', timestamp: '2026-01-01T08:00:00', property: mockProperties.find(p => p.id === '1')! },
  { id: 'act-17', type: 'payment',     message: 'Huur ontvangen — alle huurders — januari incasso geslaagd', timestamp: '2026-01-01T09:00:00', property: mockProperties.find(p => p.id === '1')! },

  // December 2025
  { id: 'act-18', type: 'payment',     message: 'Huur ontvangen — Lars & Nina de Boer — €3.225', timestamp: '2025-12-01T08:55:00', property: mockProperties.find(p => p.id === '5')! },
  { id: 'act-19', type: 'maintenance', message: 'Lekkage gemeld — Keizersgracht 312 — dakgoot verstopt', timestamp: '2025-12-14T16:05:00', property: mockProperties.find(p => p.id === '1')! },
  { id: 'act-20', type: 'maintenance', message: 'Lekkage verholpen — Keizersgracht 312 — dakrond gerepareerd', timestamp: '2025-12-19T11:30:00', property: mockProperties.find(p => p.id === '1')! },

  // November 2025
  { id: 'act-21', type: 'payment',     message: 'Huur te laat ontvangen — Bakkerij Van Dijk BV — €3.400 (+11 dagen)', timestamp: '2025-11-12T14:10:00', property: mockProperties.find(p => p.id === '7')! },
  { id: 'act-22', type: 'document',    message: 'Jaarlijkse inspectie uitgevoerd — Blaak 31 Rotterdam', timestamp: '2025-11-05T10:00:00', property: mockProperties.find(p => p.id === '4')! },

  // Oktober 2025
  { id: 'act-23', type: 'payment',     message: 'Huur te laat — Mohammed Rahim — €780 (+14 dagen)', timestamp: '2025-10-15T11:00:00', property: mockProperties.find(p => p.id === '12')! },
  { id: 'act-24', type: 'indexation',  message: 'Huurindexatie — Lars & Nina de Boer — €3.100 → €3.225 (+4,0%)', timestamp: '2025-10-01T08:00:00', property: mockProperties.find(p => p.id === '5')! },

  // September 2025
  { id: 'act-25', type: 'lease',       message: 'Nieuw huurcontract getekend — Marcus & Isabelle Wijnbergen — Zuidas', timestamp: '2024-08-20T14:00:00', property: mockProperties.find(p => p.id === '2')! },
]

// ─── Onderhoud ────────────────────────────────────────────────────────────────
export const mockMaintenanceRequests = [
  {
    id: 'm-1',
    property: mockProperties.find(p => p.id === '12')!,
    tenant: mockTenants.find(t => t.id === 't-9')!,
    title: 'Schimmel in badkamer',
    description: 'Schimmelvorming aangetroffen op de voeg rondom de douchecabine en muur ertegenover. Al langer zichtbaar.',
    priority: 'hoog', status: 'open',
    createdAt: '2026-04-20', assignedTo: null,
  },
  {
    id: 'm-2',
    property: mockProperties.find(p => p.id === '6')!,
    tenant: mockTenants.find(t => t.id === 't-4')!,
    title: 'Cv-ketel storing — foutcode E3',
    description: 'De cv-ketel geeft foutcode E3 bij opstarten en schakelt soms spontaan uit. Melding al in feb. 2026 gemaakt.',
    priority: 'urgent', status: 'in_behandeling',
    createdAt: '2026-02-18', assignedTo: 'Akkerman Installaties — afspraak 14 apr.',
  },
  {
    id: 'm-3',
    property: mockProperties.find(p => p.id === '4')!,
    tenant: mockTenants.find(t => t.id === 't-6')!,
    title: 'Schilderwerk buitenkant nodig',
    description: 'Verflaag voorgevel bladdert. Aangemerkt bij jaarlijkse inspectie november 2025. Offerte De Wit aangevraagd.',
    priority: 'laag', status: 'gepland',
    createdAt: '2025-11-05', assignedTo: 'Schildersbedrijf De Wit — gepland mei 2026',
  },
  {
    id: 'm-4',
    property: mockProperties.find(p => p.id === '1')!,
    tenant: mockTenants.find(t => t.id === 't-1')!,
    title: 'Lekkage dakgoot',
    description: 'Dakgoot verstopt, water liep langs gevel. Gerepareerd dec. 2025.',
    priority: 'normaal', status: 'afgerond',
    createdAt: '2025-12-14', assignedTo: 'Dakdekker Snel BV',
  },
]

// ─── Uitgaven ─────────────────────────────────────────────────────────────────
export const mockExpenses = [
  { id: 'exp-1', description: 'Reparatie dakgoot Keizersgracht', amount: 380, date: '2025-12-19', category: 'Onderhoud', property: mockProperties.find(p => p.id === '1')!, invoice: 'factuur-dakdekker-dec25.pdf' },
  { id: 'exp-2', description: 'Inspectie Blaak 31 — jaarlijks', amount: 225, date: '2025-11-05', category: 'Inspectie', property: mockProperties.find(p => p.id === '4')!, invoice: 'factuur-inspectie-nov25.pdf' },
  { id: 'exp-3', description: 'Opstalverzekering alle panden Q1 2026', amount: 1240, date: '2026-01-01', category: 'Verzekering', property: null, invoice: 'polis-nn-2026-Q1.pdf' },
  { id: 'exp-4', description: 'VvE bijdrage Keizersgracht jan–apr 2026', amount: 700, date: '2026-01-01', category: 'VvE', property: mockProperties.find(p => p.id === '1')!, invoice: null },
  { id: 'exp-5', description: 'Gemeentelijke belastingen Rotterdam 2026', amount: 940, date: '2026-02-01', category: 'Belasting', property: mockProperties.find(p => p.id === '4')!, invoice: 'aanslag-rotterdam-2026.pdf' },
  { id: 'exp-6', description: 'Offerte schilderwerk Blaak (goedgekeurd)', amount: 3200, date: '2026-04-02', category: 'Onderhoud', property: mockProperties.find(p => p.id === '4')!, invoice: 'offerte-dewit-apr26.pdf' },
  { id: 'exp-7', description: 'Brandmelder vervangen Kanaalstraat', amount: 95, date: '2026-04-14', category: 'Onderhoud', property: mockProperties.find(p => p.id === '11')!, invoice: 'factuur-elektra-apr26.pdf' },
  { id: 'exp-8', description: 'Administratiekosten Q1 2026', amount: 350, date: '2026-04-01', category: 'Administratie', property: null, invoice: null },
]

// ─── Documenten ───────────────────────────────────────────────────────────────
export const mockDocuments = [
  { id: 'doc-01', name: 'Huurcontract Sophie Vermeer.pdf', type: 'Contract', property: mockProperties.find(p => p.id === '1')!, uploadDate: '2022-09-01', size: '312 KB', url: '/documents/contract-vermeer.pdf' },
  { id: 'doc-02', name: 'Plaatsbeschrijving Keizersgracht.pdf', type: 'Plaatsbeschrijving', property: mockProperties.find(p => p.id === '1')!, uploadDate: '2022-09-01', size: '2.1 MB', url: '/documents/plaatsbeschrijving-vermeer.pdf' },
  { id: 'doc-03', name: 'Huurcontract Lars & Nina de Boer.pdf', type: 'Contract', property: mockProperties.find(p => p.id === '5')!, uploadDate: '2023-04-01', size: '298 KB', url: '/documents/contract-deboer.pdf' },
  { id: 'doc-04', name: 'Huurcontract Julien Moreau — Den Haag.pdf', type: 'Contract', property: mockProperties.find(p => p.id === '14')!, uploadDate: '2024-02-01', size: '305 KB', url: '/documents/contract-moreau-dh.pdf' },
  { id: 'doc-05', name: 'Huurcontract Marcus & Isabelle Wijnbergen.pdf', type: 'Contract', property: mockProperties.find(p => p.id === '2')!, uploadDate: '2024-09-01', size: '318 KB', url: '/documents/contract-wijnbergen.pdf' },
  { id: 'doc-06', name: 'Huurcontract Fatima El-Amin.pdf', type: 'Contract', property: mockProperties.find(p => p.id === '6')!, uploadDate: '2021-03-01', size: '290 KB', url: '/documents/contract-elamin.pdf' },
  { id: 'doc-07', name: 'Huurcontract Tech Solutions BV.pdf', type: 'Contract', property: mockProperties.find(p => p.id === '4')!, uploadDate: '2022-06-01', size: '450 KB', url: '/documents/contract-techsolutions.pdf' },
  { id: 'doc-08', name: 'Energielabel A — Coolhaven 22C.pdf', type: 'Certificaat', property: mockProperties.find(p => p.id === '5')!, uploadDate: '2026-02-12', size: '210 KB', url: '/documents/energielabel-coolhaven.pdf' },
  { id: 'doc-09', name: 'Elektra-keuring Keizersgracht 2024.pdf', type: 'Keuring', property: mockProperties.find(p => p.id === '1')!, uploadDate: '2024-03-15', size: '890 KB', url: '/documents/keuring-keizersgracht-2024.pdf' },
  { id: 'doc-10', name: 'Opstalverzekering 2026 NN.pdf', type: 'Verzekering', property: null, uploadDate: '2026-01-01', size: '612 KB', url: '/documents/verzekering-nn-2026.pdf' },
  { id: 'doc-11', name: 'Jaarlijkse inspectie Blaak 31 — 2025.pdf', type: 'Inspectie', property: mockProperties.find(p => p.id === '4')!, uploadDate: '2025-11-05', size: '1.8 MB', url: '/documents/inspectie-blaak-2025.pdf' },
  { id: 'doc-12', name: 'Plaatsbeschrijving Fatima El-Amin.pdf', type: 'Plaatsbeschrijving', property: mockProperties.find(p => p.id === '6')!, uploadDate: '2021-03-01', size: '1.4 MB', url: '/documents/plaatsbeschrijving-elamin.pdf' },
]

// ─── Omzetgrafiek ─────────────────────────────────────────────────────────────
export const mockRevenueData = [
  { month: 'Okt \'25', revenue: 18975 },
  { month: 'Nov \'25', revenue: 19450 },
  { month: 'Dec \'25', revenue: 19450 },
  { month: 'Jan \'26', revenue: 20225 },
  { month: 'Feb \'26', revenue: 20225 },
  { month: 'Mrt \'26', revenue: 16825 }, // Bakkerij te laat, Rahim niet betaald
  { month: 'Apr \'26', revenue: 16825 }, // Bakkerij openstaand + Rahim achterstallig
]

// ─── Bezettingsgraad ──────────────────────────────────────────────────────────
export const mockOccupancyData = [
  { month: 'Okt \'25', occupancy: 73 },
  { month: 'Nov \'25', occupancy: 73 },
  { month: 'Dec \'25', occupancy: 73 },
  { month: 'Jan \'26', occupancy: 80 },
  { month: 'Feb \'26', occupancy: 80 },
  { month: 'Mrt \'26', occupancy: 80 },
  { month: 'Apr \'26', occupancy: mockKPIs.occupancyRate },
]

// ─── Compliance ───────────────────────────────────────────────────────────────
export const mockCompliance = [
  {
    propertyId: '1', property: mockProperties.find(p => p.id === '1')!,
    smokeDetectors: true,
    electricityInspection: { valid: true, expiryDate: '2029-03-15', documentId: 'doc-09' },
    insurance: { valid: true, expiryDate: '2026-12-31', documentId: 'doc-10' },
    tenantInsurance: true, overallStatus: 'green',
  },
  {
    propertyId: '2', property: mockProperties.find(p => p.id === '2')!,
    smokeDetectors: true,
    electricityInspection: { valid: true, expiryDate: '2027-09-01', documentId: null },
    insurance: { valid: true, expiryDate: '2026-12-31', documentId: 'doc-10' },
    tenantInsurance: true, overallStatus: 'green',
  },
  {
    propertyId: '6', property: mockProperties.find(p => p.id === '6')!,
    smokeDetectors: true,
    electricityInspection: { valid: true, expiryDate: '2027-03-01', documentId: null },
    insurance: { valid: true, expiryDate: '2026-12-31', documentId: 'doc-10' },
    tenantInsurance: true, overallStatus: 'green',
  },
  {
    propertyId: '12', property: mockProperties.find(p => p.id === '12')!,
    smokeDetectors: false,
    electricityInspection: { valid: false, expiryDate: null, documentId: null },
    insurance: { valid: true, expiryDate: '2026-12-31', documentId: 'doc-10' },
    tenantInsurance: false, overallStatus: 'red',
  },
  {
    propertyId: '4', property: mockProperties.find(p => p.id === '4')!,
    smokeDetectors: true,
    electricityInspection: { valid: true, expiryDate: '2026-06-01', documentId: 'doc-11' },
    insurance: { valid: true, expiryDate: '2026-12-31', documentId: 'doc-10' },
    tenantInsurance: true, overallStatus: 'orange',
  },
]

// ─── Huurachterstand procedures ───────────────────────────────────────────────
export const mockRentArrearsProcedures = [
  {
    id: 'arr-1',
    tenant: mockTenants.find(t => t.id === 't-9')!,
    property: mockProperties.find(p => p.id === '12')!,
    totalArrears: 1560,
    daysPastDue: 54,
    startDate: '2026-03-01',
    status: 'in_behandeling',
    steps: [
      { step: 1, name: 'Herinnering verstuurd', completed: true, completedDate: '2026-03-08', document: 'herinnering-rahim-mrt26.pdf', notes: 'E-mail herinnering verstuurd' },
      { step: 2, name: 'Telefonisch contact', completed: true, completedDate: '2026-03-12', document: null, notes: 'Geen opname, voicemail ingesproken. Niet teruggebeld.' },
      { step: 3, name: '14-dagenbrief verstuurd', completed: true, completedDate: '2026-03-15', document: '14dagenbrief-rahim-mrt26.pdf', notes: 'Aangetekend verstuurd, ontvangst bevestigd.' },
      { step: 4, name: 'Vroegsignalering gemeente', completed: false, completedDate: null, document: null, notes: '' },
      { step: 5, name: 'Juridisch traject', completed: false, completedDate: null, document: null, notes: '' },
    ],
  },
]

// ─── Brief templates ──────────────────────────────────────────────────────────
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
