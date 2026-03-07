'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import type { BlogArticle } from '@/lib/blog/types'
import { CATEGORY_LABELS } from '@/lib/blog/types'
import { cn } from '@/lib/utils'

/** Nep-auteurs voor de kennisbankkaarten */
const FAKE_AUTHORS = [
  'Janneke de Vries',
  'Pieter van Dam',
  'Sophie Bakker',
  'Thomas Jansen',
  'Marieke van den Berg',
  'Lars de Groot',
  'Emma Visser',
  'Daan Smit',
  'Anna Mulder',
  'Ruben de Boer',
  'Femke Vink',
  'Jasper Dekker',
  'Lisa van Leeuwen',
  'Niels Bos',
  'Iris Hendriks',
]

/**
 * Kaartindex → auteursindex. Sommige auteurs (0–3) komen vaker voor = vaste schrijvers,
 * de rest (4–14) minder vaak = gastbijdragen.
 */
const AUTHOR_INDEX_BY_CARD = [
  0, 0, 0, 1, 1, 1, 2, 2, 0, 3, 1, 2, 3, 4, 5, 0, 6, 1, 2, 7, 3, 8, 4, 9, 0, 10, 1, 11, 2, 3, 12, 13, 14,
]

/** Nep-profielfoto's (Unsplash face crop, zelfde aanpak als hero) */
const FAKE_AVATARS = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507591064344-4c6cef03d071?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=face',
]

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
  const authorIndex = AUTHOR_INDEX_BY_CARD[imageIndex % AUTHOR_INDEX_BY_CARD.length]
  const authorName = article.author?.name ?? FAKE_AUTHORS[authorIndex]
  const authorAvatarUrl = article.author?.avatar ?? FAKE_AVATARS[authorIndex]

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
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700">
              <Image src={authorAvatarUrl} alt="" fill className="object-cover" sizes="40px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{authorName}</p>
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
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700">
            <Image src={authorAvatarUrl} alt="" fill className="object-cover" sizes="40px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{authorName}</p>
            <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
              {format(new Date(article.publishDate), 'dd.MM.yy', { locale: nl })} · Leestijd {article.readingTime} min
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
