export type Category =
  | 'wetgeving-compliance'
  | 'financieel-beheer'
  | 'verduurzaming-energie'
  | 'onderhoud-inspecties'
  | 'huurdersbeheer'
  | 'vve-beheer'
  | 'markt-trends'

export const CATEGORY_LABELS: Record<Category, string> = {
  'wetgeving-compliance': 'Wetgeving & compliance',
  'financieel-beheer': 'Financieel beheer',
  'verduurzaming-energie': 'Verduurzaming & energie',
  'onderhoud-inspecties': 'Onderhoud & inspecties',
  'huurdersbeheer': 'Huurdersbeheer',
  'vve-beheer': 'VvE-beheer',
  'markt-trends': 'Vastgoedmarkt & trends',
}

export interface BlogArticle {
  slug: string
  title: string
  summary: string
  category: Category
  tags: string[]
  content: string
  publishDate: string
  lastUpdated: string
  readingTime: number
  featured: boolean
  relatedArticles: string[]
  placeholder?: boolean
  /** Optioneel: afbeelding voor de kaart (pad in public) */
  image?: string
  /** Optioneel: auteur voor onderaan de kaart */
  author?: { name: string; avatar?: string }
}

export interface UpdateItem {
  date: string
  title: string
  description: string
  relatedArticle?: string
  type: 'actief' | 'aankomend'
  importance: 'hoog' | 'midden' | 'laag'
}
