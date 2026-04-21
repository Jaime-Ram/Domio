import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/blog/articles-data'
import { getAllCategories } from '@/lib/blog/utils'

/** Zelfde logica als elders: productie-URL uit env, anders Vercel-preview, anders localhost. */
function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
  return 'http://localhost:3000'
}

const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/functies', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/mijn-domio', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/blog/updates', changeFrequency: 'weekly', priority: 0.75 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/tools/wws-calculator', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/registreren', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/register', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/login', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/forgot-password', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/hulp', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/demo', changeFrequency: 'monthly', priority: 0.65 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl()
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  const articles = getAllArticles()
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(a.lastUpdated || a.publishDate),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const categories = getAllCategories()
  const categoryEntries: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${base}/blog/categorie/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.65,
  }))

  return [...staticEntries, ...categoryEntries, ...articleEntries]
}
