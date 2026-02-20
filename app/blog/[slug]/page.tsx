import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Clock, ChevronRight, ArrowRight } from 'lucide-react'
import { MarketingLayout } from '@/components/marketing/marketing-layout'
import { FooterSection } from '@/components/marketing/footer-section'
import { CategoryBadge } from '@/components/blog/category-badge'
import { MarkdownContent } from '@/components/blog/markdown-content'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { extractToc } from '@/lib/blog/utils'
import { ArticleCard } from '@/components/blog/article-card'
import { getArticleBySlug, getRelatedArticles } from '@/lib/blog/utils'
import { CATEGORY_LABELS } from '@/lib/blog/types'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const related = getRelatedArticles(article)
  const toc = extractToc(article.content)

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100 bg-gray-50/30 py-8 md:py-10">
          <div className="container mx-auto max-w-4xl px-4 md:px-8">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#163300]">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/blog" className="hover:text-[#163300]">Kennisbank</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href={`/blog/categorie/${article.category}`} className="hover:text-[#163300]">
                {CATEGORY_LABELS[article.category]}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700 truncate">{article.title}</span>
            </nav>
            <CategoryBadge category={article.category} href className="mt-4" />
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#163300] sm:text-4xl">
              {article.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <time dateTime={article.publishDate}>
                {format(new Date(article.publishDate), 'd MMMM yyyy', { locale: nl })}
              </time>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readingTime} min leestijd
              </span>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_240px]">
            <article>
              {article.placeholder ? (
                <p className="text-gray-600">{article.content}</p>
              ) : (
                <MarkdownContent content={article.content} />
              )}

              {/* CTA */}
              <div className="mt-12 rounded-2xl border border-[#163300]/20 bg-[#163300]/5 p-6 md:p-8">
                <p className="text-base text-gray-700">
                  Domio helpt je bij {CATEGORY_LABELS[article.category].toLowerCase()}. Probeer 30 dagen gratis.
                </p>
                <Button asChild className="mt-4 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 border-0">
                  <Link href="/registreren" className="inline-flex items-center gap-2">
                    Start proefperiode
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Gerelateerde artikelen */}
              {related.length > 0 && (
                <div className="mt-14">
                  <h2 className="text-xl font-semibold text-[#163300]">Gerelateerde artikelen</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {related.map((a) => (
                      <ArticleCard key={a.slug} article={a} />
                    ))}
                  </div>
                </div>
              )}
            </article>

            <aside className="lg:order-none">
              <div className="sticky top-24">
                <TableOfContents items={toc} />
              </div>
            </aside>
          </div>
        </div>
      </div>
      <FooterSection />
    </MarketingLayout>
  )
}
