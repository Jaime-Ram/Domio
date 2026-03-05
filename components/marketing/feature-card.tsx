'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface FeatureCardProps {
  /** Afbeelding boven de kaart – alleen bovenkant afgerond (zoals referentie) */
  imageSrc: string
  imageAlt?: string
  /** Categorie-tag direct onder de afbeelding – donkergroen, klein, geen pill */
  category: string
  title: string
  description: string
  /** Link (bijv. naar demo) */
  href: string
  /** Onderaan: label bij avatar (bijv. "Bekijk in demo") */
  footerLabel?: string
  /** Onderaan: secundaire tekst (bijv. "Direct in de app") */
  footerMeta?: string
  className?: string
}

/**
 * Kaart exact zoals referentie: afbeelding met alleen boven afgerond,
 * donkergroene categorie, vet titel, grijze beschrijving, onderaan avatar-rij.
 */
export function FeatureCard({
  imageSrc,
  imageAlt = '',
  category,
  title,
  description,
  href,
  footerLabel = 'Bekijk in demo',
  footerMeta = 'Direct in de app',
  className,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col bg-white dark:bg-neutral-900 overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163300] focus-visible:ring-offset-2',
        className
      )}
    >
      {/* Afbeelding – alleen bovenste hoeken afgerond */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-gray-100 dark:bg-neutral-800">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content – geen border, geen shadow op de kaart zelf */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Categorie: donkergroen, klein, geen achtergrond */}
        <span className="text-xs font-normal text-[#163300] dark:text-[#9FE870] tracking-wide">
          {category}
        </span>

        {/* Titel: vet, donkergrijs/zwart */}
        <h3 className="mt-2 text-base font-bold leading-snug text-gray-900 dark:text-white sm:text-lg">
          {title}
        </h3>

        {/* Beschrijving: lichter grijs, kleiner */}
        <p className="mt-2 text-sm font-normal leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
          {description}
        </p>

        {/* Onderste rij: avatar + naam + meta (zoals auteur + datum + leestijd) */}
        <div className="mt-5 flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#163300] dark:bg-[#9FE870] text-white dark:text-[#163300] text-sm font-semibold">
            D
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {footerLabel}
            </p>
            <p className="text-xs font-normal text-gray-500 dark:text-gray-400 truncate">
              {footerMeta}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
