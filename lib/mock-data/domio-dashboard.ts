/**
 * Centraal mock data bestand voor Domio Dashboard.
 * Alle data is hardcoded Nederlands; geen backend.
 */

export type Sector = 'Vrij' | 'Midden' | 'Sociaal'

export type ComplianceStatus =
  | 'compliant'
  | 'puntentelling_verlopen'
  | 'huur_boven_max'
  | 'pdf_mist'
  | 'energielabel_verloopt'
  | 'leegstand'

export interface PortfolioObject {
  id: string
  address: string
  sector: Sector
  points: number
  rent: number // huidige huur €/maand
  maxRent: number // max huurprijs €/maand
  tenantName: string | null
  status: string // bijv. "Verhuurd, compliant"
  complianceStatus: ComplianceStatus
  bar: number // rendement %
  // voor detailpagina
  type?: string
  size?: number // m²
  buildYear?: number
  energyLabel?: string
  wozValue?: number
  rooms?: number
  outdoorSpace?: number // m²
}

export const portfolioObjects: PortfolioObject[] = [
  { id: '1', address: 'Keizersgracht 12-A', sector: 'Vrij', points: 194, rent: 1450, maxRent: 1612, tenantName: 'J. van der Berg', status: 'Verhuurd, compliant', complianceStatus: 'compliant', bar: 5.2 },
  { id: '2', address: 'Keizersgracht 12-B', sector: 'Midden', points: 168, rent: 1050, maxRent: 1085, tenantName: 'A. Yilmaz', status: 'Verhuurd, ⚠ puntentelling verlopen', complianceStatus: 'puntentelling_verlopen', bar: 4.8 },
  { id: '3', address: 'Prinsengracht 8-1', sector: 'Midden', points: 172, rent: 1180, maxRent: 1135, tenantName: 'S. de Boer', status: 'Verhuurd, 🔴 huur boven max', complianceStatus: 'huur_boven_max', bar: 4.1 },
  { id: '4', address: 'Prinsengracht 8-3', sector: 'Vrij', points: 201, rent: 1550, maxRent: 1680, tenantName: 'K. Meijer', status: 'Verhuurd, compliant', complianceStatus: 'compliant', bar: 5.5 },
  { id: '5', address: 'Herengracht 45-2', sector: 'Vrij', points: 212, rent: 1780, maxRent: 1895, tenantName: 'R. Hendriks', status: 'Verhuurd, compliant', complianceStatus: 'compliant', bar: 6.1 },
  { id: '6', address: 'Vondelstraat 22', sector: 'Midden', points: 178, rent: 1100, maxRent: 1150, tenantName: 'E. de Groot', status: 'Verhuurd, ⚠ PDF mist bij contract', complianceStatus: 'pdf_mist', bar: 4.4 },
  { id: '7', address: 'Singel 88', sector: 'Vrij', points: 189, rent: 1380, maxRent: 1425, tenantName: 'P. Jansen', status: 'Verhuurd, ⚠ energielabel verloopt', complianceStatus: 'energielabel_verloopt', bar: 5.0 },
  { id: '8', address: 'Rozengracht 14-1', sector: 'Sociaal', points: 128, rent: 780, maxRent: 810, tenantName: 'F. El Amrani', status: 'Verhuurd, compliant', complianceStatus: 'compliant', bar: 3.2 },
  { id: '9', address: 'Rozengracht 14-2', sector: 'Midden', points: 155, rent: 0, maxRent: 985, tenantName: null, status: 'Leegstand', complianceStatus: 'leegstand', bar: 0 },
  { id: '10', address: 'Westerstraat 67', sector: 'Vrij', points: 198, rent: 1520, maxRent: 1640, tenantName: 'L. Visser', status: 'Verhuurd, compliant', complianceStatus: 'compliant', bar: 5.8 },
]

