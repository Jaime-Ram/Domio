import type { BlogArticle, Category, UpdateItem } from './types'
import { getAllArticles } from './articles-data'
import { getUpdates } from './updates-data'

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return getAllArticles().find((a) => a.slug === slug)
}

export function getArticlesByCategory(category: Category): BlogArticle[] {
  return getAllArticles().filter((a) => a.category === category)
}

export function getFeaturedArticle(): BlogArticle | undefined {
  return getAllArticles().find((a) => a.featured)
}

export function getArticlesForOverview(): BlogArticle[] {
  return getAllArticles().filter((a) => !a.featured)
}

export function getRelatedArticles(article: BlogArticle): BlogArticle[] {
  const all = getAllArticles()
  return article.relatedArticles
    .map((slug) => all.find((a) => a.slug === slug))
    .filter((a): a is BlogArticle => !!a)
}

export function getAllCategories(): Category[] {
  const cats = new Set(getAllArticles().map((a) => a.category))
  return Array.from(cats)
}

export function getUpdatesTimeline(): UpdateItem[] {
  return getUpdates()
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const valid: Category[] = [
    'wetgeving-compliance',
    'financieel-beheer',
    'verduurzaming-energie',
    'onderhoud-inspecties',
    'huurdersbeheer',
    'vve-beheer',
    'markt-trends',
  ]
  return valid.includes(slug as Category) ? (slug as Category) : undefined
}

export interface TocItem {
  id: string
  title: string
  level: 2 | 3
}

function slugifyToc(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function extractToc(content: string): TocItem[] {
  const items: TocItem[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/)
    const h3 = line.match(/^###\s+(.+)$/)
    if (h2) items.push({ id: slugifyToc(h2[1]), title: h2[1].trim(), level: 2 })
    if (h3) items.push({ id: slugifyToc(h3[1]), title: h3[1].trim(), level: 3 })
  }
  return items
}
