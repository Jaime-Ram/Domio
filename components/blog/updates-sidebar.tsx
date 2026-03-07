import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { ArrowRight, Calendar } from 'lucide-react'
import { getUpdates } from '@/lib/blog/updates-data'
import { cn } from '@/lib/utils'

export function UpdatesSidebar({ className }: { className?: string }) {
  const updates = getUpdates().slice(0, 5)

  return (
    <div className={cn('rounded-2xl bg-gray-100 dark:bg-neutral-800 p-5', className)}>
      <h3 className="flex items-center gap-2 text-xl font-semibold text-[#163300] dark:text-[#9FE870]">
        <Calendar className="h-6 w-6 shrink-0" />
        Wat verandert er?
      </h3>
      <p className="mt-1.5 text-base text-gray-600 dark:text-gray-400">Recente en aankomende wijzigingen</p>
      <ul className="mt-3 space-y-2">
        {updates.map((u) => (
          <li key={`${u.date}-${u.title}`}>
            <Link
              href={u.relatedArticle ? `/blog/${u.relatedArticle}` : '/blog/updates'}
              className="block rounded-lg p-2 text-sm transition-colors hover:bg-white"
            >
              <span className="font-medium text-gray-900">{u.title}</span>
              <span className="mt-0.5 block text-xs text-gray-500">
                {format(new Date(u.date), 'd MMM yyyy', { locale: nl })} · {u.type === 'aankomend' ? 'Aankomend' : 'Actief'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/blog/updates"
        className="mt-3 flex items-center gap-1 text-sm font-medium text-[#163300] hover:underline"
      >
        Volledige tijdlijn
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