// Uitgebreide velden voor objectdetail (zelfde volgorde als portfolioObjects)
const objectDetails = [
  { type: 'Appartement', size: 72, buildYear: 1920, energyLabel: 'C', wozValue: 385000, rooms: 3, outdoorSpace: 12 },
  { type: 'Appartement', size: 58, buildYear: 1920, energyLabel: 'D', wozValue: 298000, rooms: 2, outdoorSpace: 0 },
  { type: 'Appartement', size: 65, buildYear: 1875, energyLabel: 'E', wozValue: 312000, rooms: 2, outdoorSpace: 8 },
  { type: 'Appartement', size: 78, buildYear: 1875, energyLabel: 'B', wozValue: 420000, rooms: 3, outdoorSpace: 15 },
  { type: 'Appartement', size: 95, buildYear: 1890, energyLabel: 'A', wozValue: 565000, rooms: 4, outdoorSpace: 20 },
  { type: 'Appartement', size: 62, buildYear: 1910, energyLabel: 'C', wozValue: 295000, rooms: 2, outdoorSpace: 5 },
  { type: 'Appartement', size: 68, buildYear: 1905, energyLabel: 'D', wozValue: 335000, rooms: 2, outdoorSpace: 10 },
  { type: 'Appartement', size: 48, buildYear: 1930, energyLabel: 'C', wozValue: 185000, rooms: 2, outdoorSpace: 0 },
  { type: 'Appartement', size: 52, buildYear: 1930, energyLabel: 'D', wozValue: 198000, rooms: 2, outdoorSpace: 0 },
  { type: 'Appartement', size: 82, buildYear: 1880, energyLabel: 'B', wozValue: 445000, rooms: 3, outdoorSpace: 18 },
]
portfolioObjects.forEach((obj, i) => {
  Object.assign(obj, objectDetails[i])
})

export const portfolioTotals = {
  totalObjects: 24,
  occupancyPercent: 95.8,
  monthlyRentIncome: 28400,
  monthlyCosts: 5000,
  complianceScore: 92,
  objectsThisMonth: 2, // ↑2 deze maand
}

// ——— Tickets (onderhoud) ———
export type TicketStatus = 'nieuw' | 'in_behandeling' | 'wacht_op_huurder' | 'afgerond'
export type TicketPriority = 'urgent' | 'hoog' | 'normaal' | 'laag'

export interface MaintenanceTicket {
  id: string
  number: number
  title: string
  address: string
  tenantName: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  assignedTo?: string
  photoUrl?: string
}

export const maintenanceTickets: MaintenanceTicket[] = [
  { id: '1', number: 1042, title: 'Lekkage badkamer', address: 'Prinsengracht 8-3', tenantName: 'K. Meijer', status: 'nieuw', priority: 'urgent', createdAt: '2026-02-09' },
  { id: '2', number: 1043, title: 'Deurbel defect', address: 'Westerstraat 67', tenantName: 'L. Visser', status: 'nieuw', priority: 'laag', createdAt: '2026-02-09' },
  { id: '3', number: 1040, title: 'CV-ketel storing', address: 'Herengracht 45-2', tenantName: 'R. Hendriks', status: 'in_behandeling', priority: 'urgent', createdAt: '2026-02-07', assignedTo: 'Warmte BV' },
  { id: '4', number: 1041, title: 'Schimmel slaapkamer', address: 'Rozengracht 14-1', tenantName: 'F. El Amrani', status: 'in_behandeling', priority: 'hoog', createdAt: '2026-02-06', assignedTo: 'Wacht op inspectie' },
  { id: '5', number: 1039, title: 'Afvoer verstopt', address: 'Keizersgracht 12-A', tenantName: 'J. van der Berg', status: 'wacht_op_huurder', priority: 'normaal', createdAt: '2026-02-05' },
  { id: '6', number: 1038, title: 'Kozijn schilderen', address: 'Singel 88', tenantName: 'P. Jansen', status: 'afgerond', priority: 'laag', createdAt: '2026-02-01' },
  { id: '7', number: 1037, title: 'Kapotte ruit', address: 'Vondelstraat 22', tenantName: 'E. de Groot', status: 'afgerond', priority: 'urgent', createdAt: '2026-01-28' },
  { id: '8', number: 1036, title: 'Thermostaat vervangen', address: 'Prinsengracht 8-1', tenantName: 'S. de Boer', status: 'afgerond', priority: 'normaal', createdAt: '2026-01-25' },
]

