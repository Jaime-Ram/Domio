'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import type { BlogArticle } from '@/lib/blog/types'
import { CATEGORY_LABELS } from '@/lib/blog/types'
import { cn } from '@/lib/utils'


/** Standaard afbeeldingen voor artikelkaarten (geroteerd als article.image ontbreekt) */
const DEFAULT_IMAGES = [
  '/images/Achtergrond1.jpg',
  '/images/Achtergrond2.jpg',
  '/images/Achtergrond3.jpg',
  '/images/Achtergrond4.jpg',
  '/images/Achtergrond5.jpg',
  '/images/Achtergrond6.jpg',
  '/images/Achtergrond7.jpg',
  '/images/Achtergrond8.jpg',
  '/images/Achtergrond9.jpg',
  '/images/Achtergrond10.jpg',
  '/images/Achtergrond11.jpg',
  '/images/Achtergrond12.jpg',
  '/images/Achtergrond13.jpg',
  '/images/Achtergrond14.jpg',
  '/images/AchtergrondX.jpg',
  '/images/AchtergrondY.jpg',
]

export function ArticleCard({
  article,
  featured,
  imageIndex = 0,
  className,
}: {
  article: BlogArticle
  featured?: boolean
  /** Index voor default image bij ontbrekende article.image */
  imageIndex?: number
  className?: string
}) {
  const href = `/blog/${article.slug}`
  const imageSrc = article.image ?? DEFAULT_IMAGES[imageIndex % DEFAULT_IMAGES.length]

  if (featured) {
    return (
      <Link
        href={href}
        className={cn(
          'group block overflow-hidden bg-white dark:bg-neutral-900',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163300] focus-visible:ring-offset-2',
          className
        )}
      >
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>
        <div className="px-0 py-6 sm:py-8">
          <span className="text-xs font-normal text-[#163300] dark:text-[#9FE870] underline underline-offset-2 group-hover:text-[#0d1f00] dark:group-hover:text-[#9FE870] transition-colors">
            {CATEGORY_LABELS[article.category]}
          </span>
          <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white group-hover:underline group-hover:text-[#163300] dark:group-hover:text-[#9FE870] transition-colors sm:text-2xl">
            {article.title}
          </h2>
          <p className="mt-2 text-base font-normal text-gray-600 dark:text-gray-400 line-clamp-2">
            {article.summary}
          </p>
          <div className="mt-5 flex items-center gap-3 pt-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-[#163300] flex items-center justify-center">
              <span className="text-[#9FE870] text-sm font-bold">D</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Domio</p>
              <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                {format(new Date(article.publishDate), 'dd.MM.yy', { locale: nl })} · Leestijd {article.readingTime} min
              </p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col overflow-hidden bg-white dark:bg-neutral-900',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163300] focus-visible:ring-offset-2',
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col px-0 py-5 sm:py-6">
        <span className="text-xs font-normal text-[#163300] dark:text-[#9FE870] underline underline-offset-2 group-hover:text-[#0d1f00] dark:group-hover:text-[#9FE870] transition-colors">
          {CATEGORY_LABELS[article.category]}
        </span>
        <h3 className="mt-2 text-base font-bold leading-snug text-gray-900 dark:text-white group-hover:underline group-hover:text-[#163300] dark:group-hover:text-[#9FE870] transition-colors sm:text-lg">
          {article.title}
        </h3>
        <p className="mt-2 flex-1 text-sm font-normal leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
          {article.summary}
        </p>
        <div className="mt-5 flex items-center gap-3 pt-4">
          <div className="h-10 w-10 shrink-0 rounded-full bg-[#163300] flex items-center justify-center">
            <span className="text-[#9FE870] text-sm font-bold">D</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">Domio</p>
            <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
              {format(new Date(article.publishDate), 'dd.MM.yy', { locale: nl })} · Leestijd {article.readingTime} min
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
