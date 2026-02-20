import Link from 'next/link'
import { CATEGORY_LABELS, type Category } from '@/lib/blog/types'
import { cn } from '@/lib/utils'

export function CategoryBadge({
  category,
  href,
  className,
}: {
  category: Category
  href?: boolean
  className?: string
}) {
  const label = CATEGORY_LABELS[category]
  const slug = category

  const base = cn(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    'bg-[#163300]/10 text-[#163300]',
    className
  )

  if (href) {
    return (
      <Link href={`/blog/categorie/${slug}`} className={base}>
        {label}
      </Link>
    )
  }
  return <span className={base}>{label}</span>
}