// ——— Facturen ———
export type InvoiceStatus = 'betaald' | 'open' | 'verlopen'

export interface Invoice {
  id: string
  invoiceNumber: string
  tenantName: string
  address: string
  amount: number
  dueDate: string
  status: InvoiceStatus
  paidDate?: string
}

export const invoices: Invoice[] = [
  { id: '1', invoiceNumber: 'F-2026-001', tenantName: 'J. van der Berg', address: 'Keizersgracht 12-A', amount: 1450, dueDate: '2026-01-01', status: 'betaald', paidDate: '2025-12-28' },
  { id: '2', invoiceNumber: 'F-2026-002', tenantName: 'A. Yilmaz', address: 'Keizersgracht 12-B', amount: 1050, dueDate: '2026-01-01', status: 'open' },
  { id: '3', invoiceNumber: 'F-2026-003', tenantName: 'S. de Boer', address: 'Prinsengracht 8-1', amount: 1180, dueDate: '2026-01-01', status: 'verlopen' },
  { id: '4', invoiceNumber: 'F-2026-004', tenantName: 'K. Meijer', address: 'Prinsengracht 8-3', amount: 1550, dueDate: '2026-01-01', status: 'betaald', paidDate: '2026-01-02' },
  { id: '5', invoiceNumber: 'F-2026-005', tenantName: 'R. Hendriks', address: 'Herengracht 45-2', amount: 1780, dueDate: '2026-01-01', status: 'betaald', paidDate: '2025-12-30' },
  { id: '6', invoiceNumber: 'F-2026-006', tenantName: 'E. de Groot', address: 'Vondelstraat 22', amount: 1100, dueDate: '2026-01-01', status: 'open' },
  { id: '7', invoiceNumber: 'F-2026-007', tenantName: 'P. Jansen', address: 'Singel 88', amount: 1380, dueDate: '2026-01-01', status: 'betaald', paidDate: '2026-01-03' },
  { id: '8', invoiceNumber: 'F-2026-008', tenantName: 'F. El Amrani', address: 'Rozengracht 14-1', amount: 780, dueDate: '2026-01-01', status: 'betaald', paidDate: '2025-12-29' },
  { id: '9', invoiceNumber: 'F-2026-009', tenantName: 'L. Visser', address: 'Westerstraat 67', amount: 1520, dueDate: '2026-01-01', status: 'betaald', paidDate: '2026-01-01' },
  { id: '10', invoiceNumber: 'F-2026-010', tenantName: 'J. van der Berg', address: 'Keizersgracht 12-A', amount: 1450, dueDate: '2026-02-01', status: 'betaald', paidDate: '2026-02-01' },
  { id: '11', invoiceNumber: 'F-2026-011', tenantName: 'A. Yilmaz', address: 'Keizersgracht 12-B', amount: 1050, dueDate: '2026-02-01', status: 'open' },
  { id: '12', invoiceNumber: 'F-2026-012', tenantName: 'K. Meijer', address: 'Prinsengracht 8-3', amount: 1550, dueDate: '2026-02-01', status: 'open' },
  { id: '13', invoiceNumber: 'F-2026-013', tenantName: 'E. de Groot', address: 'Vondelstraat 22', amount: 1100, dueDate: '2026-02-01', status: 'verlopen' },
  { id: '14', invoiceNumber: 'F-2026-014', tenantName: 'F. El Amrani', address: 'Rozengracht 14-1', amount: 780, dueDate: '2026-02-01', status: 'betaald', paidDate: '2026-01-31' },
  { id: '15', invoiceNumber: 'F-2026-015', tenantName: 'L. Visser', address: 'Westerstraat 67', amount: 1520, dueDate: '2026-02-01', status: 'betaald', paidDate: '2026-02-02' },
]

