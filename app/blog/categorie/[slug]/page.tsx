import { notFound } from 'next/navigation'
import { MarketingLayout } from '@/components/marketing/marketing-layout'
import { FooterSection } from '@/components/marketing/footer-section'
import { ArticleCard } from '@/components/blog/article-card'
import { getArticlesByCategory, getCategoryBySlug } from '@/lib/blog/utils'
import { CATEGORY_LABELS } from '@/lib/blog/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const articles = getArticlesByCategory(category).sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  )
  const title = CATEGORY_LABELS[category]

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-white">
        <section className="border-b border-gray-100 bg-gray-50/30 py-12 md:py-16">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#163300] sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-gray-600">
              Artikelen over {title.toLowerCase()} voor verhuurders en vastgoedbeheerders.
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          {articles.length === 0 && (
            <p className="py-12 text-center text-gray-500">Geen artikelen in deze categorie.</p>
          )}
        </div>
      </div>
      <FooterSection />
    </MarketingLayout>
  )
}
