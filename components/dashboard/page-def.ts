export type TabDef = { label: string; path: string }
export type PageDef = { title: string; tabs?: TabDef[]; noDivider?: boolean }

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Goedemorgen'
  if (h < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

export function getPageDef(rel: string, firstName: string): PageDef {
  if (rel === '' || rel === '/') return { title: `${getGreeting()}, ${firstName}` }
  if (rel.startsWith('/financial')) return {
    title: 'Financieel',
    tabs: [
      { label: 'Overzicht', path: '/financial' },
      { label: 'Betalingen', path: '/financial/betalingen' },
      { label: 'Achterstanden', path: '/financial/achterstanden' },
      { label: 'Huurafrekeningen', path: '/financial/huurafrekening' },
      { label: 'Verdeelsleutel', path: '/financial/verdeelsleutel' },
    ],
  }
  if (rel.startsWith('/compliance')) return {
    title: 'Compliance',
    tabs: [
      { label: 'WWS Overzicht', path: '/compliance' },
      { label: 'Puntentelling', path: '/compliance/puntentelling' },
      { label: 'Alerts', path: '/compliance/alerts' },
    ],
  }
  if (rel.startsWith('/maintenance')) return {
    title: 'Onderhoud',
    tabs: [
      { label: 'Tickets', path: '/maintenance' },
      { label: 'Inspecties', path: '/maintenance/inspecties' },
      { label: 'Planning', path: '/maintenance/planning' },
    ],
  }
  if (rel.startsWith('/tenants')) return { title: 'Huurders' }
  if (rel.startsWith('/portfolio')) return { title: 'Portefeuille' }
  if (rel.startsWith('/tasks')) return { title: 'Taken' }
  if (rel.startsWith('/documents')) return { title: 'Documenten' }
  if (rel.startsWith('/flows')) return { title: 'Flows', noDivider: true }
  if (rel.startsWith('/integrations')) return { title: 'Integraties' }
  if (rel.startsWith('/assist')) return { title: 'Domio Assist' }
  if (rel.startsWith('/app')) return { title: 'App' }
  if (rel.startsWith('/settings')) return { title: 'Instellingen' }
  if (rel.startsWith('/upgrade')) return { title: 'Abonnement' }
  if (rel.startsWith('/hulp')) return { title: 'Hulp' }
  if (rel.startsWith('/betalingen')) return { title: 'Betalingen' }
  if (rel.startsWith('/onderhoud')) return { title: 'Onderhoud' }
  if (rel.startsWith('/documenten')) return { title: 'Documenten' }
  if (rel.startsWith('/berichten')) return { title: 'Berichten' }
  if (rel.startsWith('/instellingen')) return { title: 'Instellingen' }
  return { title: '' }
}

export function getActiveTabPath(rel: string, tabs: TabDef[]): string | null {
  return [...tabs]
    .sort((a, b) => b.path.length - a.path.length)
    .find((t) => rel === t.path || rel.startsWith(t.path + '/'))?.path ?? null
}