// Openstaande facturen totaal (voor KPI)
export const openInvoicesTotal = 4250 // €4.250

// ——— Berichten (conversaties) ———
export interface ChatMessage {
  id: string
  sender: 'user' | 'tenant'
  text: string
  time: string
}

export interface Conversation {
  id: string
  tenantName: string
  address: string
  lastMessage: string
  lastTime: string
  unread: number
  messages: ChatMessage[]
}

export const conversations: Conversation[] = [
  {
    id: '1',
    tenantName: 'K. Meijer',
    address: 'Prinsengracht 8-3',
    lastMessage: 'De loodgieter is geweest, lekkage is verholpen. Bedankt!',
    lastTime: '10:32',
    unread: 0,
    messages: [
      { id: 'm1', sender: 'tenant', text: 'Hallo, er lekt water in de badkamer bij de radiator.', time: '09:15' },
      { id: 'm2', sender: 'user', text: 'Dag mevrouw Meijer, we sturen vandaag nog een loodgieter.', time: '09:22' },
      { id: 'm3', sender: 'tenant', text: 'De loodgieter is geweest, lekkage is verholpen. Bedankt!', time: '10:32' },
    ],
  },
  {
    id: '2',
    tenantName: 'J. van der Berg',
    address: 'Keizersgracht 12-A',
    lastMessage: 'Wanneer komt de inspectie?',
    lastTime: 'gisteren',
    unread: 1,
    messages: [
      { id: 'm4', sender: 'tenant', text: 'Wanneer komt de inspectie?', time: 'gisteren 14:00' },
    ],
  },
  {
    id: '3',
    tenantName: 'E. de Groot',
    address: 'Vondelstraat 22',
    lastMessage: 'Ik heb de huur overgemaakt.',
    lastTime: '2 dagen',
    unread: 0,
    messages: [
      { id: 'm5', sender: 'tenant', text: 'Ik heb de huur overgemaakt.', time: '2 dagen geleden' },
      { id: 'm6', sender: 'user', text: 'Ontvangen, dank u wel.', time: '2 dagen geleden' },
    ],
  },
  {
    id: '4',
    tenantName: 'R. Hendriks',
    address: 'Herengracht 45-2',
    lastMessage: 'De CV doet het weer, dank.',
    lastTime: '3 dagen',
    unread: 0,
    messages: [
      { id: 'm7', sender: 'tenant', text: 'De CV doet het weer, dank.', time: '3 dagen geleden' },
    ],
  },
  {
    id: '5',
    tenantName: 'L. Visser',
    address: 'Westerstraat 67',
    lastMessage: 'De deurbel is gerepareerd.',
    lastTime: '1 week',
    unread: 0,
    messages: [
      { id: 'm8', sender: 'user', text: 'We hebben een monteur ingepland voor de deurbel.', time: '1 week geleden' },
      { id: 'm9', sender: 'tenant', text: 'De deurbel is gerepareerd.', time: '1 week geleden' },
    ],
  },
]

// ——— Recente activiteit (tijdlijn) ———
export interface ActivityItem {
  id: string
  type: 'huur_ontvangen' | 'storingsmelding' | 'contract_verlengd' | 'wws_herberekening' | 'nieuwe_huurder'
  title: string
  subtitle: string
  amount?: number
  time: string
}

