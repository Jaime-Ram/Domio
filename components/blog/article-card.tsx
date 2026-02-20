import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Clock } from 'lucide-react'
import type { BlogArticle } from '@/lib/blog/types'
import { CategoryBadge } from './category-badge'
import { cn } from '@/lib/utils'

export function ArticleCard({
  article,
  featured,
  className,
}: {
  article: BlogArticle
  featured?: boolean
  className?: string
}) {
  const href = `/blog/${article.slug}`

  if (featured) {
    return (
      <Link
        href={href}
        className={cn(
          'group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md',
          className
        )}
      >
        <div className="p-6 sm:p-8">
          <CategoryBadge category={article.category} href />
          <h2 className="mt-3 text-xl font-semibold text-[#163300] group-hover:underline sm:text-2xl">
            {article.title}
          </h2>
          <p className="mt-2 text-gray-600 line-clamp-2">{article.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <time dateTime={article.publishDate}>
              {format(new Date(article.publishDate), 'd MMMM yyyy', { locale: nl })}
            </time>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readingTime} min
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <CategoryBadge category={article.category} href />
      <h3 className="mt-2 text-lg font-semibold text-[#163300] group-hover:underline">
        {article.title}
      </h3>
      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{article.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <time dateTime={article.publishDate}>
          {format(new Date(article.publishDate), 'd MMM yyyy', { locale: nl })}
        </time>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {article.readingTime} min
        </span>
      </div>
    </Link>
  )
}
