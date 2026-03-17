'use client'

import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'

export default function ReportsPage() {
  return (
    <div className="space-y-content-blocks">
      <SectionHeroHeader
        title="Rapportages"
        widgetMenu={
          <SectionWidgetMenu>
            <SectionWidgetMenuPlaceholder />
          </SectionWidgetMenu>
        }
      />
    </div>
  )
}