export const recentActivities: ActivityItem[] = [
  { id: '1', type: 'huur_ontvangen', title: 'Huur ontvangen', subtitle: 'Keizersgracht 12-A', amount: 1450, time: '2 uur geleden' },
  { id: '2', type: 'storingsmelding', title: 'Storingsmelding', subtitle: 'Prinsengracht 8-3 - Lekkage badkamer', time: '5 uur geleden' },
  { id: '3', type: 'contract_verlengd', title: 'Contract verlengd', subtitle: 'Herengracht 45-2', time: 'gisteren' },
  { id: '4', type: 'wws_herberekening', title: 'WWS-herberekening', subtitle: '3 woningen geüpdatet', time: 'gisteren' },
  { id: '5', type: 'nieuwe_huurder', title: 'Nieuwe huurder', subtitle: 'Vondelstraat 22 - Emma de Groot', time: '2 dagen geleden' },
  { id: '6', type: 'huur_ontvangen', title: 'Huur ontvangen', subtitle: 'Westerstraat 67', amount: 1520, time: '3 dagen geleden' },
  { id: '7', type: 'storingsmelding', title: 'Ticket afgerond', subtitle: 'Singel 88 - Kozijn schilderen', time: '5 dagen geleden' },
  { id: '8', type: 'contract_verlengd', title: 'Contract getekend', subtitle: 'Rozengracht 14-1', time: '1 week geleden' },
  { id: '9', type: 'wws_herberekening', title: 'Puntentelling geüpload', subtitle: 'Keizersgracht 12-B', time: '1 week geleden' },
  { id: '10', type: 'huur_ontvangen', title: 'Huur ontvangen', subtitle: 'Prinsengracht 8-1', amount: 1180, time: '2 weken geleden' },
]

// ——— Compliance status (voor dashboard) ———
export const complianceSummary = {
  compliant: 20,
  actionNeeded: 3,
  expired: 1,
  total: 24,
  score: 92,
}

export const complianceAlerts = [
  { address: 'Keizersgracht 12-B', type: 'puntentelling_verlopen', label: 'Puntentelling verlopen' },
  { address: 'Prinsengracht 8-1', type: 'huur_boven_max', label: 'Huur €45 boven maximum' },
  { address: 'Vondelstraat 22', type: 'pdf_mist', label: 'Puntentelling PDF mist bij contract' },
]

// ——— Aankomende taken ———
export interface UpcomingTask {
  id: string
  title: string
  date: string
  subtitle?: string
}

export const upcomingTasks: UpcomingTask[] = [
  { id: '1', title: 'Huurindexatie doorvoeren', date: '1 april', subtitle: '18 woningen' },
  { id: '2', title: 'Inspectie plannen', date: 'voor 15 maart', subtitle: 'Herengracht 45' },
  { id: '3', title: 'Energielabel verloopt', date: 'mei 2026', subtitle: 'Singel 88' },
  { id: '4', title: 'Contract eindigt', date: '30 april 2026', subtitle: 'Rozengracht 14-1' },
]

// ——— Financieel deze maand (bar chart) ———
export const monthlyFinancials = {
  huurinkomsten: 28400,
  onderhoud: 3200,
  beheerkosten: 1800,
  netto: 23400,
}

// ——— VvE ———
export interface VvE {
  id: string
  name: string
  address: string
  units: number
  reserveFund: number
  targetReserve: number
  monthlyContributionPerUnit: number
}

export const vveData: VvE = {
  id: '1',
  name: 'VvE Keizersgracht 12',
  address: 'Keizersgracht 12, Amsterdam',
  units: 6,
  reserveFund: 45200,
  targetReserve: 60000,
  monthlyContributionPerUnit: 185,
}

// MJOP (meerjarenonderhoudsplan)
export const vveMjop = [
  { year: 2026, description: 'Schilderwerk', amount: 8500 },
  { year: 2027, description: 'Dakonderhoud', amount: 15000 },
  { year: 2028, description: 'CV vervanging', amount: 22000 },
]

// ——— Gebruiker (topbar) ———
export const currentUser = {
  name: 'Thomas van Dijk',
  email: 'thomas@domio.nl',
  avatarInitials: 'TvD',
}

// ——— Notificaties ———
export const notifications = [
  { id: '1', title: 'Puntentelling verlopen', body: 'Keizersgracht 12-B - Herberekening nodig', time: '1 uur geleden', read: false },
  { id: '2', title: 'Nieuwe storingsmelding', body: 'Prinsengracht 8-3 - Lekkage badkamer', time: '5 uur geleden', read: false },
  { id: '3', title: 'Factuur verlopen', body: 'F-2026-003 - S. de Boer - €1.180', time: 'gisteren', read: false },
]

export const unreadNotificationsCount = 3
