'use client'

import { useMemo, useState } from 'react'
import { MarketingLayout } from '@/components/marketing/marketing-layout'
import { FooterSection } from '@/components/marketing/footer-section'
import { ArticleCard } from '@/components/blog/article-card'
import { UpdatesSidebar } from '@/components/blog/updates-sidebar'
import { getFeaturedArticle, getArticlesForOverview, getAllCategories } from '@/lib/blog/utils'
import { CATEGORY_LABELS, type Category } from '@/lib/blog/types'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BlogPage() {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')

  const featured = getFeaturedArticle()
  const allArticles = getArticlesForOverview()
  const categories = getAllCategories()

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const filtered = useMemo(() => {
    let list = allArticles
    if (selectedCategories.length > 0) {
      list = list.filter((a) => selectedCategories.includes(a.category))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return list.sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    )
  }, [allArticles, selectedCategories, search])

  const showFeatured = selectedCategories.length === 0 && !search.trim()
  const displayList = useMemo(() => {
    if (showFeatured && featured) return [featured, ...filtered]
    return filtered
  }, [showFeatured, featured, filtered])

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-white">
        <section className="relative border-b border-gray-200 overflow-hidden py-12 md:py-16 bg-gray-100 dark:bg-neutral-800">
          <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#163300] dark:text-[#9FE870] sm:text-4xl md:text-5xl">
              Kennisbank
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[#163300]/90 dark:text-[#9FE870]/90">
              Uitgebreide artikelen over wetgeving, financieel beheer, verduurzaming en meer. Voor verhuurders en vastgoedbeheerders in Nederland.
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
            <div>
              {/* Zoekbalk boven de filteropties */}
              <div className="mb-6">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                  <input
                    type="search"
                    placeholder="Zoek in artikelen..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-neutral-400 py-3 pl-12 pr-4 text-base focus:border-[#163300] focus:outline-none focus:ring-1 focus:ring-[#163300]"
                  />
                </div>
              </div>
              <div className="mb-8 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    selectedCategories.length === 0
                      ? 'bg-[#163300] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Alles
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      selectedCategories.includes(cat)
                        ? 'bg-[#163300] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              {/* Artikelgrid — altijd minimaal 2 blokken per rij (2 of 3 kolommen); uitgelicht staat mee in grid */}
              <div className="grid gap-8 grid-cols-2 lg:grid-cols-3">
                {displayList.map((article, index) => (
                  <ArticleCard key={article.slug} article={article} imageIndex={index} />
                ))}
              </div>
              {displayList.length === 0 && (
                <p className="py-12 text-center text-gray-500">Geen artikelen gevonden.</p>
              )}
            </div>

            <aside className="lg:order-none">
              <UpdatesSidebar className="sticky top-24" />
            </aside>
          </div>
        </div>
      </div>
      <FooterSection />
    </MarketingLayout>
  )
}
