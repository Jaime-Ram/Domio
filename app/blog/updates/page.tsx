import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { MarketingLayout } from '@/components/marketing/marketing-layout'
import { FooterSection } from '@/components/marketing/footer-section'
import { getUpdatesTimeline } from '@/lib/blog/utils'
import { Calendar, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BlogUpdatesPage() {
  const updates = getUpdatesTimeline()
  const actief = updates.filter((u) => u.type === 'actief')
  const aankomend = updates.filter((u) => u.type === 'aankomend')

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-white">
        <section className="border-b border-gray-100 bg-gray-50/30 py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-4 md:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#163300] sm:text-4xl md:text-5xl">
              Wat verandert er?
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Tijdlijn van wijzigingen in wet- en regelgeving voor verhuurders en vastgoedbeheerders. Actieve maatregelen en aankomende deadlines.
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
          {/* Actief */}
          <div className="mb-14">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#163300]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#163300] text-white">
                <Calendar className="h-4 w-4" />
              </span>
              Actief
            </h2>
            <p className="mt-1 text-sm text-gray-500">Deze maatregelen zijn al van kracht.</p>
            <ul className="mt-6 space-y-0">
              {actief.map((u, i) => (
                <TimelineItem key={`actief-${u.date}-${u.title}-${i}`} item={u} isLast={i === actief.length - 1} />
              ))}
            </ul>
          </div>

          {/* Aankomend */}
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#163300]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9FE870] text-[#163300]">
                <Calendar className="h-4 w-4" />
              </span>
              Aankomend
            </h2>
            <p className="mt-1 text-sm text-gray-500">Geplande wijzigingen en deadlines.</p>
            <ul className="mt-6 space-y-0">
              {aankomend.map((u, i) => (
                <TimelineItem key={`aankomend-${u.date}-${u.title}-${i}`} item={u} isLast={i === aankomend.length - 1} />
              ))}
            </ul>
          </div>
        </div>
      </div>
      <FooterSection />
    </MarketingLayout>
  )
}

function TimelineItem({
  item,
  isLast,
}: {
  item: { date: string; title: string; description: string; relatedArticle?: string; importance: string }
  isLast: boolean
}) {
  const isHoog = item.importance === 'hoog'
  return (
    <li className="relative flex gap-6 pb-8 last:pb-0">
      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium',
            isHoog ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-600'
          )}
        >
          {format(new Date(item.date), 'd', { locale: nl })}
        </span>
        <span className="mt-1 text-xs text-gray-500">
          {format(new Date(item.date), 'MMM yyyy', { locale: nl })}
        </span>
        {!isLast && (
          <div className="absolute left-1/2 top-12 bottom-0 w-px -translate-x-px bg-gray-200" />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="font-semibold text-gray-900">{item.title}</h3>
        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
        {item.relatedArticle && (
          <Link
            href={`/blog/${item.relatedArticle}`}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#163300] hover:underline"
          >
            Lees meer
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </li>
  )
}
